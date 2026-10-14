import { getBucket } from "@/lib/db";

/** Stuurt een foto uit de opslag terug. De URL bevat een versienummer, dus mag lang gecachet worden. */
export async function serveObject(objectKey: string | undefined): Promise<Response> {
  if (!objectKey) return new Response("Niet gevonden", { status: 404 });
  const object = await getBucket().get(objectKey);
  if (!object) return new Response("Niet gevonden", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
