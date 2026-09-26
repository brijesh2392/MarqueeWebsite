# Marquee Goods website

A static site with no framework and no build dependencies; you only need Node 18+ to regenerate the pages.

## Edit content

All products, prices, sizes, kits (combos), FAQs, industries and contact details live in **[`_src/data.mjs`](_src/data.mjs)**. After editing, rebuild the site:

```bash
node _src/build.mjs
```

This regenerates `index.html`, `products/`, `cart/`, `contact/`, `assets/data.js` and `robots.txt`. It also writes `sitemap.xml` once `SITE.url` is set. **Don't hand-edit the generated HTML**; your changes will be overwritten.

| File | What it is |
|---|---|
| `_src/data.mjs` | Content and prices (edit this) |
| `_src/build.mjs` | Page templates |
| `assets/styles.css` | Design |
| `assets/app.js` | Cart, product customisation, kits, logo upload, lead capture |
| `backend/Code.gs` | Google Apps Script that saves leads to a Google Sheet ([setup guide](backend/README.md)) |

## Preview locally

```bash
node _src/serve.mjs
```

Then open http://localhost:5173.

## Before launch

- [ ] Set up the Google Sheet backend and paste its URL into `leadEndpoint` ([guide](backend/README.md))
- [ ] Confirm every price and size marked `TBC` in `_src/data.mjs`
- [ ] Confirm the "products delivered" number (`SITE.stats.delivered`)
- [ ] Add the email address (`SITE.email`)
- [ ] Set `SITE.url` to the live domain, which turns on canonical tags and the sitemap
- [ ] Replace the Unsplash stock photos with photos of your real products and installs. Product images are set by Unsplash photo ID in `_src/data.mjs`. To use your own photos, put them in `assets/img/` and update the `img()` helper in `_src/build.mjs`.
