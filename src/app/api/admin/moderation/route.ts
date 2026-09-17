import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isUuid, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getCurrentUser();
  return session?.role === "admin" ? session : null;
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const body = await request.json();
  if (!isUuid(body.userId) || typeof body.banned !== "boolean") return jsonError("Invalid moderation request.");
  if (body.userId === admin.userId) return jsonError("You cannot suspend your own administrator account.");

  const [user] = await db
    .update(users)
    .set({ isBanned: body.banned })
    .where(eq(users.id, body.userId))
    .returning({ id: users.id, isBanned: users.isBanned });
  if (!user) return jsonError("User not found.", 404);
  return Response.json({ user });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const id = new URL(request.url).searchParams.get("reportId");
  if (!isUuid(id)) return jsonError("Invalid report ID.");

  const [deleted] = await db.delete(reports).where(eq(reports.id, id)).returning({ id: reports.id });
  if (!deleted) return jsonError("Report not found.", 404);
  return Response.json({ ok: true });
}
