import { describe, it, expect, beforeEach } from "vitest";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

describe("scroll-lock", () => {
  beforeEach(() => {
    while (document.body.style.overflow !== "") {
      unlockScroll();
    }
    document.body.style.overflow = "";
  });

  it("locks and unlocks body scroll", () => {
    lockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    unlockScroll();
    expect(document.body.style.overflow).toBe("");
  });

  it("stacks locks and only unlocks at zero", () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    unlockScroll();
    expect(document.body.style.overflow).toBe("");
  });

  it("never underflows below zero on extra unlocks", () => {
    unlockScroll();
    expect(document.body.style.overflow).toBe("");
  });
});
