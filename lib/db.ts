import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) throw new Error("De database (D1 binding `DB`) is niet beschikbaar.");
  return drizzle(env.DB, { schema });
}

export function getBucket(): R2Bucket {
  if (!env.UPLOADS) throw new Error("De foto-opslag (R2 binding `UPLOADS`) is niet beschikbaar.");
  return env.UPLOADS;
}
