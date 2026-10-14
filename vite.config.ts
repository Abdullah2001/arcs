import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { hosting } from "./build/hosting-plugin";

// Lokale nabootsing van de database (D1) en foto-opslag (R2) uit hosting.json.
const localBindings = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: hostingConfig.d1
    ? [{ binding: hostingConfig.d1, database_name: "arcs-local", database_id: "00000000-0000-4000-8000-000000000000" }]
    : [],
  r2_buckets: hostingConfig.r2 ? [{ binding: hostingConfig.r2, bucket_name: "arcs-local" }] : [],
};

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    plugins: [
      vinext(),
      hosting(),
      cloudflare({ viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }, config: localBindings }),
    ],
  };
});
