import { useEffect, useMemo, useRef, useState } from "react";
import { GraphCanvas } from "./components/GraphCanvas";
import { InvestigationPanel } from "./components/InvestigationPanel";
import { Legend } from "./components/Legend";
import { SensitivitySlider } from "./components/SensitivitySlider";
import { StatsBar } from "./components/StatsBar";
import { UploadPanel } from "./components/UploadPanel";
import { fetchGraph, getCachedSnapshot, isUsingMockData } from "./lib/api";
import { deriveGraph } from "./lib/deriveGraph";
import type { GraphNode, GraphSnapshot } from "./lib/types";

export default function App() {
  const [snapshot, setSnapshot] = useState<GraphSnapshot | null>(null);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
  const [mock, setMock] = useState(false);
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

  // After a decision is submitted, re-render with the mutated ring status
  // without re-fetching/regenerating the whole graph (which would discard
  // node layout and, for the mock world, draw a fresh random scenario).
  function refreshAfterDecision() {
    const current = getCachedSnapshot();
    if (current) setSnapshot({ ...current, rings: [...current.rings] });
  }

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
    () => (snapshot ? deriveGraph(snapshot, sensitivity) : null),
    [snapshot, sensitivity],
  );

  const selectedRing = useMemo(
    () => snapshot?.rings.find((r) => r.id === selectedRingId) ?? null,
    [snapshot, selectedRingId],
  );

  function handleSelectNode(node: GraphNode) {
    if (!node.ringId) {
      setSelectedRingId(null);
      return;
    }
    setSelectedRingId(node.ringId);
  }

  // The graph wrapper (and its ResizeObserver target) must stay mounted
  // across the loading -> loaded transition, or the observer effect (which
  // only runs once) attaches to a ref that's still null.
  return (
    <div className="flex h-screen flex-col bg-[#0b0f14] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Post-Purchase Value Flow — Fraud Radar</h1>
          <p className="text-xs text-slate-500">
            Hesablar arası dəyər axınının canlı qrafı{" "}
            {mock && (
              <span className="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
                demo data (backend hələ bağlı deyil)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <UploadPanel mock={mock} onUploaded={load} />
          <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {snapshot && derived ? (
          <StatsBar stats={snapshot.stats} flaggedRingCount={derived.flaggedRingIds.size} />
        ) : (
          <span className="text-sm text-slate-500">Qraf yüklənir…</span>
        )}
        <Legend />
      </div>

      <div className="flex min-h-0 flex-1">
        <div ref={canvasWrapRef} className="min-w-0 flex-1">
          {size.width > 0 && derived && (
            <GraphCanvas
              nodes={derived.nodes}
              links={derived.links}
              selectedRingId={selectedRingId}
              onSelectNode={handleSelectNode}
              width={size.width}
              height={size.height}
            />
          )}
        </div>

        {selectedRing && derived && (
          <InvestigationPanel
            ring={selectedRing}
            flagged={derived.flaggedRingIds.has(selectedRing.id)}
            onDecided={refreshAfterDecision}
            onClose={() => setSelectedRingId(null)}
          />
        )}
      </div>
    </div>
  );
}
