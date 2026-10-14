import { max } from "drizzle-orm";
import { apiAdmin } from "@/lib/auth";
import { getBucket, getDb } from "@/lib/db";
import { checkUpload } from "@/lib/media";
import { photos } from "@/lib/schema";
import { fail, file, notLoggedIn, text } from "../helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const me = await apiAdmin(request);
  if (!me) return notLoggedIn();

  const form = await request.formData();
  const titleNl = text(form, "titleNl", 90);
  const placeNl = text(form, "placeNl", 120);
  const image = file(form, "image");
  if (!titleNl || !placeNl) return fail("Vul een titel en een plaats in.");
  if (!image) return fail("Kies een foto.");
  const checked = checkUpload(image);
  if ("error" in checked) return fail(checked.error);

  const db = getDb();
  const id = crypto.randomUUID();
  const objectKey = `fotos/${id}-1.${checked.ext}`;
  await getBucket().put(objectKey, image.stream(), {
    httpMetadata: { contentType: image.type },
    customMetadata: { door: me.username },
  });
  const [{ last }] = await db.select({ last: max(photos.position) }).from(photos);
  try {
    const [photo] = await db
      .insert(photos)
      .values({
        id,
        titleNl,
        placeNl,
        titleEn: text(form, "titleEn", 90) || null,
        placeEn: text(form, "placeEn", 120) || null,
        objectKey,
        position: (last ?? 0) + 1,
      })
      .returning();
    return Response.json({ photo }, { status: 201 });
  } catch (error) {
    await getBucket().delete(objectKey);
    throw error;
  }
}
