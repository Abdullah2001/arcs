"use client";

import { useState, type FormEvent } from "react";
import type { SiteImage } from "@/lib/schema";
import { errorFrom, formWithImage, ImagePicker } from "./image-tools";
import s from "./beheer.module.css";

const urlOf = (img: SiteImage) => `/media/site/${img.slot}?v=${img.version}`;

export default function HeroManager({ initial }: { initial: SiteImage | null }) {
  const [hero, setHero] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/beheer/hoofdfoto", { method: "POST", body: await formWithImage(event.currentTarget) });
      if (!response.ok) throw new Error(await errorFrom(response, "Opslaan is niet gelukt."));
      setHero(((await response.json()) as { image: SiteImage }).image);
      setFormKey((k) => k + 1);
      setMessage({ text: "De hoofdfoto staat op de website.", ok: true });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Opslaan is niet gelukt.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/beheer/hoofdfoto", { method: "DELETE" });
      if (!response.ok) throw new Error(await errorFrom(response, "Verwijderen is niet gelukt."));
      setHero(null);
      setConfirm(false);
      setFormKey((k) => k + 1);
      setMessage({ text: "De hoofdfoto is verwijderd. Bovenaan staat nu weer de donkere achtergrond.", ok: true });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Verwijderen is niet gelukt.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={s.panel} aria-labelledby="hoofdfoto">
      <h2 id="hoofdfoto">Hoofdfoto bovenaan de homepage</h2>
      <p className={s.panelHint}>Een liggende foto werkt het best. De tekst staat links over de foto, dus links mag het rustig zijn.</p>
      <form key={formKey} className={s.layout} onSubmit={save}>
        <ImagePicker id="hero-image" wide label={hero ? "Foto vervangen" : "Klik om een foto te kiezen"} current={hero ? urlOf(hero) : undefined} required={!hero} />
        <div className={s.side}>
          <div className={s.pair}>
            <label className={s.field}>
              Wat staat erop? (Nederlands)
              <input id="hero-altNl" name="altNl" maxLength={160} defaultValue={hero?.altNl ?? ""} placeholder="Bijv. Woonkamer na de renovatie" />
            </label>
            <label className={s.field}>
              What is shown? (English)
              <input id="hero-altEn" name="altEn" maxLength={160} defaultValue={hero?.altEn ?? ""} placeholder="E.g. Living room after renovation" />
            </label>
          </div>
          <div className={s.actions}>
            <button className={s.primary} type="submit" disabled={busy}>{busy ? "Bezig…" : "Hoofdfoto opslaan"}</button>
            {hero &&
              (confirm ? (
                <>
                  <button className={s.danger} type="button" disabled={busy} onClick={remove}>Ja, verwijderen</button>
                  <button className={s.secondary} type="button" onClick={() => setConfirm(false)}>Nee</button>
                </>
              ) : (
                <button className={s.dangerQuiet} type="button" onClick={() => setConfirm(true)}>Hoofdfoto verwijderen</button>
              ))}
          </div>
          {message && <p className={message.ok ? s.ok : s.error} role="status">{message.text}</p>}
        </div>
      </form>
    </section>
  );
}
