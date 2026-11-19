import { applyAttempt, freshPR, type Attempt, type PRState, type Verdict } from './engine';
import { Cursor } from './cursor';

const INTRO_START_MS = 600;
const TRAVEL_MS = 800;
const FRAME_MS = 700;
const IDLE_AUTOPLAY_MS = 7000;
// The intro shows push and edit-guard; idle autoplay continues with the other two first.
const AUTOPLAY: Attempt[] = ['skip-qa', 'retry', 'push', 'edit-guard'];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sha = () => Math.random().toString(16).slice(2, 8).padEnd(6, '0');

class Timers {
  private ids: number[] = [];
  later(ms: number, fn: () => void): void { this.ids.push(window.setTimeout(fn, reduce ? 0 : ms)); }
  cancel(): void { this.ids.forEach((id) => window.clearTimeout(id)); this.ids = []; }
}

export function initHero(): void {
  const stage = document.getElementById('hero');
  if (!stage) return;
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const el = {
    head: $('pr-head'), ci: $('chip-ci'), review: $('chip-review'), qa: $('chip-qa'), guard: $('guard'),
    merge: $('merge'), refusal: $('refusal'), attempts: $('attempts'), card: $('pr-card'), h1: $('hero-h1'),
    play: $('hero-play'), ticker: $('hero-ticker'),
  };
  const targets: Record<Attempt, HTMLElement> = { push: $('pr-headwrap'), 'skip-qa': el.qa, 'edit-guard': el.guard, retry: el.ci };
  const actions: Record<Attempt, string> = {
    push: 'pushing after approval', 'skip-qa': 'deleting the QA verdict', 'edit-guard': 'editing the merge guard', retry: 're-running until green',
  };

  const rogue = new Cursor(stage, 'rogue agent (you)', '--yellow');
  const reviewer = new Cursor(stage, 'Reviewer', '--fg');
  const qa = new Cursor(stage, 'QA', '--green');
  const driver = new Cursor(stage, 'Driver', '--red');
  const timers = new Timers();
  let state = freshPR('a3f9c1');
  let idle = 0;
  let next = 0;

  const verdictText = (kind: string, v: Verdict) =>
    v.state === 'none' ? `${kind}: none for head` : `${kind} PASS @${v.sha}`;

  function render(s: PRState): void {
    el.head.textContent = s.head;
    el.ci.className = `chip ${s.ci === 'green' ? 'ok' : 'bad'}`;
    el.ci.textContent = s.ci === 'green' ? 'CI green' : `CI red ${s.ciRed}/3 · same check`;
    el.review.className = `chip ${s.review.state === 'pass' ? 'ok' : s.review.state === 'void' ? 'void' : 'bad'}`;
    el.review.textContent = verdictText('Review', s.review);
    el.qa.className = `chip ${s.qa.state === 'pass' ? 'ok' : s.qa.state === 'void' ? 'void' : 'bad'}`;
    el.qa.textContent = verdictText('QA', s.qa);
    el.guard.className = `guard ${s.guard === 'ok' ? '' : 'bad'}`;
    el.guard.textContent = s.guard === 'ok' ? 'merge guard: all checks green => allow' : 'merge guard: state unreadable => fail closed';
    el.merge.className = `merge ${s.gate === 'open' ? '' : 'shut'}`;
    el.merge.textContent = s.gate === 'open' ? 'MERGE' : s.gate === 'parked' ? 'PARKED' : 'REFUSED';
    el.refusal.textContent = s.refusal;
    el.attempts.textContent = String(s.attempts);
    el.h1.classList.toggle('struck', s.gate !== 'open');
    if (s.gate !== 'open' && !reduce) {
      el.merge.classList.add('flash');
      el.card.classList.add('shake');
      window.setTimeout(() => { el.merge.classList.remove('flash'); el.card.classList.remove('shake'); }, 260);
    }
  }

  function park(withRogue = true): void {
    const w = stage!.clientWidth;
    const h = stage!.clientHeight;
    if (withRogue) rogue.place(w * 0.42, 36);
    reviewer.place(w - 140, h - 70);
    qa.place(w - 230, h - 40);
    driver.place(w * 0.62, h - 30);
  }

  function attempt(a: Attempt, base: PRState): void {
    timers.cancel();
    window.clearTimeout(idle);
    const start = { ...freshPR(sha()), attempts: base.attempts };
    state = start;
    render(start);
    el.ticker.textContent = `sweep ${new Date().toTimeString().slice(0, 5)} · no LLM`;
    park(false);
    driver.label('');
    rogue.moveTo(targets[a], actions[a], 0.5, 0.5);
    const frames = applyAttempt(start, a, sha);
    frames.forEach((f, i) => {
      timers.later(TRAVEL_MS + i * FRAME_MS, () => {
        rogue.press();
        state = f;
        render(f);
        if (f.gate === 'parked') driver.moveTo(el.merge, 'parked · re-plan', 0.7, 0.5);
      });
    });
    timers.later(TRAVEL_MS + frames.length * FRAME_MS + 300, () => {
      reviewer.moveTo(el.refusal, 'waiting for a new head', 0.08, 1.9);
      qa.moveTo(el.refusal, 'verdict bound to the head', 0.08, 3.1);
      rogue.label('your move');
      armIdle();
    });
  }

  function armIdle(): void {
    window.clearTimeout(idle);
    if (reduce) return;
    idle = window.setTimeout(() => attempt(AUTOPLAY[next++ % AUTOPLAY.length], state), IDLE_AUTOPLAY_MS);
  }

  document.querySelectorAll<HTMLButtonElement>('[data-attempt]').forEach((b) => {
    b.addEventListener('click', () => attempt(b.dataset.attempt as Attempt, state));
  });

  state = freshPR('a3f9c1');
  render(state);
  park();
  stage.classList.add('live');
  if (reduce) {
    const frames = applyAttempt(state, 'push', () => '7be204');
    state = frames[frames.length - 1];
    render(state);
    el.play.dataset.on = '1';
    return;
  }
  timers.later(INTRO_START_MS, () => {
    attempt('push', state);
    timers.later(TRAVEL_MS + FRAME_MS + 900, () => {
      attempt('edit-guard', state);
      el.play.dataset.on = '1';
    });
  });
  window.addEventListener('resize', () => park());
}
