import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM script without types
import { scanForBanned, loadBanned } from '../scripts/leak-check.mjs';

describe('scanForBanned', () => {
  it('finds a banned word case-insensitively', () => {
    expect(scanForBanned('Hello Acme team', ['acme'])).toEqual(['acme']);
  });
  it('matches whole words only', () => {
    expect(scanForBanned('acmeville', ['acme'])).toEqual([]);
  });
  it('matches multi-word phrases', () => {
    expect(scanForBanned('He led AI teams', ['led ai teams'])).toEqual(['led ai teams']);
  });
  it('returns nothing for clean text', () => {
    expect(scanForBanned('gates that refuse', ['acme'])).toEqual([]);
  });
});

describe('loadBanned', () => {
  it('returns null when the list file is missing', () => {
    expect(loadBanned('/nonexistent/.banned-names')).toBeNull();
  });
});
