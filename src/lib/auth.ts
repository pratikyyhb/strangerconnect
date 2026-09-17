import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "strangerconnect_session";

export type AuthPayload = {
  userId: string;
  username: string;
  role: "user" | "admin";
};

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }
  return new TextEncoder().encode(value ?? "strangerconnect-local-development-secret");
}

export async function createSessionToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token?: string | null): Promise<AuthPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  return verifySessionToken(store.get(AUTH_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};
