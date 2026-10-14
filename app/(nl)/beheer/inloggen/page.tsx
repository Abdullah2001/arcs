import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import s from "../beheer.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inloggen | AR Civil Solutions", robots: { index: false, follow: false } };

const messages: Record<string, { text: string; kind: "error" | "ok" }> = {
  onjuist: { text: "Gebruikersnaam of wachtwoord klopt niet.", kind: "error" },
  geblokkeerd: { text: "Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.", kind: "error" },
  ongeldig: { text: "Inloggen is niet gelukt. Laad de pagina opnieuw en probeer het nog eens.", kind: "error" },
  uitgelogd: { text: "Je bent uitgelogd.", kind: "ok" },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (await currentAdmin()) redirect("/beheer");
  const message = messages[(await searchParams).melding ?? ""];

  return (
    <main className={s.login}>
      <form className={s.loginCard} method="post" action="/api/beheer/inloggen">
        <img src="/images/brand/logo-horizontal-light.png" alt="AR Civil Solutions" width={1602} height={291} />
        <h1>Beheer</h1>
        {message && <p className={s[message.kind]} role="alert">{message.text}</p>}
        <label className={s.field}>
          Gebruikersnaam
          <input id="login-user" name="gebruikersnaam" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
        </label>
        <label className={s.field}>
          Wachtwoord
          <input id="login-pass" name="wachtwoord" type="password" autoComplete="current-password" required />
        </label>
        <button className={s.primary} type="submit">Inloggen</button>
        <Link className={s.back} href="/">Terug naar de website</Link>
      </form>
    </main>
  );
}
