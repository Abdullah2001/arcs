// Ingang van de Cloudflare Worker: alle verzoeken gaan naar de app.
import handler from "vinext/server/app-router-entry";

type Env = { ASSETS: Fetcher; DB: D1Database; UPLOADS: R2Bucket };
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException(): void };

const worker = {
  fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
