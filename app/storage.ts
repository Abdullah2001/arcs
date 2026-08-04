import { env } from "cloudflare:workers";

export function getUploadsBucket(): R2Bucket {
  const bucket = (env as unknown as { UPLOADS?: R2Bucket }).UPLOADS;
  if (!bucket) {
    throw new Error("De afbeeldingsopslag is niet beschikbaar.");
  }
  return bucket;
}
