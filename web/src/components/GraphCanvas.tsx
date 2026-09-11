import { useEffect, useMemo, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { NEUTRAL_FILL, riskColor } from "../lib/colors";
import type { GraphLink, GraphNode } from "../lib/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedRingId: string | null;
  flaggedOnly: boolean;
  /** Non-null => payment-moment view: only these accounts stay lit. */
  paymentVisibleIds: Set<string> | null;
  /** Briefing spotlight: only these accounts stay lit (outermost mask). */
  spotlightIds?: Set<string> | null;
  /** Briefing spotlight: hubs drawn with an orange halo. */
  spotlightHubIds?: Set<string> | null;
  /** Accounts the camera should frame; null returns to the whole graph. */
  focusIds?: Set<string> | null;
  /** Replay: accounts that just made a flagged purchase, drawn with a red pulse. */
  pulseIds?: Set<string> | null;
  /** Replay: keep the whole growing graph in frame as nodes arrive. */
  autoFit?: boolean;
  onSelectNode: (node: GraphNode) => void;
  onHoverNode: (node: GraphNode | null) => void;
  width: number;
  height: number;
}

type FGNode = NodeObject<GraphNode>;

// The force layout swaps link endpoints from ids to node objects once the
// simulation owns them; read the id either way.
function endId(end: unknown): string {
  return typeof end === "object" && end !== null ? String((end as { id: string }).id) : String(end);
}

export function GraphCanvas({
  nodes,
  links,
  selectedRingId,
  flaggedOnly,
  paymentVisibleIds,
  spotlightIds = null,
  spotlightHubIds = null,
  focusIds = null,
  pulseIds = null,
  autoFit = false,
  onSelectNode,
  onHoverNode,
  width,
  height,
}: Props) {
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(undefined);

  // react-force-graph mutates node objects in place to track simulation state
  // (x, y, vx, vy). Moving the sensitivity slider only changes `flagged` on
  // existing accounts, not the account set — so we keep one persistent node
  // object per id and patch its fields in place, instead of building new
  // objects, or the whole layout would re-simulate and jitter on every tick.
  const nodeObjectsRef = useRef(new Map<string, FGNode>());
  const isFirstLoad = nodeObjectsRef.current.size === 0;

  const graphData = useMemo(() => {
    const map = nodeObjectsRef.current;
    const seen = new Set<string>();
    const outNodes = nodes.map((n) => {
      seen.add(n.id);
      const existing = map.get(n.id);
      if (existing) {
        existing.riskScore = n.riskScore;
        existing.ringId = n.ringId;
        existing.flagged = n.flagged;
        existing.isHub = n.isHub;
        existing.label = n.label;
        return existing;
      }
      const created: FGNode = { ...n };
      map.set(n.id, created);
      return created;
    });
    for (const id of map.keys()) if (!seen.has(id)) map.delete(id);
    return { nodes: outNodes, links: links.map((l) => ({ ...l })) };
  }, [nodes, links]);

  // First load: fit early so something is on screen, then fit again once
  // the layout settles — the early fit is taken while nodes are still
  // flying apart and leaves the graph small in a corner.
  const fitOnStopRef = useRef(false);
  useEffect(() => {
    if (!isFirstLoad) return;
    fitOnStopRef.current = true;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 50), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  useEffect(() => {
    if (!autoFit) return;
    fgRef.current?.zoomToFit(350, 140);
  }, [autoFit, graphData]);

  // Camera: opening a case (or a briefing spotlight) frames those accounts,
  // so the ring fills the screen instead of being a smudge in the corner.
  // Clearing the focus eases back out to the whole graph.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || isFirstLoad) return;
    if (!focusIds || focusIds.size === 0) {
      if (!autoFit) fg.zoomToFit(600, 50);
      return;
    }
    const t = setTimeout(() => {
      const pts = graphData.nodes.filter((n) => focusIds.has(n.id) && n.x != null && n.y != null);
      if (pts.length === 0) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of pts) {
        minX = Math.min(minX, n.x!); maxX = Math.max(maxX, n.x!);
        minY = Math.min(minY, n.y!); maxY = Math.max(maxY, n.y!);
      }
      const pad = 90;
      const k = Math.max(0.6, Math.min(5, Math.min(width / (maxX - minX + pad), height / (maxY - minY + pad))));
      fg.centerAt((minX + maxX) / 2, (minY + maxY) / 2, 600);
      fg.zoom(k, 600);
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusIds]);

  function nodeOpacity(node: FGNode): number {
    // Payment-moment view is an outer mask: anything a payment processor
    // never sees drops out first, whatever the other filters say.
    if (paymentVisibleIds && !paymentVisibleIds.has(node.id)) return 0.06;
    if (spotlightIds && !spotlightIds.has(node.id)) return 0.08;
    if (selectedRingId) return node.ringId === selectedRingId ? 1 : 0.13;
    if (flaggedOnly && !node.flagged) return 0.09;
    if (!node.flagged) return 0.55;
    return 1;
  }

  // A link carries flow when it sits inside a flagged ring — and, once a
  // case is open, only inside that case.
  function linkActive(l: GraphLink): boolean {
    if (!l.flagged) return false;
    if (spotlightIds && (!spotlightIds.has(endId(l.source)) || !spotlightIds.has(endId(l.target)))) return false;
    return selectedRingId ? l.ringId === selectedRingId : true;
  }

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="#0a0b0d"
      nodeRelSize={4}
      linkColor={(l) =>
        paymentVisibleIds
          ? "rgba(58,64,72,0.10)"
          : linkActive(l)
            ? "rgba(200,121,46,0.45)"
            : l.paymentFlagged
              ? "rgba(176,71,63,0.55)"
              : selectedRingId
                ? "rgba(58,64,72,0.18)"
                : "rgba(58,64,72,0.5)"
      }
      linkWidth={(l) => Math.min(3, 0.4 + Math.log10(1 + l.valueUsdEstimate) * 0.6)}
      // Value visibly travels along the links of a flagged ring, feeder to
      // hub. Opening a case narrows the flow to that ring alone; the
      // payment-moment mask stops all of it, since nothing "moves" there.
      linkDirectionalParticles={(l) => (paymentVisibleIds ? 0 : linkActive(l) ? (selectedRingId ? 4 : 2) : l.paymentFlagged ? 1 : 0)}
      linkDirectionalParticleSpeed={(l) => (linkActive(l) ? 0.007 : 0.004)}
      linkDirectionalParticleWidth={(l) => (linkActive(l) ? 3 : 2)}
      linkDirectionalParticleColor={(l) => (linkActive(l) ? "#e0913f" : "#b0473f")}
      cooldownTicks={100}
      onEngineStop={() => {
        if (!fitOnStopRef.current || focusIds) return;
        fitOnStopRef.current = false;
        fgRef.current?.zoomToFit(600, 50);
      }}
      onNodeClick={(node) => onSelectNode(node)}
      onNodeHover={(node) => onHoverNode(node as FGNode | null)}
      nodeCanvasObject={(node: FGNode, ctx, globalScale) => {
        const isSelected = node.ringId != null && node.ringId === selectedRingId;
        const r = (node.isHub ? 6.5 : node.ringId ? 5 : 3.5) / Math.sqrt(globalScale) + 2;
        const o = nodeOpacity(node);

        ctx.globalAlpha = o;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = node.flagged ? riskColor(node.riskScore) : NEUTRAL_FILL;
        ctx.fill();

        if (pulseIds?.has(node.id)) {
          // Replay: a flagged purchase just landed here.
          ctx.lineWidth = 1.5 / Math.sqrt(globalScale);
          ctx.strokeStyle = "#d1685f";
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, r + 4 / Math.sqrt(globalScale), 0, 2 * Math.PI);
          ctx.stroke();
          ctx.globalAlpha = o * 0.4;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, r + 9 / Math.sqrt(globalScale), 0, 2 * Math.PI);
          ctx.stroke();
          ctx.globalAlpha = o;
        }

        if (node.isHub) {
          ctx.lineWidth = 2 / Math.sqrt(globalScale);
          ctx.strokeStyle = isSelected || !selectedRingId ? "#e8e6e1" : "#8d9299";
          ctx.stroke();
        }
        if (spotlightHubIds?.has(node.id)) {
          // Briefing halo: two concentric orange rings around the hub so the
          // eye lands on it even on a projector.
          ctx.lineWidth = 1.5 / Math.sqrt(globalScale);
          ctx.strokeStyle = "#e0913f";
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, r + 5 / Math.sqrt(globalScale), 0, 2 * Math.PI);
          ctx.stroke();
          ctx.globalAlpha = o * 0.45;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, r + 11 / Math.sqrt(globalScale), 0, 2 * Math.PI);
          ctx.stroke();
        } else if (isSelected) {
          ctx.lineWidth = 2 / Math.sqrt(globalScale);
          ctx.strokeStyle = "#e8e6e1";
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }}
      nodePointerAreaPaint={(node: FGNode, color, ctx) => {
        const r = (node.isHub ? 6.5 : node.ringId ? 5 : 3.5) + 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
        ctx.fill();
      }}
    />
  );
}
