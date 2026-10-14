// Offerte (voor de klant) en werkbegroting (intern) als PDF, in de huisstijl: donker, goud en wit.
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import {
  arbeidBedrag,
  bereken,
  euro,
  formatDatum,
  formatGetal,
  geldigTot,
  materiaalBedrag,
  offerteRegels,
  verpakkingen,
  type Begroting,
} from "./reken";

export type Bedrijf = { name: string; phoneDisplay: string; email: string; kvk: string; btw: string };

type RGB = [number, number, number];
const NACHT: RGB = [21, 23, 26];
const GOUD: RGB = [176, 138, 52];
const GOUD_LICHT: RGB = [226, 189, 102];
const INKT: RGB = [28, 30, 33];
const GRIJS: RGB = [104, 106, 110];
const LIJN: RGB = [222, 219, 211];
const ZACHT: RGB = [247, 245, 240];

const W = 210;
const H = 297;
const M = 18;
const LOGO_RATIO = 291 / 1602;

// De standaardletters van een PDF kennen alleen de Windows-1252-tekens; de rest wordt vervangen.
const EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const veilig = (s: string) =>
  s
    .normalize("NFC")
    .replace(/[‐-‒]/g, "-")
    .replace(/ | /g, " ")
    .replace(/[^\n\x20-\x7e -ÿ]/g, (ch) => (EXTRA.includes(ch) ? ch : "?"));

type Opties = { bedrijf: Bedrijf; logo: string };

function kop(doc: jsPDF, titel: string, sub: string, logo: string) {
  doc.setFillColor(...NACHT);
  doc.rect(0, 0, W, 38, "F");
  doc.setFillColor(...GOUD);
  doc.rect(0, 38, W, 1.2, "F");
  const lw = 74;
  doc.addImage(logo, "PNG", M, 12, lw, lw * LOGO_RATIO, "logo", "FAST");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(titel.length > 10 ? 16 : 19);
  doc.setTextColor(...GOUD_LICHT);
  // Met letterafstand rekent align: "right" niet goed; daarom zelf de breedte bepalen.
  const ruimte = 1.2;
  const breedte = doc.getTextWidth(titel) + ruimte * (titel.length - 1);
  doc.setCharSpace(ruimte);
  doc.text(titel, W - M - breedte, 20);
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 199, 194);
  doc.text(veilig(sub), W - M, 27, { align: "right" });
}

function kleineKop(doc: jsPDF, titel: string, logo: string) {
  doc.setFillColor(...NACHT);
  doc.rect(0, 0, W, 14, "F");
  doc.setFillColor(...GOUD);
  doc.rect(0, 14, W, 0.8, "F");
  const lw = 38;
  doc.addImage(logo, "PNG", M, (14 - lw * LOGO_RATIO) / 2, lw, lw * LOGO_RATIO, "logo", "FAST");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GOUD_LICHT);
  doc.text(veilig(titel), W - M, 8.6, { align: "right" });
}

function voetteksten(doc: jsPDF, bedrijf: Bedrijf, titel: string, logo: string) {
  const delen = [bedrijf.name, bedrijf.phoneDisplay, bedrijf.email];
  if (bedrijf.kvk) delen.push(`KvK ${bedrijf.kvk}`);
  if (bedrijf.btw) delen.push(`Btw ${bedrijf.btw}`);
  const totaal = doc.getNumberOfPages();
  for (let p = 1; p <= totaal; p++) {
    doc.setPage(p);
    if (p > 1) kleineKop(doc, titel, logo);
    doc.setDrawColor(...GOUD);
    doc.setLineWidth(0.4);
    doc.line(M, H - 15, W - M, H - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIJS);
    doc.text(veilig(delen.filter(Boolean).join("   ·   ")), M, H - 10);
    doc.text(`Pagina ${p} van ${totaal}`, W - M, H - 10, { align: "right" });
  }
}

function label(doc: jsPDF, tekst: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GOUD);
  doc.setCharSpace(0.6);
  doc.text(tekst.toUpperCase(), x, y);
  doc.setCharSpace(0);
}

/** Klantgegevens links en offertegegevens rechts. Geeft de y-positie onder het blok terug. */
function gegevensBlok(doc: jsPDF, b: Begroting, links: string, rechts: [string, string][]): number {
  let y = 52;
  label(doc, links, M, y);
  y += 6;
  const klant = [b.klant.adres, b.klant.plaats, b.klant.email, b.klant.telefoon].filter((s) => s.trim());
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INKT);
  doc.text(veilig(b.klant.naam.trim() || "-"), M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  for (const regel of klant) {
    y += 5;
    doc.text(veilig(regel), M, y);
  }

  let yr = 52;
  const x = 118;
  for (const [k, v] of rechts) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIJS);
    doc.text(veilig(k), x, yr);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INKT);
    const lines = doc.splitTextToSize(veilig(v || "-"), W - M - (x + 30)) as string[];
    doc.text(lines, x + 30, yr);
    yr += 5.6 * Math.max(1, lines.length);
  }
  return Math.max(y, yr) + 13;
}

function ruimte(doc: jsPDF, y: number, nodig: number): number {
  if (y + nodig > H - 22) {
    doc.addPage();
    return 26;
  }
  return y;
}

function tabelStijl(kolommen: Record<number, { halign?: "left" | "right"; cellWidth?: number | "auto" }>) {
  return {
    theme: "plain" as const,
    margin: { left: M, right: M, top: 24, bottom: 22 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: { top: 2.6, bottom: 2.6, left: 2.6, right: 2.6 }, textColor: INKT, lineColor: LIJN, overflow: "linebreak" as const },
    headStyles: { fillColor: NACHT, textColor: GOUD_LICHT, fontStyle: "bold" as const, fontSize: 8 },
    alternateRowStyles: { fillColor: ZACHT },
    bodyStyles: { lineWidth: { bottom: 0.2 } },
    columnStyles: kolommen,
    didParseCell: (data: { section: string; column: { index: number }; cell: { styles: { halign: string } } }) => {
      const k = kolommen[data.column.index];
      if (data.section === "head" && k?.halign) data.cell.styles.halign = k.halign;
    },
  };
}

const eindY = (doc: jsPDF) => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

/** Totalenblok rechts uitgelijnd. De laatste regel wordt als donkere balk getekend. */
function totalen(doc: jsPDF, y: number, regels: [string, string][], slot: [string, string]): number {
  const x = 104;
  y = ruimte(doc, y, regels.length * 6.5 + 16);
  doc.setFontSize(9.5);
  for (const [k, v] of regels) {
    y += 6.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRIJS);
    doc.text(veilig(k), x + 3, y);
    doc.setTextColor(...INKT);
    doc.text(veilig(v), W - M - 3, y, { align: "right" });
  }
  y += 4;
  doc.setFillColor(...NACHT);
  doc.rect(x, y, W - M - x, 11, "F");
  doc.setFillColor(...GOUD);
  doc.rect(x, y, 1.2, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(veilig(slot[0]), x + 5, y + 7.2);
  doc.setFontSize(12);
  doc.setTextColor(...GOUD_LICHT);
  doc.text(veilig(slot[1]), W - M - 3, y + 7.4, { align: "right" });
  return y + 11;
}

function alinea(doc: jsPDF, tekst: string, y: number, opmaak: { size?: number; kleur?: RGB } = {}): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(opmaak.size ?? 9.5);
  doc.setTextColor(...(opmaak.kleur ?? INKT));
  const lh = (opmaak.size ?? 9.5) * 0.47;
  for (const lijn of doc.splitTextToSize(veilig(tekst), W - 2 * M) as string[]) {
    y = ruimte(doc, y, lh);
    y += lh;
    doc.text(lijn, M, y);
  }
  return y;
}

function bestandsnaam(soort: string, b: Begroting) {
  const deel = (s: string) => s.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return [soort, deel(b.nummer), deel(b.klant.naam)].filter(Boolean).join("_") + ".pdf";
}

export function offertePdf(b: Begroting, { bedrijf, logo }: Opties): { doc: jsPDF; naam: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `Offerte ${b.nummer}`, author: bedrijf.name, subject: b.project.titel });
  const u = bereken(b);
  kop(doc, "OFFERTE", b.nummer, logo);

  const rechts: [string, string][] = [
    ["Offertenummer", b.nummer],
    ["Datum", formatDatum(b.datum)],
    ["Geldig tot", formatDatum(geldigTot(b))],
  ];
  if (b.project.adres.trim()) rechts.push(["Werkadres", b.project.adres]);
  let y = gegevensBlok(doc, b, "Offerte voor", rechts);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INKT);
  const titel = doc.splitTextToSize(veilig(b.project.titel.trim() || "Offerte"), W - 2 * M) as string[];
  doc.text(titel, M, y);
  y += 6.5 * titel.length - 1;
  if (b.project.omschrijving.trim()) y = alinea(doc, b.project.omschrijving, y + 1.5, { kleur: [60, 62, 66] });
  y += 6;

  const regels = offerteRegels(b, u);
  autoTable(doc, {
    ...tabelStijl({ 1: { halign: "right", cellWidth: 34 }, 2: { halign: "right", cellWidth: 38 } }),
    startY: y,
    head: [["Omschrijving", "Hoeveelheid", "Bedrag excl. btw"]],
    body: regels.length ? regels.map((r) => [veilig(r.omschrijving), veilig(r.hoeveelheid), veilig(euro(r.bedrag))]) : [["Nog geen posten ingevuld", "", ""]],
  });
  y = totalen(
    doc,
    eindY(doc) + 2,
    [
      ["Totaal excl. btw", euro(u.excl)],
      [`Btw ${formatGetal(b.instellingen.btw)}%`, euro(u.btw)],
    ],
    ["Totaal incl. btw", euro(u.incl)],
  );

  const voorwaarden = b.offerte.voorwaarden.split("\n").map((s) => s.trim()).filter(Boolean);
  if (voorwaarden.length) {
    y = ruimte(doc, y + 14, 14);
    label(doc, "Voorwaarden", M, y);
    y += 1;
    for (const v of voorwaarden) y = alinea(doc, `•  ${v}`, y + 1, { size: 8.8, kleur: [60, 62, 66] });
  }

  // Akkoordverklaring
  y = ruimte(doc, y + 14, 44);
  label(doc, "Voor akkoord", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(60, 62, 66);
  doc.text(veilig(`Door te ondertekenen gaat u akkoord met deze offerte (${b.nummer}) en de voorwaarden.`), M, y + 5.5);
  const kolom = (x: number, kopje: string, naam: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INKT);
    doc.text(veilig(kopje), x, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIJS);
    const velden: [string, string][] = [["Naam", naam], ["Datum", ""], ["Handtekening", ""]];
    velden.forEach(([k, v], i) => {
      const ly = y + 23 + i * 8.5;
      doc.text(k, x, ly);
      doc.setDrawColor(...LIJN);
      doc.setLineWidth(0.3);
      doc.line(x + 24, ly + 0.8, x + 80, ly + 0.8);
      if (v) {
        doc.setTextColor(...INKT);
        doc.text(veilig(v), x + 25, ly - 0.2);
        doc.setTextColor(...GRIJS);
      }
    });
  };
  kolom(M, "Opdrachtgever", b.klant.naam);
  kolom(W / 2 + 4, bedrijf.name, "");

  voetteksten(doc, bedrijf, `OFFERTE ${b.nummer}`, logo);
  return { doc, naam: bestandsnaam("Offerte", b) };
}

export function werkbegrotingPdf(b: Begroting, { bedrijf, logo }: Opties): { doc: jsPDF; naam: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `Werkbegroting ${b.nummer}`, author: bedrijf.name, subject: b.project.titel });
  const u = bereken(b);
  kop(doc, "WERKBEGROTING", `${b.nummer} · intern, niet voor de klant`, logo);

  const rechts: [string, string][] = [
    ["Nummer", b.nummer],
    ["Datum", formatDatum(b.datum)],
    ["Project", b.project.titel],
  ];
  if (b.project.adres.trim()) rechts.push(["Werkadres", b.project.adres]);
  let y = gegevensBlok(doc, b, "Klant", rechts);

  label(doc, "Materialen", M, y);
  autoTable(doc, {
    ...tabelStijl({ 0: { cellWidth: 19 }, 2: { cellWidth: 24 }, 3: { halign: "right", cellWidth: 32 }, 4: { halign: "right", cellWidth: 21 }, 5: { halign: "right", cellWidth: 23 } }),
    styles: { ...tabelStijl({}).styles, fontSize: 8.3, cellPadding: { top: 2.4, bottom: 2.4, left: 2, right: 2 } },
    startY: y + 2.5,
    head: [["Code", "Omschrijving", "Winkel", "Aantal", "Prijs", "Bedrag"]],
    body: b.materialen.length
      ? b.materialen.map((r) => {
          const n = verpakkingen(r);
          const aantal = r.invoer === "eenheid" ? `${formatGetal(r.hoeveelheid)} ${r.eenheid} = ${formatGetal(n)} × ${r.per}` : `${formatGetal(n)} × ${r.per}`;
          return [veilig(r.code ?? "eigen"), veilig(r.omschrijving || "-"), veilig(r.winkel || "-"), veilig(aantal), veilig(euro(r.prijs)), veilig(euro(materiaalBedrag(r)))];
        })
      : [["", "Geen materialen", "", "", "", ""]],
    foot: [["", "Totaal materiaal", "", "", "", veilig(euro(u.materiaal))]],
    footStyles: { fontStyle: "bold", textColor: INKT, fillColor: [236, 232, 222], halign: "right" },
  });
  y = ruimte(doc, eindY(doc) + 10, 20);

  label(doc, "Arbeid", M, y);
  autoTable(doc, {
    ...tabelStijl({ 1: { halign: "right", cellWidth: 26 }, 2: { halign: "right", cellWidth: 26 }, 3: { halign: "right", cellWidth: 28 } }),
    startY: y + 2.5,
    head: [["Omschrijving", "Uren", "Tarief", "Bedrag"]],
    body: b.arbeid.length
      ? b.arbeid.map((r) => [
          veilig(r.omschrijving || "-"),
          r.soort === "uren" ? formatGetal(r.uren) : "vast bedrag",
          r.soort === "uren" ? veilig(euro(r.tarief)) : "",
          veilig(euro(arbeidBedrag(r))),
        ])
      : [["Geen arbeid", "", "", ""]],
    foot: [["Totaal arbeid", formatGetal(u.uren), "", veilig(euro(u.arbeid))]],
    footStyles: { fontStyle: "bold", textColor: INKT, fillColor: [236, 232, 222], halign: "right" },
  });

  totalen(
    doc,
    eindY(doc) + 6,
    [
      ["Materiaal", euro(u.materiaal)],
      ["Arbeid", euro(u.arbeid)],
      ["Bouwkosten", euro(u.bouwkosten)],
      [`Risico ${formatGetal(b.instellingen.risico)}% over bouwkosten`, euro(u.risico)],
      ["Totale kosten", euro(u.totaleKosten)],
      [`Winst ${formatGetal(b.instellingen.winst)}% over totale kosten`, euro(u.winst)],
      ["Offerteprijs excl. btw", euro(u.excl)],
      [`Btw ${formatGetal(b.instellingen.btw)}%`, euro(u.btw)],
    ],
    ["Offerteprijs incl. btw", euro(u.incl)],
  );

  voetteksten(doc, bedrijf, `WERKBEGROTING ${b.nummer} · INTERN`, logo);
  return { doc, naam: bestandsnaam("Werkbegroting", b) };
}
