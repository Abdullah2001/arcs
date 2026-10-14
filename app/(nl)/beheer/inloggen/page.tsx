import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminPageUser } from "@/app/admin-auth";
import styles from "../beheer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inloggen | AR Civil Solutions",
  robots: { index: false, follow: false },
};

const messages: Record<string, { text: string; error: boolean }> = {
  onjuist: { text: "Gebruikersnaam of wachtwoord klopt niet.", error: true },
  geblokkeerd: { text: "Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.", error: true },
  ongeldig: { text: "Het inloggen is niet gelukt. Laad de pagina opnieuw en probeer het nog eens.", error: true },
  uitgelogd: { text: "Je bent uitgelogd.", error: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await getAdminPageUser()) redirect("/beheer");
  const params = await searchParams;
  const key = typeof params.fout === "string" ? params.fout : params.uitgelogd ? "uitgelogd" : "";
  const message = messages[key];

  return (
    <main className={styles.loginPage}>
      <form className={styles.loginCard} method="post" action="/api/admin/login">
        <img className={styles.loginLogo} src="/images/brand/logo-horizontal.png" alt="AR Civil Solutions" width={1602} height={291} />
        <h1>Beheer inloggen</h1>
        {message && (
          <p className={message.error ? styles.alertError : styles.alertInfo} role="alert">
            {message.text}
          </p>
        )}
        <label className={styles.field}>
          <span>Gebruikersnaam</span>
          <input name="gebruikersnaam" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
        </label>
        <label className={styles.field}>
          <span>Wachtwoord</span>
          <input name="wachtwoord" type="password" autoComplete="current-password" required />
        </label>
        <button className={styles.primary} type="submit">Inloggen</button>
        <Link className={styles.backLink} href="/">Terug naar de website</Link>
      </form>
    </main>
  );
}
