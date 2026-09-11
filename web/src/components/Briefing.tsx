import { useEffect, useRef, useState } from "react";
import type { BriefingStep } from "../lib/briefing";

interface Props {
  steps: BriefingStep[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  onAction: (ringId: string) => void;
}

const STEP_MS = 9000;

// Animates a number from 0 to `target` the first time a step is shown, so a
// count like "122 accounts" reads as something being measured, not pasted.
function useCountUp(target: number, key: string, ms = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, key, ms]);
  return value;
}

function formatStat(value: number, prefix?: string): string {
  const rounded = Math.round(value);
  return `${prefix ?? ""}${rounded.toLocaleString("en-US")}`;
}

export function Briefing({ steps, index, onIndexChange, onClose, onAction }: Props) {
  const step = steps[index];
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(performance.now());
  const elapsedRef = useRef(0);
  const stat = useCountUp(step?.stat?.value ?? 0, step?.id ?? "");

  // Auto-advance with a visible progress bar; hovering the card pauses it.
  // The parent remounts this component per step (key={index}), which is what
  // resets the timer and the count-up between steps.
  useEffect(() => {
    if (!step || step.action) return; // the last step waits for the human
    let raf = 0;
    const tick = () => {
      if (!paused) {
        const elapsed = elapsedRef.current + (performance.now() - startRef.current);
        const p = Math.min(1, elapsed / STEP_MS);
        setProgress(p);
        if (p >= 1) {
          onIndexChange(Math.min(steps.length - 1, index + 1));
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, step, steps.length, onIndexChange]);

  function pause() {
    if (paused) return;
    elapsedRef.current += performance.now() - startRef.current;
    setPaused(true);
  }
  function resume() {
    if (!paused) return;
    startRef.current = performance.now();
    setPaused(false);
  }

  if (!step) return null;
  const last = index === steps.length - 1;

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      className="absolute"
      style={{
        left: "50%",
        bottom: 24,
        // Centering goes through the animation's own transform (--fr-x), since
        // `fr-rise` with fill-mode both would override an inline translateX.
        ["--fr-x" as string]: "-50%",
        width: 560,
        maxWidth: "calc(100% - 32px)",
        zIndex: 35,
        border: "1px solid #5c3a17",
        background: "rgba(13,15,18,0.96)",
        borderRadius: 4,
        boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
        overflow: "hidden",
        animation: "fr-rise .45s cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div style={{ height: 3, background: "#1d2127" }}>
        <div style={{ height: "100%", width: `${(step.action ? 1 : progress) * 100}%`, background: "#c8792e", transition: paused ? "none" : "width .12s linear" }} />
      </div>

      <div style={{ padding: "12px 16px 14px" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8792e", animation: "fr-pulse 1.6s infinite", flex: "0 0 auto" }} />
            <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10.5, letterSpacing: ".18em", color: "#e0913f" }}>
              AI briefing
            </span>
            <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".14em", color: "#676d76" }}>
              {step.eyebrow}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.id}
                onClick={() => onIndexChange(i)}
                className="cursor-pointer"
                style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i <= index ? "#c8792e" : "#2b2f36", transition: "width .25s, background .25s" }}
              />
            ))}
          </div>
        </div>

        <div key={step.id} style={{ animation: "fr-rise .4s cubic-bezier(.2,.8,.2,1) both", ["--fr-x" as string]: "0px" }}>
          <div className="mt-3 flex items-start gap-4">
            {step.stat && (
              <div style={{ flex: "0 0 auto", minWidth: 128 }}>
                <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 34, fontWeight: 600, lineHeight: 1, color: "#e0913f", fontVariantNumeric: "tabular-nums" }}>
                  {formatStat(stat, step.stat.prefix)}
                </div>
                <div className="mt-1.5 uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: "#9aa0a8", maxWidth: 140, lineHeight: 1.3 }}>
                  {step.stat.label}
                </div>
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 19, lineHeight: 1.18, color: "#e8e6e1" }}>{step.title}</div>
              <div className="mt-2" style={{ fontSize: 12.5, lineHeight: 1.6, color: "#c3c7cc" }}>{step.body}</div>
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "#1d2127" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="uppercase"
              style={{ height: 28, padding: "0 10px", border: "1px solid #313640", borderRadius: 3, color: "#9aa0a8", background: "transparent", fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".1em" }}
            >
              {last ? "Close" : "Skip"}
            </button>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "#4b5058" }}>← → keys · hover pauses</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onIndexChange(Math.max(0, index - 1))}
              disabled={index === 0}
              className="uppercase"
              style={{ height: 28, padding: "0 10px", border: "1px solid #313640", borderRadius: 3, color: index === 0 ? "#3a4048" : "#c3c7cc", background: "transparent", fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".1em" }}
            >
              Back
            </button>
            {step.action ? (
              <button
                onClick={() => onAction(step.action!.ringId)}
                className="uppercase"
                style={{ height: 28, padding: "0 14px", borderRadius: 3, background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 11.5, letterSpacing: ".1em" }}
              >
                {step.action.label} →
              </button>
            ) : (
              <button
                onClick={() => onIndexChange(Math.min(steps.length - 1, index + 1))}
                className="uppercase"
                style={{ height: 28, padding: "0 14px", borderRadius: 3, background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 11.5, letterSpacing: ".1em" }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
