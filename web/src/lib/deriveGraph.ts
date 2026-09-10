import { sensitivityToThreshold } from "./colors";
import type { GraphLink, GraphNode, GraphSnapshot, Ring } from "./types";

export interface DerivedGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  flaggedRingIds: Set<string>;
  ringById: Map<string, Ring>;
}

export function deriveGraph(snapshot: GraphSnapshot, sensitivity: number): DerivedGraph {
  const threshold = sensitivityToThreshold(sensitivity);
  const ringById = new Map(snapshot.rings.map((r) => [r.id, r]));
  const flaggedRingIds = new Set<string>();

  snapshot.rings.forEach((ring) => {
    let flagged: boolean;
    if (ring.status === "confirmed_fraud") flagged = true;
    else if (ring.status === "confirmed_real") flagged = false;
    else flagged = ring.riskScore >= threshold;
    if (flagged) flaggedRingIds.add(ring.id);
  });

  const nodes: GraphNode[] = snapshot.accounts.map((a) => ({
    id: a.id,
    label: a.label,
    riskScore: a.riskScore,
    ringId: a.ringId,
    flagged: a.ringId ? flaggedRingIds.has(a.ringId) : false,
  }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const links: GraphLink[] = snapshot.events
    .filter((e) => e.from !== "STORE" && nodeIds.has(e.from) && nodeIds.has(e.to))
    .map((e) => ({
      source: e.from,
      target: e.to,
      type: e.type,
      valueUsdEstimate: e.valueUsdEstimate,
      paymentFlagged: e.paymentFlagged,
    }));

  return { nodes, links, flaggedRingIds, ringById };
}
