// Gedeelde validatie voor het toevoegen en bewerken van projecten.
export const MAX_IMAGE_SIZE = 12 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function cleanText(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function readTexts(formData: FormData) {
  return {
    title: cleanText(formData.get("title"), 90),
    location: cleanText(formData.get("location"), 120),
    titleEn: cleanText(formData.get("titleEn"), 90) || null,
    locationEn: cleanText(formData.get("locationEn"), 120) || null,
  };
}

/** Geeft de extensie terug, of een foutmelding. */
export function checkImage(image: File): { extension: string } | { error: string } {
  const extension = allowedImageTypes.get(image.type);
  if (!extension) return { error: "Gebruik een JPG-, PNG- of WebP-afbeelding." };
  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) return { error: "De foto mag maximaal 12 MB groot zijn." };
  return { extension };
}

export const jsonError = (error: string, status = 400) => Response.json({ error }, { status });
