import { useDeferredValue, useMemo, useState } from "react";
import { resetDemoData, uploadEvents } from "../lib/api";
import { generateChallenge, randomSeed, type ChallengeParams, type ChallengeTruth } from "../lib/challenge";

interface Props {
  open: boolean;
  mock: boolean;
  onClose: () => void;
  onDone: (truth: ChallengeTruth) => void;
}

type Status = { kind: "idle" } | { kind: "busy"; step: string } | { kind: "error"; message: string };

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4" style={{ padding: "9px 0", borderBottom: "1px solid #1d2127" }}>
      <div style={{ flex: "0 0 190px" }}>
        <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10.5, letterSpacing: ".14em", color: "#c3c7cc" }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "#4b5058", marginTop: 2, lineHeight: 1.35 }}>{hint}</div>
      </div>
      {children}
    </div>
  );
}

function Slider({ value, min, max, step = 1, onChange, render }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; render: (v: number) => string }) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 cursor-pointer" style={{ height: 3 }} />
      <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: "#e8e6e1", minWidth: 96, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{render(value)}</span>
    </div>
  );
}

export function ChallengePanel({ open, mock, onClose, onDone }: Props) {
  const [params, setParams] = useState<ChallengeParams>({ seed: randomSeed(), players: 40, mules: 30, hubs: 1, care: 0.2 });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // The preview regenerates the whole log; deferring it keeps the sliders
  // smooth while dragging instead of rebuilding hundreds of events per frame.
  const deferredParams = useDeferredValue(params);
  const preview = useMemo(() => generateChallenge(deferredParams), [deferredParams]);

  if (!open) return null;
  const busy = status.kind === "busy";
  const set = <K extends keyof ChallengeParams>(k: K, v: ChallengeParams[K]) => setParams((p) => ({ ...p, [k]: v }));

  async function run() {
    if (busy) return;
    try {
      setStatus({ kind: "busy", step: "Clearing the previous log" });
      await resetDemoData();
      setStatus({ kind: "busy", step: `Sending ${preview.events.length} events — the log only, no labels` });
      await uploadEvents(preview.events);
      setStatus({ kind: "idle" });
      onDone(preview.truth);
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(6,7,9,.78)", zIndex: 40 }} onClick={() => !busy && onClose()}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 640, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto", border: "1px solid #5c3a17", background: "#0d0f12", borderRadius: 4, animation: "fr-rise .4s cubic-bezier(.2,.8,.2,1) both" }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#24282f" }}>
          <div>
            <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".18em", color: "#c8792e" }}>Blind test</div>
            <div style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginTop: 3, color: "#e8e6e1" }}>Build a fraud ring. See if we find it.</div>
          </div>
          <button onClick={onClose} disabled={busy} className="flex items-center justify-center rounded" style={{ width: 24, height: 24, border: "1px solid #24282f", color: "#9aa0a8", fontFamily: "'IBM Plex Mono'", fontSize: 12 }}>✕</button>
        </div>

        {mock && (
          <div className="border-b px-4 py-2.5" style={{ borderColor: "#24282f", background: "#1a1509", fontSize: 11.5, color: "#e0913f" }}>
            Backend is not reachable — the log cannot be sent right now.
          </div>
        )}

        <div className="px-4 pt-1 pb-4">
          <Row label="Your number" hint="Any number. Same number, same ring, every time.">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="number"
                value={params.seed}
                onChange={(e) => set("seed", Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                style={{ width: 120, height: 30, padding: "0 10px", background: "#101216", border: "1px solid #313640", borderRadius: 3, color: "#e8e6e1", fontFamily: "'IBM Plex Mono'", fontSize: 13 }}
              />
              <button onClick={() => set("seed", randomSeed())} className="uppercase" style={{ height: 30, padding: "0 10px", border: "1px solid #313640", borderRadius: 3, color: "#9aa0a8", background: "transparent", fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".1em" }}>
                Random
              </button>
            </div>
          </Row>
          <Row label="Ring size" hint="Fresh accounts buying with cards and forwarding the value.">
            <Slider value={params.mules} min={8} max={60} onChange={(v) => set("mules", v)} render={(v) => `${v} mules`} />
          </Row>
          <Row label="Cash-out hubs" hint="Aged accounts that only ever receive, then sell.">
            <Slider value={params.hubs} min={1} max={3} onChange={(v) => set("hubs", v)} render={(v) => `${v} hub${v > 1 ? "s" : ""}`} />
          </Row>
          <Row label="How careful is the fraudster" hint="Careful = fewer cards get flagged, value hops through peers first.">
            <Slider value={Math.round(params.care * 100)} min={0} max={100} step={10} onChange={(v) => set("care", v / 100)} render={(v) => (v === 0 ? "careless" : v >= 80 ? "very careful" : v >= 40 ? "careful" : "a little")} />
          </Row>
          <Row label="Background players" hint="Legitimate economy the ring hides in.">
            <Slider value={params.players} min={20} max={150} step={10} onChange={(v) => set("players", v)} render={(v) => `${v} players`} />
          </Row>

          <div className="mt-3" style={{ fontSize: 12, color: "#9aa0a8", lineHeight: 1.55 }}>
            <span style={{ color: "#e8e6e1", fontFamily: "'IBM Plex Mono'", fontSize: 12 }}>
              {preview.events.length.toLocaleString("en-US")} events · {(params.players + params.mules + params.hubs).toLocaleString("en-US")} accounts
            </span>
            , every one named <span style={{ fontFamily: "'IBM Plex Mono'" }}>p_####</span> in random order. The backend receives only this log. Who is a mule, who is a hub stays in this browser, and is compared with the verdict afterwards.
          </div>

          {status.kind === "error" && (
            <div className="mt-3 rounded px-3 py-2" style={{ background: "#1c1211", border: "1px solid #5a2a26", color: "#d1685f", fontSize: 12 }}>
              Could not run the test: {status.message}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={run}
              disabled={busy || mock}
              className="flex items-center gap-2 rounded uppercase"
              style={{ height: 34, padding: "0 14px", background: busy || mock ? "#5c3a17" : "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
            >
              {busy && <span style={{ width: 10, height: 10, border: "2px solid rgba(10,11,13,.35)", borderTopColor: "#0a0b0d", borderRadius: "50%", animation: "fr-spin .7s linear infinite" }} />}
              {busy ? status.step : "Generate & run"}
            </button>
            <button onClick={onClose} disabled={busy} className="flex items-center rounded uppercase" style={{ height: 34, padding: "0 14px", border: "1px solid #313640", color: "#9aa0a8", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
