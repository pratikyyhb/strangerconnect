import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return Response.json({ user: null });

  const [user] = await db
    .select({ id: users.id, username: users.username, email: users.email, role: users.role, isBanned: users.isBanned, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return Response.json({ user: user ?? null });
}
