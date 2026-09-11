import { describe, expect, it } from "vitest";
import { caseRef, usd } from "../format";

describe("format", () => {
  it("usd rounds to whole dollars with en-US grouping", () => {
    expect(usd(26814.4)).toBe("$26,814");
    expect(usd(0.4)).toBe("$0");
    expect(usd(1234567.6)).toBe("$1,234,568");
  });

  it("caseRef is stable, zero-padded and only depends on the ring id", () => {
    expect(caseRef("ring_3")).toBe(caseRef("ring_3"));
    expect(caseRef("ring_3")).toMatch(/^RING-\d{4}$/);
    expect(caseRef("ring_3")).not.toBe(caseRef("ring_5"));
  });
});
