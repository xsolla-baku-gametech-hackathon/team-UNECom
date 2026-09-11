import { describe, expect, it } from "vitest";
import { RISK_ELEVATED, RISK_HIGH, RISK_LOW, riskColor, sensitivityToThreshold } from "../colors";

describe("sensitivityToThreshold", () => {
  it("maps the slider onto the ring-risk cut-off the docs and the eval harness quote", () => {
    expect(sensitivityToThreshold(0)).toBeCloseTo(0.92);
    expect(sensitivityToThreshold(0.5)).toBeCloseTo(0.56);
    expect(sensitivityToThreshold(0.8)).toBeCloseTo(0.344);
    expect(sensitivityToThreshold(1)).toBeCloseTo(0.2);
  });

  it("is monotonic: a higher sensitivity never raises the bar", () => {
    let last = Infinity;
    for (let s = 0; s <= 1.0001; s += 0.1) {
      const t = sensitivityToThreshold(s);
      expect(t).toBeLessThanOrEqual(last);
      last = t;
    }
  });
});

describe("riskColor", () => {
  it("uses the three fixed bands the legend documents", () => {
    expect(riskColor(0.75)).toBe(RISK_HIGH);
    expect(riskColor(0.9)).toBe(RISK_HIGH);
    expect(riskColor(0.5)).toBe(RISK_ELEVATED);
    expect(riskColor(0.74)).toBe(RISK_ELEVATED);
    expect(riskColor(0.49)).toBe(RISK_LOW);
    expect(riskColor(0)).toBe(RISK_LOW);
  });
});
