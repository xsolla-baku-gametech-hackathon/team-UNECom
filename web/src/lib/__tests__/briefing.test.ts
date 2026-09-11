import { describe, expect, it } from "vitest";
import { buildBriefing } from "../briefing";
import { computePaymentMomentView } from "../paymentMomentView";
import { ring1, snapshot } from "./fixture";

describe("buildBriefing", () => {
  it("tells the whole story when a ring is flagged, from the live numbers", () => {
    const snap = snapshot();
    const steps = buildBriefing(snap, [ring1], computePaymentMomentView(snap, [ring1]), 0.5);
    expect(steps.map((s) => s.id)).toEqual(["log", "rings", "top-ring", "hub", "payment-moment", "decide"]);
    expect(steps[0].body).toContain("6 events between 6 accounts");
    expect(steps[0].body).toContain("The 2 store purchases are not drawn");
    expect(steps[1].title).toContain("One ring crosses");
    expect(steps[3].title).toContain("h1 collects from 2 accounts and never touched a flagged card");
    expect(steps[4].paymentMoment).toBe(true);
    expect(steps[5].action?.ringId).toBe("ring_1");
  });

  it("says so honestly when nothing clears the bar", () => {
    const snap = snapshot();
    const steps = buildBriefing(snap, [], computePaymentMomentView(snap, []), 0.2);
    expect(steps).toHaveLength(2);
    expect(steps[1].title).toContain("none clears the current threshold");
  });
});
