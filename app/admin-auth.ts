import { and, eq, gt, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { adminSessions, adminUsers, loginAttempts, type AdminUser } from "@/db/schema";

// ---------------------------------------------------------------------------
// Instellingen
// ---------------------------------------------------------------------------
export const SESSION_COOKIE = "__Host-arcs_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 uur
const PBKDF2_ITERATIONS = 100_000; // maximum dat Cloudflare Workers toestaat
const MAX_FAILURES = 5;
const LOCK_WINDOW_SECONDS = 15 * 60;

export type AdminSessionUser = Pick<AdminUser, "id" | "username" | "mustChangePassword">;

// ---------------------------------------------------------------------------
// Hulpfuncties
// ---------------------------------------------------------------------------
const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------------------
// Wachtwoorden — formaat: pbkdf2$<iteraties>$<salt base64>$<hash base64>
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const actual = await pbkdf2(password, fromBase64(salt), Number(iter));
  return timingSafeEqual(actual, fromBase64(hash));
}

// Vergelijkt altijd met een hash, ook als de gebruikersnaam niet bestaat,
// zodat de reactietijd niet verraadt welke gebruikersnamen geldig zijn.
const DUMMY_HASH = "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export function passwordProblem(password: string, username: string): string | null {
  if (password.length < 12) return "Kies een wachtwoord van minimaal 12 tekens.";
  if (password.length > 200) return "Dit wachtwoord is te lang.";
  if (password.toLowerCase().includes(username.toLowerCase())) {
    return "Het wachtwoord mag je gebruikersnaam niet bevatten.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Inlogpogingen beperken
// ---------------------------------------------------------------------------
export function clientKey(request: Request): string {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "onbekend";
  return `ip:${ip}`;
}

export async function isLockedOut(key: string): Promise<boolean> {
  const [row] = await getDb().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
  if (!row) return false;
  if (nowSeconds() - row.windowStart > LOCK_WINDOW_SECONDS) return false;
  return row.failures >= MAX_FAILURES;
}

export async function recordFailure(key: string): Promise<void> {
  const db = getDb();
  const now = nowSeconds();
  const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
  if (!row || now - row.windowStart > LOCK_WINDOW_SECONDS) {
    await db
      .insert(loginAttempts)
      .values({ key, failures: 1, windowStart: now })
      .onConflictDoUpdate({ target: loginAttempts.key, set: { failures: 1, windowStart: now } });
  } else {
    await db.update(loginAttempts).set({ failures: row.failures + 1 }).where(eq(loginAttempts.key, key));
  }
}

export async function clearFailures(key: string): Promise<void> {
  await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
}

// ---------------------------------------------------------------------------
// Inloggen en sessies
// ---------------------------------------------------------------------------
export async function checkCredentials(username: string, password: string): Promise<AdminUser | null> {
  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username.trim().toLowerCase()))
    .limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? user : null;
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, nowSeconds()));
  await db.insert(adminSessions).values({
    tokenHash: await sha256Hex(token),
    userId,
    expiresAt: nowSeconds() + SESSION_TTL_SECONDS,
  });
  return token;
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=") || null;
  }
  return null;
}

async function userForToken(token: string | null): Promise<AdminSessionUser | null> {
  if (!token || token.length > 100) return null;
  try {
    const [row] = await getDb()
      .select({ id: adminUsers.id, username: adminUsers.username, mustChangePassword: adminUsers.mustChangePassword })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
      .where(and(eq(adminSessions.tokenHash, await sha256Hex(token)), gt(adminSessions.expiresAt, nowSeconds())))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function sessionTokenFromRequest(request: Request): Promise<string | null> {
  return readCookie(request.headers.get("cookie"), SESSION_COOKIE);
}

export async function deleteSession(token: string | null): Promise<void> {
  if (!token) return;
  await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await sha256Hex(token)));
}

export async function deleteAllSessionsFor(userId: string): Promise<void> {
  await getDb().delete(adminSessions).where(eq(adminSessions.userId, userId));
}

/** Voor server-pagina's: stuurt niet-ingelogde bezoekers naar het inlogscherm. */
export async function requireAdminPage(): Promise<AdminSessionUser> {
  const h = await headers();
  const user = await userForToken(readCookie(h.get("cookie"), SESSION_COOKIE));
  if (!user) redirect("/beheer/inloggen");
  return user;
}

export async function getAdminPageUser(): Promise<AdminSessionUser | null> {
  const h = await headers();
  return userForToken(readCookie(h.get("cookie"), SESSION_COOKIE));
}

/**
 * Voor API-routes. Wijzigingen mogen alleen van dezelfde website komen en,
 * zolang het tijdelijke wachtwoord nog niet is vervangen, niets anders doen.
 */
export async function getAdminApiUser(
  request: Request,
  { allowPendingPasswordChange = false } = {},
): Promise<AdminSessionUser | null> {
  const user = await userForToken(await sessionTokenFromRequest(request));
  if (!user) return null;
  if (user.mustChangePassword && !allowPendingPasswordChange) return null;
  return user;
}

export function isSameOriginWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function seeOther(request: Request, path: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(null, {
    status: 303,
    headers: { location: path, "cache-control": "no-store", ...extraHeaders },
  });
}
