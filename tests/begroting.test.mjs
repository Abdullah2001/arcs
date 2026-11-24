import assert from "node:assert/strict";
import test from "node:test";
import { bereken, materiaalUitProduct, legeArbeidRegel, nieuweBegroting, offerteRegels, verpakkingen } from "../lib/begroting/reken.ts";

function voorbeeld() {
  const b = nieuweBegroting();
  const plaat = materiaalUitProduct({ code: "MAT-1", groep: "Afwerken", subgroep: "Gips", product: "Gipsplaat", winkel: "Bouwmaat", prijs: 10, per: "plaat", inhoud: 1.56, eenheid: "m²", url: "", datum: "" });
  plaat.hoeveelheid = 10; // 10 platen à € 10
  const pleister = materiaalUitProduct({ code: "MAT-2", groep: "Stucwerk", subgroep: "Pleister", product: "Pleister 25 kg", winkel: "HORNBACH", prijs: 20, per: "25 kg", inhoud: 25, eenheid: "kg", url: "", datum: "" });
  pleister.invoer = "eenheid";
  pleister.hoeveelheid = 60; // 60 kg = 3 zakken
  b.materialen.push(plaat, pleister);
  const uren = legeArbeidRegel(50);
  uren.uren = 10;
  const vast = legeArbeidRegel();
  vast.soort = "vast";
  vast.bedrag = 340;
  b.arbeid.push(uren, vast);
  return b;
}

test("berekening: risico over bouwkosten, winst over totale kosten, btw aanpasbaar", () => {
  const b = voorbeeld();
  assert.equal(verpakkingen(b.materialen[1]), 3);
  const u = bereken(b);
  assert.equal(u.materiaal, 160);
  assert.equal(u.arbeid, 840);
  assert.equal(u.bouwkosten, 1000);
  assert.equal(u.risico, 50); // 5%
  assert.equal(u.totaleKosten, 1050);
  assert.equal(u.winst, 105); // 10%
  assert.equal(u.excl, 1155);
  assert.equal(u.btw, 242.55); // 21%
  assert.equal(u.incl, 1397.55);

  b.instellingen = { btw: 9, risico: 0, winst: 20 };
  const v = bereken(b);
  assert.equal(v.excl, 1200);
  assert.equal(v.btw, 108);
});

test("offerteregels tellen altijd precies op tot het bedrag excl. btw", () => {
  const b = voorbeeld();
  b.instellingen = { btw: 21, risico: 3.7, winst: 12.3 };
  for (const indeling of ["groepen", "regels", "totaal"]) {
    b.offerte.indeling = indeling;
    const regels = offerteRegels(b);
    const som = Math.round(regels.reduce((s, r) => s + r.bedrag, 0) * 100) / 100;
    assert.equal(som, bereken(b).excl, indeling);
  }
  b.offerte.indeling = "regels";
  assert.equal(offerteRegels(b).length, 4);
});

test("factuur: hele bedrag of een deel, met btw over het gefactureerde deel", async () => {
  const { factuurBedragen, factuurNummer, normaliseer, vervaldatum } = await import("../lib/begroting/reken.ts");
  const b = voorbeeld();
  assert.equal(factuurNummer("OF-20261124-2115"), "F-20261124-2115");
  assert.deepEqual(factuurBedragen(b), { deel: 100, excl: 1155, btw: 242.55, incl: 1397.55 });
  b.factuur.deel = 30;
  assert.deepEqual(factuurBedragen(b), { deel: 30, excl: 346.5, btw: 72.77, incl: 419.27 });
  b.factuur.datum = "2026-11-24";
  b.factuur.betaaldagen = 14;
  assert.equal(vervaldatum(b), "2026-12-08");
  // Een begroting van voor de factuuroptie krijgt een factuur met een nummer bij de offerte.
  const oud = { ...b, nummer: "OF-20261001-0900" };
  delete oud.factuur;
  assert.equal(normaliseer(oud).factuur.nummer, "F-20261001-0900");
});

test("offerte zonder handtekeningblok, factuur met bedrijfsgegevens", async () => {
  // pdf.ts importeert "./reken" zonder extensie (zoals de bundler dat doet); laat Node dan .ts proberen.
  const { register } = await import("node:module");
  const hook = `export async function resolve(s, c, next) { try { return await next(s, c); } catch (e) { if (s.startsWith(".")) return next(s + ".ts", c); throw e; } }`;
  register("data:text/javascript," + encodeURIComponent(hook));
  const { offertePdf, factuurPdf } = await import("../lib/begroting/pdf.ts");
  const b = voorbeeld();
  b.klant.naam = "Test Klant";
  const logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const bedrijf = { name: "AR Civil Solutions", phoneDisplay: "06 40 15 83 08", email: "", kvk: "83094229", btw: "NL003774097B78", adres: "Cavallilaan 265", postcode: "5654 BE", plaats: "Eindhoven", iban: "" };
  const tekst = (doc) => doc.internal.pages.flat().filter(Boolean).join(" ");
  const offerte = offertePdf(b, { bedrijf, logo });
  assert.ok(!/Handtekening|Voor akkoord|VOOR AKKOORD/i.test(tekst(offerte.doc)));
  const factuur = factuurPdf(b, { bedrijf, logo });
  assert.match(factuur.naam, /^Factuur_F-/);
  const t = tekst(factuur.doc);
  for (const s of ["FACTUUR", "Cavallilaan 265", "83094229", "NL003774097B78", "Te betalen"]) assert.ok(t.includes(s), s);
});
