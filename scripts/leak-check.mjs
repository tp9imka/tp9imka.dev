// Fails the build if private names leak into source or output.
// The name list lives in .banned-names (gitignored): the list itself would leak them.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const COPY_BANNED = ['stealth', '10x', 'swarm', 'ai-native', 'ai security expert', 'led ai teams'];
const TEXT_EXT = new Set(['.astro', '.ts', '.md', '.mjs', '.js', '.html', '.css', '.json', '.txt', '.xml', '.svg']);
const SKIP = new Set(['cv.pdf']);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function scanForBanned(text, banned) {
  return banned.filter((w) => new RegExp(`(^|[^a-z0-9])${escape(w.toLowerCase())}($|[^a-z0-9])`, 'i').test(text));
}

export function loadBanned(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (!SKIP.has(name) && TEXT_EXT.has(extname(name))) yield p;
  }
}

function main() {
  const names = loadBanned('.banned-names');
  if (!names) console.warn('leak-check: .banned-names missing, checking copy words only');
  const banned = [...(names ?? []), ...COPY_BANNED];
  const hits = [];
  for (const dir of ['src', 'dist']) {
    for (const file of walk(dir)) {
      const found = scanForBanned(readFileSync(file, 'utf8'), banned);
      if (found.length) hits.push(`${file}: ${found.join(', ')}`);
    }
  }
  if (hits.length) {
    console.error('leak-check: banned names found\n' + hits.join('\n'));
    process.exit(1);
  }
  console.log(`leak-check: clean (${banned.length} terms)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
