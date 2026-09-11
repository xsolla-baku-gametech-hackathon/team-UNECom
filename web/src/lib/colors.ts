// Discrete 3-tier risk coloring (not a continuous gradient) — a ring is
// either clearly high, elevated, or low risk, and the legend names exactly
// these three bands, so the node/case coloring should too.
export const RISK_HIGH = "#b0473f";
export const RISK_ELEVATED = "#9a8038";
export const RISK_LOW = "#4f7a5f";
export const NEUTRAL_FILL = "#33383f"; // unflagged ring members + unaffiliated accounts

export function riskColor(score: number): string {
  if (score >= 0.75) return RISK_HIGH;
  if (score >= 0.5) return RISK_ELEVATED;
  return RISK_LOW;
}

export function severityText(score: number): string {
  if (score >= 0.75) return "High: clearly over the threshold";
  if (score >= 0.5) return "Elevated: above the threshold";
  return "Low: just over the threshold";
}

// sensitivity: 0..1. Higher sensitivity -> lower threshold -> more rings
// flagged. At 0 the bar is nearly the ceiling (only the most obvious rings
// clear it); at 1 it's low enough that most elevated-risk clusters clear it.
export function sensitivityToThreshold(sensitivity: number): number {
  return 0.92 - 0.72 * sensitivity;
}
