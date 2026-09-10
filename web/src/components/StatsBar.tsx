import type { GraphSnapshot } from "../lib/types";

interface Props {
  stats: GraphSnapshot["stats"];
  flaggedRingCount: number;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-semibold text-slate-100">{value}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

export function StatsBar({ stats, flaggedRingCount }: Props) {
  return (
    <div className="flex items-center gap-8 rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-3">
      <Stat label="Aktiv hesab" value={stats.activeAccounts.toLocaleString()} />
      <Stat label="Günlük əməliyyat" value={stats.dailyEvents.toLocaleString()} />
      <Stat label="Günlük dövriyyə" value={`$${stats.dailyVolumeUsd.toLocaleString()}`} />
      <Stat
        label="Bayraqlanmış halqa"
        value={flaggedRingCount.toString()}
      />
    </div>
  );
}
