import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./workers-loader.mjs", import.meta.url);

async function render(path) {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("t", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(url.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("Nederlandse homepage", async () => {
  const res = await render("/");
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<html lang="nl">/);
  assert.match(html, /Renovatie en afbouw, tot in de laatste naad\./);
  assert.match(html, /logo-horizontal-light\.png/);
  for (const id of ["diensten", "werkwijze", "contact"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /hrefLang="en"/i);
  // Zonder foto's geen lege projectensectie
  assert.doesNotMatch(html, /id="projecten"/);
});

test("Engelse homepage", async () => {
  const res = await render("/en");
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Renovation and finishing work, right down to the last detail\./);
  assert.match(html, /Request a free quote/);
});
