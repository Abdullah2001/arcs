import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

// Zet na de build het hostingbestand en de database-migraties in dist/.openai,
// waar de hosting ze ophaalt.
export function hosting(): Plugin {
  let root = process.cwd();
  return {
    name: "hosting-package",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const out = resolve(root, "dist", ".openai");
      await rm(out, { recursive: true, force: true });
      await mkdir(out, { recursive: true });
      const hostingFile = resolve(root, ".openai", "hosting.json");
      if (await exists(hostingFile)) await cp(hostingFile, resolve(out, "hosting.json"));
      const migrations = resolve(root, "drizzle");
      if (await exists(migrations)) await cp(migrations, resolve(out, "drizzle"), { recursive: true });
    },
  };
}
