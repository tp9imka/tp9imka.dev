// Simulation of the inbox agent's policy: instructions inside a message are content, never commands.
export type InboxDecision = { decision: 'denied' | 'data'; rule: string; tool: string; log: string };

const PATTERNS: { re: RegExp; tool: string }[] = [
  { re: /\b(ignore|disregard|forget)\b.*\b(instruction|rule|prompt|previous)/i, tool: 'policy_override' },
  { re: /\b(forward|send|email|post|share)\b.*\b(file|files|email|emails|message|messages|password|token|key|everything|all)\b/i, tool: 'send_message' },
  { re: /\b(run|execute|exec)\b|\brm\s+-|\bsudo\b|\bcurl\b/i, tool: 'shell' },
  { re: /\b(delete|remove|wipe|drop)\b.*\b(repo|branch|database|table|files?|messages?)\b/i, tool: 'shell' },
  { re: /\b(read|open|cat|print)\b.*\b(\.env|secret|token|key|config|credentials?)\b/i, tool: 'read_file' },
];

export function classifyInboxInput(text: string): InboxDecision {
  const hit = PATTERNS.find((p) => p.re.test(text));
  if (!hit) {
    return { decision: 'data', rule: 'plain message', tool: 'none', log: 'guard: data rule="plain message" tool=none => summarise and route' };
  }
  const rule = 'message text is data';
  return { decision: 'denied', rule, tool: hit.tool, log: `guard: denied rule="${rule}" tool=${hit.tool} => not executed, logged` };
}
