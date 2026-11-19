import { describe, expect, it } from 'vitest';
import { clampPoint } from '../src/scripts/hero/geometry';
import { planAttempt } from '../src/scripts/hero/engine';

describe('clampPoint', () => {
  it('keeps the cursor and its label inside the stage', () => {
    expect(clampPoint(340, 1200, { w: 360, h: 1177 }, { w: 205, h: 40 })).toEqual({ x: 360 - 205 - 8, y: 1177 - 40 - 8 });
  });
  it('leaves an inside point alone', () => {
    expect(clampPoint(50, 60, { w: 360, h: 800 }, { w: 100, h: 40 })).toEqual({ x: 50, y: 60 });
  });
  it('never goes negative when the label is wider than the stage', () => {
    expect(clampPoint(10, 10, { w: 100, h: 100 }, { w: 300, h: 40 }).x).toBe(8);
  });
});

describe('planAttempt', () => {
  it('counts each attempt immediately, even before any frame plays', () => {
    const sha = () => 'abcdef';
    const one = planAttempt(0, 'skip-qa', sha);
    const two = planAttempt(one.count, 'edit-guard', sha);
    expect(one.count).toBe(1);
    expect(two.count).toBe(2);
    expect(two.frames[two.frames.length - 1].attempts).toBe(2);
  });
});
