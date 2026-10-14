import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { photos, siteImages, type Photo, type SiteImage } from "./schema";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/** Controleert een geüploade afbeelding; geeft de extensie of een foutmelding. */
export function checkUpload(file: File): { ext: string } | { error: string } {
  const ext = TYPES.get(file.type);
  if (!ext) return { error: "Gebruik een JPG-, PNG- of WebP-afbeelding." };
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return { error: "Een foto mag maximaal 12 MB zijn." };
  return { ext };
}

export const photoUrl = (p: Pick<Photo, "id" | "version">) => `/media/foto/${p.id}?v=${p.version}`;
export const siteImageUrl = (img: Pick<SiteImage, "slot" | "version">) => `/media/site/${img.slot}?v=${img.version}`;

/** Projectfoto's voor de website. Valt terug op een lege lijst als de database niet bereikbaar is. */
export async function listPhotos(): Promise<Photo[]> {
  try {
    return await getDb().select().from(photos).orderBy(asc(photos.position), asc(photos.createdAt));
  } catch {
    return [];
  }
}

export async function getSiteImage(slot: string): Promise<SiteImage | null> {
  try {
    const [row] = await getDb().select().from(siteImages).where(eq(siteImages.slot, slot)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}
