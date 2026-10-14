import type { Metadata } from "next";
import { requireAdminPage } from "@/app/admin-auth";
import AdminHeader from "../admin-header";
import AccountForm from "./account-form";
import styles from "../beheer.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account | AR Civil Solutions",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireAdminPage();

  return (
    <div className={styles.adminPage}>
      <AdminHeader username={user.username} active="account" />
      <main className={styles.shellNarrow}>
        <div className={styles.intro}>
          <h1>Account</h1>
          {user.mustChangePassword ? (
            <p className={styles.alertWarn}>
              Je bent ingelogd met een tijdelijk wachtwoord. Kies nu je eigen wachtwoord; daarna kun je
              foto&apos;s beheren.
            </p>
          ) : (
            <p>Wijzig hier je gebruikersnaam of wachtwoord. Na een nieuw wachtwoord worden andere apparaten uitgelogd.</p>
          )}
        </div>
        <AccountForm username={user.username} mustChange={user.mustChangePassword} />
      </main>
    </div>
  );
}
