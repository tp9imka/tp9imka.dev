import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const jsonc = (p: string) => JSON.parse(readFileSync(p, 'utf8').replace(/^\s*\/\/.*$/gm, ''));

describe('wrangler config', () => {
  it('serves the custom 404 page for unknown paths', () => {
    expect(jsonc('wrangler.jsonc').assets.not_found_handling).toBe('404-page');
  });
  it('builds before deploying and serves dist', () => {
    const c = jsonc('wrangler.jsonc');
    expect(c.build.command).toBe('npm run build');
    expect(c.assets.directory).toBe('./dist');
  });
});
