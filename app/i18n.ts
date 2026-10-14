import type { Lang } from "./site-config";

export type IconName =
  | "trowel"
  | "roller"
  | "tiles"
  | "floor"
  | "door"
  | "kitchen"
  | "hammer"
  | "house";

export type Dictionary = {
  meta: { title: string; description: string; ogAlt: string };
  skip: string;
  nav: { services: string; projects: string; process: string; area: string; contact: string; menu: string; call: string };
  langSwitch: { label: string; other: string; otherShort: string };
  cta: { quote: string; call: string; whatsapp: string; whatsappText: string };
  hero: { title: string; intro: string; imageAlt: string; promises: string[] };
  services: { title: string; intro: string; items: { icon: IconName; title: string; text: string }[] };
  pricing: { title: string; intro: string; items: { title: string; text: string }[] };
  projects: { title: string; intro: string; empty: string; cta: string };
  process: { title: string; intro: string; steps: { title: string; text: string }[]; imageAlt: string };
  area: { title: string; intro: string; outside: string };
  faq: { title: string; items: { q: string; a: string }[] };
  contact: { title: string; intro: string; phone: string; email: string; whatsapp: string; area: string; areaValue: string };
  form: {
    name: string; namePh: string;
    phone: string; phonePh: string;
    email: string; emailPh: string;
    place: string; placePh: string;
    type: string; typePh: string; typeOptions: string[];
    start: string; startPh: string; startOptions: string[];
    message: string; messagePh: string;
    submit: string; submitting: string;
    success: string; error: string;
    consent: string; subject: string;
  };
  footer: { rights: string; top: string; kvk: string; btw: string; imageCredit: string };
};

const nl: Dictionary = {
  meta: {
    title: "AR Civil Solutions | Renovatie en afbouw in Eindhoven",
    description:
      "Stucwerk, schilderwerk, tegelwerk, vloeren, montage, keukens, sloopwerk en complete renovaties in Eindhoven en omgeving. Eén aanspreekpunt van opname tot oplevering.",
    ogAlt: "AR Civil Solutions — renovatie en afbouw",
  },
  skip: "Ga naar de inhoud",
  nav: {
    services: "Diensten",
    projects: "Projecten",
    process: "Werkwijze",
    area: "Werkgebied",
    contact: "Contact",
    menu: "Menu",
    call: "Bel",
  },
  langSwitch: { label: "Taal", other: "English", otherShort: "EN" },
  cta: {
    quote: "Offerte aanvragen",
    call: "Bel ons",
    whatsapp: "WhatsApp",
    whatsappText: "Hallo AR Civil Solutions, ik wil graag een offerte aanvragen.",
  },
  hero: {
    title: "Renovatie en afbouw in Eindhoven en omgeving",
    intro:
      "Stucwerk, tegels, vloeren, een nieuwe keuken of een complete verbouwing. Wij plannen het, voeren het uit en houden je op de hoogte, met één aanspreekpunt van opname tot oplevering.",
    imageAlt: "Woning tijdens de renovatie, met gestucte wanden en beschermde vloer",
    promises: [
      "Eén vast aanspreekpunt",
      "Heldere offerte vooraf",
      "Netjes en veilig werken",
      "Nederlands en Engels",
    ],
  },
  services: {
    title: "Wat we voor je doen",
    intro:
      "Losse klussen of alles in één keer. Combineer je meerdere werkzaamheden, dan stemmen wij de vakmensen en de planning op elkaar af.",
    items: [
      { icon: "trowel", title: "Stucwerk", text: "Wanden en plafonds strak stucen, sausklaar opleveren of bestaand pleisterwerk herstellen." },
      { icon: "roller", title: "Schilderwerk", text: "Binnen en buiten, inclusief voorbehandeling van hout, muren en kozijnen." },
      { icon: "tiles", title: "Tegelwerk", text: "Wand- en vloertegels in badkamer, toilet en keuken, inclusief voegen en kitten." },
      { icon: "floor", title: "Vloeren", text: "Egaliseren, laminaat, pvc en plinten. Oude vloeren verwijderen we eerst." },
      { icon: "door", title: "Montage en timmerwerk", text: "Binnendeuren, kozijnen, kasten, vensterbanken en aftimmeringen." },
      { icon: "kitchen", title: "Keukens", text: "Oude keuken eruit, nieuwe erin: kasten, werkblad, tegelwerk en afwerking." },
      { icon: "hammer", title: "Sloopwerk", text: "Keukens, badkamers en vloeren verwijderen, inclusief afvoer van het afval." },
      { icon: "house", title: "Complete renovatie", text: "Een hele woning of verdieping opnieuw afwerken, van ruwbouw tot oplevering." },
    ],
  },
  pricing: {
    title: "Zo komt je prijs tot stand",
    intro: "Geen schatting via de telefoon, maar een prijs op basis van wat we ter plekke zien en meten.",
    items: [
      { title: "Gratis opname op locatie", text: "We komen langs, meten alles in en bespreken wat je wilt. Daar zit je niets aan vast." },
      { title: "Offerte per onderdeel", text: "Je ziet per werkzaamheid wat het kost aan arbeid en materiaal, inclusief btw." },
      { title: "Afspraken op papier", text: "Planning, startdatum en oplevering staan vast. Extra werk doen we alleen na jouw akkoord." },
    ],
  },
  projects: {
    title: "Projecten",
    intro: "Een greep uit het werk in de regio.",
    empty: "Hier verschijnen binnenkort foto's van onze projecten.",
    cta: "Iets vergelijkbaars in gedachten? Vraag een offerte aan",
  },
  process: {
    title: "Van aanvraag tot oplevering",
    intro: "Je weet vooraf waar je aan toe bent, en tijdens het werk hoor je van ons hoe het gaat.",
    steps: [
      { title: "Aanvraag", text: "Je vertelt via het formulier, telefoon of WhatsApp wat er moet gebeuren." },
      { title: "Opname", text: "We bekijken de situatie, meten in en denken mee over de aanpak." },
      { title: "Offerte", text: "Je krijgt een duidelijk voorstel met prijs en planning." },
      { title: "Voorbereiding", text: "Materialen bestellen, vakmensen inplannen, werkplek beschermen." },
      { title: "Uitvoering", text: "Ons team voert het werk uit. Jouw aanspreekpunt houdt je op de hoogte." },
      { title: "Oplevering", text: "We lopen alles samen na en laten de ruimte schoon achter." },
    ],
    imageAlt: "Vakman bekijkt een woning tijdens de sloop- en renovatiefase",
  },
  area: {
    title: "Werkgebied",
    intro: "We werken in Eindhoven en de omliggende plaatsen, onder andere:",
    outside: "Woon je net buiten deze plaatsen? Vraag het gerust, vaak kan het ook.",
  },
  faq: {
    title: "Veelgestelde vragen",
    items: [
      { q: "Kost een offerte iets?", a: "Nee. De opname op locatie en de offerte zijn gratis en vrijblijvend." },
      { q: "Kunnen jullie meerdere klussen combineren?", a: "Ja, dat is juist onze kracht. Bijvoorbeeld slopen, stucen, tegelen en schilderen in één project, met één planning en één aanspreekpunt." },
      { q: "Moet ik zelf materialen uitzoeken?", a: "Dat mag, maar hoeft niet. We adviseren over materialen en kunnen alles voor je bestellen. Wil je zelf tegels of een keuken kiezen, dan stemmen we de planning daarop af." },
      { q: "Is de btw inbegrepen in de prijs?", a: "Ja. In onze offerte staan de bedragen voor particulieren inclusief btw, zodat je niet voor verrassingen komt te staan." },
      { q: "Do you speak English?", a: "Yes. We work for Dutch and international clients and can do the whole project in English. Switch to the English version of this site at the top of the page." },
    ],
  },
  contact: {
    title: "Vraag een gratis offerte aan",
    intro: "Vertel kort wat je wilt laten doen. We nemen contact op om een afspraak voor de opname te plannen.",
    phone: "Bellen",
    email: "Mailen",
    whatsapp: "WhatsApp",
    area: "Werkgebied",
    areaValue: "Eindhoven en omgeving",
  },
  form: {
    name: "Naam", namePh: "Voor- en achternaam",
    phone: "Telefoon", phonePh: "06 12345678",
    email: "E-mail", emailPh: "naam@voorbeeld.nl",
    place: "Postcode of plaats", placePh: "Bijv. 5611 AB of Veldhoven",
    type: "Soort werk", typePh: "Kies een soort werk",
    typeOptions: ["Stucwerk", "Schilderwerk", "Tegelwerk", "Vloeren", "Montage en timmerwerk", "Keuken", "Sloopwerk", "Complete renovatie", "Anders"],
    start: "Wanneer wil je starten?", startPh: "Kies een moment",
    startOptions: ["Zo snel mogelijk", "Binnen 1 tot 3 maanden", "Over meer dan 3 maanden", "Weet ik nog niet"],
    message: "Wat wil je laten doen?", messagePh: "Bijvoorbeeld: badkamer van 6 m² opnieuw betegelen, oude tegels eruit.",
    submit: "Offerte aanvragen", submitting: "Aanvraag wordt verstuurd…",
    success: "Je aanvraag is verstuurd. We nemen zo snel mogelijk contact met je op.",
    error: "Je aanvraag is niet verstuurd. Controleer je internetverbinding en probeer het opnieuw, of mail ons direct.",
    consent: "We gebruiken je gegevens alleen om contact met je op te nemen over deze aanvraag.",
    subject: "Nieuwe offerteaanvraag via de website (NL)",
  },
  footer: {
    rights: "Alle rechten voorbehouden.",
    top: "Naar boven",
    kvk: "KvK",
    btw: "Btw",
    imageCredit: "Sfeerbeelden: Unsplash",
  },
};

const en: Dictionary = {
  meta: {
    title: "AR Civil Solutions | Renovation and finishing work in Eindhoven",
    description:
      "Plastering, painting, tiling, flooring, carpentry, kitchens, demolition and complete renovations in Eindhoven and the surrounding area. One point of contact from survey to handover.",
    ogAlt: "AR Civil Solutions — renovation and finishing work",
  },
  skip: "Skip to content",
  nav: {
    services: "Services",
    projects: "Projects",
    process: "How we work",
    area: "Service area",
    contact: "Contact",
    menu: "Menu",
    call: "Call",
  },
  langSwitch: { label: "Language", other: "Nederlands", otherShort: "NL" },
  cta: {
    quote: "Request a quote",
    call: "Call us",
    whatsapp: "WhatsApp",
    whatsappText: "Hello AR Civil Solutions, I would like to request a quote.",
  },
  hero: {
    title: "Renovation and finishing work in Eindhoven and the region",
    intro:
      "Plastering, tiling, floors, a new kitchen or a complete renovation. We plan it, carry it out and keep you informed, with one point of contact from the first visit to handover.",
    imageAlt: "Home during renovation, with freshly plastered walls and a protected floor",
    promises: [
      "One fixed point of contact",
      "A clear quote up front",
      "Clean and safe work",
      "English and Dutch spoken",
    ],
  },
  services: {
    title: "What we do",
    intro:
      "A single job or everything at once. When you combine several jobs, we coordinate the trades and the schedule for you.",
    items: [
      { icon: "trowel", title: "Plastering", text: "Smooth plaster on walls and ceilings, ready for paint, or repairs to existing plasterwork." },
      { icon: "roller", title: "Painting", text: "Interior and exterior, including preparation of woodwork, walls and frames." },
      { icon: "tiles", title: "Tiling", text: "Wall and floor tiles for bathrooms, toilets and kitchens, including grouting and sealing." },
      { icon: "floor", title: "Flooring", text: "Levelling, laminate, vinyl and skirting. We remove old floors first." },
      { icon: "door", title: "Carpentry and fitting", text: "Interior doors, frames, cabinets, window sills and boxing-in." },
      { icon: "kitchen", title: "Kitchens", text: "Old kitchen out, new kitchen in: cabinets, worktop, tiling and finishing." },
      { icon: "hammer", title: "Demolition", text: "Removing kitchens, bathrooms and floors, including waste disposal." },
      { icon: "house", title: "Complete renovation", text: "Refinishing a whole home or floor, from shell to handover." },
    ],
  },
  pricing: {
    title: "How your price is set",
    intro: "No guesswork over the phone: a price based on what we see and measure on site.",
    items: [
      { title: "Free site visit", text: "We visit, take measurements and discuss what you want. No obligation." },
      { title: "Itemised quote", text: "You see the cost of labour and materials for each job, including VAT." },
      { title: "Agreements in writing", text: "Schedule, start date and handover are fixed. Extra work only happens with your approval." },
    ],
  },
  projects: {
    title: "Projects",
    intro: "A selection of work in the region.",
    empty: "Photos of our projects will appear here soon.",
    cta: "Planning something similar? Request a quote",
  },
  process: {
    title: "From request to handover",
    intro: "You know what to expect before we start, and you hear from us while the work is underway.",
    steps: [
      { title: "Request", text: "Tell us what needs doing via the form, by phone or on WhatsApp." },
      { title: "Site visit", text: "We look at the situation, take measurements and suggest an approach." },
      { title: "Quote", text: "You receive a clear proposal with price and schedule." },
      { title: "Preparation", text: "Ordering materials, scheduling the trades, protecting your home." },
      { title: "The work", text: "Our team carries out the work. Your contact keeps you up to date." },
      { title: "Handover", text: "We check everything together and leave the space clean." },
    ],
    imageAlt: "Tradesman reviewing a home during the demolition and renovation phase",
  },
  area: {
    title: "Service area",
    intro: "We work in Eindhoven and the surrounding towns, including:",
    outside: "Just outside these towns? Ask us, it is often possible.",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "Is the quote free?", a: "Yes. The site visit and the quote are free and without obligation." },
      { q: "Can you combine several jobs?", a: "Yes, that is what we do best. For example demolition, plastering, tiling and painting in one project, with one schedule and one point of contact." },
      { q: "Do I need to choose materials myself?", a: "You can, but you don't have to. We advise on materials and can order everything for you. If you want to pick your own tiles or kitchen, we plan around that." },
      { q: "Is VAT included in the price?", a: "Yes. Prices in our quotes for private clients include VAT, so there are no surprises." },
      { q: "I don't speak Dutch. Is that a problem?", a: "Not at all. We can handle the whole project in English, from the first visit to handover." },
    ],
  },
  contact: {
    title: "Request a free quote",
    intro: "Tell us briefly what you would like done. We will get in touch to schedule a site visit.",
    phone: "Call",
    email: "Email",
    whatsapp: "WhatsApp",
    area: "Service area",
    areaValue: "Eindhoven and surroundings",
  },
  form: {
    name: "Name", namePh: "First and last name",
    phone: "Phone", phonePh: "+31 6 12345678",
    email: "Email", emailPh: "name@example.com",
    place: "Postcode or town", placePh: "E.g. 5611 AB or Veldhoven",
    type: "Type of work", typePh: "Choose a type of work",
    typeOptions: ["Plastering", "Painting", "Tiling", "Flooring", "Carpentry and fitting", "Kitchen", "Demolition", "Complete renovation", "Other"],
    start: "When would you like to start?", startPh: "Choose a moment",
    startOptions: ["As soon as possible", "Within 1 to 3 months", "In more than 3 months", "Not sure yet"],
    message: "What would you like done?", messagePh: "For example: retile a 6 m² bathroom, remove the old tiles.",
    submit: "Request a quote", submitting: "Sending your request…",
    success: "Your request has been sent. We will contact you as soon as possible.",
    error: "Your request was not sent. Check your internet connection and try again, or email us directly.",
    consent: "We only use your details to contact you about this request.",
    subject: "New quote request via the website (EN)",
  },
  footer: {
    rights: "All rights reserved.",
    top: "Back to top",
    kvk: "Chamber of Commerce (KvK)",
    btw: "VAT",
    imageCredit: "Imagery: Unsplash",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { nl, en };
