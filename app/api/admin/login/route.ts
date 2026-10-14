import {
  checkCredentials,
  clearFailures,
  clientKey,
  createSession,
  isLockedOut,
  isSameOriginWrite,
  recordFailure,
  seeOther,
  sessionCookie,
} from "@/app/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginWrite(request)) return seeOther(request, "/beheer/inloggen?fout=ongeldig");

  const key = clientKey(request);
  if (await isLockedOut(key)) return seeOther(request, "/beheer/inloggen?fout=geblokkeerd");

  const form = await request.formData();
  const username = String(form.get("gebruikersnaam") ?? "").slice(0, 100);
  const password = String(form.get("wachtwoord") ?? "").slice(0, 200);

  const user = username && password ? await checkCredentials(username, password) : null;
  if (!user) {
    await recordFailure(key);
    const locked = await isLockedOut(key);
    return seeOther(request, `/beheer/inloggen?fout=${locked ? "geblokkeerd" : "onjuist"}`);
  }

  await clearFailures(key);
  const token = await createSession(user.id);
  return seeOther(request, user.mustChangePassword ? "/beheer/account?nieuw=1" : "/beheer", {
    "set-cookie": sessionCookie(token),
  });
}
