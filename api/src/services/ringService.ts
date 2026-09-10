import { engineClient } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";
import { ringSensitivityRepository } from "../repositories/ringSensitivityRepository.js";
import { ringDecisionRepository } from "../repositories/ringDecisionRepository.js";

export const ringService = {
  // Flagged rings from the engine, each annotated with our locally-stored
  // sensitivity override (null if the designer hasn't tuned it yet).
  async listRings() {
    const events = await eventRepository.findAllAsContract();
    const [analysis, overrides] = await Promise.all([
      engineClient.analyze(events),
      ringSensitivityRepository.findAll(),
    ]);
    const overrideByRingId = new Map(overrides.map((o) => [o.ringId, o.sensitivity]));

    return analysis.rings.map((ring) => ({
      ...ring,
      sensitivity: overrideByRingId.get(ring.ring_id) ?? null,
    }));
  },

  async setSensitivity(ringId: string, sensitivity: number) {
    return ringSensitivityRepository.upsert(ringId, sensitivity);
  },

  // Analyst verdict from /web's InvestigationPanel ("real" | "fraud"),
  // stored as the confirmed_real/confirmed_fraud status GET /graph reports.
  async setDecision(ringId: string, decision: "real" | "fraud") {
    const status = decision === "real" ? "confirmed_real" : "confirmed_fraud";
    return ringDecisionRepository.upsert(ringId, status);
  },
};
