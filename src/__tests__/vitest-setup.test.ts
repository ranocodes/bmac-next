import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("vitest setup", () => {
  it("uses pool: forks (required on Node 24)", () => {
    const cfg = readFileSync(resolve(process.cwd(), "vitest.config.ts"), "utf8");
    expect(cfg).toMatch(/pool:\s*"forks"/);
  });

  it("runs on Node >= 24", () => {
    const major = Number(process.version.match(/^v(\d+)/)?.[1]);
    expect(major).toBeGreaterThanOrEqual(24);
  });
});
