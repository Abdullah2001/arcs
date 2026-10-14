import { checkLogin, clearFailures, clientKey, isLocked, noteFailure, redirectTo, sameOrigin, sessionCookie, startSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo("/beheer/inloggen?melding=ongeldig");
  const key = clientKey(request);
  if (await isLocked(key)) return redirectTo("/beheer/inloggen?melding=geblokkeerd");

  const form = await request.formData();
  const username = String(form.get("gebruikersnaam") ?? "").slice(0, 100);
  const password = String(form.get("wachtwoord") ?? "").slice(0, 200);
  const admin = username && password ? await checkLogin(username, password) : null;

  if (!admin) {
    await noteFailure(key);
    return redirectTo(`/beheer/inloggen?melding=${(await isLocked(key)) ? "geblokkeerd" : "onjuist"}`);
  }
  await clearFailures(key);
  const token = await startSession(admin.id);
  return redirectTo(admin.mustChangePassword ? "/beheer/account" : "/beheer", { "set-cookie": sessionCookie(token) });
}
