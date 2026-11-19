import { planRun, type PlanNode } from './sim';

const STEP_MS = 650;
const LOOP_PAUSE_MS = 3200;
const SCENARIOS: { brief: string; ceiling: number; nodes: PlanNode[] }[] = [
  { brief: '30s product teaser, vertical, voice-over', ceiling: 1.2, nodes: [
    { name: 'script / llm', cost: 0.03 }, { name: 'storyboard / image x6', cost: 0.24 },
    { name: 'shots / video x3', cost: 0.66 }, { name: 'upscale / 4k', cost: 0.42 },
    { name: 'voice / tts', cost: 0.06 }, { name: 'compose / render', cost: 0.04 } ] },
  { brief: '15s lesson clip, diagram + narration', ceiling: 0.6, nodes: [
    { name: 'script / llm', cost: 0.02 }, { name: 'diagram / image x3', cost: 0.12 },
    { name: 'voice / tts', cost: 0.05 }, { name: 'compose / render', cost: 0.03 } ] },
];

const usd = (n: number) => `$${n.toFixed(2)}`;

export function initProductSim(): void {
  const root = document.getElementById('psim');
  if (!root) return;
  const brief = root.querySelector('[data-brief]') as HTMLElement;
  const list = root.querySelector('[data-rows]') as HTMLElement;
  const meter = root.querySelector('[data-meter]') as HTMLElement;
  const meterLbl = root.querySelector('[data-meter-label]') as HTMLElement;
  const status = root.querySelector('[data-status]') as HTMLElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let k = 0;
  let timers: number[] = [];

  const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, reduce ? 0 : ms));

  function play(): void {
    timers.forEach(clearTimeout); timers = [];
    const sc = SCENARIOS[k++ % SCENARIOS.length];
    const run = planRun(sc.ceiling, sc.nodes);
    const kept = new Set(run.rows.map((r) => r.name));
    brief.textContent = sc.brief;
    list.innerHTML = '';
    meter.style.width = '0%';
    meterLbl.textContent = `spend ${usd(0)} / ceiling ${usd(sc.ceiling)}`;
    status.textContent = 'planning: one plan, validated and priced before anything runs';
    const lis = sc.nodes.map((n) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="n"></span><span class="c"></span><span class="s">planned</span>`;
      (li.querySelector('.n') as HTMLElement).textContent = n.name;
      (li.querySelector('.c') as HTMLElement).textContent = usd(n.cost);
      list.appendChild(li);
      return { li, n };
    });
    let t = STEP_MS;
    if (run.replanned) {
      later(t, () => {
        lis.filter(({ n }) => !kept.has(n.name)).forEach(({ li }) => { li.classList.add('dropped'); (li.querySelector('.s') as HTMLElement).textContent = 're-plan: dropped'; });
        status.textContent = 'plan crosses the ceiling => one re-plan allowed';
      });
      t += STEP_MS * 1.5;
    }
    run.rows.forEach((row) => {
      later(t, () => {
        const item = lis.find(({ n }) => n.name === row.name);
        if (!item) return;
        item.li.classList.add(row.status);
        (item.li.querySelector('.s') as HTMLElement).textContent = row.status === 'billed' ? `billed, total ${usd(row.total)}` : 'BLOCKED: over ceiling';
        const pct = Math.min(100, (row.status === 'billed' ? row.total : sc.ceiling) / sc.ceiling * 100);
        meter.style.width = `${pct}%`;
        if (row.status === 'billed') meterLbl.textContent = `spend ${usd(row.total)} / ceiling ${usd(sc.ceiling)}`;
      });
      t += STEP_MS;
    });
    later(t, () => { status.textContent = run.rows.some((r) => r.status === 'blocked') ? 'stopped at the ceiling' : 'rendered under the ceiling'; });
    if (!reduce) later(t + LOOP_PAUSE_MS, play);
  }
  play();
}
