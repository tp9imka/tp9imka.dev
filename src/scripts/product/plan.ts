// Price the whole plan before anything runs. Over the ceiling: one re-plan drops the most
// expensive optional node; still over: blocked before any spend.
export type PlanNode = { id: string; cost: number; optional: boolean };
export type Priced = { projected: number; dropped: string | null; after: number; blocked: boolean };

const EPS = 1e-9;

export function pricePlan(nodes: PlanNode[], ceiling: number): Priced {
  const projected = nodes.reduce((s, n) => s + n.cost, 0);
  if (projected <= ceiling + EPS) return { projected, dropped: null, after: projected, blocked: false };
  const optional = nodes.filter((n) => n.optional).sort((a, b) => b.cost - a.cost)[0];
  const after = optional ? projected - optional.cost : projected;
  return { projected, dropped: optional?.id ?? null, after, blocked: after > ceiling + EPS };
}
