// Risk score (0..1) -> green -> yellow -> red.
const STOPS: [number, [number, number, number]][] = [
  [0, [34, 197, 94]], // green-500
  [0.5, [234, 179, 8]], // yellow-500
  [1, [239, 68, 68]], // red-500
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function riskColor(score: number): string {
  const s = Math.min(1, Math.max(0, score));
  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (s >= STOPS[i][0] && s <= STOPS[i + 1][0]) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const t = (s - lo[0]) / span;
  const [r, g, b] = [
    Math.round(lerp(lo[1][0], hi[1][0], t)),
    Math.round(lerp(lo[1][1], hi[1][1], t)),
    Math.round(lerp(lo[1][2], hi[1][2], t)),
  ];
  return `rgb(${r}, ${g}, ${b})`;
}

// Maps the 0..1 "suspicion sensitivity" slider to a risk-score threshold.
// Higher sensitivity -> lower threshold -> more rings get flagged.
export function sensitivityToThreshold(sensitivity: number): number {
  return 1 - sensitivity;
}
