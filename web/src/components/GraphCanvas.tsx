import { useEffect, useMemo, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { riskColor } from "../lib/colors";
import type { GraphLink, GraphNode } from "../lib/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedRingId: string | null;
  onSelectNode: (node: GraphNode) => void;
  width: number;
  height: number;
}

type FGNode = NodeObject<GraphNode>;

export function GraphCanvas({ nodes, links, selectedRingId, onSelectNode, width, height }: Props) {
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

  useEffect(() => {
    if (!isFirstLoad) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 50), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="#0b0f14"
      nodeRelSize={4}
      linkColor={(l) => (l.paymentFlagged ? "rgba(239,68,68,0.55)" : "rgba(148,163,184,0.18)")}
      linkWidth={(l) => Math.min(3, 0.4 + Math.log10(1 + l.valueUsdEstimate) * 0.6)}
      linkDirectionalParticles={(l) => (l.paymentFlagged ? 2 : 0)}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleColor={() => "#ef4444"}
      cooldownTicks={100}
      onNodeClick={(node) => onSelectNode(node)}
      nodeCanvasObject={(node: FGNode, ctx, globalScale) => {
        const isSelected = node.ringId != null && node.ringId === selectedRingId;
        const r = (node.ringId ? 5.5 : 3.5) / Math.sqrt(globalScale) + 2;

        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = riskColor(node.riskScore);
        ctx.fill();

        if (node.flagged) {
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(239,68,68,0.9)";
          ctx.stroke();
        } else if (isSelected) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
        }
      }}
      nodePointerAreaPaint={(node: FGNode, color, ctx) => {
        const r = (node.ringId ? 5.5 : 3.5) + 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
        ctx.fill();
      }}
    />
  );
}
