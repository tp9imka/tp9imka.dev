import { describe, expect, it } from 'vitest';
import { boardGeometry } from '../src/scripts/crew/geometry';

describe('boardGeometry', () => {
  it('uses three lanes on wide boards', () => {
    const g = boardGeometry(1200);
    expect(g.narrow).toBe(false);
    expect(g.cols.map((c) => Math.round(c.x))).toEqual([0, 400, 800]);
    expect(g.cw).toBe(330);
    expect(g.guardX).toBe(800);
  });
  it('folds WORK and VERIFY into one column on phones, keeping cards readable', () => {
    const g = boardGeometry(328);
    expect(g.narrow).toBe(true);
    expect(g.cols[0].x).toBe(g.cols[1].x);
    expect(g.cw).toBeGreaterThanOrEqual(190);
    expect(g.cols[2].x).toBeGreaterThanOrEqual(g.cw);
    expect(g.guardX).toBe(g.cols[2].x);
  });
});
