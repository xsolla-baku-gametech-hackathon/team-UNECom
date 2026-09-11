import { useEffect, useState } from "react";
import { fetchExplanation, type Decision } from "../lib/api";
import { riskColor, severityText } from "../lib/colors";
import { caseRef, usd } from "../lib/format";
import type { Ring, RingExplanation } from "../lib/types";

interface Props {
  ring: Ring;
  flagged: boolean;
  armed: Decision | null;
  committing: boolean;
  decisionError: string | null;
  onArm: (v: Decision | null) => void;
  onCommit: () => void;
  onClose: () => void;
  onNextCase: () => void;
  /** False when this was the last open case: the button leads to the summary. */
  hasNext: boolean;
  ringSensOverride: number | null; // 0..1
  globalSensitivity: number; // 0..1
  onSetRingSensOverride: (v: number | null) => void;
}

const STATUS_META: Record<Ring["status"], { label: string; c: string }> = {
  confirmed_fraud: { label: "Fırıldaq kimi qeydə alındı", c: "#d1685f" },
  confirmed_real: { label: "Real oyunçu kimi qeydə alındı", c: "#8fae9b" },
  pending: { label: "Gözləyir", c: "#c9ccd1" },
};

export function InvestigationPanel({
  ring,
  flagged,
  armed,
  committing,
  decisionError,
  onArm,
  onCommit,
  onClose,
  onNextCase,
  hasNext,
  ringSensOverride,
  globalSensitivity,
  onSetRingSensOverride,
}: Props) {
  const [explanation, setExplanation] = useState<RingExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [tuningOpen, setTuningOpen] = useState(false);

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

  const decided = ring.status !== "pending";
  const effectiveSens = ringSensOverride ?? globalSensitivity;

  return (
    <div
      className="flex h-full flex-col overflow-y-auto border-l"
      style={{ width: 380, flex: "0 0 380px", minHeight: 0, borderColor: "#24282f", background: "#0a0b0d" }}
    >
      <div className="flex items-start gap-2.5 border-b px-3.5 py-3" style={{ borderColor: "#24282f", background: "#0d0f12" }}>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, letterSpacing: ".06em", color: "#c8792e" }}>
            {caseRef(ring.id)}
          </div>
          <div
            className="mt-1.5"
            style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: "#e8e6e1" }}
          >
            {ring.memberAccountIds.length - ring.hubAccountIds.length} hesab {ring.hubAccountIds.length} cash-out hub-a
            dəyər ötürür
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex shrink-0 items-center justify-center rounded"
          style={{ width: 24, height: 24, border: "1px solid #24282f", color: "#9aa0a8", fontFamily: "'IBM Plex Mono'", fontSize: 12 }}
        >
          ✕
        </button>
      </div>

      <div className="flex border-b" style={{ borderColor: "#1d2127" }}>
        <div className="flex-1 border-r px-3.5 py-3" style={{ borderColor: "#1d2127" }}>
          <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".15em", color: "#676d76" }}>
            Halqa risk skoru
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 600, marginTop: 3, color: riskColor(ring.riskScore) }}>
            {ring.riskScore.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: "#9aa0a8", marginTop: 2 }}>{severityText(ring.riskScore)}</div>
        </div>
        <div className="flex-1 border-r px-3.5 py-3" style={{ borderColor: "#1d2127" }}>
          <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".15em", color: "#676d76" }}>
            Risk altındakı dəyər
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 600, marginTop: 3, color: "#e8e6e1" }}>
            {usd(ring.totalValueUsd)}
          </div>
          <div style={{ fontSize: 11, color: "#9aa0a8", marginTop: 2 }}>{ring.memberAccountIds.length} hesab arasında</div>
        </div>
        <div className="px-3.5 py-3" style={{ flex: "0 0 96px" }}>
          <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".15em", color: "#676d76" }}>
            Status
          </div>
          <div style={{ marginTop: 6, fontFamily: "'IBM Plex Mono'", fontSize: 11, color: STATUS_META[ring.status].c }}>
            {ring.status === "pending" ? "GÖZLƏYİR" : ring.status === "confirmed_fraud" ? "FIRILDAQ" : "REAL"}
          </div>
        </div>
      </div>

      {!flagged && !decided && (
        <div className="mx-3.5 mt-3 rounded px-3 py-2" style={{ background: "#101216", border: "1px solid #24282f", fontSize: 11.5, color: "#9aa0a8" }}>
          Cari həssaslıq səviyyəsində bu halqa bayraqlanmır.
        </div>
      )}

      <div className="border-b px-3.5 py-3" style={{ borderColor: "#1d2127" }}>
        <div className="flex items-center gap-2">
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#e8e6e1" }}>
            Ölçülmüş sübutlar
          </span>
        </div>
        <div className="mt-2.5 flex flex-col">
          {ring.signals.map((s) => (
            <div key={s} className="border-b py-1.5" style={{ borderColor: "#16191e", fontSize: 12, color: "#9aa0a8", lineHeight: 1.4 }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="border-b px-3.5 py-3" style={{ borderColor: "#1d2127", background: "#101216" }}>
        <div className="flex items-center gap-2">
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#c8792e" }}>
            Model interpretasiyası
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "#676d76" }}>{explanation?.source === "ai" ? "Claude tərəfindən yazılıb" : explanation?.source === "template" ? "Şablon izah" : explanation?.source === "demo" ? "Demo izahı" : ""}</span>
        </div>
        {loading ? (
          <div className="mt-2.5">
            <div className="h-2.5" style={{ background: "#1d2127", animation: "fr-shim 1.1s infinite" }} />
            <div className="mt-1.5 h-2.5" style={{ width: "92%", background: "#1d2127", animation: "fr-shim 1.1s infinite .15s" }} />
            <div className="mt-1.5 h-2.5" style={{ width: "64%", background: "#1d2127", animation: "fr-shim 1.1s infinite .3s" }} />
          </div>
        ) : (
          <div className="mt-2.5">
            <div style={{ fontSize: 13, lineHeight: 1.62, color: "#c3c7cc" }}>{explanation?.summary}</div>
            <div className="mt-2.5 border-t pt-2" style={{ borderColor: "#1d2127", fontSize: 12.5, lineHeight: 1.55, color: "#9aa0a8" }}>
              <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".15em", color: "#676d76" }}>
                Tövsiyə
              </span>
              <br />
              {explanation?.recommendedAction}
            </div>
          </div>
        )}
      </div>

      <div className="border-b px-3.5 py-3" style={{ borderColor: "#1d2127" }}>
        <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#e8e6e1" }}>
          Bu halqadakı hesablar
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {ring.memberAccountIds.map((id) => {
            const isHub = ring.hubAccountIds.includes(id);
            return (
              <span
                key={id}
                style={{
                  fontFamily: "'IBM Plex Mono'",
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 2,
                  background: "#101216",
                  color: isHub ? "#e8e6e1" : "#9aa0a8",
                  border: `1px solid ${isHub ? "#8d9299" : "#1d2127"}`,
                }}
              >
                {id}
              </span>
            );
          })}
        </div>
        <div className="mt-2" style={{ fontSize: 11, color: "#676d76" }}>Konturlu id-lər cash-out hub-lardır.</div>
      </div>

      <div className="px-3.5 py-3">
        <div className="flex cursor-pointer items-center justify-between" onClick={() => setTuningOpen((v) => !v)}>
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#9aa0a8" }}>
            Yalnız bu case üçün hədd
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#676d76" }}>
            {ringSensOverride != null ? `override aktiv · ${Math.round(ringSensOverride * 100)}%` : tuningOpen ? "gizlət" : "qlobalı izləyir"}
          </span>
        </div>
        {tuningOpen && (
          <div className="mt-2.5">
            <div style={{ fontSize: 11.5, color: "#676d76", lineHeight: 1.5 }}>
              Qlobal sürüşdürücünü yalnız bu case üçün əvəz edir. Növbədəki digər case-lərə təsir etmir.
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(effectiveSens * 100)}
                onChange={(e) => onSetRingSensOverride(Number(e.target.value) / 100)}
                className="flex-1"
                style={{ height: 3 }}
              />
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, width: 38, textAlign: "right" }}>
                {Math.round(effectiveSens * 100)}%
              </span>
            </div>
            {ringSensOverride != null && (
              <div className="mt-1.5">
                <span
                  onClick={() => onSetRingSensOverride(null)}
                  className="cursor-pointer uppercase"
                  style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10.5, letterSpacing: ".12em", color: "#c8792e" }}
                >
                  Qlobala sıfırla
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto border-t px-3.5 py-3" style={{ borderColor: "#24282f", background: "#0d0f12" }}>
        {decisionError && <div role="alert" className="mb-2" style={{ color: "#d1685f" }}>{decisionError}</div>}
        {!armed && !decided && (
          <div>
            <div style={{ fontSize: 11.5, color: "#676d76", lineHeight: 1.45 }}>
              Qərarınız bu case üçün qeydə alınır. Heç nə avtomatik bloklanmır.
            </div>
            <div className="mt-2.5 flex gap-2">
              <button
                onClick={() => onArm("fraud")}
                className="flex flex-1 items-center justify-center gap-2 rounded uppercase"
                style={{ height: 36, border: "1px solid #6d3430", background: "#180f0e", color: "#d1685f", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
              >
                Fırıldaqdır <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, opacity: 0.7 }}>F</span>
              </button>
              <button
                onClick={() => onArm("real")}
                className="flex flex-1 items-center justify-center gap-2 rounded uppercase"
                style={{ height: 36, border: "1px solid #34503f", background: "#0d1411", color: "#72a184", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em" }}
              >
                Real oyunçudur <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, opacity: 0.7 }}>R</span>
              </button>
            </div>
          </div>
        )}
        {armed && (
          <div
            className="rounded px-3 py-2.5"
            style={{ border: `1px solid ${armed === "fraud" ? "#6d3430" : "#34503f"}`, background: armed === "fraud" ? "#140d0c" : "#0d1411" }}
          >
            <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "#e8e6e1" }}>
              {armed === "fraud"
                ? "Bu case fırıldaq kimi qeyd olunsun? Hesablar aktiv qalır — qərarınız ödəniş komandası üçün qeydə alınır."
                : "Bu case real oyunçu kimi qeyd olunsun? Növbədən çıxır və hesablar şübhədən təmizlənir."}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                disabled={committing}
                onClick={onCommit}
                className="flex items-center rounded uppercase"
                style={{ height: 32, padding: "0 14px", color: "#0a0b0d", background: armed === "fraud" ? "#b0473f" : "#4f7a5f", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: ".11em" }}
              >
                {committing ? "..." : armed === "fraud" ? "Bəli — fırıldaq" : "Bəli — real oyunçu"}
              </button>
              <button
                onClick={() => onArm(null)}
                className="flex items-center rounded uppercase"
                style={{ height: 32, padding: "0 14px", border: "1px solid #313640", color: "#9aa0a8", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12 }}
              >
                Ləğv et
              </button>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: "#676d76" }}>↵ təsdiq · esc ləğv</span>
            </div>
          </div>
        )}
        {decided && !armed && (
          <div className="rounded px-3 py-2.5" style={{ border: `1px solid ${ring.status === "confirmed_fraud" ? "#6d3430" : "#34503f"}`, background: ring.status === "confirmed_fraud" ? "#140d0c" : "#0d1411" }}>
            <div className="flex items-center justify-between gap-2.5">
              <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: ".11em", color: STATUS_META[ring.status].c }}>
                {STATUS_META[ring.status].label}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={onNextCase}
                className="flex items-center rounded uppercase"
                style={{ height: 32, padding: "0 14px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: ".11em" }}
              >
                {hasNext ? "Növbəti case →" : "Yekun hesabat →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
