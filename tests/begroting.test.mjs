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
