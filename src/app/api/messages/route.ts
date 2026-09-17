import { and, asc, eq, gt, gte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, chatSessions } from "@/db/schema";
import { cleanText, isParticipantToken, isUuid, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

async function isSessionParticipant(sessionId: string, token: string) {
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), or(eq(chatSessions.participant1, token), eq(chatSessions.participant2, token))))
    .limit(1);
  return Boolean(session);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const token = url.searchParams.get("token");
  const after = Math.max(0, Number(url.searchParams.get("after") ?? 0) || 0);
  if (!isUuid(sessionId) || !isParticipantToken(token)) return jsonError("Invalid message request.");
  if (!(await isSessionParticipant(sessionId, token))) return jsonError("Chat session not found.", 404);

  const rows = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.chatSessionId, sessionId), gt(chatMessages.id, after)))
    .orderBy(asc(chatMessages.id))
    .limit(100);
  return Response.json({ messages: rows });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    const token = body.token;
    const message = cleanText(body.message, 1000);
    if (!isUuid(sessionId) || !isParticipantToken(token) || !message) return jsonError("Enter a valid message.");
    if (!(await isSessionParticipant(sessionId, token))) return jsonError("Chat session not found.", 404);

    const [recent] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .where(and(eq(chatMessages.chatSessionId, sessionId), eq(chatMessages.senderToken, token), gte(chatMessages.createdAt, new Date(Date.now() - 5000))));
    if ((recent?.count ?? 0) >= 8) return jsonError("You’re sending messages too quickly.", 429);

    const [row] = await db
      .insert(chatMessages)
      .values({ chatSessionId: sessionId, senderToken: token, message })
      .returning();
    return Response.json({ message: row }, { status: 201 });
  } catch (error) {
    console.error("Message send failed", error);
    return jsonError("Unable to send that message.", 500);
  }
}
