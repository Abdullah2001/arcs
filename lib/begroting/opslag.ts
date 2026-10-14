// Opslag van begrotingen en de prijzendatabase in de bestandsopslag (R2) van de hosting.
import { getBucket } from "../db";
import standaard from "./prijzen.json";
import { normaliseer, samenvatting, type Begroting, type Prijzenbestand, type Product, type Samenvatting } from "./reken";

const PRIJZEN = "data/prijzen.json";
const MAP = "begrotingen/";
export const standaardPrijzen = standaard as Prijzenbestand;

export const geldigId = (id: string) => /^[A-Za-z0-9-]{8,64}$/.test(id);

/** De geüploade prijzen, of de standaardprijzen uit de website als er niets is geüpload of de opslag niet bereikbaar is. */
export async function laadPrijzen(): Promise<Prijzenbestand> {
  try {
    const object = await getBucket().get(PRIJZEN);
    if (object) return await object.json<Prijzenbestand>();
  } catch {
    // val terug op de standaardprijzen
  }
  return standaardPrijzen;
}

export async function bewaarPrijzen(bestand: Prijzenbestand) {
  await getBucket().put(PRIJZEN, JSON.stringify(bestand), { httpMetadata: { contentType: "application/json" } });
}

export async function verwijderPrijzen() {
  await getBucket().delete(PRIJZEN);
}

/** Controleert een prijzenlijst die vanuit de browser is gestuurd. */
export function controleerProducten(input: unknown): Product[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20_000) return null;
  const out: Product[] = [];
  for (const x of input) {
    if (!x || typeof x !== "object") return null;
    const p = x as Record<string, unknown>;
    const t = (k: string, max = 300) => (typeof p[k] === "string" ? (p[k] as string).slice(0, max) : "");
    const prijs = Number(p.prijs);
    const inhoud = Number(p.inhoud);
    if (!t("code") || !t("product") || !Number.isFinite(prijs) || prijs < 0) return null;
    out.push({
      code: t("code", 40),
      groep: t("groep", 80),
      subgroep: t("subgroep", 80),
      product: t("product"),
      winkel: t("winkel", 80),
      prijs,
      per: t("per", 40) || "stuk",
      inhoud: Number.isFinite(inhoud) && inhoud > 0 ? inhoud : 1,
      eenheid: t("eenheid", 20) || "stuk",
      url: /^https?:\/\//.test(t("url", 1000)) ? t("url", 1000) : "",
      datum: t("datum", 10),
    });
  }
  return out;
}

export async function lijstBegrotingen(): Promise<Samenvatting[]> {
  const out: Samenvatting[] = [];
  let cursor: string | undefined;
  do {
    const page = await getBucket().list({ prefix: MAP, cursor, include: ["customMetadata"] });
    for (const o of page.objects) {
      const m = o.customMetadata ?? {};
      out.push({
        id: o.key.slice(MAP.length, -".json".length),
        nummer: m.nummer ?? "",
        klant: m.klant ?? "",
        titel: m.titel ?? "",
        totaal: Number(m.totaal ?? 0),
        bijgewerkt: m.bijgewerkt ?? new Date(o.uploaded).toISOString(),
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return out.sort((a, b) => b.bijgewerkt.localeCompare(a.bijgewerkt));
}

export async function laadBegroting(id: string): Promise<Begroting | null> {
  const object = await getBucket().get(`${MAP}${id}.json`);
  return object ? normaliseer(await object.json()) : null;
}

export async function bewaarBegroting(b: Begroting, door: string) {
  const s = samenvatting(b);
  await getBucket().put(`${MAP}${b.id}.json`, JSON.stringify(b), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      nummer: s.nummer.slice(0, 80),
      klant: s.klant.slice(0, 120),
      titel: s.titel.slice(0, 160),
      totaal: String(s.totaal),
      bijgewerkt: s.bijgewerkt,
      door,
    },
  });
}

export async function verwijderBegroting(id: string) {
  await getBucket().delete(`${MAP}${id}.json`);
}
