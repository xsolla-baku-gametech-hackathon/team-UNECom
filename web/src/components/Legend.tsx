export function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(34,197,94)" }} />
        Aşağı risk
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(234,179,8)" }} />
        Orta risk
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(239,68,68)" }} />
        Yüksək risk
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border border-red-500" style={{ background: "transparent" }} />
        Bayraqlanmış halqa
      </div>
    </div>
  );
}
