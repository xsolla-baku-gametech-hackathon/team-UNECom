export function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// Short display id for a ring, e.g. "ring_farm_01" -> "RING-0041"-style.
// Purely cosmetic — derived deterministically from the real ring id so it's
// stable across renders, not a separate identifier the backend needs to know.
export function caseRef(ringId: string): string {
  let h = 0;
  for (let i = 0; i < ringId.length; i++) h = (h * 31 + ringId.charCodeAt(i)) >>> 0;
  return "RING-" + String(h % 10000).padStart(4, "0");
}
