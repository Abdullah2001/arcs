// Maakt een wachtwoord-hash in hetzelfde formaat als app/admin-auth.ts.
// Gebruik: node scripts/hash-password.mjs "jouw-wachtwoord"
import { webcrypto as crypto } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Gebruik: node scripts/hash-password.mjs "wachtwoord"');
  process.exit(1);
}
const iterations = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
const b64 = (u) => Buffer.from(u).toString("base64");
console.log(`pbkdf2$${iterations}$${b64(salt)}$${b64(bits)}`);
