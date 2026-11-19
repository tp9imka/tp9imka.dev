import { describe, expect, it } from 'vitest';
import { planRun } from '../src/scripts/product/sim';

const n = (name: string, cost: number) => ({ name, cost });

describe('planRun', () => {
  it('bills every node when the plan fits under the ceiling', () => {
    const r = planRun(1.0, [n('script', 0.02), n('image', 0.2), n('voice', 0.1)]);
    expect(r.replanned).toBe(false);
    expect(r.rows.every((x) => x.status === 'billed')).toBe(true);
    expect(r.rows[2].total).toBeCloseTo(0.32);
  });
  it('re-plans once by dropping the most expensive remaining node', () => {
    const r = planRun(1.0, [n('script', 0.1), n('video', 0.8), n('upscale', 0.5), n('voice', 0.1)]);
    expect(r.replanned).toBe(true);
    expect(r.rows.map((x) => x.name)).not.toContain('upscale');
    expect(r.rows[r.rows.length - 1].total).toBeLessThanOrEqual(1.0);
    expect(r.rows.every((x) => x.status === 'billed')).toBe(true);
  });
  it('blocks the node that still crosses after the one re-plan', () => {
    const r = planRun(0.5, [n('script', 0.1), n('video', 0.45), n('video-2', 0.45)]);
    expect(r.replanned).toBe(true);
    expect(r.rows[r.rows.length - 1].status).toBe('blocked');
    const billed = r.rows.filter((x) => x.status === 'billed');
    expect(billed[billed.length - 1].total).toBeLessThanOrEqual(0.5);
  });
});
