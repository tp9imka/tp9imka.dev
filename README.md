# tp9imka.dev

Personal site of Ivan Antsimonau (`tp9imka`): agent crews that ship on their own,
and the gates that tell them no. The hero lets you play an agent that cuts corners
and try to get a change merged. Every attempt ends in a real refusal.

Also the domain of the [pub.dev verified publisher](https://pub.dev/publishers/tp9imka.dev/packages).

## Stack

Astro (static output) + TypeScript. Animations are small modules bundled as
external files, so the CSP keeps `script-src 'self'`. Fonts are self-hosted via
@fontsource. No analytics, no third-party scripts.

```
src/
  components/   page sections (Hero, WallOfNo, ProductSim, ...)
  content/      systems/*.md and notes/*.md (content collections)
  data/         evidence.ts and gates.ts - every claim, keyed by a private source id
  scripts/      hero engine (pure) + DOM layers, product sim, injection demo
  styles/       tokens.css (dark default, light variant) and global.css
public/         _headers (CSP and security headers), cv.pdf, theme-boot.js
scripts/        leak-check.mjs, build-cv.sh
test/           Vitest unit tests for the pure cores, data and config
```

## Commands

```
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run build     # build to dist/ and run the leak check
npm run preview   # serve dist/
```

`scripts/leak-check.mjs` fails the build if a name from a local, gitignored
`.banned-names` file appears in `src/` or `dist/`. Without the file it checks
banned copy words only and prints a warning.

## Deploy

Cloudflare Workers Builds runs `npx wrangler deploy` on every push to `main`.
Wrangler runs the `build.command` from `wrangler.jsonc` and serves `./dist` as
static assets, with `404.html` for unknown paths and `_headers` applied to every
response. A push to `main` goes live.

## Evidence rule

Every number on the site maps to a row in a private inventory through its `src`
id. Each item has a `published` flag; set it to `false` to pull a claim. Values
inside a component marked SIMULATION are illustrative.
