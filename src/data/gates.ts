// The "Wall of no": real gates from the crews I run. `src` maps to the private inventory.
export type Gate = {
  gate: string;
  trigger: string;
  action: string;
  tone: 'no' | 'yes' | 'owed';
  src: string;
  published: boolean;
};

export const gates: Gate[] = [
  { gate: 'Review verdict', trigger: 'new commit pushed', action: 'VOID, judge the new head', tone: 'no', src: 'qa-sha', published: true },
  { gate: 'QA verdict', trigger: 'bound to an old SHA', action: 'VOID, no receipt', tone: 'no', src: 'qa-sha', published: true },
  { gate: 'Merge guard', trigger: 'check state unreadable', action: 'FAIL CLOSED', tone: 'no', src: 'sec-merge-guard', published: true },
  { gate: 'Same check red', trigger: '3 heads in a row', action: 'DRIVER PARKS, RE-PLANS', tone: 'no', src: 'crew-sweep', published: true },
  { gate: 'Red CI', trigger: 'new head', action: 'WAKE IMPLEMENTER ONCE', tone: 'no', src: 'crew-sweep', published: true },
  { gate: 'Inbox agent', trigger: 'tool not on allowlist', action: 'DENIED, LOGGED', tone: 'no', src: 'sec-inbox', published: true },
  { gate: 'Inbox agent', trigger: 'send outside a 1-1 chat', action: 'REFUSED, CHECKED TWICE', tone: 'no', src: 'sec-inbox', published: true },
  { gate: 'Bug report', trigger: 'same fingerprint', action: 'MERGED INTO ONE ISSUE', tone: 'no', src: 'qa-sha', published: true },
  { gate: 'Requirement', trigger: 'criteria hash drifted', action: 'RE-SCORED OVERNIGHT', tone: 'no', src: 'decide-rescore', published: true },
  { gate: 'Product question', trigger: 'inside scope', action: 'DECIDED FOR IVAN - UNDO', tone: 'yes', src: 'decide-proxy', published: true },
  { gate: 'Scope change', trigger: 'new commitment', action: 'WAKES IVAN', tone: 'yes', src: 'decide-proxy', published: true },
  { gate: 'Crew cost', trigger: 'per ticket', action: 'NOT MEASURED YET', tone: 'owed', src: 'owed-metrics', published: true },
];
