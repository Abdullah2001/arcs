// Rekenregels van de werkbegroting en de offerte. Alle bedragen zijn exclusief btw, tenzij anders vermeld.
//
//   bouwkosten     = materiaal + arbeid
//   risico         = bouwkosten × risicomarge
//   totale kosten  = bouwkosten + risico
//   winst          = totale kosten × winstmarge
//   offerte excl.  = totale kosten + winst
//   btw            = offerte excl. × btw-percentage
//   offerte incl.  = offerte excl. + btw

export type Product = {
  code: string;
  groep: string;
  subgroep: string;
  product: string;
  winkel: string;
  /** Prijs excl. btw per prijseenheid (kolom "Prijs per"). */
  prijs: number;
  /** Prijseenheid, bijvoorbeeld "25 kg", "plaat" of "rol". */
  per: string;
  /** Hoeveel eenheden er in één prijseenheid zitten. */
  inhoud: number;
  /** Eenheid van de inhoud: kg, l, m², m, stuk. */
  eenheid: string;
  url: string;
  datum: string;
};

export type Prijzenbestand = {
  bron: "standaard" | "upload";
  bestandsnaam: string;
  bijgewerkt: string;
  producten: Product[];
};

export type MateriaalRegel = {
  id: string;
  /** Code uit de prijzendatabase, of null voor een zelf ingevulde regel. */
  code: string | null;
  omschrijving: string;
  winkel: string;
  hoeveelheid: number;
  /** "verpakking": hoeveelheid is het aantal prijseenheden. "eenheid": hoeveelheid is in kg/m²/l, afgerond op hele verpakkingen. */
  invoer: "verpakking" | "eenheid";
  per: string;
  inhoud: number;
  eenheid: string;
  prijs: number;
};

export type ArbeidRegel = {
  id: string;
  omschrijving: string;
  soort: "uren" | "vast";
  uren: number;
  tarief: number;
  bedrag: number;
};

export type Indeling = "groepen" | "regels" | "totaal";

export type Begroting = {
  id: string;
  nummer: string;
  datum: string;
  geldigDagen: number;
  klant: { naam: string; adres: string; plaats: string; email: string; telefoon: string };
  project: { titel: string; adres: string; omschrijving: string };
  materialen: MateriaalRegel[];
  arbeid: ArbeidRegel[];
  /** Percentages, bijvoorbeeld 21 voor 21%. */
  instellingen: { btw: number; risico: number; winst: number };
  offerte: { indeling: Indeling; voorwaarden: string };
  bijgewerkt: string;
};

export type Samenvatting = {
  id: string;
  nummer: string;
  klant: string;
  titel: string;
  totaal: number;
  bijgewerkt: string;
};

export const STANDAARD = { btw: 21, risico: 5, winst: 10, uurtarief: 45, geldigDagen: 30 };

export const STANDAARD_VOORWAARDEN = [
  "Deze offerte is geldig tot de genoemde datum.",
  "Betaling: 30% bij opdracht, 70% na oplevering, binnen 14 dagen na factuurdatum.",
  "Meerwerk wordt alleen uitgevoerd na overleg en wordt apart verrekend.",
  "De werkplek moet bij aanvang vrij en bereikbaar zijn. Water en stroom zijn aanwezig.",
].join("\n");

export const nieuwId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const vandaag = () => new Date().toISOString().slice(0, 10);

export function nieuweBegroting(): Begroting {
  const d = new Date();
  const nummer = `OF-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    id: nieuwId(),
    nummer,
    datum: vandaag(),
    geldigDagen: STANDAARD.geldigDagen,
    klant: { naam: "", adres: "", plaats: "", email: "", telefoon: "" },
    project: { titel: "", adres: "", omschrijving: "" },
    materialen: [],
    arbeid: [],
    instellingen: { btw: STANDAARD.btw, risico: STANDAARD.risico, winst: STANDAARD.winst },
    offerte: { indeling: "groepen", voorwaarden: STANDAARD_VOORWAARDEN },
    bijgewerkt: new Date().toISOString(),
  };
}

export function materiaalUitProduct(p: Product): MateriaalRegel {
  return {
    id: nieuwId(),
    code: p.code,
    omschrijving: p.product,
    winkel: p.winkel,
    hoeveelheid: 1,
    invoer: "verpakking",
    per: p.per,
    inhoud: p.inhoud,
    eenheid: p.eenheid,
    prijs: p.prijs,
  };
}

export const legeMateriaalRegel = (): MateriaalRegel => ({
  id: nieuwId(),
  code: null,
  omschrijving: "",
  winkel: "",
  hoeveelheid: 1,
  invoer: "verpakking",
  per: "stuk",
  inhoud: 1,
  eenheid: "stuk",
  prijs: 0,
});

export const legeArbeidRegel = (tarief = STANDAARD.uurtarief): ArbeidRegel => ({
  id: nieuwId(),
  omschrijving: "",
  soort: "uren",
  uren: 8,
  tarief,
  bedrag: 0,
});

const n = (v: number) => (Number.isFinite(v) ? v : 0);
/** Afronden op centen. */
export const rond = (v: number) => Math.round((n(v) + Number.EPSILON) * 100) / 100;

/** Aantal prijseenheden dat je moet kopen. */
export function verpakkingen(r: MateriaalRegel): number {
  const q = Math.max(0, n(r.hoeveelheid));
  if (r.invoer === "eenheid" && r.inhoud > 0) return Math.ceil(q / r.inhoud - 1e-9);
  return q;
}

export const materiaalBedrag = (r: MateriaalRegel) => rond(verpakkingen(r) * n(r.prijs));
export const arbeidBedrag = (r: ArbeidRegel) => rond(r.soort === "uren" ? n(r.uren) * n(r.tarief) : n(r.bedrag));

export type Uitkomst = {
  materiaal: number;
  arbeid: number;
  uren: number;
  bouwkosten: number;
  risico: number;
  totaleKosten: number;
  winst: number;
  excl: number;
  btw: number;
  incl: number;
  /** Vermenigvuldiger van kostprijs naar verkoopprijs: (1 + risico) × (1 + winst). */
  factor: number;
};

export function bereken(b: Begroting): Uitkomst {
  const materiaal = rond(b.materialen.reduce((s, r) => s + materiaalBedrag(r), 0));
  const arbeid = rond(b.arbeid.reduce((s, r) => s + arbeidBedrag(r), 0));
  const uren = b.arbeid.reduce((s, r) => s + (r.soort === "uren" ? Math.max(0, n(r.uren)) : 0), 0);
  const bouwkosten = rond(materiaal + arbeid);
  const risico = rond((bouwkosten * n(b.instellingen.risico)) / 100);
  const totaleKosten = rond(bouwkosten + risico);
  const winst = rond((totaleKosten * n(b.instellingen.winst)) / 100);
  const excl = rond(totaleKosten + winst);
  const btw = rond((excl * n(b.instellingen.btw)) / 100);
  const incl = rond(excl + btw);
  const factor = (1 + n(b.instellingen.risico) / 100) * (1 + n(b.instellingen.winst) / 100);
  return { materiaal, arbeid, uren, bouwkosten, risico, totaleKosten, winst, excl, btw, incl, factor };
}

export type OfferteRegel = { omschrijving: string; hoeveelheid: string; bedrag: number };

/**
 * Regels zoals de klant ze ziet. Risico en winst zijn naar verhouding over de regels verdeeld,
 * zodat de klant geen inkoopprijzen ziet. Afrondingsverschillen gaan naar de grootste regel,
 * zodat de regels altijd precies optellen tot het offertebedrag excl. btw.
 */
export function offerteRegels(b: Begroting, u = bereken(b)): OfferteRegel[] {
  const titel = b.project.titel.trim() || "Werkzaamheden volgens omschrijving";
  let regels: { omschrijving: string; hoeveelheid: string; kosten: number }[];
  if (b.offerte.indeling === "totaal") {
    regels = [{ omschrijving: titel, hoeveelheid: "1 post", kosten: u.bouwkosten }];
  } else if (b.offerte.indeling === "groepen") {
    regels = [];
    if (u.materiaal > 0) regels.push({ omschrijving: "Materialen", hoeveelheid: "", kosten: u.materiaal });
    if (u.arbeid > 0)
      regels.push({ omschrijving: "Arbeid", hoeveelheid: u.uren > 0 ? `${formatGetal(u.uren)} uur` : "", kosten: u.arbeid });
  } else {
    regels = [
      ...b.materialen.map((r) => ({
        omschrijving: r.omschrijving || "Materiaal",
        hoeveelheid:
          r.invoer === "eenheid"
            ? `${formatGetal(r.hoeveelheid)} ${r.eenheid}`
            : `${formatGetal(r.hoeveelheid)} × ${r.per}`,
        kosten: materiaalBedrag(r),
      })),
      ...b.arbeid.map((r) => ({
        omschrijving: r.omschrijving || "Arbeid",
        hoeveelheid: r.soort === "uren" ? `${formatGetal(r.uren)} uur` : "1 post",
        kosten: arbeidBedrag(r),
      })),
    ];
  }
  regels = regels.filter((r) => r.kosten !== 0);
  if (!regels.length) return [];
  const uit = regels.map((r) => ({ omschrijving: r.omschrijving, hoeveelheid: r.hoeveelheid, bedrag: rond(r.kosten * u.factor) }));
  const verschil = rond(u.excl - uit.reduce((s, r) => s + r.bedrag, 0));
  if (verschil !== 0) {
    const grootste = uit.reduce((g, r, i) => (Math.abs(r.bedrag) > Math.abs(uit[g].bedrag) ? i : g), 0);
    uit[grootste].bedrag = rond(uit[grootste].bedrag + verschil);
  }
  return uit;
}

export function geldigTot(b: Begroting): string {
  const d = new Date(`${b.datum || vandaag()}T12:00:00`);
  d.setDate(d.getDate() + Math.max(0, n(b.geldigDagen)));
  return d.toISOString().slice(0, 10);
}

export const samenvatting = (b: Begroting): Samenvatting => ({
  id: b.id,
  nummer: b.nummer,
  klant: b.klant.naam,
  titel: b.project.titel,
  totaal: bereken(b).incl,
  bijgewerkt: b.bijgewerkt,
});

const euroFormat = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const getalFormat = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 });
export const euro = (v: number) => euroFormat.format(n(v)).replace(/ /g, " ");
export const formatGetal = (v: number) => getalFormat.format(n(v));
export const formatDatum = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}-${m}-${y}`;
};

/** Controleert een begroting die van buiten komt (opgeslagen bestand of API) en vult ontbrekende velden aan. */
export function normaliseer(input: unknown): Begroting | null {
  if (!input || typeof input !== "object") return null;
  const x = input as Partial<Begroting>;
  if (typeof x.id !== "string" || !Array.isArray(x.materialen) || !Array.isArray(x.arbeid)) return null;
  const basis = nieuweBegroting();
  return {
    ...basis,
    ...x,
    klant: { ...basis.klant, ...(x.klant ?? {}) },
    project: { ...basis.project, ...(x.project ?? {}) },
    instellingen: { ...basis.instellingen, ...(x.instellingen ?? {}) },
    offerte: { ...basis.offerte, ...(x.offerte ?? {}) },
  } as Begroting;
}
