import { desc, max } from "drizzle-orm";
import { getAdminApiUser, isSameOriginWrite } from "@/app/admin-auth";
import { getUploadsBucket } from "@/app/storage";
import { getDb } from "@/db";
import { projects } from "@/db/schema";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function cleanText(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET() {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Geen toegang." }, { status: 403 });

  const rows = await getDb().select().from(projects).orderBy(desc(projects.sortOrder));
  return Response.json({ projects: rows });
}

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Geen toegang." }, { status: 403 });
  if (!isSameOriginWrite(request)) {
    return Response.json({ error: "Ongeldige aanvraag." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = cleanText(formData.get("title"), 90);
  const location = cleanText(formData.get("location"), 120);
  const image = formData.get("image");

  if (!title || !location) {
    return Response.json({ error: "Vul een titel en locatie in." }, { status: 400 });
  }
  if (!(image instanceof File)) {
    return Response.json({ error: "Kies een foto." }, { status: 400 });
  }

  const extension = allowedImageTypes.get(image.type);
  if (!extension) {
    return Response.json(
      { error: "Gebruik een JPG-, PNG- of WebP-afbeelding." },
      { status: 400 },
    );
  }
  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { error: "De foto mag maximaal 12 MB groot zijn." },
      { status: 400 },
    );
  }

  const db = getDb();
  const bucket = getUploadsBucket();
  const id = crypto.randomUUID();
  const objectKey = `projects/${id}.${extension}`;
  const [{ highestSortOrder }] = await db
    .select({ highestSortOrder: max(projects.sortOrder) })
    .from(projects);
  const sortOrder = (highestSortOrder ?? 0) + 1;

  await bucket.put(objectKey, image.stream(), {
    httpMetadata: { contentType: image.type },
    customMetadata: { uploadedBy: user.email },
  });

  try {
    const [project] = await db
      .insert(projects)
      .values({
        id,
        title,
        location,
        imagePath: `/api/project-images/${id}`,
        objectKey,
        sortOrder,
      })
      .returning();
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    await bucket.delete(objectKey);
    throw error;
  }
}
