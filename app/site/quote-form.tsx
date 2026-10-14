"use client";

import { useState, type FormEvent } from "react";
import type { Copy } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "failed";

export default function QuoteForm({ t, email, lang }: { t: Copy["form"]; email: string; lang: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("_honey")) {
      form.reset();
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!response.ok) throw new Error();
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <form className="quote-form" onSubmit={submit}>
      <input className="form-trap" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="_subject" value={t.subject} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="taal" value={lang} />

      <label className="field">
        {t.name}
        <input id="f-naam" name="naam" autoComplete="name" required />
      </label>
      <label className="field">
        {t.phone}
        <input id="f-telefoon" name="telefoon" type="tel" autoComplete="tel" required />
      </label>
      <label className="field">
        {t.email}
        <input id="f-email" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="field">
        {t.place}
        <input id="f-plaats" name="plaats" placeholder={t.placeHint} autoComplete="postal-code" required />
      </label>
      <label className="field field-wide">
        {t.type}
        <select id="f-soort" name="soort_werk" defaultValue="" required>
          <option value="" disabled>
            {t.typeChoose}
          </option>
          {t.types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>
      <label className="field field-wide">
        {t.message}
        <textarea id="f-bericht" name="bericht" rows={4} placeholder={t.messageHint} required />
      </label>

      <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t.sending : t.send}
      </button>
      {status === "sent" && <p className="form-status ok" role="status">{t.sent}</p>}
      {status === "failed" && (
        <p className="form-status error" role="alert">
          {t.failed} <a href={`mailto:${email}`}>{email}</a>
        </p>
      )}
      <p className="form-note">{t.privacy}</p>
    </form>
  );
}
