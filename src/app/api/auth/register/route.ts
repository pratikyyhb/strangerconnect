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
  const limited = checkRateLimit(request, "register", 8, 15 * 60 * 1000);
  if (limited) return limited;
  try {
    const body = await request.json();
    const username = cleanText(body.username, 32);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return jsonError("Username must be 3–32 characters using letters, numbers, or underscores.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 255) {
      return jsonError("Enter a valid email address.");
    }
    if (password.length < 8 || password.length > 72) {
      return jsonError("Password must be between 8 and 72 characters.");
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existing) return jsonError("That email or username is already in use.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning({ id: users.id, username: users.username, role: users.role });

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role === "admin" ? "admin" : "user",
    });
    const response = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Registration failed", error);
    return jsonError("Unable to create your account right now.", 500);
  }
}
