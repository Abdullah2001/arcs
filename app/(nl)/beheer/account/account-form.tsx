"use client";

import { useState, type FormEvent } from "react";
import styles from "../beheer.module.css";

export default function AccountForm({ username, mustChange }: { username: string; mustChange: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== String(data.get("repeatPassword") ?? "")) {
      setMessage({ text: "De twee nieuwe wachtwoorden zijn niet hetzelfde.", error: true });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.get("currentPassword"),
          username: data.get("username"),
          newPassword,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Opslaan is niet gelukt.");
      if (mustChange) {
        window.location.href = "/beheer";
        return;
      }
      form.reset();
      setMessage({ text: "Je wijzigingen zijn opgeslagen.", error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Opslaan is niet gelukt.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.panel} onSubmit={submit}>
      <label className={styles.field}>
        <span>Gebruikersnaam</span>
        <input id="account-username" name="username" defaultValue={username} autoComplete="username" autoCapitalize="none" spellCheck={false} required pattern="[a-z0-9._\-]{3,40}" title="3 tot 40 kleine letters, cijfers, punt, streepje of underscore" />
      </label>
      <label className={styles.field}>
        <span>Huidig wachtwoord</span>
        <input id="account-current" name="currentPassword" type="password" autoComplete="current-password" required />
      </label>
      <label className={styles.field}>
        <span>Nieuw wachtwoord {mustChange ? "" : <small>(laat leeg om niet te wijzigen)</small>}</span>
        <input id="account-new" name="newPassword" type="password" autoComplete="new-password" minLength={12} required={mustChange} />
        <small>Minimaal 12 tekens. Een zin van een paar woorden werkt goed.</small>
      </label>
      <label className={styles.field}>
        <span>Herhaal nieuw wachtwoord</span>
        <input id="account-repeat" name="repeatPassword" type="password" autoComplete="new-password" minLength={12} required={mustChange} />
      </label>
      <button className={styles.primary} type="submit" disabled={busy}>
        {busy ? "Opslaan…" : mustChange ? "Wachtwoord instellen" : "Wijzigingen opslaan"}
      </button>
      {message && (
        <p className={message.error ? styles.alertError : styles.alertInfo} role="status">{message.text}</p>
      )}
    </form>
  );
}
