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
      <Cell label="Aktiv hesab" value={stats.activeAccounts.toLocaleString("en-US")} sub="yüklənmiş qrafda" />
      <Cell label="Bugünkü əməliyyat" value={stats.dailyEvents.toLocaleString("en-US")} sub="ingest edilmiş köçürmə" />
      <Cell label="Bugünkü dövriyyə" value={`$${stats.dailyVolumeUsd.toLocaleString("en-US")}`} sub="təxmini USD" />
      <Cell label="Riskli halqa" value={String(flaggedRingCount)} sub={`${decidedCount} qərarlanıb`} hot last />
    </div>
  );
}
