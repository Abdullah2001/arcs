import { eq } from "drizzle-orm";
import { apiAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/schema";
import { fail, notLoggedIn } from "../../helpers";

export const dynamic = "force-dynamic";

/** Ontvangt alle foto-id's in de nieuwe volgorde. */
export async function POST(request: Request) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((v) => typeof v === "string")) return fail("Ongeldige volgorde.");
  const db = getDb();
  for (let i = 0; i < ids.length; i++) {
    await db.update(photos).set({ position: i + 1 }).where(eq(photos.id, ids[i] as string));
  }
  return Response.json({ ok: true });
}
