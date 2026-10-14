// Laat de gebouwde worker draaien in Node tijdens tests (zonder Cloudflare).
const stub = "data:text/javascript,export const env = Object.create(null);";
export function resolve(specifier, context, next) {
  if (specifier === "cloudflare:workers") return { url: stub, shortCircuit: true };
  return next(specifier, context);
}
