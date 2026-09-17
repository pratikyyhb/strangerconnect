import { and, asc, eq, gt, or } from "drizzle-orm";
import { db } from "@/db";
import { chatSessions, signals } from "@/db/schema";
import { isParticipantToken, isUuid, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

async function isSessionParticipant(sessionId: string, token: string) {
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.id, sessionId),
        or(eq(chatSessions.participant1, token), eq(chatSessions.participant2, token)),
      ),
    )
    .limit(1);
  return Boolean(session);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const token = url.searchParams.get("token");
  const after = Math.max(0, Number(url.searchParams.get("after") ?? 0) || 0);

  if (!isUuid(sessionId) || !isParticipantToken(token)) return jsonError("Invalid signaling request.");
  if (!(await isSessionParticipant(sessionId, token))) return jsonError("Chat session not found.", 404);

  const rows = await db
    .select()
    .from(signals)
    .where(and(eq(signals.chatSessionId, sessionId), eq(signals.receiverToken, token), gt(signals.id, after)))
    .orderBy(asc(signals.id))
    .limit(100);

  return Response.json({ signals: rows });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, token, peerToken, type, payload } = body;
    const allowedTypes = new Set(["offer", "answer", "ice"]);
    if (
      !isUuid(sessionId) ||
      !isParticipantToken(token) ||
      !isParticipantToken(peerToken) ||
      token === peerToken ||
      !allowedTypes.has(type)
    ) {
      return jsonError("Invalid signal.");
    }
    if (!(await isSessionParticipant(sessionId, token))) return jsonError("Chat session not found.", 404);

    const [row] = await db
      .insert(signals)
      .values({ chatSessionId: sessionId, senderToken: token, receiverToken: peerToken, type, payload: payload ?? {} })
      .returning({ id: signals.id });
    return Response.json({ id: row.id }, { status: 201 });
  } catch (error) {
    console.error("Signal relay failed", error);
    return jsonError("Unable to relay the connection signal.", 500);
  }
}
