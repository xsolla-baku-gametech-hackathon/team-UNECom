import { engineClient, EngineError, type EngineExplainResponse } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";

// evidence shape is engine/app/explain.py's build_evidence() output —
// risk_score there is 0-100, same scale as everywhere else in the engine.
function recommendedActionFor(riskScore: unknown): string {
  const score = typeof riskScore === "number" ? riskScore : null;
  if (score === null) return "Review the result manually.";
  if (score >= 60) return "Freeze every member account and notify the payment provider.";
  if (score >= 30) return "Flag for further investigation; do not block automatically.";
  return "Keep monitoring; there is not enough evidence yet.";
}

// Claude tends to decorate its answer with markdown (**bold**, headings,
// list markers). The panel renders plain text, so the markers would show up
// literally on screen. Strip the common inline/line-start syntax and keep the
// words.
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)[*_](\S.*?\S|\S)[*_](?=\s|$|[.,;:!?])/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toRingExplanation(res: EngineExplainResponse) {
  const e = res.evidence;
  const signals: { label: string; value: string }[] = [];

  if (typeof e.account_count === "number") {
    signals.push({ label: "Accounts", value: String(e.account_count) });
  }
  if (typeof e.flagged_purchase_count === "number") {
    signals.push({ label: "Flagged source purchases", value: String(e.flagged_purchase_count) });
  }
  if (typeof e.avg_taint_score === "number") {
    signals.push({ label: "Average taint score", value: `${Math.round(e.avg_taint_score * 100)}%` });
  }
  if (typeof e.total_value_usd === "number") {
    signals.push({ label: "Total value", value: `$${e.total_value_usd.toLocaleString("en-US")}` });
  }
  if (Array.isArray(e.hub_candidates) && e.hub_candidates.length > 0) {
    signals.push({ label: "Hub accounts", value: e.hub_candidates.join(", ") });
  }

  return {
    ringId: res.ring_id,
    source: res.ai_generated ? "ai" : "template",
    summary: stripMarkdown(res.explanation),
    signals,
    recommendedAction: recommendedActionFor(e.risk_score),
  };
}

export const explanationService = {
  // /web's InvestigationPanel "Model interpretation" section. Runs a fresh
  // analyze() first to get an analysis_id grounded in the current stored
  // events, then asks the engine to explain that specific ring within it —
  // otherwise /explain would fall back to whatever analysis some other
  // caller last ran.
  async getExplanation(ringId: string) {
    const events = await eventRepository.findAllAsContract();
    if (events.length === 0) throw new EngineError("ring not found", undefined, 404);
    const analysis = await engineClient.analyze(events);
    const res = await engineClient.explain(ringId, analysis.analysis_id);
    return toRingExplanation(res);
  },
};
