import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { requireAdminPage } from "@/app/admin-auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import AdminHeader from "./admin-header";
import PhotoManager from "./photo-manager";
import styles from "./beheer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Foto's beheren | AR Civil Solutions",
  robots: { index: false, follow: false },
};

export default async function BeheerPage() {
  const user = await requireAdminPage();
  if (user.mustChangePassword) redirect("/beheer/account?nieuw=1");

  const rows = await getDb().select().from(projects).orderBy(asc(projects.sortOrder));

  return (
    <div className={styles.adminPage}>
      <AdminHeader username={user.username} active="fotos" />
      <main className={styles.shell}>
        <div className={styles.intro}>
          <h1>Projectfoto&apos;s</h1>
          <p>
            Wat je hier toevoegt, wijzigt of verwijdert, staat direct op de website. De volgorde hier is
            ook de volgorde op de website; de eerste foto wordt groot getoond.
          </p>
        </div>
        <PhotoManager initialProjects={rows} />
      </main>
    </div>
  );
}
