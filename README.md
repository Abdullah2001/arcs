# AR Civil Solutions — website

Website van AR Civil Solutions (renovatie en afbouw, Eindhoven en omgeving), in het
Nederlands (`/`) en Engels (`/en`), met een beveiligde beheerpagina voor foto's (`/beheer`).

## Wat waar staat

| Wat | Bestand |
| --- | --- |
| Telefoon, WhatsApp, e-mail, KvK, btw | `lib/config.ts` |
| Alle teksten (NL en EN) | `lib/content.ts` |
| Kleuren, lettertypes, opmaak | `app/site.css` |
| Homepage | `app/site/home.tsx` |
| Beheerpagina | `app/(nl)/beheer/` |
| Inloggen en beveiliging | `lib/auth.ts` |
| Database-tabellen | `lib/schema.ts`, migratie in `drizzle/` |
| Logo | `public/images/brand/` |
| Koppeling met de hosting | `.openai/hosting.json` |

## Beheerpagina

- Inloggen op `/beheer` met gebruikersnaam en wachtwoord.
- Het eerste wachtwoord is tijdelijk en moet bij de eerste keer inloggen worden vervangen.
- Na 5 mislukte pogingen vanaf hetzelfde IP-adres is inloggen 15 minuten geblokkeerd.
- Wachtwoorden staan alleen als hash (PBKDF2) in de database; sessies verlopen na 8 uur.
- Hier beheer je de hoofdfoto bovenaan de homepage en de projectfoto's (toevoegen,
  wijzigen, vervangen, volgorde, verwijderen). Foto's worden in de browser verkleind.

Wachtwoord vergeten? Maak een nieuwe hash met `npm run hash-password -- "nieuw wachtwoord"`
en zet die in de tabel `admins` (kolom `password_hash`).

## Ontwikkelen

```bash
npm install
npm run dev      # lokaal draaien
npm test         # bouwen en controleren
npm run lint
```

Het offerteformulier verstuurt via formsubmit.co naar het e-mailadres uit `lib/config.ts`.
De eerste keer stuurt formsubmit een bevestigingsmail naar dat adres die je moet goedkeuren.
