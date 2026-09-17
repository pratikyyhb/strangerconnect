import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { isParticipantToken, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

type QueueRow = {
  participant_token: string;
  state: string;
  peer_token: string | null;
  chat_session_id: string | null;
  is_initiator: boolean;
  user_id: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token;
    if (!isParticipantToken(token)) return jsonError("Invalid participant token.");
    const auth = await getCurrentUser();

    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(4182901)`);
      await tx.execute(sql`
        delete from match_queue
        where state = 'waiting' and last_seen_at < now() - interval '35 seconds'
      `);

      if (auth) {
        const bannedResult = await tx.execute(sql`select is_banned from users where id = ${auth.userId}::uuid limit 1`);
        const banned = (bannedResult.rows[0] as { is_banned?: boolean } | undefined)?.is_banned;
        if (banned) return { error: "This account is not permitted to join chat.", status: 403 };
      }

      const ownResult = await tx.execute(sql`
        select participant_token, state, peer_token, chat_session_id, is_initiator, user_id
        from match_queue where participant_token = ${token} limit 1
      `);
      const own = ownResult.rows[0] as QueueRow | undefined;

      if (own?.state === "matched" && own.chat_session_id && own.peer_token) {
        await tx.execute(sql`update match_queue set last_seen_at = now() where participant_token = ${token}`);
        return {
          status: "matched",
          sessionId: own.chat_session_id,
          peerToken: own.peer_token,
          initiator: own.is_initiator,
        };
      }

      const peerResult = await tx.execute(sql`
        select participant_token, state, peer_token, chat_session_id, is_initiator, user_id
        from match_queue
        where state = 'waiting'
          and participant_token <> ${token}
          and (${auth?.userId ?? null}::uuid is null or user_id is null or user_id <> ${auth?.userId ?? null}::uuid)
        order by created_at asc
        for update skip locked
        limit 1
      `);
      const peer = peerResult.rows[0] as QueueRow | undefined;

      if (!peer) {
        await tx.execute(sql`
          insert into match_queue (participant_token, user_id, state, peer_token, chat_session_id, is_initiator, created_at, last_seen_at)
          values (${token}, ${auth?.userId ?? null}::uuid, 'waiting', null, null, false, now(), now())
          on conflict (participant_token) do update set
            user_id = excluded.user_id,
            state = 'waiting',
            peer_token = null,
            chat_session_id = null,
            is_initiator = false,
            last_seen_at = now()
        `);
        return { status: "waiting" };
      }

      const sessionResult = await tx.execute(sql`
        insert into chat_sessions (user_1_id, user_2_id, participant_1, participant_2, started_at)
        values (${peer.user_id}::uuid, ${auth?.userId ?? null}::uuid, ${peer.participant_token}, ${token}, now())
        returning id
      `);
      const sessionId = (sessionResult.rows[0] as { id: string }).id;

      await tx.execute(sql`
        update match_queue set
          state = 'matched', peer_token = ${token}, chat_session_id = ${sessionId}::uuid,
          is_initiator = true, last_seen_at = now()
        where participant_token = ${peer.participant_token}
      `);
      await tx.execute(sql`
        insert into match_queue (participant_token, user_id, state, peer_token, chat_session_id, is_initiator, created_at, last_seen_at)
        values (${token}, ${auth?.userId ?? null}::uuid, 'matched', ${peer.participant_token}, ${sessionId}::uuid, false, now(), now())
        on conflict (participant_token) do update set
          user_id = excluded.user_id, state = 'matched', peer_token = excluded.peer_token,
          chat_session_id = excluded.chat_session_id, is_initiator = false, last_seen_at = now()
      `);

      return { status: "matched", sessionId, peerToken: peer.participant_token, initiator: false };
    });

    if ("error" in result && typeof result.error === "string") {
      return jsonError(result.error, typeof result.status === "number" ? result.status : 403);
    }
    return Response.json(result);
  } catch (error) {
    console.error("Matchmaking failed", error);
    return jsonError("Matchmaking is temporarily unavailable.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const token = body.token;
    const reason = body.reason === "next" ? "next" : "ended";
    if (!isParticipantToken(token)) return jsonError("Invalid participant token.");

    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(4182901)`);
      const ownResult = await tx.execute(sql`
        select participant_token, peer_token, chat_session_id, state
        from match_queue where participant_token = ${token} limit 1 for update
      `);
      const own = ownResult.rows[0] as QueueRow | undefined;

      if (own?.chat_session_id && own.peer_token) {
        await tx.execute(sql`
          insert into signals (chat_session_id, sender_token, receiver_token, type, payload)
          values (${own.chat_session_id}::uuid, ${token}, ${own.peer_token}, 'peer-left', ${JSON.stringify({ reason })}::jsonb)
        `);
        await tx.execute(sql`
          update chat_sessions set ended_at = coalesce(ended_at, now()),
          duration_seconds = coalesce(duration_seconds, greatest(0, extract(epoch from (now() - started_at))::int))
          where id = ${own.chat_session_id}::uuid
        `);
        await tx.execute(sql`delete from match_queue where participant_token in (${token}, ${own.peer_token})`);
      } else {
        await tx.execute(sql`delete from match_queue where participant_token = ${token}`);
      }
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("End chat failed", error);
    return jsonError("Unable to leave the chat cleanly.", 500);
  }
}
