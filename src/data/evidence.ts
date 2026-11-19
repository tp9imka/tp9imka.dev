// Every item maps to a row in the private inventory via `src`. Never put source paths here.
export type EvidenceKind = 'proof' | 'shipper' | 'owed' | 'depth' | 'oss';
export type Evidence = {
  id: string;
  src: string;
  label: string;
  value: string;
  counts: string;
  published: boolean;
  kind: EvidenceKind;
  url?: string;
};

export const evidence: Evidence[] = [
  { id: 'proof-sweep', src: 'crew-sweep', kind: 'proof', published: true,
    value: '0', label: 'LLM calls in the PR sweep', counts: 'The scheduler is plain code. Models are spent on judgement, not on polling.' },
  { id: 'proof-driver', src: 'crew-57-86', kind: 'proof', published: true,
    value: '57 of 86', label: 'issues closed by the driver agent', counts: 'Under a delivery-speed bar, Oct 2026.' },
  { id: 'proof-eval', src: 'oss-navindex', kind: 'proof', published: true,
    value: '8.3%', label: 'wrong records, found by a seeded eval', counts: 'Agent-built knowledge base, sample of 60. Public.' },
  { id: 'proof-latency', src: 'perf', kind: 'proof', published: true,
    value: '10s => 200ms', label: 'latency, measured before claiming', counts: 'Production mobile client under load.' },
  { id: 'driver-closed', src: 'crew-57-86', kind: 'shipper', published: true,
    value: '57 of 86', label: 'issues closed by the driver agent',
    counts: 'Closed under a delivery-speed bar. A count of work done, not a success rate.' },
  { id: 'qa-batch', src: 'qa-pr189', kind: 'shipper', published: true,
    value: '11 defects', label: 'QA-confirmed, fixed in one PR',
    counts: '16,522 tests passing on that PR. Each fix carried a verdict bound to its commit.' },
  { id: 'spec-programme', src: 'rust-prog', kind: 'shipper', published: true,
    value: '1,184 tests', label: 'one spec-driven programme',
    counts: '0 failed across 80 test binaries. Driven from 31 plans and 24 ADRs.' },
  { id: 'owed-cost', src: 'owed-metrics', kind: 'owed', published: true,
    value: 'not measured yet', label: 'Cost per merged PR',
    counts: 'The data exists in the forge. Counting starts in December.' },
  { id: 'owed-lead', src: 'owed-metrics', kind: 'owed', published: true,
    value: 'not measured yet', label: 'Time per ticket, review minutes per PR',
    counts: 'Same window. Numbers will land here with their denominators.' },
  { id: 'owed-escapes', src: 'owed-metrics', kind: 'owed', published: true,
    value: 'not measured yet', label: 'Escaped defects after an agent merge',
    counts: 'Needs a full month of production data before it means anything.' },
  { id: 'perf-latency', src: 'perf', kind: 'depth', published: true,
    value: '10s => 200ms', label: 'latency on a hot path', counts: 'Mobile client, measured before and after.' },
  { id: 'perf-memory', src: 'perf', kind: 'depth', published: true,
    value: '3GB => 200MB', label: 'memory under load', counts: 'Same client, same workload.' },
  { id: 'perf-battery', src: 'perf', kind: 'depth', published: true,
    value: '104mA => 18mA', label: 'battery draw in the background', counts: 'Measured on device.' },
  { id: 'oss-farmout', src: 'oss-farmout', kind: 'oss', published: true, url: 'https://github.com/tp9imka/farmout',
    value: 'farmout', label: 'one agent runs other coding-agent CLIs',
    counts: 'Isolated worktrees, stall detection, cross-review, lands the result as a reviewable change.' },
  { id: 'oss-agents', src: 'oss-agents', kind: 'oss', published: true, url: 'https://github.com/tp9imka/agents',
    value: 'agents', label: 'AGENTS.md templates for nine stacks',
    counts: 'Built from 623 sources, 257 assessed by hand. Not yet measured against a no-template baseline.' },
  { id: 'oss-devicelink', src: 'oss-devicelink', kind: 'oss', published: true, url: 'https://github.com/tp9imka/device-link',
    value: 'device-link', label: 'end-to-end encrypted clipboard relay',
    counts: 'HPKE and HKDF checked against the RFC test vectors. 52 contract tests.' },
  { id: 'oss-navindex', src: 'oss-navindex', kind: 'oss', published: true, url: 'https://github.com/tp9imka/navigation-index',
    value: 'navigation-index', label: 'agent-built knowledge base, audited',
    counts: '8.3% wrong or outdated records in a seeded sample of 60. 0 misquotes in about 300 paper digests.' },
  { id: 'oss-skills', src: 'oss-skills', kind: 'oss', published: true, url: 'https://github.com/tp9imka/llm-skills',
    value: 'llm-skills', label: 'skills for coding agents',
    counts: 'Refined from an observation log of real agent failures.' },
  { id: 'oss-leakradar', src: 'oss-leakradar', kind: 'oss', published: true, url: 'https://pub.dev/publishers/tp9imka.dev/packages',
    value: 'flutter-leak-radar', label: 'memory-leak tooling, 7 packages on pub.dev',
    counts: 'Verified publisher tp9imka.dev.' },
  { id: 'oss-mempalace', src: 'oss-mempalace', kind: 'oss', published: true, url: 'https://github.com/MemPalace/mempalace/pull/1852',
    value: 'MemPalace #1852', label: 'upstream fix, merged',
    counts: 'Wing slugs with special characters, in an open-source agent memory system.' },
];

export function publishedEvidence(kind?: EvidenceKind, list: Evidence[] = evidence): Evidence[] {
  return list.filter((e) => e.published && (!kind || e.kind === kind));
}
