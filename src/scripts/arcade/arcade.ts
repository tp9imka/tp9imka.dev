// Replay of the farmout arcade dashboard. Task titles are the public demo fixtures from the farmout README.
type Script = { kind: 'CTL' | 'PLY'; who: string; model: string; task: string; project: string; mode: string; tools: string[]; end: 'clear' | 'conflict' | 'lost' };
type Tile = HTMLDivElement & { s: Script; step: number; secs: number; prog: number; f: number; score: number; speed: number; body: string };

const RED = '#FF3B1F', AMBER = '#FFB000';
const STAGES = 24;
const TICK_MS = 600;
const HOF_ROWS = 6;
const CROWN = ['.r.r.r.r.', '.rrrrrrr.'];
const ROBOT = ['..wwwwwww..', '..wkwwwkw..', '..wwwwwww..', '...wwwww...', '.wbbbbbbbw.', 'w.bbbbbbb.w', '..bbbbbbb..', '..ww...ww..', '..ww...ww..'];
const GHOST = ['...ggggg...', '..ggggggg..', '.gggggggggg', '.gkkgggkkgg', '.gkkgggkkgg', '.gggggggggg', '.gggggggggg', '.gg.gg.gg.g'];
const SCRIPTS: Script[] = [
  { kind: 'CTL', who: 'CLAUDE', model: 'claude-opus-5-5', task: 'Offline sync: move conflict handling into the merge step', project: 'notes-app', mode: 'SESSION', tools: ['Read src/sync/merge.ts', 'Grep applyRemote', 'Edit src/sync/merge.ts', 'Bash npm test -- sync'], end: 'clear' },
  { kind: 'PLY', who: 'CODEX', model: 'gpt-5-codex', task: 'Review merge.ts conflict handling for data-loss paths', project: 'notes-app', mode: 'REVIEW · READ', tools: ['Read src/sync/merge.ts', 'Grep lastWriteWins', 'Read test/merge.spec.ts'], end: 'clear' },
  { kind: 'PLY', who: 'KIRO', model: 'default', task: 'List every tenant field name used by the legacy mappers', project: 'payments-api', mode: 'BULK-READ · READ', tools: ['Grep tenant', 'Read src/legacy/mappers/contacts.js', 'Read src/legacy/mappers/billing.js'], end: 'clear' },
  { kind: 'PLY', who: 'CURSOR', model: 'composer-1', task: 'Rename matrixRow to tenantRow across services', project: 'payments-api', mode: 'IMPLEMENT · WRITE', tools: ['Grep matrixRow', 'Edit src/matrix/row.ts', 'Edit src/api/tenants.ts'], end: 'conflict' },
  { kind: 'CTL', who: 'CLAUDE', model: 'claude-sonnet-4-5', task: 'PAY-142: tenant CSV export endpoint', project: 'payments-api', mode: 'SESSION', tools: ['Read src/export/csv.ts', 'Edit src/export/csv.ts', 'Bash npm test -- export'], end: 'clear' },
  { kind: 'PLY', who: 'COPILOT', model: 'gpt-5', task: 'Second opinion on the CSV streaming approach', project: 'payments-api', mode: 'SECOND-OPINION · READ', tools: ['Read src/export/csv.ts', 'Read docs/streaming.md'], end: 'lost' },
  { kind: 'PLY', who: 'CODEX', model: 'gpt-5-codex', task: 'Prototype file watcher debounce', project: 'notes-app', mode: 'IMPLEMENT · WRITE', tools: ['Read src/watch.ts', 'Edit src/watch.ts', 'Bash npm test -- watch'], end: 'clear' },
  { kind: 'PLY', who: 'KIRO', model: 'default', task: 'Survey CRDT libraries for offline sync', project: 'notes-app', mode: 'RESEARCH', tools: ['WebSearch crdt yjs automerge', 'Read notes/crdt.md'], end: 'clear' },
];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function sprite(cv: HTMLCanvasElement, f: number, body: string, crown: boolean, ghost: boolean): void {
  const x = cv.getContext('2d'); if (!x) return;
  x.clearRect(0, 0, cv.width, cv.height);
  const C: Record<string, string> = { w: '#f2f2f2', k: '#141416', b: body, r: RED, g: '#777' };
  const rows = ghost ? GHOST : crown ? CROWN.map((r) => `.${r}.`).concat(ROBOT) : ['', ''].concat(ROBOT);
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]; if (ch === '.') continue;
      const bob = f && !ghost && j >= rows.length - 2 && i < 5 ? -1 : 0;
      x.fillStyle = C[ch]; x.fillRect(i * 6, (j + bob) * 6 + (f && ghost ? 2 : 0), 6, 6);
    }
  });
}

export function initArcade(root: HTMLElement): void {
  const tilesEl = root.querySelector('[data-tiles]') as HTMLElement, hof = root.querySelector('[data-hof]') as HTMLElement;
  const hiEl = root.querySelector('[data-hi]') as HTMLElement, playEl = root.querySelector('[data-play]') as HTMLElement, coinsEl = root.querySelector('[data-coins]') as HTMLElement;
  const slots = Number(root.dataset.slots ?? 6);
  let n = 0, coins = 0.19, prs = 3, hi = 1234567, row = 3;
  const tiles: Tile[] = [];

  function mkTile(): Tile {
    const s = SCRIPTS[n++ % SCRIPTS.length];
    const t = document.createElement('div') as Tile; t.className = 'tile';
    const body = s.kind === 'CTL' ? RED : (s.who === 'KIRO' || s.who === 'CURSOR' ? AMBER : RED);
    t.innerHTML = `<div class="r1"><span class="badge ${s.kind === 'CTL' ? 'ctl">CONTROL' : 'ply">PLAYER'}</span><span class="who">${s.who}</span><span class="score">0000000</span></div>`
      + `<div class="task">${s.task}</div><div class="mid"><div><div class="sub">${s.mode} · ${s.project.toUpperCase()}</div><div class="tool">&gt; ${s.tools[0].split(' ')[0]}</div></div><canvas width="66" height="72"></canvas></div>`
      + `<div class="model"><b>MODEL</b>${s.model}</div><div class="act">${s.tools[0]}</div>`
      + `<div class="sbar${body === AMBER ? ' y' : ''}">${'<i></i>'.repeat(STAGES)}</div><div class="foot"><span class="clk">00:00</span><span class="pbtn">${s.kind === 'CTL' ? 'THINK' : 'PLAY'}</span></div>`
      + '<div class="over"><b>STAGE CLEAR</b><span>READY TO LAND</span></div>';
    Object.assign(t, { s, body, step: 0, secs: 0, prog: 0, f: 0, score: 0, speed: 0.55 + Math.random() * 0.6 });
    sprite(t.querySelector('canvas') as HTMLCanvasElement, 0, body, s.kind === 'CTL', false);
    return t;
  }
  function hofRow(who: string, task: string, status: string, tm: string, bad = false): void {
    row++;
    const li = document.createElement('li');
    li.innerHTML = `<span class="id">${String(row).padStart(2, '0')}</span><span class="w">${who}</span><span class="x"></span><span class="s${bad ? ' bad' : ''}">${status}</span><span class="tm">${tm}</span>`;
    (li.querySelector('.x') as HTMLElement).textContent = task;
    hof.prepend(li); while (hof.children.length > HOF_ROWS) hof.lastElementChild?.remove();
  }
  function fly(t: Tile, then: () => void): void {
    const a = t.getBoundingClientRect(), b = hof.getBoundingClientRect(), f = document.createElement('div'); f.className = 'flyer';
    Object.assign(f.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
    document.body.appendChild(f);
    requestAnimationFrame(() => Object.assign(f.style, { left: `${b.left}px`, top: `${b.top}px`, width: `${Math.min(b.width / 2, 560)}px`, height: '28px', opacity: '.2' }));
    setTimeout(() => { f.remove(); then(); }, reduce ? 0 : 720);
  }
  function finish(t: Tile, idx: number): void {
    const end = t.s.end, over = t.querySelector('.over') as HTMLElement;
    if (end === 'conflict') over.innerHTML = '<b>STAGE CLEAR</b><span class="conflict">CONFLICT</span>';
    if (end === 'lost') { t.classList.add('lost'); sprite(t.querySelector('canvas') as HTMLCanvasElement, 0, t.body, false, true); over.innerHTML = '<b>GAME OVER</b><span class="lost">LOST</span>'; }
    t.classList.add('end');
    const from = t.score, to = t.score + 180000; let k = 0;
    const iv = setInterval(() => { k++; (t.querySelector('.score') as HTMLElement).textContent = String(Math.floor(from + (to - from) * k / 10)).padStart(7, '0'); if (k >= 10) clearInterval(iv); }, 80);
    if (end === 'clear') prs++;
    setTimeout(() => fly(t, () => {
      hofRow(t.s.who, t.s.task, end === 'clear' ? 'LANDED' : end === 'conflict' ? 'CONFLICT' : 'OVER · LOST', (t.querySelector('.clk') as HTMLElement).textContent ?? '', end !== 'clear');
      const nt = mkTile(); tilesEl.replaceChild(nt, t); tiles[idx] = nt;
    }), reduce ? 0 : 1500);
  }
  function tick(): void {
    tiles.forEach((t, idx) => {
      if (t.classList.contains('end')) return;
      t.f++; t.secs += 3; t.prog = Math.min(STAGES, t.prog + t.speed);
      sprite(t.querySelector('canvas') as HTMLCanvasElement, t.f % 2, t.body, t.s.kind === 'CTL', false);
      const at = Math.min(t.s.tools.length - 1, Math.floor(t.prog / STAGES * t.s.tools.length));
      if (at !== t.step) { t.step = at; (t.querySelector('.act') as HTMLElement).textContent = t.s.tools[at]; (t.querySelector('.tool') as HTMLElement).textContent = `> ${t.s.tools[at].split(' ')[0]}`; }
      const on = Math.floor(t.prog); t.querySelectorAll('.sbar i').forEach((b, k) => b.classList.toggle('on', k < on));
      t.score += Math.floor(800 + Math.random() * 1600); (t.querySelector('.score') as HTMLElement).textContent = String(t.score).padStart(7, '0');
      (t.querySelector('.clk') as HTMLElement).textContent = `${String(Math.floor(t.secs / 60)).padStart(2, '0')}:${String(t.secs % 60).padStart(2, '0')}`;
      if (t.prog >= STAGES) finish(t, idx);
    });
    coins += 0.003; hi += 1200;
    coinsEl.textContent = `${coins.toFixed(2)} CR · ${prs} PR`; hiEl.textContent = String(hi).padStart(8, '0');
    playEl.textContent = `${tiles.filter((x) => !x.classList.contains('end')).length}/10`;
  }
  for (let i = 0; i < slots; i++) { const t = mkTile(); tilesEl.appendChild(t); tiles.push(t); }
  hofRow('COPILOT', 'Review migration 0042 for table locks', 'OVER · TIMEOUT', '20:00', true);
  hofRow('CURSOR', 'Extract frontmatter parser into its own module', 'LANDED', '18:22');
  hofRow('KIRO', 'Survey CRDT libraries for offline sync', 'CLEAR', '24:40');
  if (reduce) return;
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); setInterval(tick, TICK_MS); } }, { threshold: 0.3 });
  io.observe(root);
}
