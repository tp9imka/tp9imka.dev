import { describe, expect, it } from 'vitest';
import { createCounter } from '../src/scripts/gates-counter';
import { hasReceipts, missingReceipt, type CrewCard } from '../src/scripts/crew/receipts';
import { pricePlan } from '../src/scripts/product/plan';
import { closeLine } from '../src/scripts/close-line';

const card = (o: Partial<CrewCard>): CrewCard => ({ head: null, review: null, qa: null, ...o });

describe('gates counter', () => {
  it('counts each held gate and notifies subscribers', () => {
    const c = createCounter();
    const seen: number[] = [];
    c.subscribe((n) => seen.push(n));
    c.hold('hero'); c.hold('pipeline');
    expect(c.count()).toBe(2);
    expect(seen).toEqual([0, 1, 2]);
  });
});

describe('receipts', () => {
  it('names a card with no commits', () => {
    expect(missingReceipt(card({}))).toBe('no commits on this card');
  });
  it('names a voided QA pass after a new push', () => {
    expect(missingReceipt(card({ head: 'bbb', review: 'bbb', qa: 'aaa' }))).toBe('PASS @aaa is void, head is @bbb');
  });
  it('names a missing review before a missing QA', () => {
    expect(missingReceipt(card({ head: 'bbb' }))).toBe('no review @bbb');
    expect(missingReceipt(card({ head: 'bbb', review: 'bbb' }))).toBe('no QA PASS @bbb');
  });
  it('accepts a card whose review and QA match the head', () => {
    const c = card({ head: 'bbb', review: 'bbb', qa: 'bbb' });
    expect(hasReceipts(c)).toBe(true);
    expect(missingReceipt(c)).toBe('');
  });
});

describe('pricePlan', () => {
  const nodes = [
    { id: 'script', cost: 0.03, optional: false }, { id: 'board', cost: 0.24, optional: false },
    { id: 'voice', cost: 0.06, optional: false }, { id: 'shots', cost: 0.66, optional: false },
    { id: 'up', cost: 0.42, optional: true }, { id: 'compose', cost: 0.04, optional: false },
  ];
  it('keeps a plan that fits', () => {
    const r = pricePlan(nodes, 2);
    expect(r.dropped).toBeNull();
    expect(r.blocked).toBe(false);
    expect(r.after).toBeCloseTo(1.45);
  });
  it('drops the most expensive optional node once when over the ceiling', () => {
    const r = pricePlan(nodes, 1.2);
    expect(r.projected).toBeCloseTo(1.45);
    expect(r.dropped).toBe('up');
    expect(r.after).toBeCloseTo(1.03);
    expect(r.blocked).toBe(false);
  });
  it('blocks when one re-plan is not enough', () => {
    const r = pricePlan(nodes, 0.5);
    expect(r.blocked).toBe(true);
  });
});

describe('closeLine', () => {
  it('reads the counter', () => {
    expect(closeLine(0)).toBe('Nothing merges here without proof.');
    expect(closeLine(1)).toBe('You tried once. Nothing got through.');
    expect(closeLine(4)).toBe('You tried 4 times. Nothing got through.');
  });
});
