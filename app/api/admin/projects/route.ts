import { asc, max } from "drizzle-orm";
import { getAdminApiUser, isSameOriginWrite } from "@/app/admin-auth";
import { getUploadsBucket } from "@/app/storage";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { checkImage, jsonError, readTexts } from "../project-input";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await getAdminApiUser(request))) return jsonError("Je bent niet (meer) ingelogd.", 401);
  const rows = await getDb().select().from(projects).orderBy(asc(projects.sortOrder));
  return Response.json({ projects: rows });
}

export async function POST(request: Request) {
  const user = await getAdminApiUser(request);
  if (!user) return jsonError("Je bent niet (meer) ingelogd.", 401);
  if (!isSameOriginWrite(request)) return jsonError("Ongeldige aanvraag.", 403);

  const formData = await request.formData();
  const texts = readTexts(formData);
  const image = formData.get("image");

  if (!texts.title || !texts.location) return jsonError("Vul een titel en een locatie in.");
  if (!(image instanceof File)) return jsonError("Kies een foto.");
  const checked = checkImage(image);
  if ("error" in checked) return jsonError(checked.error);

  const db = getDb();
  const bucket = getUploadsBucket();
  const id = crypto.randomUUID();
  const objectKey = `projects/${id}-${Date.now()}.${checked.extension}`;
  const [{ highestSortOrder }] = await db.select({ highestSortOrder: max(projects.sortOrder) }).from(projects);

  await bucket.put(objectKey, image.stream(), {
    httpMetadata: { contentType: image.type },
    customMetadata: { uploadedBy: user.username },
  });

  try {
    const [project] = await db
      .insert(projects)
      .values({
        id,
        ...texts,
        imagePath: `/api/project-images/${id}?v=${Date.now()}`,
        objectKey,
        sortOrder: (highestSortOrder ?? 0) + 1,
      })
      .returning();
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    await bucket.delete(objectKey);
    throw error;
  }
}
