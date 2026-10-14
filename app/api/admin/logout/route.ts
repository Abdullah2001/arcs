import { clearedSessionCookie, deleteSession, isSameOriginWrite, seeOther, sessionTokenFromRequest } from "@/app/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isSameOriginWrite(request)) {
    await deleteSession(await sessionTokenFromRequest(request));
  }
  return seeOther(request, "/beheer/inloggen?uitgelogd=1", { "set-cookie": clearedSessionCookie() });
}
