# tp9imka.dev

Personal landing page for **[tp9imka.dev](https://tp9imka.dev)** — Ivan Antsimonau
(`tp9imka`), building Flutter packages for memory safety and application security.

A single static page that makes the domain look intentional and points to the
[pub.dev verified publisher](https://pub.dev/publishers/tp9imka.dev/packages) and
[GitHub](https://github.com/tp9imka). It is designed to grow into a small index of
published packages with no redesign — new entries just slot into the "Packages"
ledger.

## Stack

Plain static HTML/CSS. **No build step, no dependencies, no JavaScript framework** —
one ~7 KB `index.html` with system fonts, an inline pre-paint theme script, and a
small theme toggle. Perfect Core Web Vitals by construction.

## Structure

```
public/              ← deploy root (this is what Cloudflare Pages serves)
├── index.html       ← the page
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── _headers         ← security headers + CSP (Cloudflare Pages)
docs/design/         ← original design handoff (reference, NOT deployed)
```

`public/index.html` is the source of truth for the live site. `docs/design/` holds
the original design deliverable and the multi-state design document; see
`docs/design/README.md` for the full design spec, tokens, and the future
package-list layout.

## Local preview

No tooling required:

```bash
cd public
python3 -m http.server 8000
# open http://localhost:8000
```

Note: the `_headers` file (CSP, HSTS, etc.) is applied by Cloudflare Pages, not by
`python3 -m http.server`, so security headers won't show in this local preview.

## Deploy — Cloudflare Pages (free tier)

Connect this GitHub repo in the Cloudflare Pages dashboard and use:

| Setting                  | Value      |
| ------------------------ | ---------- |
| Framework preset         | None       |
| Build command            | *(empty)*  |
| Build output directory   | `public`   |

No environment variables. Every push to `main` redeploys. Then add `tp9imka.dev`
as a custom domain in the Pages project (the DNS lives in Cloudflare already).

## Security headers

`public/_headers` ships a strict CSP (hash-pinned inline scripts, no
`unsafe-inline` for scripts), HSTS with preload, `nosniff`, `X-Frame-Options: DENY`,
a locked-down `Referrer-Policy`, and a restrictive `Permissions-Policy`. If you edit
the inline `<script>` blocks in `index.html`, recompute the `script-src` hashes:

```bash
python3 - <<'PY'
import re, hashlib, base64
data = open('public/index.html','rb').read().decode()
for m in re.finditer(r'<script\b[^>]*>(.*?)</script>', data, re.S):
    print("'sha256-" + base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode() + "'")
PY
```

## License

[MIT](LICENSE)
