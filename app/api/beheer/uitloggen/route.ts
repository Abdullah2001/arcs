import { clearedCookie, endSession, redirectTo, requestToken, sameOrigin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (sameOrigin(request)) await endSession(requestToken(request));
  return redirectTo("/beheer/inloggen?melding=uitgelogd", { "set-cookie": clearedCookie() });
}
