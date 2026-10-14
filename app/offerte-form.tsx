"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "./i18n";

type FormStatus = "idle" | "submitting" | "success" | "error";

type Props = {
  t: Dictionary["form"];
  email: string;
  lang: string;
};

export default function OfferteForm({ t, email, lang }: Props) {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("_honey")) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      if (!response.ok) throw new Error("Request failed");

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="quote-form" id="offerte-formulier" onSubmit={handleSubmit}>
      <input className="form-honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="_subject" value={t.subject} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="taal" value={lang} />

      <div className="field-row">
        <label className="field">
          <span>{t.name}</span>
          <input type="text" name="naam" placeholder={t.namePh} autoComplete="name" required />
        </label>
        <label className="field">
          <span>{t.phone}</span>
          <input type="tel" name="telefoon" placeholder={t.phonePh} autoComplete="tel" required />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>{t.email}</span>
          <input type="email" name="email" placeholder={t.emailPh} autoComplete="email" required />
        </label>
        <label className="field">
          <span>{t.place}</span>
          <input type="text" name="plaats" placeholder={t.placePh} autoComplete="postal-code" required />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>{t.type}</span>
          <select name="soort_werk" defaultValue="" required>
            <option value="" disabled>{t.typePh}</option>
            {t.typeOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t.start}</span>
          <select name="start" defaultValue="" required>
            <option value="" disabled>{t.startPh}</option>
            {t.startOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>{t.message}</span>
        <textarea name="bericht" rows={5} placeholder={t.messagePh} required />
      </label>

      <button className="btn btn-gold btn-block" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? t.submitting : t.submit}
      </button>

      <div className="form-feedback" aria-live="polite">
        {status === "success" && <p className="form-status is-success">{t.success}</p>}
        {status === "error" && (
          <p className="form-status is-error">
            {t.error} <a href={`mailto:${email}`}>{email}</a>
          </p>
        )}
      </div>

      <p className="form-note">{t.consent}</p>
    </form>
  );
}
