import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { chatSessions, reports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { cleanText, isParticipantToken, isUuid, jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const allowedReasons = new Set(["Harassment", "Spam", "Inappropriate behavior", "Offensive language", "Other"]);

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "reports", 10, 10 * 60 * 1000);
  if (limited) return limited;
  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    const token = body.token;
    const reason = cleanText(body.reason, 64);
    const description = cleanText(body.description, 1000);
    if (!isUuid(sessionId) || !isParticipantToken(token) || !allowedReasons.has(reason)) return jsonError("Invalid report details.");

    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), or(eq(chatSessions.participant1, token), eq(chatSessions.participant2, token))))
      .limit(1);
    if (!session) return jsonError("Chat session not found.", 404);

    const auth = await getCurrentUser();
    const reportedUserId = token === session.participant1 ? session.user2Id : session.user1Id;
    const [report] = await db
      .insert(reports)
      .values({ reporterId: auth?.userId ?? null, reportedUserId, chatSessionId: sessionId, reason, description })
      .returning({ id: reports.id, status: reports.status });

    return Response.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Report submission failed", error);
    return jsonError("Unable to submit the report right now.", 500);
  }
}
