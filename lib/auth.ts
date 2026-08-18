import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { users, sessions } from "./schema";

export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "344066291812-ek6nmskdibqm7fqa0l1v19mougs2ev6c.apps.googleusercontent.com";

const SESSION_COOKIE = "lacianda_session";
const SESSION_DAYS = 30;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyGoogleToken(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid Google token");
  return {
    googleId: payload.sub!,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
  };
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
}) {
  const existing = await db.query.users.findFirst({
    where: eq(users.googleId, profile.googleId),
  });
  if (existing) return existing;

  const byEmail = await db.query.users.findFirst({
    where: eq(users.email, profile.email),
  });
  if (byEmail) {
    const [updated] = await db
      .update(users)
      .set({ googleId: profile.googleId, name: profile.name })
      .where(eq(users.id, byEmail.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      role: "cashier",
    })
    .returning();
  return created;
}

export async function createSession(userId: string, deviceInfo?: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    deviceInfo: deviceInfo?.slice(0, 500),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.tokenHash, tokenHash),
      gt(sessions.expiresAt, new Date())
    ),
    with: undefined,
  });
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  return user ?? null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function verifyPinLogin(email: string, pin: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (!user?.pinHash) return null;
  const valid = await bcrypt.compare(pin, user.pinHash);
  return valid ? user : null;
}

export async function setUserPin(userId: string, pin: string) {
  const pinHash = await bcrypt.hash(pin, 10);
  await db.update(users).set({ pinHash }).where(eq(users.id, userId));
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  pinHash?: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasPin: Boolean(user.pinHash),
  };
}
