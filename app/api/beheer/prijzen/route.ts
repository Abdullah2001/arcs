import { apiAdmin } from "@/lib/auth";
import { bewaarPrijzen, controleerProducten, standaardPrijzen, verwijderPrijzen } from "@/lib/begroting/opslag";
import type { Prijzenbestand } from "@/lib/begroting/reken";
import { fail, notLoggedIn } from "../helpers";

export const dynamic = "force-dynamic";
const MAX_BYTES = 8 * 1024 * 1024;

/** Nieuwe prijzen opslaan. Het Excel-bestand wordt in de browser gelezen; hier komt alleen de productlijst binnen. */
export async function PUT(request: Request) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return fail("Het prijzenbestand is te groot.");
  let body: { bestandsnaam?: unknown; producten?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Het prijzenbestand kon niet worden gelezen.");
  }
  const producten = controleerProducten(body.producten);
  if (!producten) return fail("Het prijzenbestand bevat geen geldige producten.");
  const bestand: Prijzenbestand = {
    bron: "upload",
    bestandsnaam: typeof body.bestandsnaam === "string" ? body.bestandsnaam.slice(0, 200) : "prijzen.xlsx",
    bijgewerkt: new Date().toISOString().slice(0, 10),
    producten,
  };
  await bewaarPrijzen(bestand);
  return Response.json({ prijzen: bestand });
}

/** Terug naar de standaardprijzen die in de website zijn meegeleverd. */
export async function DELETE(request: Request) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  await verwijderPrijzen();
  return Response.json({ prijzen: standaardPrijzen });
}
