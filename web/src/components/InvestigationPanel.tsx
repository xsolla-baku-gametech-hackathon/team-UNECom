import { useEffect, useState } from "react";
import { submitDecision, fetchExplanation, type Decision } from "../lib/api";
import { riskColor } from "../lib/colors";
import type { Ring, RingExplanation } from "../lib/types";

interface Props {
  ring: Ring;
  flagged: boolean;
  onDecided: () => void;
  onClose: () => void;
}

export function InvestigationPanel({ ring, flagged, onDecided, onClose }: Props) {
  const [explanation, setExplanation] = useState<RingExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<Decision | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExplanation(null);
    fetchExplanation(ring.id).then((res) => {
      if (!cancelled) {
        setExplanation(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ring.id]);

  async function decide(decision: Decision) {
    setDeciding(decision);
    await submitDecision(ring.id, decision);
    setDeciding(null);
    onDecided();
  }

  const decided = ring.status === "confirmed_real" || ring.status === "confirmed_fraud";

  return (
    <div className="flex h-full w-[380px] flex-col gap-4 overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: riskColor(ring.riskScore) }}
            />
            <h2 className="font-mono text-sm text-slate-200">{ring.id}</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {ring.memberAccountIds.length} hesab · risk {Math.round(ring.riskScore * 100)}%
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300"
        >
          Bağla
        </button>
      </div>

      {!flagged && !decided && (
        <div className="rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-slate-400">
          Cari həssaslıq səviyyəsində bu halqa bayraqlanmır.
        </div>
      )}

      {decided && (
        <div
          className={`rounded-md px-3 py-2 text-xs font-medium ${
            ring.status === "confirmed_fraud"
              ? "bg-red-500/15 text-red-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {ring.status === "confirmed_fraud" ? "Fırıldaq kimi təsdiqləndi" : "Real oyunçu kimi təsdiqləndi"}
        </div>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Claude izahatı
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-3/4 rounded bg-slate-800" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-300">{explanation?.summary}</p>
        )}
      </section>

      {!loading && explanation && explanation.signals.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Siqnallar</h3>
          <ul className="space-y-1.5">
            {explanation.signals.map((s) => (
              <li key={s.label} className="flex gap-2 text-xs text-slate-400">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                {s.label}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && explanation && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Tövsiyə</h3>
          <p className="text-xs text-slate-400">{explanation.recommendedAction}</p>
        </section>
      )}

      <div className="mt-auto flex gap-2 pt-2">
        <button
          disabled={deciding !== null}
          onClick={() => decide("real")}
          className="flex-1 rounded-md border border-emerald-600/50 bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-600/20 disabled:opacity-50"
        >
          {deciding === "real" ? "..." : "Real oyunçudur"}
        </button>
        <button
          disabled={deciding !== null}
          onClick={() => decide("fraud")}
          className="flex-1 rounded-md border border-red-600/50 bg-red-600/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-600/20 disabled:opacity-50"
        >
          {deciding === "fraud" ? "..." : "Fırıldaqdır"}
        </button>
      </div>
    </div>
  );
}
