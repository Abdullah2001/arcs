"use client";

import { useState, type FormEvent } from "react";
import type { Photo } from "@/lib/schema";
import { errorFrom, formWithImage, ImagePicker } from "./image-tools";
import s from "./beheer.module.css";

const urlOf = (p: Photo) => `/media/foto/${p.id}?v=${p.version}`;

function Texts({ photo, prefix }: { photo?: Photo; prefix: string }) {
  return (
    <div className={s.pair}>
      <fieldset>
        <legend>Nederlands</legend>
        <label className={s.field}>
          Titel
          <input id={`${prefix}-titleNl`} name="titleNl" maxLength={90} defaultValue={photo?.titleNl} placeholder="Bijv. Badkamerrenovatie" required />
        </label>
        <label className={s.field}>
          Plaats en werk
          <input id={`${prefix}-placeNl`} name="placeNl" maxLength={120} defaultValue={photo?.placeNl} placeholder="Bijv. Eindhoven · tegelwerk" required />
        </label>
      </fieldset>
      <fieldset>
        <legend>English <small>(optioneel)</small></legend>
        <label className={s.field}>
          Title
          <input id={`${prefix}-titleEn`} name="titleEn" maxLength={90} defaultValue={photo?.titleEn ?? ""} placeholder="E.g. Bathroom renovation" />
        </label>
        <label className={s.field}>
          Place and work
          <input id={`${prefix}-placeEn`} name="placeEn" maxLength={120} defaultValue={photo?.placeEn ?? ""} placeholder="E.g. Eindhoven · tiling" />
        </label>
      </fieldset>
    </div>
  );
}

export default function PhotoManager({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [addKey, setAddKey] = useState(0);
  const say = (text: string, ok = true) => setMessage({ text, ok });

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("add");
    setMessage(null);
    try {
      const response = await fetch("/api/beheer/fotos", { method: "POST", body: await formWithImage(event.currentTarget) });
      if (!response.ok) throw new Error(await errorFrom(response, "Toevoegen is niet gelukt."));
      const { photo } = (await response.json()) as { photo: Photo };
      setPhotos((list) => [...list, photo]);
      setAddKey((k) => k + 1);
      say(`“${photo.titleNl}” staat nu op de website.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Toevoegen is niet gelukt.", false);
    } finally {
      setBusy(null);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusy(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/beheer/fotos/${id}`, { method: "PATCH", body: await formWithImage(event.currentTarget) });
      if (!response.ok) throw new Error(await errorFrom(response, "Opslaan is niet gelukt."));
      const { photo } = (await response.json()) as { photo: Photo };
      setPhotos((list) => list.map((p) => (p.id === id ? photo : p)));
      setEditing(null);
      say(`“${photo.titleNl}” is bijgewerkt.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Opslaan is niet gelukt.", false);
    } finally {
      setBusy(null);
    }
  }

  async function remove(photo: Photo) {
    setBusy(photo.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/beheer/fotos/${photo.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorFrom(response, "Verwijderen is niet gelukt."));
      setPhotos((list) => list.filter((p) => p.id !== photo.id));
      setConfirm(null);
      say(`“${photo.titleNl}” is van de website gehaald.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Verwijderen is niet gelukt.", false);
    } finally {
      setBusy(null);
    }
  }

  async function move(index: number, step: -1 | 1) {
    const target = index + step;
    if (target < 0 || target >= photos.length) return;
    const before = photos;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);
    setBusy("order");
    try {
      const response = await fetch("/api/beheer/fotos/volgorde", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!response.ok) throw new Error(await errorFrom(response, "De volgorde is niet opgeslagen."));
    } catch (e) {
      setPhotos(before);
      say(e instanceof Error ? e.message : "De volgorde is niet opgeslagen.", false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <section className={s.panel} aria-labelledby="nieuw">
        <h2 id="nieuw">Projectfoto toevoegen</h2>
        <p className={s.panelHint}>Projecten verschijnen op de website zodra er minstens één foto is.</p>
        <form key={addKey} className={s.layout} onSubmit={add}>
          <ImagePicker id="add-image" label="Klik om een foto te kiezen" required />
          <div className={s.side}>
            <Texts prefix="add" />
            <div className={s.actions}>
              <button className={s.primary} type="submit" disabled={busy === "add"}>{busy === "add" ? "Uploaden…" : "Foto toevoegen"}</button>
            </div>
          </div>
        </form>
      </section>

      {message && <p className={message.ok ? s.ok : s.error} role="status">{message.text}</p>}

      <section aria-labelledby="lijst">
        <div className={s.listHead}>
          <h2 id="lijst">Op de website</h2>
          <span>{photos.length} {photos.length === 1 ? "foto" : "foto's"}</span>
        </div>
        {photos.length === 0 ? (
          <p className={s.empty}>Nog geen projectfoto&apos;s. Voeg hierboven je eerste project toe.</p>
        ) : (
          <ol className={s.list}>
            {photos.map((photo, i) => (
              <li key={photo.id} className={s.item}>
                {editing === photo.id ? (
                  <form className={s.layout} onSubmit={(e) => save(e, photo.id)}>
                    <ImagePicker id={`edit-${photo.id}`} label="Foto vervangen" current={urlOf(photo)} />
                    <div className={s.side}>
                      <Texts photo={photo} prefix={`edit-${photo.id}`} />
                      <div className={s.actions}>
                        <button className={s.primary} type="submit" disabled={busy === photo.id}>{busy === photo.id ? "Opslaan…" : "Opslaan"}</button>
                        <button className={s.secondary} type="button" onClick={() => setEditing(null)}>Annuleren</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className={s.row}>
                    <div className={s.order}>
                      <span>{i + 1}</span>
                      <button type="button" aria-label={`${photo.titleNl} naar voren`} disabled={i === 0 || busy !== null} onClick={() => move(i, -1)}>↑</button>
                      <button type="button" aria-label={`${photo.titleNl} naar achteren`} disabled={i === photos.length - 1 || busy !== null} onClick={() => move(i, 1)}>↓</button>
                    </div>
                    <img className={s.thumb} src={urlOf(photo)} alt={photo.titleNl} loading="lazy" />
                    <div className={s.meta}>
                      <strong>{photo.titleNl}</strong>
                      <span>{photo.placeNl}</span>
                      <small>{photo.titleEn ? `EN: ${photo.titleEn}${photo.placeEn ? ` · ${photo.placeEn}` : ""}` : "Nog geen Engelse tekst"}</small>
                    </div>
                    <div className={s.actions}>
                      {confirm === photo.id ? (
                        <>
                          <button className={s.danger} type="button" disabled={busy === photo.id} onClick={() => remove(photo)}>{busy === photo.id ? "Bezig…" : "Ja, verwijderen"}</button>
                          <button className={s.secondary} type="button" onClick={() => setConfirm(null)}>Nee</button>
                        </>
                      ) : (
                        <>
                          <button className={s.secondary} type="button" onClick={() => { setEditing(photo.id); setConfirm(null); }}>Wijzigen</button>
                          <button className={s.dangerQuiet} type="button" onClick={() => setConfirm(photo.id)}>Verwijderen</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
