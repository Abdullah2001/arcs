"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Bedrijf } from "@/lib/begroting/pdf";
import {
  arbeidBedrag,
  bereken,
  euro,
  formatDatum,
  formatGetal,
  geldigTot,
  legeArbeidRegel,
  legeMateriaalRegel,
  materiaalBedrag,
  materiaalUitProduct,
  nieuweBegroting,
  normaliseer,
  offerteRegels,
  STANDAARD,
  verpakkingen,
  type ArbeidRegel,
  type Begroting,
  type Indeling,
  type MateriaalRegel,
  type Prijzenbestand,
  type Product,
  type Samenvatting,
} from "@/lib/begroting/reken";
import { lokaleOpslag, lokalePrijzen, serverOpslag, type Opslag } from "./opslag-client";
import s from "../beheer.module.css";
import b from "./begroting.module.css";

const CONCEPT = "arcs-begroting-concept";
const MAX_RESULTATEN = 40;

type Props = {
  prijzen: Prijzenbestand;
  bedrijf: Bedrijf;
  /** "server" in de beheeromgeving; "lokaal" in de testversie zonder server. */
  modus: "server" | "lokaal";
  logoUrl?: string;
  /** Begroting om mee te beginnen als er nog geen concept in deze browser staat (testversie). */
  voorbeeld?: Begroting;
};
type Melding = { text: string; ok: boolean } | null;

/** Getalveld dat ook een komma accepteert (Nederlandse notatie). */
function Getal({ value, onChange, label, suffix, min = 0, className }: { value: number; onChange: (v: number) => void; label: string; suffix?: string; min?: number; className?: string }) {
  const [tekst, setTekst] = useState(() => formatInvoer(value));
  const laatste = useRef(value);
  useEffect(() => {
    if (value !== laatste.current) {
      laatste.current = value;
      setTekst(formatInvoer(value));
    }
  }, [value]);
  return (
    <span className={`${b.getal} ${className ?? ""}`}>
      <input
        aria-label={label}
        inputMode="decimal"
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          const v = Number(e.target.value.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
          if (Number.isFinite(v)) {
            const w = Math.max(min, v);
            laatste.current = w;
            onChange(w);
          }
        }}
        onBlur={() => setTekst(formatInvoer(laatste.current))}
      />
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
  );
}
const formatInvoer = (v: number) => (Number.isFinite(v) ? String(Math.round(v * 10_000) / 10_000).replace(".", ",") : "");

function Veld({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`${s.field} ${b.veld} ${wide ? b.breed : ""}`}>
      {label}
      {children}
    </label>
  );
}

async function naarDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Het logo kon niet worden geladen."));
    r.readAsDataURL(blob);
  });
}

function zoek(producten: Product[], term: string, groep: string, winkel: string): Product[] {
  const woorden = term.toLowerCase().split(/\s+/).filter(Boolean);
  return producten.filter((p) => {
    if (groep && p.groep !== groep) return false;
    if (winkel && p.winkel !== winkel) return false;
    const tekst = `${p.code} ${p.product} ${p.subgroep} ${p.groep} ${p.winkel}`.toLowerCase();
    return woorden.every((w) => tekst.includes(w));
  });
}

/** Het concept dat in deze browser is bewaard, zodat verversen of wegklikken niets kost. */
function leesConcept(): Begroting | null {
  try {
    return normaliseer(JSON.parse(localStorage.getItem(CONCEPT) ?? "null"));
  } catch {
    return null;
  }
}

const geenAbonnement = () => () => {};

/** De tool draait alleen in de browser: hij leest het concept uit de browseropslag. */
export default function BegrotingTool(props: Props) {
  const inBrowser = useSyncExternalStore(geenAbonnement, () => true, () => false);
  if (!inBrowser) {
    return (
      <main className={`${s.main} ${b.main}`}>
        <div className={s.intro}>
          <h1>Begroting en offerte</h1>
          <p>Laden…</p>
        </div>
      </main>
    );
  }
  return <Werkblad {...props} />;
}

function Werkblad({ prijzen: beginPrijzen, bedrijf, modus, logoUrl = "/images/brand/logo-horizontal-light.png", voorbeeld }: Props) {
  const opslag: Opslag = useMemo(() => (modus === "server" ? serverOpslag : lokaleOpslag(beginPrijzen)), [modus, beginPrijzen]);
  const [prijzen, setPrijzen] = useState(() => (modus === "lokaal" ? (lokalePrijzen() ?? beginPrijzen) : beginPrijzen));
  const [begroting, setBegroting] = useState<Begroting>(() => leesConcept() ?? voorbeeld ?? nieuweBegroting());
  const [opgeslagen, setOpgeslagen] = useState<string | null>(null);
  const [melding, setMelding] = useState<Melding>(null);
  const [bezig, setBezig] = useState<string | null>(null);
  const [lijst, setLijst] = useState<Samenvatting[] | null>(null);
  const [lijstOpen, setLijstOpen] = useState(false);
  const [verwijderVraag, setVerwijderVraag] = useState<string | null>(null);
  const [nieuwVraag, setNieuwVraag] = useState(false);

  const [term, setTerm] = useState("");
  const [groep, setGroep] = useState("");
  const [winkel, setWinkel] = useState("");
  const [tarief, setTarief] = useState<number>(() => begroting.arbeid.find((r) => r.soort === "uren")?.tarief ?? STANDAARD.uurtarief);

  useEffect(() => {
    try {
      localStorage.setItem(CONCEPT, JSON.stringify(begroting));
    } catch {
      // opslag niet beschikbaar
    }
  }, [begroting]);

  const u = useMemo(() => bereken(begroting), [begroting]);
  const klantRegels = useMemo(() => offerteRegels(begroting, u), [begroting, u]);
  const groepen = useMemo(() => [...new Set(prijzen.producten.map((p) => p.groep))].filter(Boolean).sort(), [prijzen]);
  const winkels = useMemo(() => [...new Set(prijzen.producten.map((p) => p.winkel))].filter(Boolean).sort(), [prijzen]);
  const resultaten = useMemo(() => zoek(prijzen.producten, term, groep, winkel), [prijzen, term, groep, winkel]);
  const gewijzigd = opgeslagen !== JSON.stringify({ ...begroting, bijgewerkt: "" });

  const zet = (f: (x: Begroting) => Begroting) => setBegroting((x) => f(x));
  const zetKlant = (k: keyof Begroting["klant"], v: string) => zet((x) => ({ ...x, klant: { ...x.klant, [k]: v } }));
  const zetProject = (k: keyof Begroting["project"], v: string) => zet((x) => ({ ...x, project: { ...x.project, [k]: v } }));
  const zetInstelling = (k: keyof Begroting["instellingen"], v: number) => zet((x) => ({ ...x, instellingen: { ...x.instellingen, [k]: v } }));
  const zetMateriaal = (id: string, wijziging: Partial<MateriaalRegel>) =>
    zet((x) => ({ ...x, materialen: x.materialen.map((r) => (r.id === id ? { ...r, ...wijziging } : r)) }));
  const zetArbeid = (id: string, wijziging: Partial<ArbeidRegel>) =>
    zet((x) => ({ ...x, arbeid: x.arbeid.map((r) => (r.id === id ? { ...r, ...wijziging } : r)) }));
  const verplaats = <T,>(lijst: T[], i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= lijst.length) return lijst;
    const kopie = [...lijst];
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    return kopie;
  };

  async function actie(naam: string, f: () => Promise<void>) {
    setBezig(naam);
    setMelding(null);
    try {
      await f();
    } catch (e) {
      setMelding({ text: e instanceof Error ? e.message : "Er ging iets mis.", ok: false });
    } finally {
      setBezig(null);
    }
  }

  const ververs = () => actie("lijst", async () => setLijst(await opslag.lijst()));

  const bewaar = () =>
    actie("opslaan", async () => {
      const nu = { ...begroting, bijgewerkt: new Date().toISOString() };
      await opslag.bewaar(nu);
      setBegroting(nu);
      setOpgeslagen(JSON.stringify({ ...nu, bijgewerkt: "" }));
      setMelding({ text: `Begroting ${nu.nummer} is opgeslagen.`, ok: true });
      if (lijst) setLijst(await opslag.lijst());
    });

  const open = (id: string) =>
    actie("open", async () => {
      const x = await opslag.laad(id);
      setBegroting(x);
      setOpgeslagen(JSON.stringify({ ...x, bijgewerkt: "" }));
      setLijstOpen(false);
      setMelding({ text: `Begroting ${x.nummer} is geopend.`, ok: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  const verwijder = (id: string) =>
    actie("verwijder", async () => {
      await opslag.verwijder(id);
      setVerwijderVraag(null);
      setLijst(await opslag.lijst());
      if (id === begroting.id) setOpgeslagen(null);
    });

  function nieuw(zeker = false) {
    if (!zeker && gewijzigd && (begroting.materialen.length || begroting.arbeid.length)) {
      setNieuwVraag(true);
      return;
    }
    setNieuwVraag(false);
    const n = nieuweBegroting();
    n.instellingen = { ...begroting.instellingen };
    setBegroting(n);
    setOpgeslagen(null);
    setMelding(null);
  }

  function kopie() {
    const n = nieuweBegroting();
    setBegroting({ ...begroting, id: n.id, nummer: n.nummer, datum: n.datum, bijgewerkt: n.bijgewerkt });
    setOpgeslagen(null);
    setMelding({ text: "Kopie gemaakt met een nieuw nummer. Sla hem op om hem te bewaren.", ok: true });
  }

  const pdf = (soort: "offerte" | "werkbegroting") =>
    actie(soort, async () => {
      const [{ offertePdf, werkbegrotingPdf }, logo] = await Promise.all([import("@/lib/begroting/pdf"), naarDataUrl(logoUrl)]);
      const maak = soort === "offerte" ? offertePdf : werkbegrotingPdf;
      const { doc, naam } = maak(begroting, { bedrijf, logo });
      doc.save(naam);
    });

  const uploadPrijzen = (file: File) =>
    actie("prijzen", async () => {
      const { leesPrijzenUitExcel } = await import("@/lib/begroting/excel");
      const producten = await leesPrijzenUitExcel(await file.arrayBuffer());
      setPrijzen(await opslag.bewaarPrijzen(file.name, producten));
      setMelding({ text: `${producten.length} producten ingelezen uit ${file.name}. Bestaande regels in deze begroting houden hun prijs.`, ok: true });
    });

  const standaardPrijzen = () =>
    actie("prijzen", async () => {
      setPrijzen(await opslag.standaardPrijzen());
      setMelding({ text: "De standaardprijzen worden weer gebruikt.", ok: true });
    });

  function voegToe(p: Product) {
    zet((x) => ({ ...x, materialen: [...x.materialen, materiaalUitProduct(p)] }));
  }

  return (
    <main className={`${s.main} ${b.main}`}>
      <div className={b.kop}>
        <div className={s.intro}>
          <h1>Begroting en offerte</h1>
          <p>
            Maak eerst de werkbegroting met materialen en arbeid. Risico, winst en btw worden automatisch berekend. Daarna download je de
            offerte voor de klant als PDF.
          </p>
        </div>
        <div className={b.knoppen}>
          <button type="button" className={s.secondary} onClick={() => nieuw()}>Nieuwe begroting</button>
          <button type="button" className={s.secondary} onClick={kopie}>Kopie maken</button>
          <button
            type="button"
            className={s.secondary}
            aria-expanded={lijstOpen}
            onClick={() => {
              setLijstOpen(!lijstOpen);
              if (!lijstOpen) ververs();
            }}
          >
            Opgeslagen begrotingen
          </button>
          <button type="button" className={s.primary} onClick={bewaar} disabled={bezig === "opslaan"}>
            {bezig === "opslaan" ? "Opslaan…" : "Opslaan"}
          </button>
          <span className={b.status}>{opgeslagen === null ? "Nog niet opgeslagen" : gewijzigd ? "Niet opgeslagen wijzigingen" : "Alles is opgeslagen"}</span>
        </div>
        {nieuwVraag && (
          <div className={`${s.warn} ${b.vraag}`} role="alert">
            <span>Deze begroting heeft wijzigingen die nog niet zijn opgeslagen. Toch een nieuwe beginnen?</span>
            <div className={s.actions}>
              <button type="button" className={s.danger} onClick={() => nieuw(true)}>Nieuwe beginnen</button>
              <button type="button" className={s.secondary} onClick={() => setNieuwVraag(false)}>Annuleren</button>
            </div>
          </div>
        )}
        {modus === "lokaal" && (
          <p className={s.warn}>Testversie: begrotingen en geüploade prijzen worden alleen in deze browser bewaard.</p>
        )}
        {melding && (
          <p className={melding.ok ? s.ok : s.error} role={melding.ok ? "status" : "alert"}>
            {melding.text}
          </p>
        )}
      </div>

      {lijstOpen && (
        <section className={s.panel} aria-labelledby="opgeslagen">
          <div className={s.listHead}>
            <h2 id="opgeslagen">Opgeslagen begrotingen</h2>
            <button type="button" className={s.secondary} onClick={() => setLijstOpen(false)}>Sluiten</button>
          </div>
          {!lijst ? (
            <p className={s.panelHint}>Laden…</p>
          ) : lijst.length === 0 ? (
            <p className={s.empty}>Nog niets opgeslagen.</p>
          ) : (
            <ul className={b.opgeslagen}>
              {lijst.map((x) => (
                <li key={x.id} className={x.id === begroting.id ? b.huidig : undefined}>
                  <div>
                    <strong>{x.nummer}</strong> · {x.klant || "zonder klant"}
                    <small>{x.titel || "zonder titel"} · bijgewerkt {formatDatum(x.bijgewerkt)}</small>
                  </div>
                  <span className={b.bedrag}>{euro(x.totaal)}</span>
                  <div className={s.actions}>
                    {verwijderVraag === x.id ? (
                      <>
                        <button type="button" className={s.danger} onClick={() => verwijder(x.id)} disabled={bezig === "verwijder"}>Definitief verwijderen</button>
                        <button type="button" className={s.secondary} onClick={() => setVerwijderVraag(null)}>Annuleren</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={s.primary} onClick={() => open(x.id)}>Openen</button>
                        <button type="button" className={s.dangerQuiet} onClick={() => setVerwijderVraag(x.id)}>Verwijderen</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className={b.indeling}>
        <div className={b.links}>
          <section className={s.panel} aria-labelledby="klant">
            <h2 id="klant">Klant en project</h2>
            <div className={b.velden}>
              <Veld label="Offertenummer">
                <input value={begroting.nummer} onChange={(e) => zet((x) => ({ ...x, nummer: e.target.value }))} />
              </Veld>
              <Veld label="Datum">
                <input type="date" value={begroting.datum} onChange={(e) => zet((x) => ({ ...x, datum: e.target.value }))} />
              </Veld>
              <Veld label={`Geldig (dagen) · tot ${formatDatum(geldigTot(begroting))}`}>
                <Getal label="Geldig aantal dagen" value={begroting.geldigDagen} onChange={(v) => zet((x) => ({ ...x, geldigDagen: Math.round(v) }))} />
              </Veld>
            </div>
            <div className={b.velden}>
              <Veld label="Naam klant" wide>
                <input value={begroting.klant.naam} onChange={(e) => zetKlant("naam", e.target.value)} autoComplete="off" />
              </Veld>
              <Veld label="Adres">
                <input value={begroting.klant.adres} onChange={(e) => zetKlant("adres", e.target.value)} autoComplete="off" />
              </Veld>
              <Veld label="Postcode en plaats">
                <input value={begroting.klant.plaats} onChange={(e) => zetKlant("plaats", e.target.value)} autoComplete="off" />
              </Veld>
              <Veld label="E-mail">
                <input type="email" value={begroting.klant.email} onChange={(e) => zetKlant("email", e.target.value)} autoComplete="off" />
              </Veld>
              <Veld label="Telefoon">
                <input type="tel" value={begroting.klant.telefoon} onChange={(e) => zetKlant("telefoon", e.target.value)} autoComplete="off" />
              </Veld>
            </div>
            <div className={b.velden}>
              <Veld label="Project (titel op de offerte)" wide>
                <input value={begroting.project.titel} onChange={(e) => zetProject("titel", e.target.value)} placeholder="Bijvoorbeeld: Badkamer renovatie" />
              </Veld>
              <Veld label="Werkadres (als dat anders is)" wide>
                <input value={begroting.project.adres} onChange={(e) => zetProject("adres", e.target.value)} />
              </Veld>
              <Veld label="Omschrijving van het werk (komt op de offerte)" wide>
                <textarea rows={3} value={begroting.project.omschrijving} onChange={(e) => zetProject("omschrijving", e.target.value)} />
              </Veld>
            </div>
          </section>

          <section className={s.panel} aria-labelledby="materialen">
            <div className={b.sectieKop}>
              <h2 id="materialen">Materialen</h2>
              <span>{euro(u.materiaal)}</span>
            </div>
            <div className={b.zoeker}>
              <div className={b.zoekVelden}>
                <Veld label={`Zoek in ${prijzen.producten.length} producten`}>
                  <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Bijvoorbeeld: gipsplaat, tegellijm, muurverf" />
                </Veld>
                <Veld label="Groep">
                  <select value={groep} onChange={(e) => setGroep(e.target.value)}>
                    <option value="">Alle groepen</option>
                    {groepen.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Veld>
                <Veld label="Winkel">
                  <select value={winkel} onChange={(e) => setWinkel(e.target.value)}>
                    <option value="">Beide winkels</option>
                    {winkels.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Veld>
              </div>
              {(term || groep || winkel) && (
                <div className={b.resultaten}>
                  {resultaten.length === 0 ? (
                    <p className={b.leeg}>Geen producten gevonden. Je kunt ook een eigen regel toevoegen.</p>
                  ) : (
                    <ul>
                      {resultaten.slice(0, MAX_RESULTATEN).map((p) => (
                        <li key={`${p.code}-${p.winkel}`}>
                          <button type="button" onClick={() => voegToe(p)}>
                            <span className={b.product}>
                              {p.product}
                              <small>{p.subgroep} · {p.winkel} · {p.code}</small>
                            </span>
                            <span className={b.prijs}>
                              {euro(p.prijs)}
                              <small>per {p.per}</small>
                            </span>
                            <span className={b.plus} aria-hidden="true">+</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {resultaten.length > MAX_RESULTATEN && <p className={b.leeg}>Nog {resultaten.length - MAX_RESULTATEN} producten. Zoek specifieker.</p>}
                </div>
              )}
            </div>

            {begroting.materialen.length > 0 && (
              <div className={b.regels}>
                <div className={`${b.regel} ${b.regelKop} ${b.materiaal}`} aria-hidden="true">
                  <span>Omschrijving</span>
                  <span>Hoeveelheid</span>
                  <span>Prijs excl. btw</span>
                  <span>Bedrag</span>
                  <span />
                </div>
                {begroting.materialen.map((r, i) => (
                  <div key={r.id} className={`${b.regel} ${b.materiaal}`}>
                    <div className={b.omschrijving}>
                      <input aria-label="Omschrijving" title={r.omschrijving} value={r.omschrijving} onChange={(e) => zetMateriaal(r.id, { omschrijving: e.target.value })} placeholder="Omschrijving" />
                      <small>{r.code ? `${r.code} · ${r.winkel}` : "eigen regel"}</small>
                    </div>
                    <div className={b.hoeveelheid}>
                      <Getal label="Hoeveelheid" value={r.hoeveelheid} onChange={(v) => zetMateriaal(r.id, { hoeveelheid: v })} />
                      {r.code ? (
                        <select
                          aria-label="Eenheid"
                          value={r.invoer}
                          onChange={(e) => zetMateriaal(r.id, { invoer: e.target.value as MateriaalRegel["invoer"] })}
                        >
                          <option value="verpakking">× {r.per}</option>
                          {r.inhoud > 0 && r.eenheid && <option value="eenheid">{r.eenheid}</option>}
                        </select>
                      ) : (
                        <input aria-label="Eenheid" className={b.eenheid} value={r.per} onChange={(e) => zetMateriaal(r.id, { per: e.target.value, eenheid: e.target.value })} />
                      )}
                      {r.invoer === "eenheid" && <small>= {formatGetal(verpakkingen(r))} × {r.per}</small>}
                    </div>
                    <div>
                      <Getal label="Prijs excl. btw" value={r.prijs} onChange={(v) => zetMateriaal(r.id, { prijs: v })} suffix="€" />
                      <small>per {r.per}</small>
                    </div>
                    <span className={b.bedrag}>{euro(materiaalBedrag(r))}</span>
                    <div className={b.regelKnoppen}>
                      <button type="button" aria-label="Omhoog" onClick={() => zet((x) => ({ ...x, materialen: verplaats(x.materialen, i, -1) }))} disabled={i === 0}>↑</button>
                      <button type="button" aria-label="Omlaag" onClick={() => zet((x) => ({ ...x, materialen: verplaats(x.materialen, i, 1) }))} disabled={i === begroting.materialen.length - 1}>↓</button>
                      <button type="button" aria-label="Regel verwijderen" onClick={() => zet((x) => ({ ...x, materialen: x.materialen.filter((m) => m.id !== r.id) }))}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={s.actions}>
              <button type="button" className={s.secondary} onClick={() => zet((x) => ({ ...x, materialen: [...x.materialen, legeMateriaalRegel()] }))}>
                + Eigen materiaalregel
              </button>
            </div>
          </section>

          <section className={s.panel} aria-labelledby="arbeid">
            <div className={b.sectieKop}>
              <h2 id="arbeid">Arbeid</h2>
              <span>{euro(u.arbeid)}</span>
            </div>
            <p className={s.panelHint}>Vul uren en uurtarief in, of een vast bedrag (bijvoorbeeld voor een onderaannemer). Bedragen zijn excl. btw.</p>
            {begroting.arbeid.length > 0 && (
              <div className={b.regels}>
                <div className={`${b.regel} ${b.regelKop} ${b.arbeidRegel}`} aria-hidden="true">
                  <span>Omschrijving</span>
                  <span>Soort</span>
                  <span>Uren × tarief / bedrag</span>
                  <span>Bedrag</span>
                  <span />
                </div>
                {begroting.arbeid.map((r, i) => (
                  <div key={r.id} className={`${b.regel} ${b.arbeidRegel}`}>
                    <div className={b.omschrijving}>
                      <input aria-label="Omschrijving" value={r.omschrijving} onChange={(e) => zetArbeid(r.id, { omschrijving: e.target.value })} placeholder="Bijvoorbeeld: wanden plaatsen" />
                    </div>
                    <select aria-label="Soort" value={r.soort} onChange={(e) => zetArbeid(r.id, { soort: e.target.value as ArbeidRegel["soort"] })}>
                      <option value="uren">Uren × tarief</option>
                      <option value="vast">Vast bedrag</option>
                    </select>
                    {r.soort === "uren" ? (
                      <div className={b.urenTarief}>
                        <Getal label="Uren" value={r.uren} onChange={(v) => zetArbeid(r.id, { uren: v })} suffix="uur" />
                        <span aria-hidden="true">×</span>
                        <Getal
                          label="Uurtarief"
                          value={r.tarief}
                          onChange={(v) => {
                            zetArbeid(r.id, { tarief: v });
                            setTarief(v);
                          }}
                          suffix="€"
                        />
                      </div>
                    ) : (
                      <Getal label="Vast bedrag" value={r.bedrag} onChange={(v) => zetArbeid(r.id, { bedrag: v })} suffix="€" />
                    )}
                    <span className={b.bedrag}>{euro(arbeidBedrag(r))}</span>
                    <div className={b.regelKnoppen}>
                      <button type="button" aria-label="Omhoog" onClick={() => zet((x) => ({ ...x, arbeid: verplaats(x.arbeid, i, -1) }))} disabled={i === 0}>↑</button>
                      <button type="button" aria-label="Omlaag" onClick={() => zet((x) => ({ ...x, arbeid: verplaats(x.arbeid, i, 1) }))} disabled={i === begroting.arbeid.length - 1}>↓</button>
                      <button type="button" aria-label="Regel verwijderen" onClick={() => zet((x) => ({ ...x, arbeid: x.arbeid.filter((m) => m.id !== r.id) }))}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={s.actions}>
              <button type="button" className={s.secondary} onClick={() => zet((x) => ({ ...x, arbeid: [...x.arbeid, legeArbeidRegel(tarief)] }))}>
                + Arbeidsregel
              </button>
            </div>
          </section>

          <section className={s.panel} aria-labelledby="offerte">
            <h2 id="offerte">Offerte voor de klant</h2>
            <p className={s.panelHint}>
              De klant ziet geen inkoopprijzen, risico of winst. Die zijn naar verhouding verwerkt in de bedragen hieronder.
            </p>
            <fieldset className={b.keuze}>
              <legend>Wat ziet de klant?</legend>
              {(
                [
                  ["groepen", "Materiaal en arbeid apart"],
                  ["regels", "Elke regel apart"],
                  ["totaal", "Eén totaalprijs"],
                ] as [Indeling, string][]
              ).map(([waarde, tekst]) => (
                <label key={waarde}>
                  <input
                    type="radio"
                    name="indeling"
                    checked={begroting.offerte.indeling === waarde}
                    onChange={() => zet((x) => ({ ...x, offerte: { ...x.offerte, indeling: waarde } }))}
                  />
                  {tekst}
                </label>
              ))}
            </fieldset>
            <div className={b.voorbeeld}>
              {klantRegels.length === 0 ? (
                <p className={b.leeg}>Voeg materialen of arbeid toe om de offerte te zien.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Omschrijving</th>
                      <th>Hoeveelheid</th>
                      <th>Bedrag excl. btw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {klantRegels.map((r, i) => (
                      <tr key={i}>
                        <td>{r.omschrijving}</td>
                        <td>{r.hoeveelheid}</td>
                        <td>{euro(r.bedrag)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Totaal excl. btw</td>
                      <td>{euro(u.excl)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}>Btw {formatGetal(begroting.instellingen.btw)}%</td>
                      <td>{euro(u.btw)}</td>
                    </tr>
                    <tr className={b.eind}>
                      <td colSpan={2}>Totaal incl. btw</td>
                      <td>{euro(u.incl)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
            <Veld label="Voorwaarden (één per regel)" wide>
              <textarea rows={5} value={begroting.offerte.voorwaarden} onChange={(e) => zet((x) => ({ ...x, offerte: { ...x.offerte, voorwaarden: e.target.value } }))} />
            </Veld>
          </section>

          <section className={s.panel} aria-labelledby="prijzen">
            <h2 id="prijzen">Prijzendatabase</h2>
            <p className={s.panelHint}>
              {prijzen.producten.length} producten uit <strong>{prijzen.bestandsnaam}</strong>
              {prijzen.bron === "upload" ? `, geüpload op ${formatDatum(prijzen.bijgewerkt)}.` : " (standaard)."} Pas je prijzen aan in Excel en upload
              het bestand hier opnieuw. Het blad &quot;Materialen&quot; wordt gelezen.
            </p>
            <div className={s.actions}>
              <label className={`${s.primary} ${b.upload}`}>
                {bezig === "prijzen" ? "Inlezen…" : "Excel-bestand uploaden"}
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) uploadPrijzen(f);
                  }}
                />
              </label>
              {prijzen.bron === "upload" && (
                <button type="button" className={s.secondary} onClick={standaardPrijzen}>Standaardprijzen gebruiken</button>
              )}
            </div>
          </section>
        </div>

        <aside className={b.rechts} aria-label="Berekening">
          <section className={`${s.panel} ${b.som}`}>
            <h2>Berekening</h2>
            <div className={b.marges}>
              <Veld label="Risico over bouwkosten">
                <Getal label="Risicomarge" value={begroting.instellingen.risico} onChange={(v) => zetInstelling("risico", v)} suffix="%" />
              </Veld>
              <Veld label="Winst over totale kosten">
                <Getal label="Winstmarge" value={begroting.instellingen.winst} onChange={(v) => zetInstelling("winst", v)} suffix="%" />
              </Veld>
              <Veld label="Btw">
                <Getal label="Btw-percentage" value={begroting.instellingen.btw} onChange={(v) => zetInstelling("btw", v)} suffix="%" />
              </Veld>
            </div>
            <dl className={b.lijst}>
              <div><dt>Materiaal</dt><dd>{euro(u.materiaal)}</dd></div>
              <div><dt>Arbeid{u.uren > 0 ? ` (${formatGetal(u.uren)} uur)` : ""}</dt><dd>{euro(u.arbeid)}</dd></div>
              <div className={b.sub}><dt>Bouwkosten</dt><dd>{euro(u.bouwkosten)}</dd></div>
              <div><dt>Risico {formatGetal(begroting.instellingen.risico)}%</dt><dd>{euro(u.risico)}</dd></div>
              <div className={b.sub}><dt>Totale kosten</dt><dd>{euro(u.totaleKosten)}</dd></div>
              <div><dt>Winst {formatGetal(begroting.instellingen.winst)}%</dt><dd>{euro(u.winst)}</dd></div>
              <div className={b.sub}><dt>Offerte excl. btw</dt><dd>{euro(u.excl)}</dd></div>
              <div><dt>Btw {formatGetal(begroting.instellingen.btw)}%</dt><dd>{euro(u.btw)}</dd></div>
              <div className={b.totaal}><dt>Offerte incl. btw</dt><dd>{euro(u.incl)}</dd></div>
            </dl>
            <div className={b.pdfKnoppen}>
              <button type="button" className={s.primary} onClick={() => pdf("offerte")} disabled={bezig === "offerte"}>
                {bezig === "offerte" ? "PDF maken…" : "Offerte downloaden (PDF)"}
              </button>
              <button type="button" className={s.secondary} onClick={() => pdf("werkbegroting")} disabled={bezig === "werkbegroting"}>
                {bezig === "werkbegroting" ? "PDF maken…" : "Werkbegroting downloaden (PDF)"}
              </button>
              {modus === "lokaal" && <small className={b.noot}>In deze testversie blokkeert de pagina soms het downloaden. Op de website werkt het altijd.</small>}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
