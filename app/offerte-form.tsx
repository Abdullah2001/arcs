"use client";

import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const FORM_ENDPOINT =
  "https://formsubmit.co/ajax/info@arcivilsolutions.nl";

export default function OfferteForm() {
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
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      if (!response.ok) {
        throw new Error("De aanvraag kon niet worden verstuurd.");
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      className="contact-form"
      id="contact-form"
      onSubmit={handleSubmit}
    >
      <input
        className="form-honey"
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        type="hidden"
        name="_subject"
        value="Nieuwe offerteaanvraag via AR Civil Solutions"
      />
      <input type="hidden" name="_template" value="table" />
      <div className="form-row">
        <label>
          Naam
          <input
            type="text"
            name="naam"
            placeholder="Voor- en achternaam"
            autoComplete="name"
            required
          />
        </label>
        <label>
          Telefoon
          <input
            type="tel"
            name="telefoon"
            placeholder="+31 6 00000000"
            autoComplete="tel"
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          E-mail
          <input
            type="email"
            name="email"
            placeholder="naam@email.nl"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Type project
          <select name="project" defaultValue="" required>
            <option value="" disabled>
              Maak een keuze
            </option>
            <option>Stucwerk</option>
            <option>Schilderwerk</option>
            <option>Tegelwerk</option>
            <option>Vloerwerk</option>
            <option>Montagewerk</option>
            <option>Keukenwerk</option>
            <option>Sloopwerk</option>
            <option>Complete renovatie</option>
            <option>Anders</option>
          </select>
        </label>
      </div>
      <label>
        Vertel kort over je plan
        <textarea
          name="bericht"
          rows={5}
          placeholder="Wat wil je laten doen en wanneer?"
          required
        />
      </label>
      <button
        className="button form-button"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Aanvraag versturen…" : "Verstuur aanvraag"}
        <span aria-hidden="true">↗</span>
      </button>
      <div className="form-feedback" aria-live="polite">
        {status === "success" && (
          <p className="form-status form-status-success">
            Bedankt! Je aanvraag is verstuurd. We nemen zo snel mogelijk
            contact met je op.
          </p>
        )}
        {status === "error" && (
          <p className="form-status form-status-error">
            Versturen is niet gelukt. Probeer het opnieuw of mail naar
            info@arcivilsolutions.nl.
          </p>
        )}
      </div>
      <p className="form-note">
        Door te versturen geef je toestemming om contact met je op te nemen
        over je aanvraag.
      </p>
    </form>
  );
}
