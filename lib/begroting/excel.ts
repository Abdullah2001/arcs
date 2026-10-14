// Leest de prijzendatabase (blad "Materialen") uit het Excel-bestand van AR Civil Solutions.
// Werkt in de browser en in Node, zonder extra pakketten: een .xlsx is een zip met XML-bestanden.
import type { Product } from "./reken";

type ZipEntry = { name: string; method: number; size: number; offset: number };

function zipEntries(buf: Uint8Array): ZipEntry[] {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let end = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error("Dit is geen geldig Excel-bestand (.xlsx).");
  const count = view.getUint16(end + 10, true);
  let p = view.getUint32(end + 16, true);
  const out: ZipEntry[] = [];
  const dec = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const offset = view.getUint32(p + 42, true);
    out.push({ name: dec.decode(buf.subarray(p + 46, p + 46 + nameLen)), method, size, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

async function readEntry(buf: Uint8Array, e: ZipEntry): Promise<string> {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const start = e.offset + 30 + view.getUint16(e.offset + 26, true) + view.getUint16(e.offset + 28, true);
  const raw = buf.slice(start, start + e.size);
  if (e.method === 0) return new TextDecoder().decode(raw);
  if (e.method !== 8) throw new Error("Onbekende compressie in het Excel-bestand.");
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}

const unescape = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");

/** Alle tekst binnen <t>-elementen (ook bij opgemaakte tekst met meerdere stukken). */
const textOf = (xml: string) => unescape([...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(""));

const colIndex = (ref: string) => {
  let n = 0;
  for (const ch of ref.replace(/\d+/g, "")) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

/** Leest één werkblad als rijen met celwaarden (tekst of getal). Formules geven hun laatst berekende waarde. */
async function readSheet(data: ArrayBuffer | Uint8Array, sheetName: string): Promise<(string | number | null)[][]> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const entries = zipEntries(buf);
  const get = async (name: string) => {
    const e = entries.find((x) => x.name === name);
    return e ? readEntry(buf, e) : null;
  };

  const workbook = await get("xl/workbook.xml");
  const rels = await get("xl/_rels/workbook.xml.rels");
  if (!workbook || !rels) throw new Error("Dit is geen geldig Excel-bestand (.xlsx).");
  const sheet = [...workbook.matchAll(/<sheet\b[^>]*>/g)].map((m) => m[0]).find((tag) => unescape(/name="([^"]*)"/.exec(tag)?.[1] ?? "") === sheetName);
  if (!sheet) throw new Error(`Het werkblad "${sheetName}" staat niet in dit Excel-bestand.`);
  const rid = /r:id="([^"]*)"/.exec(sheet)?.[1];
  const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((tag) => tag.includes(`Id="${rid}"`));
  let target = /Target="([^"]*)"/.exec(rel ?? "")?.[1] ?? "";
  target = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  const sheetXml = await get(target);
  if (!sheetXml) throw new Error(`Het werkblad "${sheetName}" kon niet worden gelezen.`);

  const sharedXml = await get("xl/sharedStrings.xml");
  const shared = sharedXml ? [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1])) : [];

  const rows: (string | number | null)[][] = [];
  for (const row of sheetXml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const r = Number(/\br="(\d+)"/.exec(row[1])?.[1] ?? rows.length + 1) - 1;
    const cells: (string | number | null)[] = [];
    for (const c of (row[2] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1];
      const body = c[2] ?? "";
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /\bt="([^"]*)"/.exec(attrs)?.[1];
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: string | number | null = null;
      if (type === "s" && v !== undefined) value = shared[Number(v)] ?? "";
      else if (type === "inlineStr") value = textOf(body);
      else if (type === "str" || type === "e") value = v !== undefined ? unescape(v) : null;
      else if (type === "b") value = v === "1" ? 1 : 0;
      else if (v !== undefined) value = Number(v);
      if (ref) cells[colIndex(ref)] = value;
    }
    rows[r] = cells;
  }
  return rows;
}

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

function excelDate(v: unknown): string {
  if (typeof v === "number" && v > 20000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86_400_000);
    return d.toISOString().slice(0, 10);
  }
  return typeof v === "string" ? v : "";
}

/**
 * Leest de producten uit het blad "Materialen". De kolommen worden op hun kopnaam gezocht,
 * dus extra of verschoven kolommen zijn geen probleem. Prijzen worden opnieuw uitgerekend
 * uit Bronprijs, Btw in bron en Btw % (de gele brongegevens).
 */
export async function leesPrijzenUitExcel(data: ArrayBuffer | Uint8Array): Promise<Product[]> {
  const rows = await readSheet(data, "Materialen");
  const headerAt = rows.findIndex((r) => r?.some((c) => c === "Code") && r.some((c) => c === "Product"));
  if (headerAt < 0) throw new Error('In het blad "Materialen" staat geen kopregel met "Code" en "Product".');
  const head = rows[headerAt].map((c) => (typeof c === "string" ? c.trim().toLowerCase() : ""));
  const col = (name: string) => head.indexOf(name.toLowerCase());
  const need = ["Code", "Product", "Winkel", "Bronprijs", "Btw in bron"];
  const missing = need.filter((n) => col(n) < 0);
  if (missing.length) throw new Error(`Deze kolommen ontbreken in "Materialen": ${missing.join(", ")}.`);

  const at = (r: (string | number | null)[], name: string) => (col(name) >= 0 ? r[col(name)] : null);
  const str = (r: (string | number | null)[], name: string) => {
    const v = at(r, name);
    return v === null || v === undefined ? "" : String(v).trim();
  };

  const out: Product[] = [];
  for (const r of rows.slice(headerAt + 1)) {
    if (!r) continue;
    const code = str(r, "Code");
    const product = str(r, "Product");
    const bron = num(at(r, "Bronprijs"));
    if (!code || !product || !Number.isFinite(bron)) continue;
    let btw = num(at(r, "Btw %"));
    if (!Number.isFinite(btw)) btw = 0.21;
    if (btw > 1) btw /= 100;
    const inclusief = str(r, "Btw in bron").toLowerCase().startsWith("incl");
    const prijs = inclusief ? bron / (1 + btw) : bron;
    const inhoud = num(at(r, "Inhoud"));
    out.push({
      code,
      groep: str(r, "Groep"),
      subgroep: str(r, "Subgroep"),
      product,
      winkel: str(r, "Winkel"),
      prijs: Math.round(prijs * 10_000) / 10_000,
      per: str(r, "Prijs per") || "stuk",
      inhoud: Number.isFinite(inhoud) && inhoud > 0 ? inhoud : 1,
      eenheid: str(r, "Eenheid") || "stuk",
      url: str(r, "Product-URL"),
      datum: excelDate(at(r, "Geraadpleegd")),
    });
  }
  if (!out.length) throw new Error('Er staan geen producten met een prijs in het blad "Materialen".');
  return out;
}
