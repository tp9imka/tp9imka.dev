// Counts every gate the visitor trips across the page ("gates held N").
export type Counter = { hold: (source: string) => void; count: () => number; subscribe: (fn: (n: number) => void) => void };

export function createCounter(): Counter {
  let n = 0;
  const subs: ((n: number) => void)[] = [];
  return {
    hold: () => { n++; subs.forEach((f) => f(n)); },
    count: () => n,
    subscribe: (fn) => { subs.push(fn); fn(n); },
  };
}

// One page-wide counter shared by every island.
const KEY = '__tp9imkaGates';
export function pageCounter(): Counter {
  const w = window as unknown as Record<string, Counter>;
  if (!w[KEY]) w[KEY] = createCounter();
  return w[KEY];
}
