import { eq } from "drizzle-orm";
import { getUploadsBucket } from "@/app/storage";
import { getDb } from "@/db";
import { projects } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const [project] = await getDb()
    .select({ objectKey: projects.objectKey })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project?.objectKey) return new Response("Niet gevonden", { status: 404 });

  const object = await getUploadsBucket().get(project.objectKey);
  if (!object) return new Response("Niet gevonden", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");

  return new Response(object.body, { headers });
}
