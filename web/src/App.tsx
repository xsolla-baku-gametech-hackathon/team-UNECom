import { useEffect, useMemo, useRef, useState } from "react";
import { Briefing } from "./components/Briefing";
import { CaseQueue, type QueueFilter } from "./components/CaseQueue";
import { GraphCanvas } from "./components/GraphCanvas";
import { InvestigationPanel } from "./components/InvestigationPanel";
import { Legend } from "./components/Legend";
import { PaymentMomentCallout } from "./components/PaymentMomentCallout";
import { SensitivitySlider } from "./components/SensitivitySlider";
import { SessionSummary } from "./components/SessionSummary";
import { StatsBar } from "./components/StatsBar";
import { UploadPanel } from "./components/UploadPanel";
import { fetchGraph, getCachedSnapshot, isUsingMockData, prefetchExplanations, resetDemoData, submitDecision, type Decision } from "./lib/api";
import { buildBriefing } from "./lib/briefing";
import { deriveGraph } from "./lib/deriveGraph";
import { computePaymentMomentView } from "./lib/paymentMomentView";
import { riskColor } from "./lib/colors";
import { caseRef } from "./lib/format";
import type { GraphNode, GraphSnapshot } from "./lib/types";

export default function App() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot | null>(null);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [ringSensOverrides, setRingSensOverrides] = useState<Record<string, number>>({});
  const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
  const [armed, setArmed] = useState<Decision | null>(null);
  const [committing, setCommitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<QueueFilter>("open");
  const [query, setQuery] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [paymentMoment, setPaymentMoment] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingIndex, setBriefingIndex] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mock, setMock] = useState(false);
  const [resetState, setResetState] = useState<
    { kind: "idle" | "confirm" | "busy" } | { kind: "done" | "error"; message: string }
  >({ kind: "idle" });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  async function load() {
    const data = await fetchGraph();
    setSnapshot(data);
    setMock(isUsingMockData());
  }

  useEffect(() => {
    load();
  }, []);

  // Clicking the wordmark asks first. The click target is the most prominent
  // thing in the header and the action is unrecoverable, so a stray click
  // during the pitch must not be able to empty the database. Confirming is a
  // second click rather than a native confirm() dialog — an OS dialog on a
  // projector looks like something went wrong.
  function requestReset() {
    if (resetState.kind === "busy") return;
    setResetState({ kind: resetState.kind === "confirm" ? "idle" : "confirm" });
  }

  // Every piece of selection state goes with it — a ring id selected from the
  // old dataset means nothing once community detection re-runs.
  async function confirmReset() {
    if (resetState.kind === "busy") return;
    setResetState({ kind: "busy" });
    try {
      const { events } = await resetDemoData();
      setSelectedRingId(null);
      setArmed(null);
      setRingSensOverrides({});
      setQuery("");
      setDecisionError(null);
      await load();
      setResetState({ kind: "done", message: `Baza boşaldıldı — ${events.toLocaleString("en-US")} hadisə silindi` });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setResetState({
        kind: "error",
        message: raw.includes("403") ? "Sıfırlama bu backend-də bağlıdır (ALLOW_DEMO_RESET)" : `Sıfırlama alınmadı: ${raw}`,
      });
    }
  }

  // The result banner clears itself; so does an unanswered confirmation, so a
  // half-pressed reset never sits armed in the header waiting for a stray click.
  useEffect(() => {
    if (resetState.kind === "idle" || resetState.kind === "busy") return;
    const t = setTimeout(() => setResetState({ kind: "idle" }), resetState.kind === "confirm" ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [resetState]);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const derived = useMemo(
    () => (snapshot ? deriveGraph(snapshot, sensitivity, ringSensOverrides) : null),
    [snapshot, sensitivity, ringSensOverrides],
  );

  useEffect(() => {
    if (snapshot && derived && !mock) prefetchExplanations([...derived.flaggedRingIds]);
  }, [snapshot, derived, mock]);

  const flaggedRings = useMemo(
    () => (snapshot && derived ? snapshot.rings.filter((r) => derived.flaggedRingIds.has(r.id)) : []),
    [snapshot, derived],
  );
  const decidedCount = flaggedRings.filter((r) => r.status !== "pending").length;
  const flaggedAccountCount = flaggedRings.reduce((s, r) => s + r.memberAccountIds.length, 0);

  // What a payment-moment competitor could see in this same dataset.
  const paymentView = useMemo(
    () => (snapshot ? computePaymentMomentView(snapshot, flaggedRings) : null),
    [snapshot, flaggedRings],
  );

  // Guided walkthrough of what was just found, built from the live numbers.
  const briefingSteps = useMemo(
    () => (snapshot && derived && paymentView && snapshot.accounts.length > 0 ? buildBriefing(snapshot, derived, flaggedRings, paymentView, sensitivity) : []),
    [snapshot, derived, flaggedRings, paymentView, sensitivity],
  );
  const briefingStep = briefingOpen ? briefingSteps[Math.min(briefingIndex, briefingSteps.length - 1)] : undefined;

  function openBriefing() {
    select(null);
    setBriefingIndex(0);
    setBriefingOpen(true);
  }

  async function loadAndBrief() {
    await load();
    openBriefing();
  }

  const selectedRing = useMemo(
    () => snapshot?.rings.find((r) => r.id === selectedRingId) ?? null,
    [snapshot, selectedRingId],
  );

  // What the camera frames: a briefing spotlight wins, then the open case.
  const focusIds = useMemo(
    () => briefingStep?.spotlightIds ?? (selectedRing ? new Set(selectedRing.memberAccountIds) : null),
    [briefingStep, selectedRing],
  );

  function select(ringId: string | null) {
    setSelectedRingId(ringId);
    setArmed(null);
    setDecisionError(null);
  }

  function handleSelectNode(node: GraphNode) {
    if (!node.ringId || !derived?.flaggedRingIds.has(node.ringId)) return;
    select(node.ringId);
  }

  function pendingQueue() {
    const q = query.trim().toLowerCase();
    return flaggedRings
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
  }

  async function commitDecision() {
    if (!selectedRingId || !armed || committing) return;
    setCommitting(true);
    setDecisionError(null);
    try {
      await submitDecision(selectedRingId, armed);
      setArmed(null);
      const current = getCachedSnapshot();
      if (current) setSnapshot({ ...current, rings: [...current.rings] });
    } catch {
      setDecisionError("Qərar saxlanmadı. Yenidən cəhd edin.");
    } finally {
      setCommitting(false);
    }
  }

  const openCaseCount = flaggedRings.filter((r) => r.status === "pending").length;

  // The last "Next case" used to do nothing. Now an empty queue ends in the
  // session summary: verdict tally, accounts for the payments team, report.
  function nextCase() {
    const list = pendingQueue().filter((r) => r.status === "pending" && r.id !== selectedRingId);
    if (list[0]) {
      select(list[0].id);
      return;
    }
    select(null);
    setSummaryOpen(true);
  }

  // Global shortcuts: "/" focuses search, Esc backs out of the current
  // layer (arm -> upload -> panel), Enter opens the first case or confirms
  // an armed decision, J/K walk the queue, F/R arm a decision.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("case-search")?.focus();
        return;
      }
      if (briefingOpen) {
        if (e.key === "Escape") setBriefingOpen(false);
        else if (e.key === "ArrowRight" || e.key === " ") setBriefingIndex((i) => Math.min(briefingSteps.length - 1, i + 1));
        else if (e.key === "ArrowLeft") setBriefingIndex((i) => Math.max(0, i - 1));
        else return;
        e.preventDefault();
        return;
      }
      if (summaryOpen) {
        if (e.key === "Escape") setSummaryOpen(false);
        return;
      }
      if (e.key === "Escape") {
        if (resetState.kind === "confirm") setResetState({ kind: "idle" });
        else if (armed) setArmed(null);
        else if (uploadOpen) setUploadOpen(false);
        else select(null);
        return;
      }
      if (e.key === "Enter") {
        if (armed) commitDecision();
        else if (!selectedRingId) select(pendingQueue()[0]?.id ?? null);
        return;
      }
      const q = pendingQueue();
      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        const i = q.findIndex((r) => r.id === selectedRingId);
        const ni = e.key === "j" ? Math.min(q.length - 1, i + 1) : Math.max(0, i - 1);
        if (q[ni]) select(q[ni].id);
        return;
      }
      if (selectedRingId && (e.key === "f" || e.key === "r")) setArmed(e.key === "f" ? "fraud" : "real");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, committing, uploadOpen, selectedRingId, filter, query, flaggedRings, resetState, briefingOpen, briefingSteps.length, summaryOpen]);

  const hoverRing = hoveredNode?.ringId ? snapshot?.rings.find((r) => r.id === hoveredNode.ringId) : null;
  const isEmpty = !mock && !!snapshot && snapshot.accounts.length === 0;

  return (
    <div className="flex h-screen flex-col" style={{ background: "#0a0b0d", color: "#e8e6e1", fontFamily: "'IBM Plex Sans'", fontSize: 13 }}>
      <header className="flex items-center gap-4 border-b px-3.5" style={{ flex: "0 0 52px", borderColor: "#24282f", background: "#0d0f12" }}>
        <div className="flex flex-col leading-tight" style={{ flex: "0 0 auto" }}>
          <span
            onClick={requestReset}
            title="Bazanı boşalt — demo açılış vəziyyətinə qayıdır"
            className="uppercase"
            style={{
              fontFamily: "'Barlow Semi Condensed'",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: ".07em",
              cursor: "pointer",
              opacity: resetState.kind === "busy" ? 0.5 : 1,
              userSelect: "none",
            }}
          >
            Fraud Radar
          </span>
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".17em", color: "#676d76" }}>
            Post-purchase dəyər axını
          </span>
        </div>
        <div style={{ width: 1, height: 26, background: "#24282f" }} />

        {resetState.kind === "confirm" && (
          <div
            className="flex items-center gap-2.5"
            style={{ height: 26, padding: "0 10px", borderRadius: 3, border: "1px solid #6d3430", background: "#1c100f", whiteSpace: "nowrap" }}
          >
            <span style={{ fontSize: 11.5, color: "#e8e6e1" }}>
              Bazadakı bütün hadisələr və qərarlar silinsin?
            </span>
            <span
              onClick={confirmReset}
              className="cursor-pointer uppercase"
              style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 11, letterSpacing: ".1em", color: "#d1685f" }}
            >
              Bəli, boşalt
            </span>
            <span
              onClick={() => setResetState({ kind: "idle" })}
              className="cursor-pointer uppercase"
              style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".1em", color: "#9aa0a8" }}
            >
              Ləğv
            </span>
          </div>
        )}

        {resetState.kind === "busy" && (
          <div
            className="flex items-center gap-2"
            style={{ height: 26, padding: "0 10px", borderRadius: 3, border: "1px solid #24282f", background: "#101216", whiteSpace: "nowrap" }}
          >
            <span style={{ width: 10, height: 10, border: "2px solid #24282f", borderTopColor: "#c8792e", borderRadius: "50%", animation: "fr-spin .7s linear infinite" }} />
            <span style={{ fontSize: 11.5, color: "#9aa0a8" }}>Baza boşaldılır…</span>
          </div>
        )}

        {(resetState.kind === "done" || resetState.kind === "error") && (
          <div
            className="flex items-center"
            style={{
              height: 26,
              padding: "0 10px",
              borderRadius: 3,
              border: `1px solid ${resetState.kind === "done" ? "#34503f" : "#6d3430"}`,
              background: resetState.kind === "done" ? "#0f1613" : "#1c100f",
              color: resetState.kind === "done" ? "#8fae9b" : "#d1685f",
              fontSize: 11.5,
              whiteSpace: "nowrap",
            }}
          >
            {resetState.message}
          </div>
        )}

        {mock ? (
          <div className="flex items-center gap-2.5" style={{ height: 26, padding: "0 10px", border: "1px solid #6b4a1f", background: "#1a1509", borderRadius: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8792e", animation: "fr-pulse 2s infinite" }} />
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", color: "#e0913f" }}>DEMO DATA</span>
            <span style={{ fontSize: 11, color: "#9aa0a8" }}>bundled dataset · backend əlçatan deyil</span>
            <span onClick={load} className="cursor-pointer uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 11, letterSpacing: ".09em", color: "#c8792e", borderBottom: "1px solid #6b4a1f" }}>
              Yenidən sına
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5" style={{ height: 26, padding: "0 10px", border: "1px solid #24282f", background: "#101216", borderRadius: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f7a5f" }} />
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", color: "#8fae9b" }}>LIVE BACKEND</span>
            {snapshot && <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#676d76" }}>{snapshot.generatedAt.replace("T", " ").slice(0, 16)} UTC</span>}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2.5" style={{ flex: "0 0 auto" }}>
          <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".16em", color: "#676d76" }}>
            Case-lər
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12 }}>
            {decidedCount}/{flaggedRings.length}
          </span>
          <div style={{ width: 72, height: 4, background: "#1d2127", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#c8792e", width: `${flaggedRings.length ? (decidedCount / flaggedRings.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div style={{ width: 1, height: 26, background: "#24282f" }} />

        {briefingSteps.length > 0 && (
          <div
            onClick={openBriefing}
            className="flex cursor-pointer items-center gap-2 rounded uppercase"
            style={{ height: 28, padding: "0 12px", border: "1px solid #5c3a17", background: briefingOpen ? "#1a1509" : "#0d0f12", color: "#e0913f", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: ".1em" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8792e", animation: "fr-pulse 1.6s infinite" }} />
            AI briefing
          </div>
        )}

        <div
          onClick={() => setUploadOpen(true)}
          className="flex cursor-pointer items-center rounded uppercase"
          style={{ height: 28, padding: "0 12px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: ".1em" }}
        >
          Hadisə jurnalı yüklə
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {derived && (
          <CaseQueue
            rings={flaggedRings}
            selectedRingId={selectedRingId}
            filter={filter}
            onFilterChange={setFilter}
            query={query}
            onQueryChange={setQuery}
            onSelect={select}
            onShowSummary={flaggedRings.length > 0 && openCaseCount === 0 ? () => setSummaryOpen(true) : undefined}
          />
        )}

        <div ref={canvasWrapRef} className="relative flex-1" style={{ minWidth: 0, background: "#0a0b0d" }}>
          {size.width > 0 && derived && (
            <GraphCanvas
              nodes={derived.nodes}
              links={derived.links}
              selectedRingId={selectedRingId}
              flaggedOnly={flaggedOnly}
              paymentVisibleIds={(paymentMoment || briefingStep?.paymentMoment) && paymentView ? paymentView.visibleIds : null}
              spotlightIds={briefingStep?.spotlightIds ?? null}
              spotlightHubIds={briefingStep?.spotlightHubIds ?? null}
              focusIds={focusIds}
              onSelectNode={handleSelectNode}
              onHoverNode={setHoveredNode}
              width={size.width}
              height={size.height}
            />
          )}

          {snapshot && derived && !isEmpty && (
            <div className="absolute flex flex-wrap items-start justify-between gap-3" style={{ left: 16, right: 16, top: 14, zIndex: 30 }}>
              <StatsBar stats={snapshot.stats} flaggedRingCount={flaggedRings.length} decidedCount={decidedCount} />
              <div className="flex flex-col items-end gap-2.5" style={{ minWidth: 0 }}>
                <div className="flex flex-wrap justify-end gap-2">
                  <div
                    onClick={() => setFlaggedOnly((v) => !v)}
                    className="flex cursor-pointer items-center rounded uppercase"
                    style={{
                      height: 26,
                      padding: "0 11px",
                      border: `1px solid ${flaggedOnly ? "#c8792e" : "#24282f"}`,
                      background: flaggedOnly ? "#1a1509" : "#0d0f12",
                      color: flaggedOnly ? "#e0913f" : "#9aa0a8",
                      fontFamily: "'Barlow Semi Condensed'",
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: ".11em",
                    }}
                  >
                    Yalnız bayraqlanmış halqalar
                  </div>
                  <div
                    onClick={() => setPaymentMoment((v) => !v)}
                    className="flex cursor-pointer items-center gap-2 rounded uppercase"
                    style={{
                      height: 26,
                      padding: "0 11px",
                      border: `1px solid ${paymentMoment ? "#c8792e" : "#24282f"}`,
                      background: paymentMoment ? "#1a1509" : "#0d0f12",
                      color: paymentMoment ? "#e0913f" : "#9aa0a8",
                      fontFamily: "'Barlow Semi Condensed'",
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: ".11em",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: paymentMoment ? "#c8792e" : "#3a4048", flex: "0 0 auto" }} />
                    Ödəniş anı görünüşü
                  </div>
                </div>
                {(paymentMoment || briefingStep?.paymentMoment) && paymentView && (
                  <PaymentMomentCallout view={paymentView} flaggedRingCount={flaggedRings.length} />
                )}
              </div>
            </div>
          )}

          {!isEmpty && (
            <div className="absolute flex flex-wrap-reverse items-end justify-between gap-2.5" style={{ left: 16, right: 16, bottom: 16, zIndex: 10 }}>
              <Legend />
              {derived && (
                <SensitivitySlider
                  value={sensitivity}
                  onChange={setSensitivity}
                  flaggedCount={flaggedRings.length}
                  totalCount={snapshot?.rings.length ?? 0}
                  flaggedAccounts={flaggedAccountCount}
                />
              )}
            </div>
          )}

          {hoveredNode && (
            <div
              style={{
                position: "absolute",
                left: (hoveredNode.x ?? 0) + 16,
                top: (hoveredNode.y ?? 0) - 10,
                pointerEvents: "none",
                border: "1px solid #313640",
                background: "#0d0f12",
                borderRadius: 3,
                padding: "9px 11px",
                minWidth: 200,
                zIndex: 20,
              }}
            >
              <div className="flex items-center justify-between gap-3.5">
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, fontWeight: 600 }}>{hoveredNode.id}</span>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9.5, letterSpacing: ".1em", padding: "2px 6px", borderRadius: 2, color: "#9aa0a8", background: "#16191e", border: "1px solid #24282f" }}>
                  {hoveredNode.isHub ? "CASH-OUT HUB" : hoveredNode.ringId ? "HALQA ÜZVÜ" : "ƏLAQƏSİZ"}
                </span>
              </div>
              <div className="mt-1.5 grid gap-y-0.5" style={{ gridTemplateColumns: "auto 1fr", columnGap: 12, fontFamily: "'IBM Plex Mono'", fontSize: 11 }}>
                <span style={{ color: "#676d76" }}>risk</span>
                <span style={{ color: riskColor(hoveredNode.riskScore) }}>{hoveredNode.riskScore.toFixed(2)}</span>
                <span style={{ color: "#676d76" }}>case</span>
                <span style={{ color: "#c3c7cc" }}>{hoverRing ? caseRef(hoverRing.id) : "yoxdur"}</span>
              </div>
            </div>
          )}

          {isEmpty && (
            <div className="absolute inset-0 flex items-center overflow-y-auto" style={{ zIndex: 25, background: "#0a0b0d", padding: "80px 40px 24px" }}>
              <div style={{ width: "100%", maxWidth: 600, minWidth: 0 }}>
                <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 10, letterSpacing: ".2em", color: "#676d76" }}>
                  Data yüklənməyib
                </div>
                <div className="mt-3" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 34, lineHeight: 1.12 }}>
                  Ödəniş bağlandıqdan <span style={{ color: "#c8792e" }}>sonra</span> dəyərin izini sürün.
                </div>
                <div className="mt-3.5" style={{ fontSize: 14, lineHeight: 1.6, color: "#9aa0a8", maxWidth: 520 }}>
                  Bu aləti hesablar arası köçürmə jurnalınıza (ticarət, hədiyyə, bazar satışı, key redemption) yönəldin.
                  Kimin kimə dəyər ötürdüyünü xəritələyir, nağdlaşdırma halqasına bənzəyən klasterləri tapır və hər
                  birini qərar üçün sizə case kimi verir. Heç nə avtomatik bloklanmır.
                </div>
                <div className="mt-6 flex gap-2.5">
                  <div
                    onClick={() => setUploadOpen(true)}
                    className="flex cursor-pointer items-center rounded uppercase"
                    style={{ height: 36, padding: "0 16px", background: "#c8792e", color: "#0a0b0d", fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: ".1em" }}
                  >
                    Hadisə jurnalı yüklə
                  </div>
                </div>
                <div className="mt-7 border-t pt-3.5" style={{ borderColor: "#1d2127", maxWidth: 560 }}>
                  <div className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 600, fontSize: 9.5, letterSpacing: ".16em", color: "#676d76" }}>
                    Qəbul edilən fayl — bu başlıqlı CSV, ya da JSON
                  </div>
                  <div className="mt-2" style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, lineHeight: 1.7, color: "#9aa0a8", wordBreak: "break-all" }}>
                    event_id, type, timestamp, from_account_id, to_account_id, asset_type, asset_id, quantity,
                    value_usd_estimate, payment_flagged, account_created_at
                  </div>
                </div>
              </div>
            </div>
          )}

          {!snapshot && (
            <div className="absolute inset-0 flex items-center" style={{ zIndex: 25, background: "#0a0b0d", padding: "0 40px" }}>
              <div style={{ width: "100%", maxWidth: 520, minWidth: 0 }}>
                <div className="flex items-center gap-2.5">
                  <span style={{ width: 11, height: 11, border: "2px solid #24282f", borderTopColor: "#c8792e", borderRadius: "50%", animation: "fr-spin .7s linear infinite" }} />
                  <span className="uppercase" style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 700, fontSize: 13, letterSpacing: ".16em" }}>
                    Dəyər qrafı qurulur
                  </span>
                </div>
              </div>
            </div>
          )}

          {briefingOpen && briefingSteps.length > 0 && (
            <Briefing
              key={briefingIndex}
              steps={briefingSteps}
              index={Math.min(briefingIndex, briefingSteps.length - 1)}
              onIndexChange={setBriefingIndex}
              onClose={() => setBriefingOpen(false)}
              onAction={(ringId) => {
                setBriefingOpen(false);
                select(ringId);
              }}
            />
          )}

          {summaryOpen && snapshot && (
            <SessionSummary
              snapshot={snapshot}
              flaggedRings={flaggedRings}
              sensitivity={sensitivity}
              onClose={() => setSummaryOpen(false)}
              onRaiseSensitivity={() => {
                setSummaryOpen(false);
                setSensitivity((s) => Math.min(1, Math.round((s + 0.1) * 10) / 10));
              }}
              onOpenRing={(ringId) => {
                setSummaryOpen(false);
                select(ringId);
              }}
            />
          )}

          <UploadPanel open={uploadOpen} mock={mock} onClose={() => setUploadOpen(false)} onUploaded={loadAndBrief} />
        </div>
        {selectedRing && derived && (
          <InvestigationPanel
            ring={selectedRing}
            flagged={derived.flaggedRingIds.has(selectedRing.id)}
            armed={armed}
            committing={committing}
            decisionError={decisionError}
            onArm={setArmed}
            onCommit={commitDecision}
            onClose={() => select(null)}
            onNextCase={nextCase}
            hasNext={flaggedRings.some((r) => r.status === "pending" && r.id !== selectedRing.id)}
            ringSensOverride={ringSensOverrides[selectedRing.id] ?? null}
            globalSensitivity={sensitivity}
            onSetRingSensOverride={(v) =>
              setRingSensOverrides((prev) => {
                const next = { ...prev };
                if (v == null) delete next[selectedRing.id];
                else next[selectedRing.id] = v;
                return next;
              })
            }
          />
        )}
      </div>
    </div>
  );
}
