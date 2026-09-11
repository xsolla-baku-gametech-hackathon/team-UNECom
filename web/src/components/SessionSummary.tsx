import { caseRef, usd } from "../lib/format";
import { buildReport } from "../lib/report";
import type { GraphSnapshot, Ring } from "../lib/types";

interface Props {
  snapshot: GraphSnapshot;
  /** Rings flagged at the current sensitivity (the queue the analyst just cleared). */
  flaggedRings: Ring[];
  sensitivity: number;
  onClose: () => void;
  onRaiseSensitivity: () => void;
  onOpenRing: (ringId: string) => void;
}

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Cell({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "fraud" | "real" }) {
  const color = tone === "fraud" ? "#d1685f" : tone === "real" ? "#8fae9b" : "#e8e6e1";
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, padding: "10px 12px", background: "#101216", border: "1px solid #1d2127", borderRadius: 3 }}>
      <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: "#676d76" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 24, fontWeight: 600, marginTop: 3, color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "#4b5058", marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export function SessionSummary({ snapshot, flaggedRings, sensitivity, onClose, onRaiseSensitivity, onOpenRing }: Props) {
  const report = buildReport(snapshot, flaggedRings, sensitivity);
  const fraudRings = flaggedRings.filter((r) => r.status === "confirmed_fraud");
  const canRaise = sensitivity < 0.99 && report.ringsBelowThreshold > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(6,7,9,.78)", zIndex: 40 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 620, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", border: "1px solid #313640", background: "#0d0f12", borderRadius: 4, animation: "fr-rise .4s cubic-bezier(.2,.8,.2,1) both" }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#24282f" }}>
          <div>
            <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".18em", color: "#c8792e" }}>
              Növbə boşaldı
            </div>
            <div style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginTop: 3, color: "#e8e6e1" }}>
              Yekun hesabat — {report.verdicts.fraud + report.verdicts.real} case qərarlandı
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded" style={{ width: 24, height: 24, border: "1px solid #24282f", color: "#9aa0a8", fontFamily: "'IBM Plex Mono'", fontSize: 12 }}>
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2">
            <Cell label="Fırıldaq" value={String(report.verdicts.fraud)} sub={`${report.fraudAccounts.length} hesab · ${report.fraudHubs.length} hub`} tone="fraud" />
            <Cell label="Real oyunçu" value={String(report.verdicts.real)} sub={`${report.clearedAccounts.length} hesab təmizləndi`} tone="real" />
            <Cell label="Dondurulacaq dəyər" value={usd(report.fraudValueUsd)} sub="təsdiqlənmiş halqalarda" />
          </div>

          {fraudRings.length > 0 ? (
            <div className="mt-4">
              <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#e8e6e1" }}>
                Ödəniş komandasına gedən halqalar
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {fraudRings.map((r) => (
                  <div key={r.id} onClick={() => onOpenRing(r.id)} className="flex cursor-pointer items-center justify-between gap-3 rounded px-3 py-2" style={{ background: "#101216", border: "1px solid #1d2127" }}>
                    <div className="flex items-center gap-3" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5 }}>
                      <span style={{ color: "#e8e6e1", fontWeight: 600 }}>{caseRef(r.id)}</span>
                      <span style={{ color: "#9aa0a8" }}>{r.memberAccountIds.length} hesab</span>
                      <span style={{ color: "#d1685f" }}>{usd(r.totalValueUsd)}</span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {r.hubAccountIds.map((h) => (
                        <span key={h} style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, padding: "1px 6px", borderRadius: 2, color: "#e8e6e1", border: "1px solid #8d9299" }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2" style={{ fontSize: 11, color: "#676d76", lineHeight: 1.5 }}>
                Konturlu id-lər nağdlaşdırma nöqtələridir. Heç nə avtomatik bloklanmayıb — hesabat ödəniş komandasının qərarı üçündür.
              </div>
            </div>
          ) : (
            <div className="mt-4" style={{ fontSize: 12.5, color: "#9aa0a8", lineHeight: 1.55 }}>
              Bu həssaslıqda bayraqlanan bütün halqalar real oyunçu kimi təmizləndi. Hər şey qaydasındadırsa, bu da nəticədir.
            </div>
          )}

          <div className="mt-4 border-t pt-3" style={{ borderColor: "#1d2127", fontSize: 11.5, color: "#9aa0a8", lineHeight: 1.5 }}>
            {report.ringsBelowThreshold > 0
              ? `${report.ringsBelowThreshold} icma hələ həddin altındadır (həssaslıq ${Math.round(sensitivity * 100)}%). Həddi endirsən növbəyə yeni case-lər gəlir.`
              : "Bu jurnalda başqa icma qalmadı."}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadJson(`fraud-radar-report-${new Date().toISOString().slice(0, 10)}.json`, report)}
              className="flex items-center rounded uppercase"
              style={{ height: 34, padding: "0 14px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
            >
              Hesabatı endir (JSON)
            </button>
            {canRaise && (
              <button
                onClick={onRaiseSensitivity}
                className="flex items-center rounded uppercase"
                style={{ height: 34, padding: "0 14px", border: "1px solid #5c3a17", color: "#e0913f", background: "#1a1509", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
              >
                Həssaslığı artır → yeni case-lər
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center rounded uppercase"
              style={{ height: 34, padding: "0 14px", border: "1px solid #313640", color: "#9aa0a8", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
