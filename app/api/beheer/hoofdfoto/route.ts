import { eq } from "drizzle-orm";
import { apiAdmin } from "@/lib/auth";
import { getBucket, getDb } from "@/lib/db";
import { checkUpload } from "@/lib/media";
import { siteImages } from "@/lib/schema";
import { fail, file, notLoggedIn, text } from "../helpers";

export const dynamic = "force-dynamic";
const SLOT = "hero";

/** De grote foto bovenaan de homepage plaatsen of vervangen, of alleen de beschrijving wijzigen. */
export async function POST(request: Request) {
  const me = await apiAdmin(request);
  if (!me) return notLoggedIn();
  const form = await request.formData();
  const altNl = text(form, "altNl", 160);
  const altEn = text(form, "altEn", 160);
  const image = file(form, "image");

  const db = getDb();
  const [current] = await db.select().from(siteImages).where(eq(siteImages.slot, SLOT)).limit(1);
  if (!image && !current) return fail("Kies een foto.");

  let objectKey = current?.objectKey;
  const version = image ? (current?.version ?? 0) + 1 : current!.version;
  if (image) {
    const checked = checkUpload(image);
    if ("error" in checked) return fail(checked.error);
    objectKey = `site/${SLOT}-${version}.${checked.ext}`;
    await getBucket().put(objectKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { door: me.username },
    });
  }

  const values = { slot: SLOT, objectKey: objectKey!, altNl, altEn, version };
  const [saved] = await db
    .insert(siteImages)
    .values(values)
    .onConflictDoUpdate({ target: siteImages.slot, set: values })
    .returning();
  if (image && current) await getBucket().delete(current.objectKey);
  return Response.json({ image: saved });
}

export async function DELETE(request: Request) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  const db = getDb();
  const [current] = await db.select().from(siteImages).where(eq(siteImages.slot, SLOT)).limit(1);
  if (current) {
    await db.delete(siteImages).where(eq(siteImages.slot, SLOT));
    await getBucket().delete(current.objectKey);
  }
  return Response.json({ deleted: true });
}
