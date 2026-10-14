import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Afbeeldingen komen uit onze eigen opslag en zijn al verkleind.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores(["dist/**", ".vinext/**", "node_modules/**"]),
]);
