import type { ChallengeScore as Score, ChallengeTruth } from "../lib/challenge";
import { usd } from "../lib/format";

interface Props {
  truth: ChallengeTruth;
  score: Score;
  sensitivity: number;
  onClose: () => void;
  onRaiseSensitivity: () => void;
}

function Bar({ label, num, den, unit, invert }: { label: string; num: number; den: number; unit: string; invert?: boolean }) {
  const pct = den > 0 ? num / den : 0;
  // For false positives the good direction is zero.
  const good = invert ? num === 0 : pct >= 0.9;
  const color = good ? "#8fae9b" : invert ? "#d1685f" : "#e0913f";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: "#676d76" }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12.5, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
          {num} / {den} {unit}
        </span>
      </div>
      <div className="mt-1" style={{ height: 4, background: "#1d2127", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(1, invert ? (den ? num / den : 0) : pct) * 100}%`, background: color, transition: "width .35s cubic-bezier(.2,.8,.2,1)" }} />
      </div>
    </div>
  );
}

export function ChallengeScoreCard({ truth, score, sensitivity, onClose, onRaiseSensitivity }: Props) {
  const ringPct = score.ringTotal ? Math.round((score.ringCaught / score.ringTotal) * 100) : 0;
  // A careful ring can sit under the default bar; the honest next move is
  // the slider, so offer it right here instead of leaving a 0% on screen.
  const canRaise = ringPct < 90 && sensitivity < 0.95;
  return (
    <div style={{ width: 342, maxWidth: "100%", border: "1px solid #5c3a17", background: "#0d0f12", borderRadius: 3, padding: "11px 12px", animation: "fr-rise .4s cubic-bezier(.2,.8,.2,1) both" }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#c8792e" }}>
          Blind test · #{truth.params.seed}
        </span>
        <span onClick={onClose} className="cursor-pointer" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#4b5058" }}>✕</span>
      </div>
      <div className="mt-2 flex items-end gap-3">
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 30, fontWeight: 600, lineHeight: 1, color: ringPct >= 90 ? "#8fae9b" : "#e0913f", fontVariantNumeric: "tabular-nums" }}>{ringPct}%</div>
        <div style={{ fontSize: 11, color: "#9aa0a8", lineHeight: 1.4, paddingBottom: 2 }}>of the planted ring is inside a flagged case at sensitivity {Math.round(sensitivity * 100)}%</div>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        <Bar label="Ring accounts caught" num={score.ringCaught} den={score.ringTotal} unit="" />
        <Bar label="Cash-out hubs caught" num={score.hubCaught} den={score.hubTotal} unit="" />
        <Bar label="Real players wrongly flagged" num={score.falsePositives} den={score.cleanTotal} unit="" invert />
      </div>
      <div className="mt-3 flex items-baseline justify-between" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11 }}>
        <span style={{ color: "#676d76" }}>ring value in flagged cases</span>
        <span style={{ color: "#e8e6e1" }}>{usd(score.valueCaughtUsd)} <span style={{ color: "#4b5058" }}>/ {usd(score.valueTotalUsd)}</span></span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span style={{ fontSize: 10.5, color: "#4b5058", lineHeight: 1.45 }}>Truth never left this browser. Follows the sensitivity slider live.</span>
        {canRaise && (
          <button
            onClick={onRaiseSensitivity}
            className="uppercase"
            style={{ flex: "0 0 auto", height: 26, padding: "0 10px", border: "1px solid #5c3a17", borderRadius: 3, color: "#e0913f", background: "#1a1509", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10.5, letterSpacing: ".1em" }}
          >
            Raise sensitivity →
          </button>
        )}
      </div>
    </div>
  );
}
