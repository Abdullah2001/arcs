import { eq } from "drizzle-orm";
import { getAdminApiUser, isSameOriginWrite } from "@/app/admin-auth";
import { getUploadsBucket } from "@/app/storage";
import { getDb } from "@/db";
import { projects } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Geen toegang." }, { status: 403 });
  if (!isSameOriginWrite(request)) {
    return Response.json({ error: "Ongeldige aanvraag." }, { status: 403 });
  }

  const { id } = await context.params;
  const db = getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) {
    return Response.json({ error: "Project niet gevonden." }, { status: 404 });
  }

  if (project.objectKey) {
    await getUploadsBucket().delete(project.objectKey);
  }
  await db.delete(projects).where(eq(projects.id, id));

  return Response.json({ deleted: true });
}
