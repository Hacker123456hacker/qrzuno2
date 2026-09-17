# QRZuno

**Create. Customize. Scan.**

QRZuno is a free, ad-free, client-side QR code generator. It's a static
site — no backend, no database, no login — built with plain HTML, CSS
and JavaScript.

## 1. Requirements

- Any modern browser to use the site
- A static file server for local development (Python, Node, or similar)
- No build step is required — this is plain HTML/CSS/JS

## 2. Installation

```bash
git clone <your-repo-url> qrzuno
cd qrzuno
```

No `npm install` is needed. The only external dependency —
[`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) —
is loaded from cdnjs via a `<script>` tag on each page.

## 3. Local development

Any static server works. For example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

or with Node:

```bash
npx serve .
```

Opening `index.html` directly via `file://` will work for most features,
but the service worker (offline support) requires `http://` or `https://`.

## 4. Build

There is no build step. If you want to regenerate the HTML pages from
their templates (used to keep header/footer consistent across pages),
the Python generator scripts used to produce this project are:

- `build_index.py` — homepage
- `build_tools.py` — the 10 dedicated tool pages
- `build_generic.py` — the long-tail generator page (`tools/generator.html?type=`)
- `build_qrtools.py` — the all-tools listing page
- `build_history.py` — history & favorites page
- `build_content.py` — about / privacy / terms / faq / contact

These are development-time helpers, not part of the deployed site.

## 5. GitHub Pages deployment

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to your default branch, root folder.
3. Your site will be live at `https://<username>.github.io/<repo>/`.
4. Update the `canonical`/`og:url` values and `sitemap.xml`/`robots.txt`
   host to match your real domain.

## 6. Cloudflare Pages deployment

1. Connect your GitHub repository in the Cloudflare Pages dashboard.
2. Build command: *(leave blank — no build step)*.
3. Output directory: `/` (project root).
4. Deploy.

## 7. Netlify deployment

1. Drag-and-drop this folder into Netlify, or connect the repo.
2. Build command: *(leave blank)*.
3. Publish directory: `/`.
4. Deploy.

## 8. PWA configuration

- `manifest.json` defines the app name, icons, colors and display mode.
- `sw.js` caches the app shell (HTML/CSS/JS + the favicon) so basic QR
  generation keeps working offline after the first visit.
- Icons currently use a single scalable SVG (`assets/icons/favicon.svg`).
  For best home-screen results on all platforms, also generate PNG
  icons (e.g. 192×192 and 512×512) and add them to the `icons` array in
  `manifest.json`.
- Bump `CACHE_NAME` inside `sw.js` whenever you change a cached file, so
  returning visitors get the update.

## 9. Custom domain configuration

- **GitHub Pages:** add a `CNAME` file with your domain, and configure a
  `CNAME`/`A` record with your DNS provider.
- **Cloudflare Pages / Netlify:** add the custom domain in the project's
  dashboard and follow the DNS instructions shown there.
- After switching domains, update:
  - `canonical` and `og:url`-style values in every page's `<head>`
  - `robots.txt`'s `Sitemap:` line
  - `sitemap.xml`'s `<loc>` values

## Notes on the contact form

`contact.html` ships with a form that does **not** send email yet — there is
no backend configured. Wire it up to a form service (e.g. Formspree,
Netlify Forms, EmailJS) or your own endpoint, and update the submit
handler in that page accordingly. Don't ship it pretending to send email
until it actually does.

## What's client-side vs. what isn't

- QR **generation**, **customization**, and **history/favorites** are
  100% client-side — nothing about the codes you create is sent to a
  server.
- The **contact form** is the only feature that would ever need a
  backend, and only once you configure one.
- The `qrcode-generator` library is loaded from a CDN (cdnjs) for the
  encoding math; everything else — rendering, styling, logos, frames,
  exporting — is QRZuno's own code in `js/qr-engine.js` and `js/app.js`.

## Project structure

```
qrzuno/
├── index.html, qr-tools.html, history.html
├── about.html, privacy.html, terms.html, faq.html, contact.html
├── tools/                  # dedicated + generic QR generator pages
├── manifest.json, sw.js, robots.txt, sitemap.xml
├── css/  main.css, responsive.css, animations.css
├── js/   app.js, qr-engine.js, tools-data.js, utils.js,
│         history.js, favorites.js, download.js
└── assets/icons/favicon.svg
```

No advertising, no AdSense, no tracking scripts — anywhere.
