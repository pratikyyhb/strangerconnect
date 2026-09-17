import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { cleanText, jsonError, normalizeEmail } from "@/lib/http";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "login", 15, 15 * 60 * 1000);
  if (limited) return limited;
  try {
    const body = await request.json();
    const identity = cleanText(body.email, 255);
    const normalized = normalizeEmail(identity);
    const password = typeof body.password === "string" ? body.password : "";

    if (!identity || !password) return jsonError("Email/username and password are required.");

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, normalized), eq(users.username, identity)))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return jsonError("Incorrect email, username, or password.", 401);
    }
    if (user.isBanned) return jsonError("This account has been suspended.", 403);

    const role = user.role === "admin" ? "admin" : "user";
    const token = await createSessionToken({ userId: user.id, username: user.username, role });
    const response = NextResponse.json({ user: { id: user.id, username: user.username, role } });
    response.cookies.set(AUTH_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return jsonError("Unable to log in right now.", 500);
  }
}
