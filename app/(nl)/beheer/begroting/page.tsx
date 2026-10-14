import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { laadPrijzen } from "@/lib/begroting/opslag";
import { company } from "@/lib/config";
import AdminBar from "../admin-bar";
import BegrotingTool from "./begroting-tool";
import s from "../beheer.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Begroting en offerte | AR Civil Solutions", robots: { index: false, follow: false } };

export default async function BegrotingPage() {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect("/beheer/account");
  const prijzen = await laadPrijzen();
  const bedrijf = { name: company.name, phoneDisplay: company.phoneDisplay, email: company.email, kvk: company.kvk, btw: company.btw };

  return (
    <div className={s.page}>
      <AdminBar username={admin.username} active="begroting" />
      <BegrotingTool prijzen={prijzen} bedrijf={bedrijf} modus="server" />
    </div>
  );
}
