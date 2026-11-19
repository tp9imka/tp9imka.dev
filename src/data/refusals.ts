// "What the crews refuse": one real denied action per system. `src` maps to the private inventory.
export type Refusal = { action: string; outcome: string; tone: 'no' | 'yes'; slug: string; src: string; published: boolean };

export const refusals: Refusal[] = [
  { action: 'Merge with a stale QA verdict', outcome: 'refused', tone: 'no', slug: 'qa-fix-loop', src: 'qa-sha', published: true },
  { action: 'Inbox agent told to forward my mail', outcome: 'denied, logged', tone: 'no', slug: 'agent-security', src: 'sec-inbox', published: true },
  { action: 'Same check red on 3 heads', outcome: 'parked, re-planned', tone: 'no', slug: 'delivery-crew', src: 'crew-sweep', published: true },
  { action: 'Product question inside scope', outcome: 'decided for Ivan, with undo', tone: 'yes', slug: 'decision-automation', src: 'decide-proxy', published: true },
  { action: 'Rules drifting between six agent runtimes', outcome: 'one AGENTS.md, a shim each', tone: 'yes', slug: 'portable-harness', src: 'harness', published: true },
];
