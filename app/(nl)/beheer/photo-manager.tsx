"use client";

import { useState, type FormEvent } from "react";
import type { Project } from "@/db/schema";
import styles from "./beheer.module.css";

type ApiError = { error?: string };

async function responseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.error || "Er ging iets mis. Probeer het opnieuw.";
  } catch {
    return "Er ging iets mis. Probeer het opnieuw.";
  }
}

export default function PhotoManager({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function uploadProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) throw new Error(await responseMessage(response));
      const body = (await response.json()) as { project: Project };
      setProjects((current) => [...current, body.project]);
      form.reset();
      setMessage("De foto is toegevoegd en staat direct bij de projecten.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Uploaden is niet gelukt.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Weet je zeker dat je “${project.title}” van de website wilt verwijderen?`,
    );
    if (!confirmed) return;

    setDeletingId(project.id);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseMessage(response));

      setProjects((current) => current.filter((item) => item.id !== project.id));
      setMessage("De foto is verwijderd.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Verwijderen is niet gelukt.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.managerGrid}>
      <section className={styles.uploadPanel}>
        <div className={styles.panelHeading}>
          <span>01</span>
          <div>
            <h2>Nieuwe foto toevoegen</h2>
            <p>JPG, PNG of WebP, maximaal 12 MB.</p>
          </div>
        </div>

        <form className={styles.uploadForm} onSubmit={uploadProject}>
          <label>
            Projecttitel
            <input name="title" type="text" maxLength={90} placeholder="Bijv. Badkamerrenovatie" required />
          </label>
          <label>
            Locatie en werkzaamheden
            <input name="location" type="text" maxLength={120} placeholder="Eindhoven · tegelwerk" required />
          </label>
          <label className={styles.fileField}>
            Projectfoto
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <button className={styles.submitButton} type="submit" disabled={uploading}>
            {uploading ? "Foto uploaden…" : "Foto toevoegen"}
          </button>
        </form>

        {message ? (
          <p className={`${styles.feedback} ${isError ? styles.feedbackError : ""}`} role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section className={styles.libraryPanel}>
        <div className={styles.panelHeading}>
          <span>02</span>
          <div>
            <h2>Foto&apos;s op de website</h2>
            <p>{projects.length} {projects.length === 1 ? "project" : "projecten"}</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            Er staan nog geen projectfoto&apos;s op de website.
          </div>
        ) : (
          <div className={styles.photoGrid}>
            {projects.map((project) => (
              <article className={styles.photoCard} key={project.id}>
                {/* Dynamische beheerthumbnail; de publieke site verzorgt de presentatie. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.imagePath} alt={project.title} />
                <div className={styles.photoInfo}>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProject(project)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? "Bezig…" : "Verwijderen"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
