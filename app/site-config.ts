// Contactgegevens op één plek. Vervang de tijdelijke waarden zodra de echte
// gegevens bekend zijn; de hele website (NL + EN) gebruikt dit bestand.
export const site = {
  name: "AR Civil Solutions",
  phoneDisplay: "+31 6 00000000",
  phoneHref: "tel:+31600000000",
  whatsappNumber: "31600000000",
  email: "info@arcivilsolutions.nl",
  // Wordt alleen getoond als ze ingevuld zijn.
  kvk: "",
  btw: "",
  serviceArea: [
    "Eindhoven",
    "Veldhoven",
    "Helmond",
    "Best",
    "Son en Breugel",
    "Nuenen",
    "Geldrop",
    "Mierlo",
    "Waalre",
    "Valkenswaard",
  ],
};

export type Lang = "nl" | "en";

export const langPath: Record<Lang, string> = { nl: "/", en: "/en" };
