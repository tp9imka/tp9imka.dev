# Handoff: tp9imka.dev — personal landing page

## Overview
A single-page personal placeholder site for the domain **tp9imka.dev** (Ivan Antsimonau, handle `tp9imka` — Principal Engineer, Flutter + application security). The page exists to (a) make the domain look intentional and (b) point to his pub.dev verified-publisher page and GitHub. It is built to grow into a small index of his published Flutter packages with **no redesign**.

Visual direction is **"The Manifest"**: the page presents itself like a precise package-registry record — monospace identifiers, one prose line in the system sans, hairline rules, a single signal-cyan accent, and an amber status pip marking the first (pending) package. Confident and understated; deliberately not a "startup landing page."

## About the design files
Unusually for a handoff, **`index.html` in this bundle is the production artifact, not a reference mock.** It is a single static file — zero build, system fonts, ~6 KB, `prefers-color-scheme` + a persisted theme toggle, semantic HTML, keyboard focus rings, `prefers-reduced-motion` honored. It is intended to ship **as-is** to Cloudflare Pages (free tier). You do not need to "recreate" it in a framework.

`design-reference.dc.html` is a **design document** (multi-frame canvas: light/dark placeholder, the future package-index state, mobile, and a tokens/type sheet). It requires the project's preview runtime to render and is **not** for deployment — use it only to see the intended states, especially the future packages layout. The runtime file `support.js` it depends on is **not** included because it isn't needed for implementation.

If/when this graduates to a framework (the brief suggested Astro once the package list grows), recreate `index.html`'s markup and tokens faithfully in that environment; the section below documents everything needed to do so.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. `index.html` is the source of truth for exact values; this README mirrors them.

## Deploy (current state)
Drop `index.html` at the root of a Cloudflare Pages project (or any static host). No build step, no dependencies, no environment variables. Done.

---

## Screen: Landing (the only view)

**Purpose:** Identify the owner, state intent in one line, link out to pub.dev + GitHub, and quietly signal the first package is coming.

**Layout**
- `body`: full-viewport (`min-height:100svh`), CSS grid, content centered (`place-items:center`), padding `max(24px, safe-area) 24px`.
- `main.manifest`: `width:100%; max-width:470px`. Single column, natural document flow.
- Vertical order: `h1` → name eyebrow → tagline → links nav → packages ledger → footer.
- A fixed theme-toggle pill sits top-right (`position:fixed; top:max(20px,safe-area); right:20px`).

**Components**

1. **Wordmark (`h1`)** — text `tp9imka`. Mono, weight 600, `font-size: clamp(1.75rem, 7vw, 2.125rem)`, `letter-spacing:-0.02em`, `line-height:1`, color `--text`.
2. **Name eyebrow (`p.name`)** — text `Ivan Antsimonau`. Mono, `0.75rem`, `letter-spacing:0.16em`, uppercase, color `--faint`. Margin-top `0.65rem`.
3. **Tagline (`p.tagline`)** — exact copy: **`Building software for the future…`** (note the single-character ellipsis `…`). System sans, `1rem`, `line-height:1.55`, color `--muted`, `max-width:42ch`, `text-wrap:pretty`. Margin-top `1.4rem`.
4. **Links nav (`nav.links a`)** — two links, flex row, `gap:0.5rem 1.4rem`, mono `0.875rem`, margin-top `1.9rem`.
   - `pub.dev` → `https://pub.dev/publishers/tp9imka.dev/packages`
   - `GitHub` → `https://github.com/tp9imka`
   - Each: `min-height:44px` (touch target), color `--text`, `border-bottom:1px solid --rule`, trailing `↗` arrow span (`0.75rem`, `--faint`). `rel="me"`.
   - Hover/focus: color + border become `--accent`; arrow shifts `translate(2px,-2px)` and recolors. Transition `0.15s ease`. Focus-visible: `2px solid --accent` outline, `offset:4px`.
5. **Packages ledger (`section.ledger`)** — margin-top `2.8rem`.
   - Head row (`.ledger-head`): flex space-between baseline, `border-bottom:1px solid --rule`, padding-bottom `0.75rem`. Mono `0.6875rem`, `letter-spacing:0.16em`, uppercase, `--faint`. Left `Packages`, right `01 pending`.
   - One package row (`.pkg`): flex, `align-items:center`, `gap:0.875rem`, padding `1rem 0`.
     - `.pip` — `7×7px` circle, `background:--pending`, pulsing animation.
     - `.pkg-name` — mono `0.875rem`, `--faint`, text `first package`.
     - `.pkg-status` — `margin-left:auto`, mono `0.8125rem`, `--faint`, text `shipping soon`.
6. **Footer** — mono `0.6875rem`, `letter-spacing:0.05em`, `--faint`, margin-top `3.5rem`. Text `Verified publisher · tp9imka.dev`.
7. **Theme toggle (`button.theme-toggle`)** — fixed pill. Mono `0.6875rem`, `letter-spacing:0.08em`, color `--accent`, `border:1px solid --rule`, `border-radius:999px`, padding `0.4rem 0.75rem`, `min-height:34px`. Contains a `6×6px` `--accent` dot + label (`light`/`dark`). Hover: border → `--accent`. Focus-visible: `2px solid --accent` outline.

## Interactions & behavior
- **Theme toggle:** click flips `data-theme` between `light`/`dark` on `<html>`. Default (no attribute) follows `prefers-color-scheme`. Choice persisted in `localStorage['tp9imka-theme']`. A tiny inline script in `<head>` applies the saved theme **before first paint** (no flash). The toggle label and `aria-pressed` stay in sync, and the button updates live if the OS theme changes while on system default.
- **Pip animation:** `@keyframes pip` — opacity `1→0.4→1` and scale `1→0.78→1` over `2.4s ease-in-out infinite`. Purely decorative (`aria-hidden`).
- **Link hover/focus:** see component 4.
- **prefers-reduced-motion: reduce** disables all animation + transitions globally (`!important`).
- No routing, no data fetching, no forms.

## Responsive behavior
Single fluid column, `max-width:470px`, works 320 → 1920 with no overflow. Wordmark scales via `clamp()`. Links wrap if needed. Touch targets ≥44px. Safe-area insets respected top/bottom. No breakpoints are strictly required; the layout is intrinsically responsive.

## State management
One piece of state: theme (`light` | `dark` | unset=system), stored in `localStorage` and reflected as `html[data-theme]`. No other state.

## Design tokens (CSS custom properties)

Defined on `:root` (light) and overridden under `:root[data-theme="dark"]` **and** `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`. Values are oklch.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `oklch(0.986 0.003 95)` | `oklch(0.19 0.012 260)` |
| `--text` | `oklch(0.27 0.01 260)` | `oklch(0.93 0.006 250)` |
| `--muted` | `oklch(0.50 0.012 260)` | `oklch(0.72 0.012 255)` |
| `--faint` | `oklch(0.70 0.010 260)` | `oklch(0.55 0.012 258)` |
| `--rule` | `oklch(0.90 0.006 260)` | `oklch(0.33 0.012 260)` |
| `--rule-soft` | `oklch(0.93 0.005 260)` | `oklch(0.26 0.012 260)` |
| `--accent` | `oklch(0.55 0.12 240)` | `oklch(0.74 0.12 230)` |
| `--pending` | `oklch(0.66 0.11 70)` | `oklch(0.80 0.10 78)` |

**Typography**
- `--mono`: `ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace` — wordmark, eyebrow, all labels/meta.
- `--sans`: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` — the single tagline only.
- Scale (rem): `2.125` (clamped) / `1` / `0.875` / `0.8125` / `0.75` / `0.6875`. Weights: 400 and 600.

**Spacing** — 8px-based rhythm: 8 / 16 / 24 / 32 / 48 (expressed in rem in the file).
**Radius** — `999px` (pills), `1–3px` (focus outlines/swatches). Otherwise square.
**Shadow** — none on the live page (frames in the design doc use card shadows only for the canvas).

## Assets
None. No images, no icon files, no web fonts — all glyphs are system-font characters (`↗`, `·`, `…`). This is intentional for Core Web Vitals.

## How it extends to the packages list (important)
The future state is fully designed in `design-reference.dc.html` (dark "Future package list" frame). To add a real package, the ledger `<ul>` gains rows of this shape (keep the pending pip row last as the "more coming" affordance):

```html
<li class="pkg pkg--published">
  <a class="pkg-name" href="https://pub.dev/packages/leak_sentinel">leak_sentinel</a>
  <span class="pkg-desc">On-device memory-leak detector &amp; lint rules.</span>
  <span class="pkg-meta">v0.1.0 ↗</span>
</li>
```
- Published rows: name is a `--accent` mono link (`0.875rem`), one-line `--muted` description (`0.8125rem`, flex:1), right-aligned version/meta in `--faint`; row separated by `1px solid --rule-soft`.
- The head-row counter updates (e.g. `02 · 01 pending`).
- No structural/visual changes needed beyond adding rows — the placeholder and the index are the same composition.

## Files
- `index.html` — **the deployable page** (production-ready static file).
- `design-reference.dc.html` — design document (states + tokens visualization; needs the preview runtime, not for deploy).

## Notes / open items
- Verify the handles before deploy: links assume `github.com/tp9imka` and `pub.dev/publishers/tp9imka.dev`.
- Tagline copy is final: `Building software for the future…`.
- If a framework migration happens later, this README + `index.html` are sufficient to reproduce the page exactly.
