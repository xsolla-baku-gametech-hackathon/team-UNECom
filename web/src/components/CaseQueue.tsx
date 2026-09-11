import { riskColor } from "../lib/colors";
import { caseRef, usd } from "../lib/format";
import type { Ring } from "../lib/types";

export type QueueFilter = "open" | "decided" | "all";

interface Props {
  rings: Ring[]; // already filtered to flagged-at-current-sensitivity
  selectedRingId: string | null;
  filter: QueueFilter;
  onFilterChange: (f: QueueFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (ringId: string) => void;
  /** Set when every flagged ring has a verdict: the empty state offers the report. */
  onShowSummary?: () => void;
}

const STATUS_META: Record<Ring["status"], { label: string; c: string; bg: string; bd: string }> = {
  confirmed_fraud: { label: "FIRILDAQ", c: "#d1685f", bg: "#1c100f", bd: "#6d3430" },
  confirmed_real: { label: "REAL", c: "#8fae9b", bg: "#0f1613", bd: "#34503f" },
  pending: { label: "GÖZLƏYİR", c: "#c9ccd1", bg: "#16191e", bd: "#313640" },
};

export function CaseQueue({ rings, selectedRingId, filter, onFilterChange, query, onQueryChange, onSelect, onShowSummary }: Props) {
  const q = query.trim().toLowerCase();
  const list = rings
    .filter((r) => {
      if (filter === "open" && r.status !== "pending") return false;
      if (filter === "decided" && r.status === "pending") return false;
      if (q) {
        const hit = caseRef(r.id).toLowerCase().includes(q) || r.memberAccountIds.some((m) => m.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div
      className="flex flex-col border-r"
      style={{ flex: "0 0 328px", borderColor: "#24282f", background: "#0d0f12", minHeight: 0 }}
    >
      <div className="px-3.5 pb-2.5 pt-3 border-b" style={{ borderColor: "#1d2127" }}>
        <div className="flex items-baseline justify-between">
          <span
            className="uppercase"
            style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: ".16em", color: "#e8e6e1" }}
          >
            İş növbəsi
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#676d76" }}>
            {list.length} / {rings.length}
          </span>
        </div>
        <div className="mt-1" style={{ fontSize: 11.5, color: "#676d76", lineHeight: 1.45 }}>
          Cari həssaslıqda bayraqlanan halqalar, ən şiddətlidən başlayaraq.
        </div>
      </div>

      <div className="flex px-3.5 pt-2.5">
        {(["open", "decided", "all"] as QueueFilter[]).map((f) => (
          <div
            key={f}
            onClick={() => onFilterChange(f)}
            className="flex-1 flex items-center justify-center cursor-pointer mr-1.5 uppercase"
            style={{
              height: 24,
              border: `1px solid ${filter === f ? "#c8792e" : "#24282f"}`,
              borderRadius: 2,
              background: filter === f ? "#1a1509" : "transparent",
              color: filter === f ? "#e0913f" : "#9aa0a8",
              fontFamily: "'Barlow Semi Condensed'",
              fontWeight: 600,
              fontSize: 10.5,
              letterSpacing: ".12em",
            }}
          >
            {f === "open" ? "Açıq" : f === "decided" ? "Qərarlanmış" : "Hamısı"}
          </div>
        ))}
      </div>

      <div className="px-3.5 pt-2.5 pb-2.5">
        <div
          className="flex items-center gap-2 rounded"
          style={{ height: 28, padding: "0 9px", background: "#101216", border: "1px solid #24282f" }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#4b5058" }}>⌕</span>
          <input
            id="case-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Case və ya hesab id axtar"
            className="flex-1 bg-transparent outline-none"
            style={{ border: 0, color: "#e8e6e1", fontFamily: "'IBM Plex Mono'", fontSize: 11.5 }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono'",
              fontSize: 10,
              color: "#4b5058",
              border: "1px solid #24282f",
              borderRadius: 2,
              padding: "1px 4px",
            }}
          >
            /
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {list.map((r) => {
          const meta = STATUS_META[r.status];
          const on = selectedRingId === r.id;
          const feeders = r.memberAccountIds.length - r.hubAccountIds.length;
          return (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="cursor-pointer"
              style={{
                position: "relative",
                padding: "11px 14px",
                borderBottom: "1px solid #16191e",
                borderLeft: `2px solid ${riskColor(r.riskScore)}`,
                background: on ? "#16191e" : "transparent",
                opacity: r.status === "pending" ? 1 : 0.62,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5, fontWeight: 600, color: "#e8e6e1" }}>
                  {caseRef(r.id)}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono'",
                    fontSize: 9.5,
                    letterSpacing: ".1em",
                    padding: "2px 6px",
                    borderRadius: 2,
                    color: meta.c,
                    background: meta.bg,
                    border: `1px solid ${meta.bd}`,
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="mt-1.5" style={{ fontSize: 12.5, color: "#c3c7cc", lineHeight: 1.35 }}>
                {feeders} hesab {r.hubAccountIds.length} hub-a dəyər ötürür
              </div>
              <div
                className="mt-1.5 flex items-center gap-3"
                style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#9aa0a8" }}
              >
                <span style={{ color: riskColor(r.riskScore) }}>risk {r.riskScore.toFixed(2)}</span>
                <span>{usd(r.totalValueUsd)}</span>
                <span style={{ color: "#4b5058" }}>{r.memberAccountIds.length} hesab</span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="px-4 py-5" style={{ fontSize: 12, color: "#676d76", lineHeight: 1.5 }}>
            {rings.length === 0 ? (
              "Hazırda uyğun case yoxdur. Sensitivliyi artırın və ya axtarışı təmizləyin."
            ) : filter === "open" && onShowSummary ? (
              <>
                Bütün case-lər qərarlanıb.{" "}
                <span onClick={onShowSummary} className="cursor-pointer" style={{ color: "#e0913f", borderBottom: "1px solid #5c3a17" }}>
                  Yekun hesabata bax
                </span>
              </>
            ) : (
              "Bu filtrə uyğun case yoxdur."
            )}
          </div>
        )}
      </div>

      <div
        className="flex gap-3.5 px-3.5 py-2.5 border-t"
        style={{ borderColor: "#1d2127", fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "#4b5058" }}
      >
        <span>J / K hərəkət</span>
        <span>↵ aç</span>
        <span>F fırıldaq</span>
        <span>R real</span>
      </div>
    </div>
  );
}
