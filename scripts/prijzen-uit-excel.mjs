// Zet de prijzendatabase uit Excel om naar lib/begroting/prijzen.json (de standaardprijzen van de begrotingstool).
// Gebruik: npm run prijzen -- "pad/naar/Materialenprijzen.xlsx"
// Prijzen bijwerken kan ook zonder dit script: upload het Excel-bestand op /beheer/begroting.
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { leesPrijzenUitExcel } from "../lib/begroting/excel.ts";

const pad = process.argv[2];
if (!pad) {
  console.error('Gebruik: npm run prijzen -- "pad/naar/Materialenprijzen.xlsx"');
  process.exit(1);
}
const producten = await leesPrijzenUitExcel(await readFile(pad));
const bestand = {
  bron: "standaard",
  bestandsnaam: basename(pad),
  bijgewerkt: new Date().toISOString().slice(0, 10),
  producten,
};
await writeFile(new URL("../lib/begroting/prijzen.json", import.meta.url), JSON.stringify(bestand, null, 1) + "\n");
console.log(`${producten.length} producten opgeslagen in lib/begroting/prijzen.json`);
