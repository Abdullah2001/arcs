import { and, eq, gt, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";
import { admins, loginFailures, sessions, type Admin } from "./schema";

const COOKIE = "__Host-arcs_session";
const SESSION_SECONDS = 8 * 60 * 60;
const ITERATIONS = 100_000; // het maximum dat Cloudflare Workers toestaat
const MAX_FAILURES = 5;
const LOCK_SECONDS = 15 * 60;

export type SessionAdmin = Pick<Admin, "id" | "username" | "mustChangePassword">;

// ---------- hulpfuncties ----------
const enc = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);

function b64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(value: string): Uint8Array<ArrayBuffer> {
  const s = atob(value);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}
async function sha256(value: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)));
  return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- wachtwoorden: pbkdf2$<iteraties>$<salt>$<hash> ----------
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt, ITERATIONS))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !salt || !hash) return false;
  return sameBytes(await derive(password, unb64(salt), Number(iterations)), unb64(hash));
}

// Zelfde rekentijd als de gebruikersnaam niet bestaat.
const DUMMY = "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export function passwordProblem(password: string, username: string): string | null {
  if (password.length < 12) return "Kies een wachtwoord van minimaal 12 tekens.";
  if (password.length > 200) return "Dit wachtwoord is te lang.";
  if (password.toLowerCase().includes(username.toLowerCase())) return "Je wachtwoord mag je gebruikersnaam niet bevatten.";
  return null;
}

// ---------- inlogpogingen beperken ----------
export function clientKey(request: Request): string {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${ip ?? "onbekend"}`;
}

export async function isLocked(key: string): Promise<boolean> {
  const [row] = await getDb().select().from(loginFailures).where(eq(loginFailures.key, key)).limit(1);
  return !!row && now() - row.windowStart <= LOCK_SECONDS && row.count >= MAX_FAILURES;
}

export async function noteFailure(key: string): Promise<void> {
  const db = getDb();
  const [row] = await db.select().from(loginFailures).where(eq(loginFailures.key, key)).limit(1);
  if (!row || now() - row.windowStart > LOCK_SECONDS) {
    await db
      .insert(loginFailures)
      .values({ key, count: 1, windowStart: now() })
      .onConflictDoUpdate({ target: loginFailures.key, set: { count: 1, windowStart: now() } });
  } else {
    await db.update(loginFailures).set({ count: row.count + 1 }).where(eq(loginFailures.key, key));
  }
}

export async function clearFailures(key: string): Promise<void> {
  await getDb().delete(loginFailures).where(eq(loginFailures.key, key));
}

// ---------- inloggen en sessies ----------
export async function checkLogin(username: string, password: string): Promise<Admin | null> {
  const [admin] = await getDb()
    .select()
    .from(admins)
    .where(eq(admins.username, username.trim().toLowerCase()))
    .limit(1);
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY);
  return admin && ok ? admin : null;
}

export async function startSession(adminId: string): Promise<string> {
  const token = b64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]!);
  const db = getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, now()));
  await db.insert(sessions).values({ tokenHash: await sha256(token), adminId, expiresAt: now() + SESSION_SECONDS });
  return token;
}

export const sessionCookie = (token: string) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
export const clearedCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

function tokenFrom(cookieHeader: string | null): string | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE) return v.join("=") || null;
  }
  return null;
}

async function adminFor(token: string | null): Promise<SessionAdmin | null> {
  if (!token || token.length > 100) return null;
  try {
    const [row] = await getDb()
      .select({ id: admins.id, username: admins.username, mustChangePassword: admins.mustChangePassword })
      .from(sessions)
      .innerJoin(admins, eq(sessions.adminId, admins.id))
      .where(and(eq(sessions.tokenHash, await sha256(token)), gt(sessions.expiresAt, now())))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export const requestToken = (request: Request) => tokenFrom(request.headers.get("cookie"));

export async function endSession(token: string | null): Promise<void> {
  if (token) await getDb().delete(sessions).where(eq(sessions.tokenHash, await sha256(token)));
}

export async function endAllSessions(adminId: string): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.adminId, adminId));
}

/** Server-pagina's: zonder sessie naar het inlogscherm. */
export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/beheer/inloggen");
  return admin;
}

export async function currentAdmin(): Promise<SessionAdmin | null> {
  return adminFor(tokenFrom((await headers()).get("cookie")));
}

/**
 * API-routes. Wijzigingen moeten van dezelfde website komen en zijn pas
 * toegestaan nadat het tijdelijke wachtwoord is vervangen.
 */
export async function apiAdmin(request: Request, { allowTemporary = false } = {}): Promise<SessionAdmin | null> {
  if (request.method !== "GET" && !sameOrigin(request)) return null;
  const admin = await adminFor(requestToken(request));
  if (!admin || (admin.mustChangePassword && !allowTemporary)) return null;
  return admin;
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function redirectTo(path: string, extra: Record<string, string> = {}): Response {
  return new Response(null, { status: 303, headers: { location: path, "cache-control": "no-store", ...extra } });
}
