import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteImages } from "@/lib/schema";
import { serveObject } from "../../serve";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slot: string }> }) {
  const { slot } = await ctx.params;
  const [row] = await getDb().select({ key: siteImages.objectKey }).from(siteImages).where(eq(siteImages.slot, slot)).limit(1);
  return serveObject(row?.key);
}
