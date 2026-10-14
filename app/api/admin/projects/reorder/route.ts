import { eq } from "drizzle-orm";
import { getAdminApiUser, isSameOriginWrite } from "@/app/admin-auth";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { jsonError } from "../../project-input";

export const dynamic = "force-dynamic";

// Ontvangt de project-id's in de nieuwe volgorde.
export async function POST(request: Request) {
  if (!(await getAdminApiUser(request))) return jsonError("Je bent niet (meer) ingelogd.", 401);
  if (!isSameOriginWrite(request)) return jsonError("Ongeldige aanvraag.", 403);

  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(body.ids) || body.ids.length > 500 || !body.ids.every((v) => typeof v === "string")) {
    return jsonError("Ongeldige volgorde.");
  }

  const db = getDb();
  const ids = body.ids as string[];
  for (let i = 0; i < ids.length; i++) {
    await db.update(projects).set({ sortOrder: i + 1 }).where(eq(projects.id, ids[i]));
  }
  return Response.json({ ok: true });
}
