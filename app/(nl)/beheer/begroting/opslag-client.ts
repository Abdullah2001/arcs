// Waar de begrotingstool zijn gegevens bewaart: op de server (beheeromgeving) of
// alleen in deze browser (de testversie zonder server).
import type { Begroting, Prijzenbestand, Product, Samenvatting } from "@/lib/begroting/reken";
import { normaliseer, samenvatting } from "@/lib/begroting/reken";

export type Opslag = {
  lijst(): Promise<Samenvatting[]>;
  laad(id: string): Promise<Begroting>;
  bewaar(b: Begroting): Promise<void>;
  verwijder(id: string): Promise<void>;
  bewaarPrijzen(bestandsnaam: string, producten: Product[]): Promise<Prijzenbestand>;
  standaardPrijzen(): Promise<Prijzenbestand>;
};

async function json<T>(response: Response, fout: string): Promise<T> {
  if (!response.ok) {
    let melding = fout;
    try {
      melding = ((await response.json()) as { error?: string }).error ?? fout;
    } catch {
      // geen JSON
    }
    throw new Error(melding);
  }
  return (await response.json()) as T;
}

export const serverOpslag: Opslag = {
  async lijst() {
    const r = await fetch("/api/beheer/begrotingen", { cache: "no-store" });
    return (await json<{ begrotingen: Samenvatting[] }>(r, "De lijst kon niet worden geladen.")).begrotingen;
  },
  async laad(id) {
    const r = await fetch(`/api/beheer/begrotingen/${id}`, { cache: "no-store" });
    return (await json<{ begroting: Begroting }>(r, "De begroting kon niet worden geladen.")).begroting;
  },
  async bewaar(b) {
    const r = await fetch(`/api/beheer/begrotingen/${b.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(b),
    });
    await json(r, "Opslaan is niet gelukt.");
  },
  async verwijder(id) {
    const r = await fetch(`/api/beheer/begrotingen/${id}`, { method: "DELETE" });
    await json(r, "Verwijderen is niet gelukt.");
  },
  async bewaarPrijzen(bestandsnaam, producten) {
    const r = await fetch("/api/beheer/prijzen", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bestandsnaam, producten }),
    });
    return (await json<{ prijzen: Prijzenbestand }>(r, "De prijzen konden niet worden opgeslagen.")).prijzen;
  },
  async standaardPrijzen() {
    const r = await fetch("/api/beheer/prijzen", { method: "DELETE" });
    return (await json<{ prijzen: Prijzenbestand }>(r, "Terugzetten is niet gelukt.")).prijzen;
  },
};

const LIJST = "arcs-begrotingen";
const PRIJZEN = "arcs-prijzen";

function lees<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function schrijf(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Deze browser staat opslaan niet toe.");
  }
}

/** Testversie: alles blijft in deze browser. */
export function lokaleOpslag(standaard: Prijzenbestand): Opslag {
  return {
    async lijst() {
      return Object.values(lees<Record<string, Begroting>>(LIJST, {}))
        .map(samenvatting)
        .sort((a, b) => b.bijgewerkt.localeCompare(a.bijgewerkt));
    },
    async laad(id) {
      const b = normaliseer(lees<Record<string, Begroting>>(LIJST, {})[id]);
      if (!b) throw new Error("Deze begroting bestaat niet (meer).");
      return b;
    },
    async bewaar(b) {
      const alles = lees<Record<string, Begroting>>(LIJST, {});
      alles[b.id] = { ...b, bijgewerkt: new Date().toISOString() };
      schrijf(LIJST, alles);
    },
    async verwijder(id) {
      const alles = lees<Record<string, Begroting>>(LIJST, {});
      delete alles[id];
      schrijf(LIJST, alles);
    },
    async bewaarPrijzen(bestandsnaam, producten) {
      const bestand: Prijzenbestand = { bron: "upload", bestandsnaam, bijgewerkt: new Date().toISOString().slice(0, 10), producten };
      schrijf(PRIJZEN, bestand);
      return bestand;
    },
    async standaardPrijzen() {
      try {
        localStorage.removeItem(PRIJZEN);
      } catch {
        // niets
      }
      return standaard;
    },
  };
}

/** In de testversie: eerder geüploade prijzen uit deze browser. */
export const lokalePrijzen = () => lees<Prijzenbestand | null>(PRIJZEN, null);
