import type { ReplayFrame } from "../lib/replay";
import { usd } from "../lib/format";

interface Props {
  frame: ReplayFrame;
  onSkip: () => void;
}

function Counter({ label, value, tone }: { label: string; value: string; tone?: "flag" }) {
  return (
    <div style={{ minWidth: 96 }}>
      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 600, lineHeight: 1, color: tone === "flag" ? "#d1685f" : "#e8e6e1", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div className="mt-1.5 uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: "#676d76" }}>
        {label}
      </div>
    </div>
  );
}

export function ReplayHud({ frame, onSkip }: Props) {
  const progress = frame.total ? frame.index / frame.total : 0;
  const clock = frame.clock ? frame.clock.replace("T", " ").slice(0, 19) : "—";
  return (
    <div
      className="absolute"
      style={{
        left: "50%",
        bottom: 24,
        ["--fr-x" as string]: "-50%",
        width: 640,
        maxWidth: "calc(100% - 32px)",
        zIndex: 35,
        border: "1px solid #313640",
        background: "rgba(13,15,18,0.96)",
        borderRadius: 4,
        boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
        overflow: "hidden",
        animation: "fr-rise .45s cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div style={{ height: 3, background: "#1d2127" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#c8792e", transition: "width .1s linear" }} />
      </div>
      <div style={{ padding: "12px 16px 14px" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d1685f", animation: "fr-pulse 1s infinite", flex: "0 0 auto" }} />
            <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10.5, letterSpacing: ".18em", color: "#e8e6e1" }}>
              Replay
            </span>
            <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".14em", color: "#676d76" }}>
              The log, in the order it happened
            </span>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5, color: "#9aa0a8", fontVariantNumeric: "tabular-nums" }}>{clock} UTC</span>
        </div>

        <div className="mt-3.5 flex flex-wrap items-end gap-6">
          <Counter label="events" value={`${frame.index.toLocaleString("en-US")} / ${frame.total.toLocaleString("en-US")}`} />
          <Counter label="accounts seen" value={frame.accounts.toLocaleString("en-US")} />
          <Counter label="flagged purchases" value={frame.flaggedPurchases.toLocaleString("en-US")} tone="flag" />
          <Counter label="value moved" value={usd(frame.valueUsd)} />
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "#1d2127" }}>
          <span style={{ fontSize: 11.5, color: "#9aa0a8", lineHeight: 1.5 }}>
            Red pulse = a purchase the card processor flagged. Watch where that value goes next.
          </span>
          <button
            onClick={onSkip}
            className="uppercase"
            style={{ flex: "0 0 auto", height: 28, padding: "0 12px", border: "1px solid #313640", borderRadius: 3, color: "#c3c7cc", background: "transparent", fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".1em" }}
          >
            Skip to result →
          </button>
        </div>
      </div>
    </div>
  );
}
