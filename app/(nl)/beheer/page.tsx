import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSiteImage, listPhotos } from "@/lib/media";
import AdminBar from "./admin-bar";
import HeroManager from "./hero-manager";
import PhotoManager from "./photo-manager";
import s from "./beheer.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Foto's beheren | AR Civil Solutions", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/beheer/account");
  const [hero, photos] = await Promise.all([getSiteImage("hero"), listPhotos()]);

  return (
    <div className={s.page}>
      <AdminBar username={admin.username} active="fotos" />
      <main className={s.main}>
        <div className={s.intro}>
          <h1>Foto&apos;s</h1>
          <p>Wat je hier toevoegt, wijzigt of verwijdert, staat direct op de website, in het Nederlands en het Engels.</p>
        </div>
        <HeroManager initial={hero} />
        <PhotoManager initial={photos} />
      </main>
    </div>
  );
}
