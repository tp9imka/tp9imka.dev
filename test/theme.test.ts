import { describe, expect, it } from 'vitest';
import { nextTheme, readTheme } from '../src/scripts/theme';

describe('readTheme', () => {
  it('defaults to dark without storage', () => {
    expect(readTheme(null)).toBe('dark');
  });
  it('defaults to dark when storage throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); } };
    expect(readTheme(broken)).toBe('dark');
  });
  it('defaults to dark when nothing is stored', () => {
    expect(readTheme({ getItem: () => null })).toBe('dark');
  });
  it('returns light when light is stored', () => {
    expect(readTheme({ getItem: () => 'light' })).toBe('light');
  });
  it('ignores unknown stored values', () => {
    expect(readTheme({ getItem: () => 'neon' })).toBe('dark');
  });
});

describe('nextTheme', () => {
  it('toggles between dark and light', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
  });
});
