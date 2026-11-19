// The founder-built product's spend rule, simplified: one plan, billed node by node under a
// ceiling, one re-plan allowed (drop the most expensive remaining node), then block.
export type PlanNode = { name: string; cost: number };
export type BilledRow = { name: string; cost: number; total: number; status: 'billed' | 'blocked' };
export type RunResult = { rows: BilledRow[]; replanned: boolean };

const EPS = 1e-9;

export function planRun(ceiling: number, nodes: PlanNode[]): RunResult {
  const queue = [...nodes];
  const rows: BilledRow[] = [];
  let total = 0;
  let replanned = false;
  while (queue.length) {
    const node = queue[0];
    if (total + node.cost <= ceiling + EPS) {
      total += node.cost;
      rows.push({ ...node, total, status: 'billed' });
      queue.shift();
      continue;
    }
    if (!replanned) {
      replanned = true;
      const worst = queue.reduce((w, x, i) => (x.cost > queue[w].cost ? i : w), 0);
      queue.splice(worst, 1);
      continue;
    }
    rows.push({ ...node, total: total + node.cost, status: 'blocked' });
    break;
  }
  return { rows, replanned };
}
