import { describe, expect, it } from 'vitest';
import { applyAttempt, freshPR } from '../src/scripts/hero/engine';

const seq = (...shas: string[]) => { let i = 0; return () => shas[i++] ?? 'ffffff'; };
const last = <T>(xs: T[]) => xs[xs.length - 1];

describe('freshPR', () => {
  it('starts approved, green and open on the given head', () => {
    const s = freshPR('a3f9c1');
    expect(s.head).toBe('a3f9c1');
    expect(s.review).toEqual({ sha: 'a3f9c1', state: 'pass' });
    expect(s.qa).toEqual({ sha: 'a3f9c1', state: 'pass' });
    expect(s.gate).toBe('open');
    expect(s.merged).toBe(0);
  });
});

describe('applyAttempt', () => {
  it('push after approval voids both verdicts and refuses', () => {
    const f = last(applyAttempt(freshPR('a3f9c1'), 'push', seq('7be204')));
    expect(f.head).toBe('7be204');
    expect(f.review.state).toBe('void');
    expect(f.qa.state).toBe('void');
    expect(f.gate).toBe('refused');
    expect(f.refusal).toContain('a3f9c1');
    expect(f.refusal).toContain('7be204');
  });
  it('skip QA leaves no QA receipt and refuses', () => {
    const f = last(applyAttempt(freshPR('a3f9c1'), 'skip-qa', seq()));
    expect(f.qa.state).toBe('none');
    expect(f.gate).toBe('refused');
  });
  it('editing the guard fails closed', () => {
    const f = last(applyAttempt(freshPR('a3f9c1'), 'edit-guard', seq()));
    expect(f.guard).toBe('unreadable');
    expect(f.gate).toBe('refused');
    expect(f.refusal).toContain('fail closed');
  });
  it('retry until green goes red on three heads, then the driver parks it', () => {
    const frames = applyAttempt(freshPR('a3f9c1'), 'retry', seq('111111', '222222', '333333'));
    expect(frames.map((f) => f.ciRed)).toEqual([1, 2, 3, 3]);
    expect(frames.slice(0, 3).map((f) => f.head)).toEqual(['111111', '222222', '333333']);
    expect(last(frames).gate).toBe('parked');
  });
  it('counts exactly one attempt per call and never merges', () => {
    let s = freshPR('a3f9c1');
    for (const a of ['push', 'skip-qa', 'edit-guard', 'retry'] as const) {
      const frames = applyAttempt(s, a, seq('aaaaaa', 'bbbbbb', 'cccccc'));
      expect(last(frames).attempts).toBe(s.attempts + 1);
      frames.forEach((f) => expect(f.merged).toBe(0));
      s = { ...freshPR('a3f9c1'), attempts: last(frames).attempts };
    }
    expect(s.attempts).toBe(4);
  });
  it('does not mutate the input state', () => {
    const s = freshPR('a3f9c1');
    applyAttempt(s, 'push', seq('7be204'));
    expect(s.head).toBe('a3f9c1');
    expect(s.gate).toBe('open');
  });
});
