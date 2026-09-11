import { describe, expect, it } from "vitest";
import { buildReport } from "../report";
import { ring1, ring2, snapshot } from "./fixture";

describe("buildReport", () => {
  it("tallies verdicts and de-duplicates the accounts handed to the payments team", () => {
    const fraud = { ...ring1, status: "confirmed_fraud" as const };
    const real = { ...ring2, status: "confirmed_real" as const };
    const r = buildReport(snapshot({ rings: [fraud, real] }), [fraud, real], 0.5);
    expect(r.verdicts).toEqual({ fraud: 1, real: 1, pending: 0 });
    expect(r.fraudAccounts.sort()).toEqual(["a1", "a2", "h1"]);
    expect(r.fraudHubs).toEqual(["h1"]);
    expect(r.clearedAccounts.sort()).toEqual(["c1", "x1", "x2"]);
    expect(r.fraudValueUsd).toBe(135);
    expect(r.ringsBelowThreshold).toBe(0);
    expect(r.rings[0].caseRef).toMatch(/^RING-\d{4}$/);
  });

  it("counts communities still under the bar", () => {
    const r = buildReport(snapshot(), [ring1], 0.5);
    expect(r.ringsFlagged).toBe(1);
    expect(r.ringsBelowThreshold).toBe(1);
    expect(r.verdicts.pending).toBe(1);
  });
});
