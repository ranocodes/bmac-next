import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/generate-password-hash.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(32).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log(`scrypt:${salt}:${hash}`);
