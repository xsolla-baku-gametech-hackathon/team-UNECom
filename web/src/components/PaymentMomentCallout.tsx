import { usd } from "../lib/format";
import type { PaymentMomentView } from "../lib/paymentMomentView";

interface Props {
  view: PaymentMomentView;
  flaggedRingCount: number;
}

function Stat({ label, value, sub, hot }: { label: string; value: string; sub: string; hot?: boolean }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, padding: "8px 11px", background: hot ? "#181009" : "#101216", border: `1px solid ${hot ? "#5c3a17" : "#1d2127"}`, borderRadius: 3 }}>
      <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: hot ? "#a97236" : "#676d76" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 600, marginTop: 2, color: hot ? "#e0913f" : "#9aa0a8" }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "#4b5058", marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export function PaymentMomentCallout({ view, flaggedRingCount }: Props) {
  return (
    <div style={{ width: 342, maxWidth: "100%", border: "1px solid #5c3a17", background: "#0d0f12", borderRadius: 3, padding: "11px 12px" }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#c8792e" }}>
          Ödəniş anı aləti nə görür
        </span>
        <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".13em", color: "#4b5058" }}>
          {flaggedRingCount} halqa
        </span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <Stat label="Görür" value={String(view.visibleCount)} sub="bayraqlanmış kart" />
        <Stat label="Görmür" value={String(view.missedCount)} sub="halqa üzvü" hot />
      </div>

      {view.missedCount > 0 ? (
        <div className="mt-2.5" style={{ fontSize: 12, lineHeight: 1.55, color: "#c3c7cc" }}>
          Ödəniş anı aləti <span style={{ fontFamily: "'IBM Plex Mono'", color: "#e8e6e1" }}>{view.visibleCount}</span> hesab
          görür. <span style={{ fontFamily: "'IBM Plex Mono'", color: "#e0913f" }}>{view.missedCount}</span> hesabı görmür —
          bunların əlində <span style={{ fontFamily: "'IBM Plex Mono'", color: "#e0913f" }}>{usd(view.missedValueUsd)}</span> dəyər
          var, o cümlədən heç vaxt bayraqlanmış karta toxunmamış{" "}
          <span style={{ fontFamily: "'IBM Plex Mono'", color: "#e0913f" }}>{view.missedHubCount}</span> cash-out hub
          {view.hubCount > 0 && <span style={{ color: "#676d76" }}> ({view.hubCount} hub-dan)</span>}.
        </div>
      ) : (
        <div className="mt-2.5" style={{ fontSize: 12, lineHeight: 1.55, color: "#9aa0a8" }}>
          Bu həssaslıqda bayraqlanmış halqanın hər üzvü ödəniş anında da görünür — bu datada gizli qol yoxdur.
        </div>
      )}

      {view.missedHubIds.length > 0 && (
        <div className="mt-2.5 border-t pt-2" style={{ borderColor: "#1d2127" }}>
          <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".14em", color: "#676d76" }}>
            Gözdən qaçan hub
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {view.missedHubIds.slice(0, 8).map((id) => (
              <span
                key={id}
                style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, padding: "2px 6px", borderRadius: 2, color: "#e0913f", background: "#181009", border: "1px solid #5c3a17" }}
              >
                {id}
              </span>
            ))}
            {view.missedHubIds.length > 8 && (
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, padding: "2px 4px", color: "#676d76" }}>
                +{view.missedHubIds.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-2.5 border-t pt-2" style={{ borderColor: "#1d2127", fontSize: 11, color: "#676d76", lineHeight: 1.45 }}>
        Solğun düyünlər ödəniş prosessorunun heç vaxt görmədiyi hesablardır. Toggle-ı söndürüb tam dəyər axınına qayıdın.
      </div>
    </div>
  );
}
