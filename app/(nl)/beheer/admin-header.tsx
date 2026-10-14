import styles from "./beheer.module.css";

export default function AdminHeader({ username, active }: { username: string; active: "fotos" | "account" }) {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="/beheer">
        <img src="/images/brand/logo-horizontal.png" alt="AR Civil Solutions" width={1602} height={291} />
      </a>
      <nav className={styles.headerNav} aria-label="Beheer">
        <a href="/beheer" aria-current={active === "fotos" ? "page" : undefined}>Foto&apos;s</a>
        <a href="/beheer/account" aria-current={active === "account" ? "page" : undefined}>Account</a>
        <a href="/" target="_blank" rel="noreferrer">Website bekijken</a>
      </nav>
      <form method="post" action="/api/admin/logout" className={styles.logout}>
        <span>{username}</span>
        <button type="submit">Uitloggen</button>
      </form>
    </header>
  );
}
