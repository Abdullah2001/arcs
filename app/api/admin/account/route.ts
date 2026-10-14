import { and, eq, ne } from "drizzle-orm";
import {
  createSession,
  deleteAllSessionsFor,
  getAdminApiUser,
  hashPassword,
  isSameOriginWrite,
  passwordProblem,
  sessionCookie,
  verifyPassword,
} from "@/app/admin-auth";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";

export const dynamic = "force-dynamic";

// Gebruikersnaam en/of wachtwoord wijzigen. Vraagt altijd het huidige wachtwoord.
export async function POST(request: Request) {
  const sessionUser = await getAdminApiUser(request, { allowPendingPasswordChange: true });
  if (!sessionUser) return Response.json({ error: "Je bent niet (meer) ingelogd." }, { status: 401 });
  if (!isSameOriginWrite(request)) return Response.json({ error: "Ongeldige aanvraag." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    username?: string;
    newPassword?: string;
  };
  const currentPassword = String(body.currentPassword ?? "");
  const username = String(body.username ?? "").trim().toLowerCase();
  const newPassword = String(body.newPassword ?? "");

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, sessionUser.id)).limit(1);
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return Response.json({ error: "Je huidige wachtwoord klopt niet." }, { status: 400 });
  }

  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return Response.json(
      { error: "Gebruik voor de gebruikersnaam 3 tot 40 kleine letters, cijfers, punt, streepje of underscore." },
      { status: 400 },
    );
  }
  const [taken] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.username, username), ne(adminUsers.id, user.id)))
    .limit(1);
  if (taken) return Response.json({ error: "Deze gebruikersnaam is al in gebruik." }, { status: 400 });

  const mustChange = user.mustChangePassword;
  if (mustChange && !newPassword) {
    return Response.json({ error: "Kies een nieuw wachtwoord om het tijdelijke te vervangen." }, { status: 400 });
  }
  if (newPassword) {
    const problem = passwordProblem(newPassword, username);
    if (problem) return Response.json({ error: problem }, { status: 400 });
    if (await verifyPassword(newPassword, user.passwordHash)) {
      return Response.json({ error: "Kies een ander wachtwoord dan het huidige." }, { status: 400 });
    }
  }

  await db
    .update(adminUsers)
    .set({
      username,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword), mustChangePassword: false } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(adminUsers.id, user.id));

  if (!newPassword) return Response.json({ ok: true });

  // Nieuw wachtwoord: alle andere apparaten worden uitgelogd, dit apparaat blijft ingelogd.
  await deleteAllSessionsFor(user.id);
  const token = await createSession(user.id);
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(token) } });
}
