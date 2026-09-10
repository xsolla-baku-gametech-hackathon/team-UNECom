import { engineClient, type EngineExplainResponse } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";

// evidence shape is engine/app/explain.py's build_evidence() output —
// risk_score there is 0-100, same scale as everywhere else in the engine.
function recommendedActionFor(riskScore: unknown): string {
  const score = typeof riskScore === "number" ? riskScore : null;
  if (score === null) return "Nəticəni manual araşdırma üçün nəzərdən keçirin.";
  if (score >= 60) return "Bütün üzv hesabları dondurun və ödəniş provayderinə bildirin.";
  if (score >= 30) return "Əlavə araşdırma üçün bayraqlayın, avtomatik bloklamayın.";
  return "Monitorinqi davam etdirin, hazırda kifayət qədər dəlil yoxdur.";
}

function toRingExplanation(res: EngineExplainResponse) {
  const e = res.evidence;
  const signals: { label: string; value: string }[] = [];

  if (typeof e.account_count === "number") {
    signals.push({ label: "Hesab sayı", value: String(e.account_count) });
  }
  if (typeof e.flagged_purchase_count === "number") {
    signals.push({ label: "Bayraqlanmış mənbə alışları", value: String(e.flagged_purchase_count) });
  }
  if (typeof e.avg_taint_score === "number") {
    signals.push({ label: "Orta taint score", value: `${Math.round(e.avg_taint_score * 100)}%` });
  }
  if (typeof e.total_value_usd === "number") {
    signals.push({ label: "Ümumi dəyər", value: `$${e.total_value_usd.toLocaleString("en-US")}` });
  }
  if (Array.isArray(e.hub_candidates) && e.hub_candidates.length > 0) {
    signals.push({ label: "Hub hesablar", value: e.hub_candidates.join(", ") });
  }

  return {
    ringId: res.ring_id,
    summary: res.explanation,
    signals,
    recommendedAction: recommendedActionFor(e.risk_score),
  };
}

export const explanationService = {
  // /web's InvestigationPanel "Claude izahatı" section. Runs a fresh
  // analyze() first to get an analysis_id grounded in the current stored
  // events, then asks the engine to explain that specific ring within it —
  // otherwise /explain would fall back to whatever analysis some other
  // caller last ran.
  async getExplanation(ringId: string) {
    const events = await eventRepository.findAllAsContract();
    const analysis = await engineClient.analyze(events);
    const res = await engineClient.explain(ringId, analysis.analysis_id);
    return toRingExplanation(res);
  },
};
