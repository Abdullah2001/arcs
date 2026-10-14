import { and, eq, ne } from "drizzle-orm";
import { apiAdmin, endAllSessions, hashPassword, passwordProblem, sessionCookie, startSession, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { admins } from "@/lib/schema";
import { fail, notLoggedIn } from "../helpers";

export const dynamic = "force-dynamic";

/** Gebruikersnaam en/of wachtwoord wijzigen; vraagt altijd het huidige wachtwoord. */
export async function POST(request: Request) {
  const me = await apiAdmin(request, { allowTemporary: true });
  if (!me) return notLoggedIn();

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const current = String(body.current ?? "");
  const username = String(body.username ?? "").trim().toLowerCase();
  const next = String(body.next ?? "");

  const db = getDb();
  const [admin] = await db.select().from(admins).where(eq(admins.id, me.id)).limit(1);
  if (!admin || !(await verifyPassword(current, admin.passwordHash))) return fail("Je huidige wachtwoord klopt niet.");
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return fail("Gebruik voor de gebruikersnaam 3 tot 40 kleine letters, cijfers, punt, streepje of underscore.");
  }
  const [taken] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(and(eq(admins.username, username), ne(admins.id, admin.id)))
    .limit(1);
  if (taken) return fail("Deze gebruikersnaam is al in gebruik.");
  if (admin.mustChangePassword && !next) return fail("Kies een nieuw wachtwoord om het tijdelijke te vervangen.");
  if (next) {
    const problem = passwordProblem(next, username);
    if (problem) return fail(problem);
    if (await verifyPassword(next, admin.passwordHash)) return fail("Kies een ander wachtwoord dan het huidige.");
  }

  await db
    .update(admins)
    .set({
      username,
      updatedAt: new Date().toISOString(),
      ...(next ? { passwordHash: await hashPassword(next), mustChangePassword: false } : {}),
    })
    .where(eq(admins.id, admin.id));

  if (!next) return Response.json({ ok: true });
  // Nieuw wachtwoord: andere apparaten uitloggen, dit apparaat blijft ingelogd.
  await endAllSessions(admin.id);
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(await startSession(admin.id)) } });
}
