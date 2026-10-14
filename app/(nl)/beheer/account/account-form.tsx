"use client";

import { useState, type FormEvent } from "react";
import s from "../beheer.module.css";

export default function AccountForm({ username, temporary }: { username: string; temporary: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("next") ?? "");
    if (next !== String(data.get("repeat") ?? "")) {
      setMessage({ text: "De twee nieuwe wachtwoorden zijn niet hetzelfde.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/beheer/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ current: data.get("current"), username: data.get("username"), next }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Opslaan is niet gelukt.");
      if (temporary) {
        window.location.href = "/beheer";
        return;
      }
      form.reset();
      setMessage({ text: "Je wijzigingen zijn opgeslagen.", ok: true });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Opslaan is niet gelukt.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={s.panel} onSubmit={submit}>
      <label className={s.field}>
        Gebruikersnaam
        <input id="acc-user" name="username" defaultValue={username} autoComplete="username" autoCapitalize="none" spellCheck={false} required pattern="[a-z0-9._\-]{3,40}" title="3 tot 40 kleine letters, cijfers, punt, streepje of underscore" />
      </label>
      <label className={s.field}>
        Huidig wachtwoord
        <input id="acc-current" name="current" type="password" autoComplete="current-password" required />
      </label>
      <label className={s.field}>
        {temporary ? "Nieuw wachtwoord" : "Nieuw wachtwoord (leeg laten om niet te wijzigen)"}
        <input id="acc-next" name="next" type="password" autoComplete="new-password" minLength={12} required={temporary} />
        <small>Minimaal 12 tekens. Een zin van een paar woorden werkt goed.</small>
      </label>
      <label className={s.field}>
        Herhaal nieuw wachtwoord
        <input id="acc-repeat" name="repeat" type="password" autoComplete="new-password" minLength={12} required={temporary} />
      </label>
      <button className={s.primary} type="submit" disabled={busy}>
        {busy ? "Opslaan…" : temporary ? "Wachtwoord instellen" : "Wijzigingen opslaan"}
      </button>
      {message && <p className={message.ok ? s.ok : s.error} role="status">{message.text}</p>}
    </form>
  );
}
