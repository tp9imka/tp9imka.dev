import { describe, expect, it } from 'vitest';
import { evidence, publishedEvidence } from '../src/data/evidence';
import { gates } from '../src/data/gates';

const ID = /^[a-z0-9-]+$/;
const DASHES = /[–—]/;

describe('evidence', () => {
  it('drops unpublished items', () => {
    const fixture = [
      { ...evidence[0], id: 'on', published: true },
      { ...evidence[0], id: 'off', published: false },
    ];
    expect(publishedEvidence(undefined, fixture).map((e) => e.id)).toEqual(['on']);
  });
  it('filters by kind', () => {
    expect(publishedEvidence('shipper').every((e) => e.kind === 'shipper')).toBe(true);
    expect(publishedEvidence('shipper').length).toBeGreaterThan(0);
  });
  it('uses inventory ids only, never paths', () => {
    [...evidence, ...gates].forEach((x) => expect(x.src).toMatch(ID));
  });
  it('has unique evidence ids', () => {
    expect(new Set(evidence.map((e) => e.id)).size).toBe(evidence.length);
  });
  it('writes every wall action in board capitals', () => {
    gates.forEach((g) => expect(g.action).toBe(g.action.toUpperCase()));
  });
  it('never uses en or em dashes in copy', () => {
    evidence.forEach((e) => [e.label, e.value, e.counts].forEach((t) => expect(t).not.toMatch(DASHES)));
    gates.forEach((g) => [g.gate, g.trigger, g.action].forEach((t) => expect(t).not.toMatch(DASHES)));
  });
});
