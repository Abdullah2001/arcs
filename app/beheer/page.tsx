import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/app/admin-auth";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { listProjects } from "@/db/projects";
import PhotoManager from "./photo-manager";
import styles from "./beheer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fotobeheer | AR Civil Solutions",
  robots: { index: false, follow: false },
};

export default async function BeheerPage() {
  const user = await requireAdminPage();

  if (!user) {
    return (
      <main className={styles.accessPage}>
        <section className={styles.accessCard}>
          <p className={styles.kicker}>AR Civil Solutions</p>
          <h1>Geen toegang</h1>
          <p>Dit fotobeheer is alleen beschikbaar voor de eigenaar van de website.</p>
          <Link className={styles.primaryLink} href="/">
            Terug naar de website
          </Link>
        </section>
      </main>
    );
  }

  const projects = await listProjects();

  return (
    <main className={styles.adminPage}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <Image
            src="/images/brand/logo-horizontal.png"
            alt="AR Civil Solutions"
            width={190}
            height={62}
            priority
          />
        </Link>
        <div className={styles.headerActions}>
          <span>{user.displayName}</span>
          <Link href="/">Website bekijken</Link>
          <a href={chatGPTSignOutPath("/")}>Uitloggen</a>
        </div>
      </header>

      <div className={styles.adminShell}>
        <section className={styles.intro}>
          <div>
            <p className={styles.kicker}>Beheeromgeving</p>
            <h1>Projectfoto&apos;s</h1>
          </div>
          <p>
            Voeg foto&apos;s van afgeronde projecten toe of verwijder foto&apos;s die niet
            meer op de website hoeven te staan.
          </p>
        </section>

        <PhotoManager initialProjects={projects} />
      </div>
    </main>
  );
}
