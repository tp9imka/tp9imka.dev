import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const block = (sel: string) => css.slice(css.indexOf(sel), css.indexOf('}', css.indexOf(sel)));
const token = (b: string, name: string) => (b.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`)) ?? [])[1];
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const AA_SMALL = 4.5;

describe('token contrast', () => {
  const dark = block(':root[data-theme="dark"]');
  const light = block(':root[data-theme="light"]');
  it.each(['--yellow', '--muted', '--faint', '--red', '--green'])('light %s meets AA on bg and surface', (t) => {
    expect(ratio(token(light, t), token(light, '--bg'))).toBeGreaterThanOrEqual(AA_SMALL);
    expect(ratio(token(light, t), token(light, '--surface'))).toBeGreaterThanOrEqual(AA_SMALL);
  });
  it.each(['--yellow', '--muted', '--faint', '--red', '--green'])('dark %s meets AA on bg and surface', (t) => {
    expect(ratio(token(dark, t), token(dark, '--bg'))).toBeGreaterThanOrEqual(AA_SMALL);
    expect(ratio(token(dark, t), token(dark, '--surface'))).toBeGreaterThanOrEqual(AA_SMALL);
  });
});
