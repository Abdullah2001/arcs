import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./cloudflare-workers-loader.mjs", import.meta.url);

async function render(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function assertShared(html) {
  assert.match(html, /logo-horizontal\.png/);
  assert.match(html, /logo-horizontal-light\.png/);
  assert.match(html, /hero-interieur\.webp/);
  for (const id of ["diensten", "projecten", "werkwijze", "werkgebied", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /hrefLang="nl"/i);
  assert.match(html, /hrefLang="en"/i);
  assert.doesNotMatch(html, /action="mailto:/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
}

test("renders the Dutch homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="nl">/i);
  assert.match(html, /<title>AR Civil Solutions \| Renovatie en afbouw in Eindhoven<\/title>/i);
  assert.match(html, /Renovatie en afbouw in Eindhoven en omgeving/);
  assert.match(html, /Offerte aanvragen/);
  assert.match(html, /Veelgestelde vragen/);
  assertShared(html);
});

test("renders the English homepage", async () => {
  const response = await render("/en");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /Renovation and finishing work in Eindhoven and the region/);
  assert.match(html, /Request a quote/);
  assert.match(html, /Frequently asked questions/);
  assertShared(html);
});
