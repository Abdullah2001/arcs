import { apiAdmin } from "@/lib/auth";
import { bewaarBegroting, geldigId, laadBegroting, verwijderBegroting } from "@/lib/begroting/opslag";
import { normaliseer, samenvatting } from "@/lib/begroting/reken";
import { fail, notLoggedIn } from "../../helpers";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
const MAX_BYTES = 1024 * 1024;

export async function GET(request: Request, ctx: Ctx) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  const { id } = await ctx.params;
  if (!geldigId(id)) return fail("Deze begroting bestaat niet.", 404);
  const begroting = await laadBegroting(id);
  if (!begroting) return fail("Deze begroting bestaat niet (meer).", 404);
  return Response.json({ begroting }, { headers: { "cache-control": "no-store" } });
}

/** Begroting opslaan (nieuw of bijwerken). */
export async function PUT(request: Request, ctx: Ctx) {
  const me = await apiAdmin(request);
  if (!me) return notLoggedIn();
  const { id } = await ctx.params;
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return fail("Deze begroting is te groot om op te slaan.");
  let begroting;
  try {
    begroting = normaliseer(JSON.parse(raw));
  } catch {
    begroting = null;
  }
  if (!begroting || begroting.id !== id || !geldigId(id)) return fail("De begroting kon niet worden gelezen.");
  begroting.bijgewerkt = new Date().toISOString();
  await bewaarBegroting(begroting, me.username);
  return Response.json({ samenvatting: samenvatting(begroting) });
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  const { id } = await ctx.params;
  if (!geldigId(id)) return fail("Deze begroting bestaat niet.", 404);
  await verwijderBegroting(id);
  return Response.json({ ok: true });
}
