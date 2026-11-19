import { pricePlan, type PlanNode } from './plan';
import { pageCounter } from '../gates-counter';

type GNode = PlanNode & { k: string; n: string; p: string; x: number; y: number; w: number; h: number; g?: SVGGElement; pt?: SVGTextElement; price?: SVGTextElement; prog?: SVGRectElement; strike?: SVGLineElement; dropped?: boolean };
type GEdge = { from: string; to: string; p: SVGPathElement; len: number };

const NS = 'http://www.w3.org/2000/svg';
const COL = ['#5B8CFF', '#B07CFF', '#FF6A3D', '#FFD400', '#25E08A', '#F4F1EA'];
const PAUSE_AFTER_RUN_MS = 2600;
const STAMP_MS = 1700;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? 0 : ms));

export function initPipeline(root: HTMLElement): void {
  const svg = root.querySelector('svg') as SVGSVGElement;
  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const spendEl = $<HTMLElement>('[data-spend]'), capEl = $<HTMLElement>('[data-cap]'), ceil = $<HTMLInputElement>('[data-ceil]');
  const toast = $<HTMLElement>('[data-toast]'), force = $<HTMLButtonElement>('[data-force]'), stamp = $<HTMLElement>('[data-stamp]');
  const frames = $<HTMLElement>('[data-frames]'), film = $<HTMLElement>('[data-film]'), wave = $<HTMLElement>('[data-wave]'), pbar = $<HTMLElement>('[data-pbar]');
  const counter = pageCounter();
  const mk = <T extends SVGElement>(t: string, a: Record<string, string | number>, p: Element = svg) => { const e = document.createElementNS(NS, t) as T; for (const k in a) e.setAttribute(k, String(a[k])); p.appendChild(e); return e; };

  const N: GNode[] = [
    { id: 'brief', k: 'INPUT', n: 'Brief', p: 'text', x: 10, y: 182, w: 120, h: 76, cost: 0, optional: false },
    { id: 'script', k: 'LLM', n: 'Script', p: 'openrouter', x: 165, y: 182, w: 140, h: 76, cost: 0.03, optional: false },
    { id: 'board', k: 'IMAGE x6', n: 'Storyboard', p: 'fal', x: 345, y: 40, w: 160, h: 90, cost: 0.24, optional: false },
    { id: 'shots', k: 'VIDEO x3', n: 'Shots', p: 'replicate', x: 545, y: 40, w: 150, h: 90, cost: 0.66, optional: false },
    { id: 'up', k: 'VIDEO', n: 'Upscale 4k', p: 'fal', x: 735, y: 40, w: 150, h: 90, cost: 0.42, optional: true },
    { id: 'voice', k: 'AUDIO · TTS', n: 'Voice-over', p: 'elevenlabs', x: 345, y: 320, w: 160, h: 80, cost: 0.06, optional: false },
    { id: 'compose', k: 'COMPOSE', n: 'Timeline', p: 'render worker', x: 655, y: 300, w: 160, h: 90, cost: 0.04, optional: false },
  ];
  const by: Record<string, GNode> = {}; N.forEach((n) => { by[n.id] = n; });
  const gE = mk<SVGGElement>('g', {}), gN = mk<SVGGElement>('g', {}), gP = mk<SVGGElement>('g', {});
  const edges: GEdge[] = [['brief', 'script'], ['script', 'board'], ['script', 'voice'], ['board', 'shots'], ['shots', 'up'], ['up', 'compose'], ['shots', 'compose'], ['voice', 'compose']].map(([f, t]) => {
    const a = by[f], b = by[t];
    let d: string;
    if (f === 'up' || (f === 'shots' && t === 'compose')) {
      const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + (f === 'up' ? b.w * 0.75 : b.w * 0.25), y2 = b.y;
      d = `M${x1},${y1} C${x1},${y1 + 80} ${x2},${y2 - 80} ${x2},${y2}`;
    } else {
      const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, mx = (x1 + x2) / 2;
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    }
    const p = mk<SVGPathElement>('path', { d, class: 'edge' }, gE); const len = p.getTotalLength();
    p.style.strokeDasharray = String(len); p.style.strokeDashoffset = '0';
    return { from: f, to: t, p, len };
  });
  for (const n of N) {
    const g = mk<SVGGElement>('g', { class: 'nd', transform: `translate(${n.x},${n.y})` }, gN);
    mk('rect', { class: 'box', width: n.w, height: n.h, rx: 4 }, g);
    mk('text', { class: 'k', x: 12, y: 20 }, g).textContent = n.k;
    mk('text', { class: 'n', x: 12, y: 42 }, g).textContent = n.n;
    n.pt = mk<SVGTextElement>('text', { class: 'p', x: 12, y: n.h - 12 }, g); n.pt.textContent = n.p;
    n.price = mk<SVGTextElement>('text', { class: 'price', x: n.w - 12, y: 20, 'text-anchor': 'end' }, g);
    n.prog = mk<SVGRectElement>('rect', { x: 0, y: n.h - 3, width: 0, height: 3, class: 'prog' }, g);
    n.strike = mk<SVGLineElement>('line', { class: 'strike', x1: 6, y1: n.h / 2, x2: 6, y2: n.h / 2 }, g);
    n.g = g;
  }
  let parts: { e: GEdge; t: number; c: SVGCircleElement }[] = [];
  const emit = (e: GEdge) => parts.push({ e, t: 0, c: mk<SVGCircleElement>('circle', { r: 4, class: 'pk' }, gP) });
  const frame = () => {
    parts = parts.filter((p) => { p.t += 0.025; if (p.t >= 1) { p.c.remove(); return false; } const pt = p.e.p.getPointAtLength(p.t * p.e.len); p.c.setAttribute('cx', String(pt.x)); p.c.setAttribute('cy', String(pt.y)); return true; });
    requestAnimationFrame(frame);
  };
  for (let i = 0; i < 40; i++) { const b = document.createElement('i'); b.style.height = `${20 + Math.abs(Math.sin(i * 1.3)) * 80}%`; wave.appendChild(b); }

  let running = false, CEIL = Number(ceil.value);
  const money = (v: number, cls = '') => { spendEl.textContent = `$${v.toFixed(2)}`; spendEl.className = `num ${cls}`; };
  const setCls = (n: GNode, c: string) => n.g?.setAttribute('class', `nd ${c}`);
  async function countTo(from: number, to: number, ms: number, cls: string) { for (let s = 1; s <= 16; s++) { money(from + (to - from) * s / 16, cls); await sleep(ms / 16); } }
  function say(t: string) { toast.textContent = t; }
  let stampTimer = 0;
  // Reduced motion shortens animation, never the time a refusal stays readable.
  function refuse(text: string, sub: string) {
    counter.hold('pipeline');
    stamp.innerHTML = `${text}<small>${sub}</small>`; stamp.classList.add('on');
    if (!reduce) { root.classList.add('shake'); setTimeout(() => root.classList.remove('shake'), 300); }
    window.clearTimeout(stampTimer); stampTimer = window.setTimeout(() => stamp.classList.remove('on'), STAMP_MS);
  }
  // The ceiling is policy for a run: a new value is queued and applies to the next plan.
  ceil.addEventListener('input', () => {
    capEl.textContent = `$${Number(ceil.value).toFixed(2)}`;
    if (running) say(`ceiling $${Number(ceil.value).toFixed(2)} => applies to the next plan`);
    else CEIL = Number(ceil.value);
  });
  force.addEventListener('click', () => {
    const total = N.reduce((s, n) => s + n.cost, 0);
    if (total > CEIL) refuse('Over ceiling.', `$${total.toFixed(2)} > $${CEIL.toFixed(2)}. The 4k upscale stays out.`);
    else say(`the 4k upscale fits under $${CEIL.toFixed(2)} => it runs on the next plan`);
  });

  function reset() {
    for (const n of N) { setCls(n, ''); n.price!.textContent = ''; n.prog!.setAttribute('width', '0'); n.strike!.setAttribute('x2', '6'); n.dropped = false; n.pt!.textContent = n.p; }
    edges.forEach((e) => { e.p.style.strokeDashoffset = '0'; e.p.setAttribute('class', 'edge'); });
    Array.from(frames.children).forEach((f, i) => { (f as HTMLElement).className = ''; (f as HTMLElement).style.background = COL[i]; });
    frames.style.opacity = '1'; film.className = 'film'; pbar.style.width = '0'; wave.querySelectorAll('i').forEach((w) => { w.className = ''; }); money(0);
  }
  async function run() {
    running = true; CEIL = Number(ceil.value); reset(); await sleep(500);
    let proj = 0;
    for (const id of ['brief', 'script', 'board', 'voice', 'shots', 'up', 'compose']) {
      const n = by[id]; setCls(n, 'priced'); if (n.cost) { n.price!.textContent = `$${n.cost.toFixed(2)}`; proj += n.cost; money(proj); } await sleep(170);
    }
    const plan = pricePlan(N, CEIL);
    if (plan.dropped) {
      money(plan.projected, 'over'); say(`projection $${plan.projected.toFixed(2)} > ceiling $${CEIL.toFixed(2)}`); await sleep(700);
      const d = by[plan.dropped]; d.dropped = true; setCls(d, 'dropped'); d.strike!.setAttribute('x2', String(d.w - 6)); d.pt!.textContent = 're-plan: dropped';
      edges.filter((e) => e.from === d.id || e.to === d.id).forEach((e) => { e.p.style.strokeDashoffset = String(e.len); });
      await countTo(plan.projected, plan.after, 500, plan.blocked ? 'over' : 'ok');
      say(plan.blocked ? 'still over after the one re-plan => blocked before it spends' : `one re-plan => $${plan.after.toFixed(2)}, under the ceiling`);
      await sleep(900);
      if (plan.blocked) { running = false; await sleep(PAUSE_AFTER_RUN_MS); return; }
    } else { money(plan.projected, 'ok'); say('the plan fits the ceiling'); await sleep(700); }
    say(''); money(0);
    let spent = 0;
    const exec = async (id: string) => {
      const n = by[id]; if (n.dropped) return; setCls(n, 'run');
      edges.filter((e) => e.to === id && !by[e.from].dropped).forEach((e) => e.p.setAttribute('class', 'edge on'));
      const steps = id === 'shots' ? 30 : 16;
      for (let s = 1; s <= steps; s++) {
        n.prog!.setAttribute('width', String(n.w * s / steps));
        if (id === 'board' && s % 3 === 0) (frames.children[s / 3 - 1] as HTMLElement | undefined)?.classList.add('in');
        if (id === 'voice') wave.querySelectorAll('i').forEach((w, k) => { w.className = k / 40 < s / steps ? 'p' : ''; });
        await sleep(id === 'shots' ? 70 : 45);
      }
      spent += n.cost; money(spent); setCls(n, 'priced'); n.pt!.textContent = `${n.p} · billed`;
      edges.filter((e) => e.from === id && !by[e.to].dropped).forEach((e) => { emit(e); setTimeout(() => emit(e), 160); });
      if (id === 'shots') { frames.style.opacity = '.25'; film.className = 'film on'; }
      await sleep(300);
    };
    await exec('brief'); await exec('script');
    await Promise.all([exec('board'), exec('voice')]);
    await exec('shots'); await exec('up'); await exec('compose');
    frames.style.opacity = '0'; money(spent, 'ok');
    for (let p = 0; p <= 100; p += 2) { pbar.style.width = `${p}%`; await sleep(40); }
    running = false; await sleep(PAUSE_AFTER_RUN_MS);
  }
  const start = async () => { requestAnimationFrame(frame); for (;;) await run(); };
  if (reduce) { reset(); money(1.03, 'ok'); film.className = 'film on'; return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); void start(); } }, { threshold: 0.3 });
  io.observe(root);
}
