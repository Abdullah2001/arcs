import { eq } from "drizzle-orm";
import { apiAdmin } from "@/lib/auth";
import { getBucket, getDb } from "@/lib/db";
import { checkUpload } from "@/lib/media";
import { photos } from "@/lib/schema";
import { fail, file, notLoggedIn, text } from "../../helpers";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** Teksten wijzigen en eventueel de foto vervangen. */
export async function PATCH(request: Request, ctx: Ctx) {
  const me = await apiAdmin(request);
  if (!me) return notLoggedIn();
  const { id } = await ctx.params;
  const db = getDb();
  const [photo] = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  if (!photo) return fail("Deze foto bestaat niet meer.", 404);

  const form = await request.formData();
  const titleNl = text(form, "titleNl", 90);
  const placeNl = text(form, "placeNl", 120);
  if (!titleNl || !placeNl) return fail("Vul een titel en een plaats in.");

  const image = file(form, "image");
  let newKey: string | null = null;
  if (image) {
    const checked = checkUpload(image);
    if ("error" in checked) return fail(checked.error);
    newKey = `fotos/${id}-${photo.version + 1}.${checked.ext}`;
    await getBucket().put(newKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { door: me.username },
    });
  }

  const [updated] = await db
    .update(photos)
    .set({
      titleNl,
      placeNl,
      titleEn: text(form, "titleEn", 90) || null,
      placeEn: text(form, "placeEn", 120) || null,
      ...(newKey ? { objectKey: newKey, version: photo.version + 1 } : {}),
    })
    .where(eq(photos.id, id))
    .returning();
  if (newKey) await getBucket().delete(photo.objectKey);
  return Response.json({ photo: updated });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const me = await apiAdmin(request);
  if (!me) return notLoggedIn();
  const { id } = await ctx.params;
  const db = getDb();
  const [photo] = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  if (!photo) return fail("Deze foto bestaat niet meer.", 404);
  await db.delete(photos).where(eq(photos.id, id));
  await getBucket().delete(photo.objectKey);
  return Response.json({ deleted: true });
}
