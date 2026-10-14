import { apiAdmin } from "@/lib/auth";
import { lijstBegrotingen } from "@/lib/begroting/opslag";
import { notLoggedIn } from "../helpers";

export const dynamic = "force-dynamic";

/** Alle opgeslagen begrotingen, nieuwste eerst. */
export async function GET(request: Request) {
  if (!(await apiAdmin(request))) return notLoggedIn();
  return Response.json({ begrotingen: await lijstBegrotingen() }, { headers: { "cache-control": "no-store" } });
}
