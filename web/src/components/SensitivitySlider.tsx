interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function SensitivitySlider({ value, onChange }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex flex-col gap-1 min-w-[220px]">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Şübhəlilik həssaslığı</span>
        <span className="font-mono text-slate-200">{pct}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-red-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Az bayraq (yalnız aydın fırıldaq)</span>
        <span>Çox bayraq (hər anomaliya)</span>
      </div>
    </div>
  );
}
