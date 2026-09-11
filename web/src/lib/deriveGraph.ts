import { sensitivityToThreshold } from "./colors";
import type { GraphLink, GraphNode, GraphSnapshot, Ring } from "./types";

export interface DerivedGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  flaggedRingIds: Set<string>;
  ringById: Map<string, Ring>;
}

export function deriveGraph(
  snapshot: GraphSnapshot,
  sensitivity: number,
  ringSensOverrides: Record<string, number> = {},
): DerivedGraph {
  const ringById = new Map(snapshot.rings.map((r) => [r.id, r]));
  const flaggedRingIds = new Set<string>();

  snapshot.rings.forEach((ring) => {
    const threshold = sensitivityToThreshold(ringSensOverrides[ring.id] ?? sensitivity);
    let flagged: boolean;
    if (ring.status === "confirmed_fraud") flagged = true;
    else if (ring.status === "confirmed_real") flagged = false;
    else flagged = ring.riskScore >= threshold;
    if (flagged) flaggedRingIds.add(ring.id);
  });

  const nodes: GraphNode[] = snapshot.accounts.map((a) => {
    const ring = a.ringId ? ringById.get(a.ringId) : undefined;
    return {
      id: a.id,
      label: a.label,
      riskScore: a.riskScore,
      ringId: a.ringId,
      flagged: a.ringId ? flaggedRingIds.has(a.ringId) : false,
      isHub: ring ? ring.hubAccountIds.includes(a.id) : false,
    };
  });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const links: GraphLink[] = snapshot.events
    .filter((e) => e.from !== "STORE" && nodeById.has(e.from) && nodeById.has(e.to))
    .map((e) => {
      const from = nodeById.get(e.from)!;
      const to = nodeById.get(e.to)!;
      const ringId = from.ringId && from.ringId === to.ringId ? from.ringId : null;
      return {
        source: e.from,
        target: e.to,
        type: e.type,
        timestamp: e.timestamp,
        valueUsdEstimate: e.valueUsdEstimate,
        paymentFlagged: e.paymentFlagged,
        ringId,
        flagged: ringId != null && flaggedRingIds.has(ringId),
      };
    });

  return { nodes, links, flaggedRingIds, ringById };
}
