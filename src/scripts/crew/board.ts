import { hasReceipts, missingReceipt } from './receipts';
import { pageCounter } from '../gates-counter';
import { boardGeometry } from './geometry';

type Card = {
  id: number; lane: number; head: string | null; review: string | null; qa: string | null;
  fail: { sha: string; why: string } | null; busy: boolean; drag: boolean; x: number; y: number; el: HTMLDivElement;
};

const LANES = ['WORK', 'VERIFY', 'MERGED'];
const MERGED_SHOWN = 7;
const QA_FAIL_RATE = 0.3;
const FIXUP_RATE = 0.35;
const AUTO_DEMO_MS = 3500;
const AUTO_DEMO_REPEAT_MS = 25000;
const VERDICT_MS = 1700;
const TITLES = ['export drops long titles', 'session restore loses drafts', 'retry storm on upload', 'tenant CSV export', 'push token rotation', 'offline queue dedupe', 'attachment preview crash', 'login loop on expiry', 'thumbnail cache bust', 'rate limit headers'];
const DIFF = [['- const t = title.slice(0, 64)', '+ const t = clamp(title, LIMIT)'], ['- await upload(f)', '+ await withBackoff(() => upload(f))'], ['- if (token) save(token)', '+ if (token?.valid) rotate(token)'], ['- queue.push(job)', '+ queue.pushOnce(job.key, job)'], ['- cache.put(key, img)', '+ cache.put(key, img, { ttl: DAY })']];
const FAILS = ['2 tests red', 'export.spec: timeout', 'lint: unused import', '1 snapshot changed'];
const PTR = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M1 1 L1 19 L6 14.5 L9.5 22 L12.5 20.8 L9 13.5 L16 13.5 Z" fill="C" stroke="#0B0B0C" stroke-width="1.5" stroke-linejoin="round"/></svg>';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? 0 : ms));
const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const sha = () => Math.random().toString(16).slice(2, 8).padEnd(6, '0');

class Agent {
  el: HTMLDivElement; tag: HTMLSpanElement;
  constructor(board: HTMLElement, public name: string, color: string, public ms: number) {
    this.el = document.createElement('div'); this.el.className = 'cur'; this.el.style.transitionDuration = `${ms}ms`;
    this.el.innerHTML = PTR.replace('C', color) + `<span class="tag" style="background:${color}">${name}</span>`;
    board.appendChild(this.el); this.tag = this.el.querySelector('.tag') as HTMLSpanElement;
  }
  at(x: number, y: number) { this.el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`; }
  say(t: string) { this.tag.textContent = this.name + (t ? ` · ${t}` : ''); }
  press() { this.el.classList.add('press'); setTimeout(() => this.el.classList.remove('press'), 150); }
  async go(c: Card, t?: string) { if (t) this.say(t); this.at(c.x + c.el.offsetWidth - 34, c.y + c.el.offsetHeight - 14); await sleep(this.ms + 60); }
}

export function initCrewBoard(board: HTMLElement, h1: HTMLElement | null): void {
  const counter = pageCounter();
  const lanes: HTMLDivElement[] = [];
  const cards: Card[] = [];
  let nextId = 214, merged = 0, refused = 0, touched = false;
  LANES.forEach((n, i) => { const d = document.createElement('div'); d.className = `lane${i === 2 ? ' merge' : ''}`; d.innerHTML = `<h4>${n}</h4>`; board.appendChild(d); lanes.push(d); });
  const guard = document.createElement('div'); guard.className = 'guard'; board.appendChild(guard);
  const verdict = document.createElement('div'); verdict.className = 'verdict stamp-refused'; board.appendChild(verdict);
  const hud = document.createElement('div'); hud.className = 'hud'; board.appendChild(hud);
  const you = document.createElement('div'); you.className = 'you'; you.textContent = 'you · rogue agent'; board.appendChild(you);
  const live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('aria-live', 'assertive'); board.appendChild(live);
  let verdictTimer = 0;

  const TOP = 52;
  const geo = () => boardGeometry(board.clientWidth);
  const q = (c: Card, s: string) => c.el.querySelector(s) as HTMLElement;

  function place(): void {
    const g = geo();
    board.classList.toggle('narrow', g.narrow);
    lanes.forEach((l, i) => { l.style.left = `${g.cols[i].x}px`; l.style.width = `${g.cols[i].w}px`; });
    lanes[0].querySelector('h4')!.textContent = g.narrow ? 'IN FLIGHT' : LANES[0];
    lanes[1].hidden = g.narrow;
    guard.style.left = `${g.guardX - 3}px`;
    const columns = g.narrow ? [[0, 1], [2]] : [[0], [1], [2]];
    for (const group of columns) {
      let inCol = cards.filter((c) => group.includes(c.lane) && !c.drag).sort((a, b) => a.lane - b.lane);
      if (group.includes(2)) inCol = inCol.slice(-MERGED_SHOWN);
      let y = TOP;
      for (const c of inCol) {
        const col = g.cols[c.lane];
        const w = c.lane === 2 && g.narrow ? col.w - 12 : g.cw;
        c.el.style.width = `${w}px`; c.x = col.x + (col.w - w) / 2; c.y = y;
        c.el.style.transform = `translate(${c.x}px,${c.y}px)`; y += c.el.offsetHeight + (g.narrow ? 8 : 12);
      }
    }
    cards.filter((c) => c.lane === 2).slice(0, -MERGED_SHOWN).forEach((c) => { c.el.remove(); cards.splice(cards.indexOf(c), 1); });
    hud.innerHTML = `<span>merged <b>${merged}</b></span><span class="r">QA held <b>${refused}</b></span><span>LLM calls in the sweep <b>0</b></span>`;
  }
  function stamps(c: Card): void {
    let h = '';
    if (c.review) h += `<span class="stamp ${c.review === c.head ? 'rev' : 'void'}">REVIEW @${c.review}</span>`;
    if (c.qa) h += `<span class="stamp ${c.qa === c.head ? 'pass' : 'void'}">PASS @${c.qa}</span>`;
    if (c.fail) h += `<span class="stamp fail">FAIL @${c.fail.sha} - ${c.fail.why}</span>`;
    q(c, '.stamps').innerHTML = h; place();
  }
  function newCard(): Card {
    const el = document.createElement('div'); el.className = 'card';
    const c: Card = { id: nextId++, lane: 0, head: null, review: null, qa: null, fail: null, busy: false, drag: false, x: 0, y: -160, el };
    el.innerHTML = `<span class="t">#${c.id} ${pick(TITLES)}</span><div class="meta"><span>${pick(['bug', 'feat', 'qa'])}</span><span class="sha">no commits</span></div><div class="diff"></div><div class="bar"><i></i></div><div class="stamps"></div>`;
    board.appendChild(el); cards.push(c);
    const g = geo(); el.style.width = `${g.cw}px`; el.style.transform = `translate(${(g.cols[0].w - g.cw) / 2}px,-160px)`;
    el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Card #${c.id}. Press Enter to try to merge it.`);
    bindDrag(c); requestAnimationFrame(place); return c;
  }
  // Reduced motion shortens animation, never the time a verdict stays readable.
  function showVerdict(text: string, sub: string, ok = false): void {
    verdict.innerHTML = `${text}<small>${sub}</small>`; verdict.className = `verdict stamp-refused on${ok ? ' okv' : ''}`;
    live.textContent = `${text} ${sub}`;
    window.clearTimeout(verdictTimer);
    verdictTimer = window.setTimeout(() => { verdict.className = 'verdict stamp-refused'; }, VERDICT_MS);
  }
  async function tryMerge(c: Card, by: 'crew' | 'visitor' | 'demo'): Promise<boolean> {
    if (hasReceipts(c)) {
      guard.className = 'guard ok'; c.lane = 2; c.el.classList.add('mini'); merged++; place();
      if (by === 'visitor') showVerdict('Merged.', `receipts matched @${c.head}. You played by the rules.`, true);
      setTimeout(() => { guard.className = 'guard'; }, 500); return true;
    }
    guard.className = 'guard slam'; board.classList.add('shake'); h1?.classList.add('struck');
    setTimeout(() => { board.classList.remove('shake'); guard.className = 'guard'; }, 420);
    if (by === 'visitor') counter.hold('crew');
    showVerdict('Refused.', missingReceipt(c));
    return false;
  }

  const drv = new Agent(board, 'Driver', '#FF3B1F', 350);
  const imp = new Agent(board, 'Implementer', '#FFD400', 900);
  const rev = new Agent(board, 'Reviewer', '#B9B5AC', 650);
  const qa = new Agent(board, 'QA', '#25E08A', 700);
  const ghost = new Agent(board, 'you', '#FFD400', 900); ghost.el.classList.add('ghost'); ghost.say('rogue agent');

  const free = (lane: number, test?: (c: Card) => boolean) => cards.find((c) => c.lane === lane && !c.busy && !c.drag && (!test || test(c)));
  const count = (l: number) => cards.filter((c) => c.lane === l).length;
  async function carry(a: Agent, c: Card, lane: number) { c.lane = lane; place(); await sleep(80); await a.go(c); }

  async function driver(): Promise<never> {
    for (;;) {
      if (count(0) < 2 && count(0) + count(1) < 4) { drv.say('picks a ticket'); newCard(); await sleep(500); }
      const m = free(1, hasReceipts);
      if (m) { m.busy = true; await drv.go(m, 'checking receipts'); drv.press(); await tryMerge(m, 'crew'); m.busy = false; drv.say(`merged @${m.head}`); await sleep(700); continue; }
      drv.say('sweep · no LLM'); drv.at(16, board.clientHeight - 70); await sleep(1300);
    }
  }
  async function implementer(): Promise<never> {
    for (;;) {
      const c = free(0); if (!c) { imp.say('idle'); await sleep(500); continue; }
      c.busy = true; await imp.go(c, c.fail ? `fixing: ${c.fail.why}` : `writing #${c.id}`);
      const d = pick(DIFF), box = q(c, '.diff'); box.innerHTML = '';
      for (const line of d) {
        const s = document.createElement('span'); s.className = line[0] === '+' ? 'a' : 'd'; box.appendChild(s); place();
        for (let j = 2; j <= line.length; j += 2) { s.textContent = line.slice(0, j); await sleep(22); }
        s.textContent = line;
      }
      imp.press(); c.head = sha(); c.fail = null; c.el.classList.remove('failed'); q(c, '.sha').textContent = `head @${c.head}`; q(c, '.bar i').style.width = '0';
      stamps(c); imp.say(`pushed @${c.head}`); await sleep(250);
      await carry(imp, c, 1); c.busy = false; await sleep(300);
    }
  }
  async function reviewer(): Promise<never> {
    for (;;) {
      const c = free(1, (k) => !!k.head && k.review !== k.head); if (!c) { rev.say('idle'); await sleep(450); continue; }
      c.busy = true; await rev.go(c, `reading @${c.head}`); await sleep(900);
      if (c.qa === c.head && Math.random() < FIXUP_RATE) { rev.press(); rev.say('asks for a fixup'); c.review = null; c.lane = 0; place(); c.busy = false; await sleep(600); continue; }
      rev.press(); c.review = c.head; stamps(c); c.busy = false; await sleep(350);
    }
  }
  async function qaAgent(): Promise<never> {
    for (;;) {
      const c = free(1, (k) => !!k.head && k.review === k.head && k.qa !== k.head); if (!c) { qa.say('idle'); await sleep(450); continue; }
      c.busy = true; await qa.go(c, `running checks @${c.head}`);
      const bar = q(c, '.bar i'); bar.style.background = 'var(--green)';
      for (let p = 0; p <= 100; p += 4) { bar.style.width = `${p}%`; await sleep(30); }
      qa.say('...'); await sleep(400); qa.press();
      if (Math.random() < QA_FAIL_RATE) {
        bar.style.background = 'var(--red)'; c.fail = { sha: c.head as string, why: pick(FAILS) }; c.el.classList.add('failed'); stamps(c);
        qa.say(`FAIL @${c.head}`); await sleep(700); c.lane = 0; place(); refused++;
      } else { c.qa = c.head; stamps(c); qa.say(`PASS @${c.head}`); }
      c.busy = false; await sleep(400);
    }
  }
  // A ghost "you" shows the point within seconds, for visitors who never drag.
  async function autoDemo(): Promise<void> {
    await sleep(AUTO_DEMO_MS);
    for (;;) {
      if (!touched) {
        const c = cards.find((k) => k.lane < 2 && !k.busy && !k.drag && !hasReceipts(k));
        if (c) {
          c.busy = true; await ghost.go(c, 'cutting a corner'); ghost.press();
          const g = geo(); c.drag = true; c.el.classList.add('dragging');
          const tx = g.guardX + 12, ty = c.y + 30;
          c.el.style.transition = 'transform .9s cubic-bezier(.3,.7,.2,1)'; c.el.style.transform = `translate(${tx}px,${ty}px)`;
          ghost.at(tx + c.el.offsetWidth - 40, ty + c.el.offsetHeight - 14);
          await sleep(950); c.drag = false; c.el.classList.remove('dragging'); c.el.style.transition = '';
          await tryMerge(c, 'demo'); place(); c.busy = false; ghost.say('rogue agent'); ghost.at(Math.max(12, board.clientWidth - 150), board.clientHeight - 40);
        }
      }
      await sleep(AUTO_DEMO_REPEAT_MS);
    }
  }
  function bindDrag(c: Card): void {
    let ox = 0, oy = 0;
    c.el.addEventListener('pointerdown', (e) => {
      if (c.lane === 2 || c.busy) return;
      touched = true; c.drag = true; c.el.classList.add('dragging'); c.el.setPointerCapture(e.pointerId);
      const r = board.getBoundingClientRect(); ox = e.clientX - r.left - c.x; oy = e.clientY - r.top - c.y;
    });
    c.el.addEventListener('pointermove', (e) => {
      if (!c.drag) return;
      const r = board.getBoundingClientRect(); c.x = e.clientX - r.left - ox; c.y = e.clientY - r.top - oy;
      c.el.style.transform = `translate(${c.x}px,${c.y}px)`;
    });
    c.el.addEventListener('pointerup', async (e) => {
      if (!c.drag) return;
      const r = board.getBoundingClientRect(), overMerge = e.clientX - r.left > geo().guardX - 10;
      c.drag = false; c.el.classList.remove('dragging');
      if (overMerge) await tryMerge(c, 'visitor');
      place();
    });
    // A touch drag the browser takes over as a scroll ends here, not in pointerup.
    const cancel = () => { if (!c.drag) return; c.drag = false; c.el.classList.remove('dragging'); place(); };
    c.el.addEventListener('pointercancel', cancel);
    c.el.addEventListener('lostpointercapture', cancel);
    c.el.addEventListener('keydown', async (e) => {
      if ((e.key !== 'Enter' && e.key !== ' ') || c.lane === 2 || c.busy) return;
      e.preventDefault(); touched = true; await tryMerge(c, 'visitor'); place();
    });
  }
  board.addEventListener('pointermove', (e) => { const r = board.getBoundingClientRect(); you.style.transform = `translate(${e.clientX - r.left + 18}px,${e.clientY - r.top + 22}px)`; });
  window.addEventListener('resize', place);
  const W0 = board.clientWidth;
  [drv, imp, rev, qa].forEach((a, i) => { a.at(12 + i * Math.max(70, (W0 - 120) / 4), board.clientHeight - 60 - (i % 2) * 26); a.say('idle'); });
  ghost.at(Math.max(12, W0 - 150), board.clientHeight - 40);
  place();
  if (reduce) { newCard(); newCard(); return; }
  newCard();
  void driver(); void implementer(); void reviewer(); void qaAgent(); void autoDemo();
}
