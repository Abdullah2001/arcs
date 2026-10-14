import { eq } from "drizzle-orm";
import { getAdminApiUser, isSameOriginWrite } from "@/app/admin-auth";
import { getUploadsBucket } from "@/app/storage";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { checkImage, jsonError, readTexts } from "../../project-input";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// Teksten aanpassen en eventueel de foto vervangen.
export async function PATCH(request: Request, context: Context) {
  const user = await getAdminApiUser(request);
  if (!user) return jsonError("Je bent niet (meer) ingelogd.", 401);
  if (!isSameOriginWrite(request)) return jsonError("Ongeldige aanvraag.", 403);

  const { id } = await context.params;
  const db = getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Dit project bestaat niet meer.", 404);

  const formData = await request.formData();
  const texts = readTexts(formData);
  if (!texts.title || !texts.location) return jsonError("Vul een titel en een locatie in.");

  const image = formData.get("image");
  let imageUpdate: { imagePath: string; objectKey: string } | null = null;
  const bucket = getUploadsBucket();

  if (image instanceof File && image.size > 0) {
    const checked = checkImage(image);
    if ("error" in checked) return jsonError(checked.error);
    const objectKey = `projects/${id}-${Date.now()}.${checked.extension}`;
    await bucket.put(objectKey, image.stream(), {
      httpMetadata: { contentType: image.type },
      customMetadata: { uploadedBy: user.username },
    });
    imageUpdate = { objectKey, imagePath: `/api/project-images/${id}?v=${Date.now()}` };
  }

  try {
    const [updated] = await db
      .update(projects)
      .set({ ...texts, ...(imageUpdate ?? {}) })
      .where(eq(projects.id, id))
      .returning();
    if (imageUpdate && project.objectKey) await bucket.delete(project.objectKey);
    return Response.json({ project: updated });
  } catch (error) {
    if (imageUpdate) await bucket.delete(imageUpdate.objectKey);
    throw error;
  }
}

export async function DELETE(request: Request, context: Context) {
  const user = await getAdminApiUser(request);
  if (!user) return jsonError("Je bent niet (meer) ingelogd.", 401);
  if (!isSameOriginWrite(request)) return jsonError("Ongeldige aanvraag.", 403);

  const { id } = await context.params;
  const db = getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Dit project bestaat niet meer.", 404);

  await db.delete(projects).where(eq(projects.id, id));
  if (project.objectKey) await getUploadsBucket().delete(project.objectKey);

  return Response.json({ deleted: true });
}
