import type { ReactNode } from "react";
import { RISK_ELEVATED, RISK_HIGH, RISK_LOW } from "../lib/colors";

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5" style={{ marginTop: 7 }}>
      {children}
    </div>
  );
}

export function Legend() {
  return (
    <div style={{ width: 238, maxWidth: "100%", border: "1px solid #24282f", background: "#0d0f12", borderRadius: 3, padding: "11px 12px" }}>
      <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 10, letterSpacing: ".16em", color: "#676d76" }}>
        Bu qrafı necə oxumaq olar
      </div>
      <div className="mt-2 flex flex-col">
        <Row>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: RISK_HIGH, flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>
            Yüksək risk — <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#9aa0a8" }}>0.75–1.00</span>
          </span>
        </Row>
        <Row>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: RISK_ELEVATED, flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>
            Yüksəldilmiş — <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#9aa0a8" }}>0.50–0.74</span>
          </span>
        </Row>
        <Row>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: RISK_LOW, flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>
            Aşağı — <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#9aa0a8" }}>0.50-dən az</span>
          </span>
        </Row>
        <Row>
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#2b2f36", border: "2px solid #e8e6e1", flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>Cash-out hub (dəyər burada toplanır)</span>
        </Row>
        <Row>
          <span style={{ width: 13, height: 2, background: "#b0473f", flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>Bayraqlanmış (payment_flagged) köçürmə</span>
        </Row>
        <Row>
          <span style={{ width: 13, height: 1, background: "#3a4048", flex: "0 0 auto" }} />
          <span style={{ fontSize: 11.5, color: "#c3c7cc" }}>Adi köçürmə</span>
        </Row>
      </div>
      <div className="mt-2 border-t pt-2" style={{ borderColor: "#1d2127", fontSize: 11, color: "#676d76", lineHeight: 1.45 }}>
        Dairənin ölçüsü = hesabdan keçən dəyər.
      </div>
    </div>
  );
}
