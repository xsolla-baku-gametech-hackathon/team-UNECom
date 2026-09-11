import { describe, expect, it } from "vitest";
import { computePaymentMomentView } from "../paymentMomentView";
import { ring1, snapshot } from "./fixture";

describe("computePaymentMomentView", () => {
  it("a payment-moment tool sees only the receivers of flagged payments", () => {
    const v = computePaymentMomentView(snapshot(), [ring1]);
    expect([...v.visibleIds]).toEqual(["a1"]);
    expect(v.visibleCount).toBe(1);
  });

  it("misses the hub, which never touched a card, and the mule whose card was not flagged", () => {
    const v = computePaymentMomentView(snapshot(), [ring1]);
    expect([...v.missedIds].sort()).toEqual(["a2", "h1"]);
    expect(v.missedHubIds).toEqual(["h1"]);
    expect(v.missedHubCount).toBe(1);
    expect(v.hubCount).toBe(1);
  });

  it("counts everything that landed in the missed accounts, including the unflagged store purchase", () => {
    const v = computePaymentMomentView(snapshot(), [ring1]);
    // a2 received 50 from STORE; h1 received 90 + 45 in transfers.
    expect(v.missedValueUsd).toBe(50 + 90 + 45);
  });

  it("reports nothing missed when no ring is flagged", () => {
    const v = computePaymentMomentView(snapshot(), []);
    expect(v.missedCount).toBe(0);
    expect(v.missedValueUsd).toBe(0);
  });
});
