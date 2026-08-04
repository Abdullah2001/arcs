const cloudflareWorkersModule =
  "data:text/javascript,export const env = Object.create(null);";

export function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return { url: cloudflareWorkersModule, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
