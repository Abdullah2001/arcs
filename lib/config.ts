// Bedrijfsgegevens op één plek. De hele website (NL en EN) leest hieruit.
// TIJDELIJK: telefoon, WhatsApp en e-mail zijn nog voorbeeldwaarden.
export const company = {
  name: "AR Civil Solutions",
  phoneDisplay: "+31 6 00000000",
  phoneLink: "tel:+31600000000",
  whatsapp: "31600000000", // landcode + nummer, zonder + of spaties
  email: "info@arcivilsolutions.nl",
  kvk: "", // wordt pas getoond als het is ingevuld
  btw: "",
  region: ["Eindhoven", "Veldhoven", "Helmond", "Best", "Son en Breugel", "Nuenen", "Geldrop", "Waalre"],
};

export type Lang = "nl" | "en";
export const home: Record<Lang, string> = { nl: "/", en: "/en" };
