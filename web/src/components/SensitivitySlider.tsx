import { sensitivityToThreshold } from "../lib/colors";

interface Props {
  value: number; // 0..1
  onChange: (value: number) => void;
  flaggedCount: number;
  totalCount: number;
  flaggedAccounts: number;
}

export function SensitivitySlider({ value, onChange, flaggedCount, totalCount, flaggedAccounts }: Props) {
  const pct = Math.round(value * 100);
  const thr = sensitivityToThreshold(value);
  return (
    <div style={{ width: 296, maxWidth: "100%", border: "1px solid #24282f", background: "#0d0f12", borderRadius: 3, padding: "11px 12px" }}>
      <div className="flex items-baseline justify-between">
        <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#676d76" }}>
          Aşkarlama həssaslığı
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, fontWeight: 600, color: "#e8e6e1" }}>{pct}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full cursor-pointer"
        style={{ margin: "10px 0 2px", height: 3 }}
      />
      <div className="flex justify-between uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".13em", color: "#4b5058" }}>
        <span>Sərt</span>
        <span>Baza</span>
        <span>Geniş</span>
      </div>
      <div className="mt-1" style={{ fontSize: 11, color: "#676d76", lineHeight: 1.4 }}>
        Solda az, əmin halqa bayraqlanır. Sağda çox, gurultulu halqa bayraqlanır.
      </div>
      <div className="mt-2.5 border-t pt-2" style={{ borderColor: "#1d2127", fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#9aa0a8", lineHeight: 1.5 }}>
        {flaggedCount} / {totalCount} halqa bayraqlanır · {flaggedAccounts} hesab · hədd risk ≥ {thr.toFixed(2)}
      </div>
    </div>
  );
}
