import type { Lang } from "./config";

export type Copy = {
  meta: { title: string; description: string };
  skip: string;
  nav: { services: string; projects: string; process: string; contact: string; menu: string; close: string };
  switchTo: { label: string; short: string };
  cta: { quote: string; quoteLong: string; whatsapp: string; whatsappText: string; call: string };
  hero: { region: string; title: string; intro: string };
  promises: string[];
  services: { title: string; intro: string; items: { title: string; text: string }[] };
  projects: { title: string; cta: string };
  process: { title: string; steps: { title: string; text: string }[] };
  contact: {
    title: string;
    intro: string;
    phone: string;
    email: string;
    area: string;
    areaValue: string;
  };
  form: {
    name: string;
    phone: string;
    email: string;
    place: string;
    placeHint: string;
    type: string;
    typeChoose: string;
    types: string[];
    message: string;
    messageHint: string;
    send: string;
    sending: string;
    sent: string;
    failed: string;
    privacy: string;
    subject: string;
  };
  footer: { rights: string; kvk: string; btw: string };
};

const nl: Copy = {
  meta: {
    title: "AR Civil Solutions | Renovatie en afbouw in Eindhoven",
    description:
      "Stucwerk, schilderwerk, tegelwerk, vloeren, montage, keukens, sloopwerk en complete renovaties in Eindhoven en omgeving. Eén aanspreekpunt van opname tot oplevering.",
  },
  skip: "Naar de inhoud",
  nav: { services: "Diensten", projects: "Projecten", process: "Werkwijze", contact: "Contact", menu: "Menu", close: "Sluiten" },
  switchTo: { label: "English", short: "EN" },
  cta: {
    quote: "Offerte aanvragen",
    quoteLong: "Gratis offerte aanvragen",
    whatsapp: "WhatsApp",
    whatsappText: "Hallo AR Civil Solutions, ik wil graag een offerte aanvragen.",
    call: "Bellen",
  },
  hero: {
    region: "Eindhoven en omgeving",
    title: "Renovatie en afbouw, tot in de laatste naad.",
    intro:
      "Stucwerk, tegels, vloeren, keukens of een complete verbouwing. Eén aanspreekpunt van de eerste opname tot de oplevering.",
  },
  promises: ["Eén vast aanspreekpunt", "Heldere offerte vooraf", "Netjes en veilig werken", "Nederlands en Engels"],
  services: {
    title: "Wat we doen",
    intro: "Losse klussen of alles in één project. Wij stemmen vakmensen en planning op elkaar af.",
    items: [
      { title: "Stucwerk", text: "Wanden en plafonds strak en sausklaar, of bestaand pleisterwerk hersteld." },
      { title: "Schilderwerk", text: "Binnen en buiten, inclusief voorbehandeling van hout en muren." },
      { title: "Tegelwerk", text: "Badkamer, toilet en keuken, inclusief voegen en kitten." },
      { title: "Vloeren", text: "Egaliseren, laminaat, pvc en plinten. Oude vloeren halen we eerst weg." },
      { title: "Montage en timmerwerk", text: "Binnendeuren, kozijnen, kasten, vensterbanken en aftimmeringen." },
      { title: "Keukens", text: "Oude keuken eruit, nieuwe erin, tot en met de afwerking." },
      { title: "Sloopwerk", text: "Keukens, badkamers en vloeren verwijderen, afval afgevoerd." },
      { title: "Complete renovatie", text: "Een hele woning of verdieping opnieuw afgewerkt." },
    ],
  },
  projects: { title: "Projecten", cta: "Iets vergelijkbaars in gedachten?" },
  process: {
    title: "Van aanvraag tot oplevering",
    steps: [
      { title: "Aanvraag", text: "Via het formulier, telefoon of WhatsApp." },
      { title: "Opname", text: "We komen langs, meten in en denken mee." },
      { title: "Offerte", text: "Prijs en planning duidelijk op papier." },
      { title: "Voorbereiding", text: "Materiaal en vakmensen ingepland." },
      { title: "Uitvoering", text: "Je wordt onderweg op de hoogte gehouden." },
      { title: "Oplevering", text: "Samen nalopen, schoon achterlaten." },
    ],
  },
  contact: {
    title: "Vertel ons je plan",
    intro: "We nemen contact op om een opname op locatie te plannen. De opname en de offerte zijn gratis.",
    phone: "Telefoon",
    email: "E-mail",
    area: "Werkgebied",
    areaValue: "Eindhoven en omgeving",
  },
  form: {
    name: "Naam",
    phone: "Telefoon",
    email: "E-mail",
    place: "Postcode of plaats",
    placeHint: "Bijv. 5611 AB of Veldhoven",
    type: "Soort werk",
    typeChoose: "Kies een soort werk",
    types: ["Stucwerk", "Schilderwerk", "Tegelwerk", "Vloeren", "Montage en timmerwerk", "Keuken", "Sloopwerk", "Complete renovatie", "Anders"],
    message: "Wat wil je laten doen?",
    messageHint: "Bijv. badkamer van 6 m² opnieuw betegelen, oude tegels eruit.",
    send: "Offerte aanvragen",
    sending: "Bezig met versturen…",
    sent: "Je aanvraag is verstuurd. We nemen zo snel mogelijk contact met je op.",
    failed: "Je aanvraag is niet verstuurd. Controleer je internetverbinding en probeer het opnieuw, of mail ons direct:",
    privacy: "We gebruiken je gegevens alleen om contact met je op te nemen over deze aanvraag.",
    subject: "Nieuwe offerteaanvraag via de website",
  },
  footer: { rights: "Alle rechten voorbehouden.", kvk: "KvK", btw: "Btw" },
};

const en: Copy = {
  meta: {
    title: "AR Civil Solutions | Renovation and finishing work in Eindhoven",
    description:
      "Plastering, painting, tiling, flooring, carpentry, kitchens, demolition and complete renovations in Eindhoven and the surrounding area. A single point of contact from the first site visit to handover.",
  },
  skip: "Skip to content",
  nav: { services: "Services", projects: "Projects", process: "How we work", contact: "Contact", menu: "Menu", close: "Close" },
  switchTo: { label: "Nederlands", short: "NL" },
  cta: {
    quote: "Request a quote",
    quoteLong: "Request a free quote",
    whatsapp: "WhatsApp",
    whatsappText: "Hello AR Civil Solutions, I would like to request a quote.",
    call: "Call",
  },
  hero: {
    region: "Eindhoven and the surrounding area",
    title: "Renovation and finishing work, right down to the last detail.",
    intro:
      "Plastering, tiling, flooring, kitchens or a complete renovation. A single point of contact from the first site visit to handover.",
  },
  promises: ["A single point of contact", "A clear quote up front", "Tidy and safe working", "English and Dutch spoken"],
  services: {
    title: "What we do",
    intro: "A one-off job or a complete project. We coordinate the tradespeople and the schedule.",
    items: [
      { title: "Plastering", text: "Smooth, paint-ready walls and ceilings, or repairs to existing plasterwork." },
      { title: "Painting", text: "Interior and exterior, including preparation of wood and walls." },
      { title: "Tiling", text: "Bathrooms, toilets and kitchens, including grouting and sealing." },
      { title: "Flooring", text: "Levelling, laminate, vinyl and skirting boards. We remove the old flooring first." },
      { title: "Carpentry and fitting", text: "Interior doors, door and window frames, cabinets, window sills and boxing-in." },
      { title: "Kitchens", text: "Old kitchen out, new kitchen in, including all the finishing work." },
      { title: "Demolition", text: "Removal of kitchens, bathrooms and floors, including waste disposal." },
      { title: "Complete renovation", text: "A whole home or a single floor, completely refinished." },
    ],
  },
  projects: { title: "Projects", cta: "Planning something similar?" },
  process: {
    title: "From request to handover",
    steps: [
      { title: "Request", text: "Via the form, by phone or on WhatsApp." },
      { title: "Site visit", text: "We visit, take measurements and advise on the approach." },
      { title: "Quote", text: "A clear price and schedule in writing." },
      { title: "Preparation", text: "We order the materials and schedule the tradespeople." },
      { title: "The work", text: "We keep you informed along the way." },
      { title: "Handover", text: "We check it together and leave it clean." },
    ],
  },
  contact: {
    title: "Tell us your plan",
    intro: "We will contact you to schedule a site visit. The visit and the quote are free.",
    phone: "Phone",
    email: "Email",
    area: "Service area",
    areaValue: "Eindhoven and the surrounding area",
  },
  form: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    place: "Postcode or town",
    placeHint: "E.g. 5611 AB or Veldhoven",
    type: "Type of work",
    typeChoose: "Choose a type of work",
    types: ["Plastering", "Painting", "Tiling", "Flooring", "Carpentry and fitting", "Kitchen", "Demolition", "Complete renovation", "Other"],
    message: "What would you like done?",
    messageHint: "E.g. retile a 6 m² bathroom and remove the old tiles.",
    send: "Request a quote",
    sending: "Sending…",
    sent: "Your request has been sent. We will contact you as soon as possible.",
    failed: "Your request was not sent. Check your internet connection and try again, or email us directly:",
    privacy: "We only use your details to contact you about this request.",
    subject: "New quote request via the website (English)",
  },
  footer: { rights: "All rights reserved.", kvk: "Chamber of Commerce (KvK)", btw: "VAT" },
};

export const copy: Record<Lang, Copy> = { nl, en };
