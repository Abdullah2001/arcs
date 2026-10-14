import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminBar from "../admin-bar";
import AccountForm from "./account-form";
import s from "../beheer.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account | AR Civil Solutions", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <div className={s.page}>
      <AdminBar username={admin.username} active="account" />
      <main className={`${s.main} ${s.narrow}`}>
        <div className={s.intro}>
          <h1>Account</h1>
          {admin.mustChangePassword ? (
            <p className={s.warn}>Je bent ingelogd met een tijdelijk wachtwoord. Kies nu je eigen wachtwoord; daarna kun je foto&apos;s beheren.</p>
          ) : (
            <p>Wijzig je gebruikersnaam of wachtwoord. Na een nieuw wachtwoord worden andere apparaten uitgelogd.</p>
          )}
        </div>
        <AccountForm username={admin.username} temporary={admin.mustChangePassword} />
      </main>
    </div>
  );
}
