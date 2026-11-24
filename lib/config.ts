// Bedrijfsgegevens op één plek. De hele website (NL en EN) leest hieruit.
// TIJDELIJK: het e-mailadres is nog een voorbeeldwaarde.
export const company = {
  name: "AR Civil Solutions",
  phoneDisplay: "06 40 15 83 08",
  phoneLink: "tel:+31640158308",
  whatsapp: "31640158308", // landcode + nummer, zonder + of spaties
  email: "info@arcivilsolutions.nl",
  kvk: "83094229", // wordt pas getoond als het is ingevuld
  btw: "NL003774097B78", // btw-identificatienummer
  // Vestigingsadres: alleen op offertes en facturen, niet op de website.
  adres: "Cavallilaan 265",
  postcode: "5654 BE",
  plaats: "Eindhoven",
  iban: "", // rekeningnummer voor facturen; wordt pas getoond als het is ingevuld
  region: ["Eindhoven", "Veldhoven", "Helmond", "Best", "Son en Breugel", "Nuenen", "Geldrop", "Waalre"],
};

export type Lang = "nl" | "en";
export const home: Record<Lang, string> = { nl: "/", en: "/en" };
