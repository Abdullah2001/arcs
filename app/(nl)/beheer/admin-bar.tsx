import Link from "next/link";
import s from "./beheer.module.css";

export default function AdminBar({ username, active }: { username: string; active: "fotos" | "account" }) {
  return (
    <header className={s.bar}>
      <Link href="/beheer"><img src="/images/brand/logo-horizontal-light.png" alt="AR Civil Solutions" width={1602} height={291} /></Link>
      <nav className={s.tabs} aria-label="Beheer">
        <Link href="/beheer" aria-current={active === "fotos" ? "page" : undefined}>Foto&apos;s</Link>
        <Link href="/beheer/account" aria-current={active === "account" ? "page" : undefined}>Account</Link>
        <Link href="/" target="_blank">Website bekijken</Link>
      </nav>
      <form className={s.out} method="post" action="/api/beheer/uitloggen">
        <span>{username}</span>
        <button type="submit">Uitloggen</button>
      </form>
    </header>
  );
}
