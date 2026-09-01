import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { User, UserRole } from "@/types";
import { getUserByEmail, getUserById } from "@/lib/catalog";

const cookieName = "beat_marketplace_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-change-me-before-production",
);

type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
};

export async function createSession(user: User) {
  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    email: user.email,
  } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return getUserById(session.userId) ?? getUserByEmail(session.email) ?? null;
}

export function canAccessStudio(role: UserRole) {
  return role === "seller" || role === "admin";
}

export function canAccessAdmin(role: UserRole) {
  return role === "admin";
}
