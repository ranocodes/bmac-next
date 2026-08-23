import { describe, it, expect } from "vitest";
import { verifyExpectedAmount } from "@/lib/payments-verify";
import nextConfig from "../../next.config";

describe("verifyExpectedAmount", () => {
  it("accepts exact match", () => {
    expect(verifyExpectedAmount(500000, 500000)).toBe(true);
  });

  it("accepts within 1% tolerance", () => {
    expect(verifyExpectedAmount(505000, 500000)).toBe(true);
    expect(verifyExpectedAmount(495000, 500000)).toBe(true);
    expect(verifyExpectedAmount(500001, 500000)).toBe(true);
  });

  it("rejects more than 1% off", () => {
    expect(verifyExpectedAmount(510000, 500000)).toBe(false);
    expect(verifyExpectedAmount(490000, 500000)).toBe(false);
  });

  it("rejects pay-less bypass (tiny amount)", () => {
    expect(verifyExpectedAmount(100, 500000)).toBe(false);
  });

  it("allows unknown expected amount (fail-open documented)", () => {
    expect(verifyExpectedAmount(100, null)).toBe(true);
    expect(verifyExpectedAmount(100, undefined)).toBe(true);
  });

  it("treats non-positive expected as unknown", () => {
    expect(verifyExpectedAmount(100, 0)).toBe(true);
  });
});

describe("security headers config", () => {
  it("sets X-Frame-Options on all routes", async () => {
    const headers = await nextConfig.headers?.();
    const all = headers?.find((h) => h.source === "/(.*)");
    const frame = all?.headers.find((h) => h.key === "X-Frame-Options");
    expect(frame?.value).toBe("SAMEORIGIN");
  });
});
