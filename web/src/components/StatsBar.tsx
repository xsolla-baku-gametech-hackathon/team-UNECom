import { usd } from "../lib/format";
import type { GraphSnapshot } from "../lib/types";

interface Props {
  stats: GraphSnapshot["stats"];
  flaggedRingCount: number;
  decidedCount: number;
}

function Cell({ label, value, sub, hot, last }: { label: string; value: string; sub: string; hot?: boolean; last?: boolean }) {
  return (
    <div style={{ padding: "9px 14px", borderRight: last ? undefined : "1px solid #24282f", background: hot ? "#121316" : undefined }}>
      <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".15em", color: "#676d76" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 20, fontWeight: 600, marginTop: 3, color: hot ? "#e0913f" : "#e8e6e1" }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "#4b5058", marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export function StatsBar({ stats, flaggedRingCount, decidedCount }: Props) {
  return (
    <div className="flex items-stretch" style={{ border: "1px solid #24282f", background: "#0d0f12", borderRadius: 3 }}>
      <Cell label="Accounts" value={stats.activeAccounts.toLocaleString("en-US")} sub="in the loaded graph" />
      <Cell label="Events" value={stats.totalEvents.toLocaleString("en-US")} sub="in the loaded log" />
      <Cell label="Total volume" value={usd(stats.totalVolumeUsd)} sub="estimated USD" />
      <Cell label="Flagged rings" value={String(flaggedRingCount)} sub={`${decidedCount} decided`} hot last />
    </div>
  );
}
