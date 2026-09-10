import { engineClient, type EngineExplainResponse } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";

// Reserved evidence keys the engine may set for us, separate from the
// free-form signals shown to the analyst. See api/README.md.
const RESERVED_EVIDENCE_KEYS = new Set(["risk_score", "recommended_action"]);

function recommendedActionFor(evidence: Record<string, unknown>): string {
  if (typeof evidence.recommended_action === "string") return evidence.recommended_action;

  const riskScore = typeof evidence.risk_score === "number" ? evidence.risk_score : null;
  if (riskScore === null) return "Nəticəni manual araşdırma üçün nəzərdən keçirin.";
  if (riskScore >= 0.8) return "Bütün üzv hesabları dondurun və ödəniş provayderinə bildirin.";
  if (riskScore >= 0.5) return "Əlavə araşdırma üçün bayraqlayın, avtomatik bloklamayın.";
  return "Monitorinqi davam etdirin, hazırda kifayət qədər dəlil yoxdur.";
}

function toRingExplanation(res: EngineExplainResponse) {
  return {
    ringId: res.ring_id,
    summary: res.explanation,
    signals: Object.entries(res.evidence)
      .filter(([key]) => !RESERVED_EVIDENCE_KEYS.has(key))
      .map(([label, value]) => ({ label, value: String(value) })),
    recommendedAction: recommendedActionFor(res.evidence),
  };
}

export const explanationService = {
  // /web's InvestigationPanel "Claude izahatı" section.
  async getExplanation(ringId: string) {
    const events = await eventRepository.findAllAsContract();
    const res = await engineClient.explain(ringId, events);
    return toRingExplanation(res);
  },
};
