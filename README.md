# AR Civil Solutions — website

Website van AR Civil Solutions (renovatie en afbouw, Eindhoven en omgeving), in het
Nederlands (`/`) en Engels (`/en`), met een beveiligde beheerpagina voor foto's (`/beheer`)
en een begrotings- en offertetool (`/beheer/begroting`).

## Wat waar staat

| Wat | Bestand |
| --- | --- |
| Telefoon, WhatsApp, e-mail, KvK, btw | `lib/config.ts` |
| Alle teksten (NL en EN) | `lib/content.ts` |
| Kleuren, lettertypes, opmaak | `app/site.css` |
| Homepage | `app/site/home.tsx` |
| Beheerpagina | `app/(nl)/beheer/` |
| Begrotingstool (scherm) | `app/(nl)/beheer/begroting/` |
| Rekenregels, PDF, Excel inlezen | `lib/begroting/` |
| Standaardprijzen | `lib/begroting/prijzen.json` |
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

## Begroting en offerte

Op `/beheer/begroting` (na inloggen) maak je een werkbegroting en de offerte voor de klant.

- Materialen kies je uit de prijzendatabase (Bouwmaat en HORNBACH). Hoeveelheid in verpakkingen,
  of in kg/m²/liter: dan wordt naar hele verpakkingen afgerond. Eigen regels kunnen ook.
- Arbeid vul je zelf in: uren × uurtarief, of een vast bedrag.
- Bouwkosten = materiaal + arbeid. Risico (standaard 5%) gaat over de bouwkosten, winst
  (standaard 10%) over de totale kosten (bouwkosten + risico). Btw is aanpasbaar (standaard 21%).
- De offerte-PDF toont de klant geen inkoopprijzen, risico of winst; die zijn naar verhouding
  in de bedragen verwerkt. Kies: materiaal en arbeid apart, elke regel apart, of één totaalprijs.
- Begrotingen worden opgeslagen in de foto-opslag (R2) onder `begrotingen/`.
- Prijzen bijwerken: pas het Excel-bestand aan en upload het op de pagina. Het blad
  "Materialen" wordt gelezen. De standaardprijzen in de code vervang je met
  `npm run prijzen -- "pad/naar/Materialenprijzen.xlsx"`.

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
