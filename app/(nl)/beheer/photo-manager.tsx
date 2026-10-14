"use client";

import { useState, type FormEvent } from "react";
import type { Project } from "@/db/schema";
import styles from "./beheer.module.css";

type Flash = { text: string; error: boolean } | null;

async function errorText(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return "Je bent niet meer ingelogd. Laad de pagina opnieuw en log in.";
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Verkleint grote foto's (bijv. van een telefoon) in de browser tot max. 2000 px
 * en slaat ze op als WebP of JPEG. Zo laadt de website snel.
 */
async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const type of ["image/webp", "image/jpeg"]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.84));
      if (blob && blob.type === type) {
        const ext = type === "image/webp" ? "webp" : "jpg";
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type });
      }
    }
  } catch {
    // Lukt verkleinen niet, dan sturen we het origineel.
  }
  return file;
}

async function formWithPreparedImage(form: HTMLFormElement): Promise<FormData> {
  const data = new FormData(form);
  const image = data.get("image");
  if (image instanceof File && image.size > 0) data.set("image", await prepareImage(image));
  else data.delete("image");
  return data;
}

function ImagePicker({ id, required, label }: { id: string; required?: boolean; label: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <label className={styles.picker} htmlFor={id}>
      {preview ? <img src={preview} alt="" /> : <span className={styles.pickerEmpty}>{label}</span>}
      <input
        id={id}
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return file ? URL.createObjectURL(file) : null;
          });
        }}
      />
      <span className={styles.pickerHint}>{preview ? "Andere foto kiezen" : "JPG, PNG of WebP"}</span>
    </label>
  );
}

function TextFields({ project, prefix }: { project?: Project; prefix: string }) {
  return (
    <div className={styles.textFields}>
      <fieldset>
        <legend>Nederlands</legend>
        <label className={styles.field}>
          <span>Titel</span>
          <input id={`${prefix}-title`} name="title" maxLength={90} defaultValue={project?.title} placeholder="Bijv. Badkamerrenovatie" required />
        </label>
        <label className={styles.field}>
          <span>Plaats en werkzaamheden</span>
          <input id={`${prefix}-location`} name="location" maxLength={120} defaultValue={project?.location} placeholder="Bijv. Eindhoven · tegelwerk" required />
        </label>
      </fieldset>
      <fieldset>
        <legend>English <small>(optioneel)</small></legend>
        <label className={styles.field}>
          <span>Title</span>
          <input id={`${prefix}-titleEn`} name="titleEn" maxLength={90} defaultValue={project?.titleEn ?? ""} placeholder="E.g. Bathroom renovation" />
        </label>
        <label className={styles.field}>
          <span>Place and work</span>
          <input id={`${prefix}-locationEn`} name="locationEn" maxLength={120} defaultValue={project?.locationEn ?? ""} placeholder="E.g. Eindhoven · tiling" />
        </label>
      </fieldset>
    </div>
  );
}

export default function PhotoManager({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [addKey, setAddKey] = useState(0);

  const say = (text: string, error = false) => setFlash({ text, error });

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("add");
    setFlash(null);
    try {
      const response = await fetch("/api/admin/projects", { method: "POST", body: await formWithPreparedImage(event.currentTarget) });
      if (!response.ok) throw new Error(await errorText(response, "Toevoegen is niet gelukt."));
      const { project } = (await response.json()) as { project: Project };
      setProjects((list) => [...list, project]);
      setAddKey((k) => k + 1);
      say(`“${project.title}” is toegevoegd en staat op de website.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Toevoegen is niet gelukt.", true);
    } finally {
      setBusy(null);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusy(id);
    setFlash(null);
    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: await formWithPreparedImage(event.currentTarget),
      });
      if (!response.ok) throw new Error(await errorText(response, "Opslaan is niet gelukt."));
      const { project } = (await response.json()) as { project: Project };
      setProjects((list) => list.map((p) => (p.id === id ? project : p)));
      setEditing(null);
      say(`“${project.title}” is bijgewerkt.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Opslaan is niet gelukt.", true);
    } finally {
      setBusy(null);
    }
  }

  async function remove(project: Project) {
    setBusy(project.id);
    setFlash(null);
    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorText(response, "Verwijderen is niet gelukt."));
      setProjects((list) => list.filter((p) => p.id !== project.id));
      setConfirmDelete(null);
      say(`“${project.title}” is van de website verwijderd.`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Verwijderen is niet gelukt.", true);
    } finally {
      setBusy(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const previous = projects;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    setBusy("order");
    try {
      const response = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!response.ok) throw new Error(await errorText(response, "De volgorde is niet opgeslagen."));
    } catch (e) {
      setProjects(previous);
      say(e instanceof Error ? e.message : "De volgorde is niet opgeslagen.", true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.manager}>
      {flash && (
        <p className={flash.error ? styles.alertError : styles.alertInfo} role="status">
          {flash.text}
        </p>
      )}

      <section className={styles.panel} aria-labelledby="toevoegen">
        <h2 id="toevoegen">Foto toevoegen</h2>
        <form key={addKey} className={styles.projectForm} onSubmit={add}>
          <ImagePicker id="add-image" required label="Klik om een foto te kiezen" />
          <div className={styles.formSide}>
            <TextFields prefix="add" />
            <button className={styles.primary} type="submit" disabled={busy === "add"}>
              {busy === "add" ? "Foto uploaden…" : "Foto toevoegen"}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="op-de-website">
        <div className={styles.listHead}>
          <h2 id="op-de-website">Op de website</h2>
          <span>{projects.length} {projects.length === 1 ? "foto" : "foto's"}</span>
        </div>

        {projects.length === 0 ? (
          <p className={styles.empty}>Er staan nog geen foto&apos;s op de website. Voeg hierboven je eerste project toe.</p>
        ) : (
          <ol className={styles.list}>
            {projects.map((project, index) => (
              <li key={project.id} className={styles.item}>
                {editing === project.id ? (
                  <form className={styles.projectForm} onSubmit={(e) => save(e, project.id)}>
                    <div className={styles.replace}>
                      <img src={project.imagePath} alt="" />
                      <ImagePicker id={`edit-image-${project.id}`} label="Foto vervangen (optioneel)" />
                    </div>
                    <div className={styles.formSide}>
                      <TextFields project={project} prefix={`edit-${project.id}`} />
                      <div className={styles.actions}>
                        <button className={styles.primary} type="submit" disabled={busy === project.id}>
                          {busy === project.id ? "Opslaan…" : "Opslaan"}
                        </button>
                        <button className={styles.secondary} type="button" onClick={() => setEditing(null)}>
                          Annuleren
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className={styles.row}>
                    <div className={styles.order}>
                      <span className={styles.position}>{index + 1}</span>
                      <button type="button" aria-label={`${project.title} omhoog`} disabled={index === 0 || busy !== null} onClick={() => move(index, -1)}>↑</button>
                      <button type="button" aria-label={`${project.title} omlaag`} disabled={index === projects.length - 1 || busy !== null} onClick={() => move(index, 1)}>↓</button>
                    </div>
                    <img className={styles.thumb} src={project.imagePath} alt={project.title} loading="lazy" />
                    <div className={styles.meta}>
                      <h3>{project.title}</h3>
                      <p>{project.location}</p>
                      <p className={styles.metaEn}>
                        {project.titleEn ? `EN: ${project.titleEn}${project.locationEn ? ` · ${project.locationEn}` : ""}` : "Nog geen Engelse titel"}
                      </p>
                      {index === 0 && <span className={styles.badge}>Groot op de website</span>}
                    </div>
                    <div className={styles.actions}>
                      {confirmDelete === project.id ? (
                        <>
                          <span className={styles.confirmText}>Verwijderen?</span>
                          <button className={styles.danger} type="button" disabled={busy === project.id} onClick={() => remove(project)}>
                            {busy === project.id ? "Bezig…" : "Ja, verwijderen"}
                          </button>
                          <button className={styles.secondary} type="button" onClick={() => setConfirmDelete(null)}>Nee</button>
                        </>
                      ) : (
                        <>
                          <button className={styles.secondary} type="button" onClick={() => { setEditing(project.id); setConfirmDelete(null); }}>
                            Wijzigen
                          </button>
                          <button className={styles.dangerQuiet} type="button" onClick={() => setConfirmDelete(project.id)}>
                            Verwijderen
                          </button>
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
    </div>
  );
}
