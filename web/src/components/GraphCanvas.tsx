import { useEffect, useMemo, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { NEUTRAL_FILL, riskColor } from "../lib/colors";
import type { GraphLink, GraphNode } from "../lib/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedRingId: string | null;
  flaggedOnly: boolean;
  onSelectNode: (node: GraphNode) => void;
  onHoverNode: (node: GraphNode | null) => void;
  width: number;
  height: number;
}

type FGNode = NodeObject<GraphNode>;

export function GraphCanvas({
  nodes,
  links,
  selectedRingId,
  flaggedOnly,
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

  useEffect(() => {
    if (!isFirstLoad) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 50), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  function nodeOpacity(node: FGNode): number {
    if (selectedRingId) return node.ringId === selectedRingId ? 1 : 0.13;
    if (flaggedOnly && !node.flagged) return 0.09;
    if (!node.flagged) return 0.55;
    return 1;
  }

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="#0a0b0d"
      nodeRelSize={4}
      linkColor={(l) => (l.paymentFlagged ? "rgba(176,71,63,0.55)" : "rgba(58,64,72,0.5)")}
      linkWidth={(l) => Math.min(3, 0.4 + Math.log10(1 + l.valueUsdEstimate) * 0.6)}
      linkDirectionalParticles={(l) => (l.paymentFlagged ? 2 : 0)}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleColor={() => "#b0473f"}
      cooldownTicks={100}
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

        if (node.isHub) {
          ctx.lineWidth = 2 / Math.sqrt(globalScale);
          ctx.strokeStyle = isSelected || !selectedRingId ? "#e8e6e1" : "#8d9299";
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
