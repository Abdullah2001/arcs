import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/schema";
import { serveObject } from "../../serve";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const [row] = await getDb().select({ key: photos.objectKey }).from(photos).where(eq(photos.id, id)).limit(1);
  return serveObject(row?.key);
}
