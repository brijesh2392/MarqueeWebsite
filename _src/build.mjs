// Static site generator. Run from the repo root:  node _src/build.mjs
// Writes index.html, products/, cart/, contact/, assets/data.js, robots.txt (+ sitemap.xml when SITE.url is set).
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CATEGORIES, PRODUCTS, COMBOS, INDUSTRIES, MORE_INDUSTRIES, FAQS, STEPS } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (path, html) => { const f = join(ROOT, path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };

/* ------------------------------------------------------------------ helpers */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = (n) => '₹' + n.toLocaleString('en-IN');
const bySlug = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));
const catName = (id) => CATEGORIES.find((c) => c.id === id).name;
const minPrice = (p) => { const ps = p.sizes.map((s) => s.price).filter((x) => x != null); return ps.length ? Math.min(...ps) : null; };
const priceFrom = (p) => { const m = minPrice(p); if (m == null) return 'Price on request'; return (p.sizes.length > 1 ? 'From ' : '') + inr(m); };
const waLink = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
const comboTotals = (c) => {
  const full = c.items.reduce((s, slug) => s + (bySlug[slug].sizes[0].price || 0), 0);
  const save = Math.round(full * SITE.comboDiscount);
  return { full, save, now: full - save, hasQuote: c.items.some((s) => bySlug[s].sizes[0].price == null) };
};

// Images: an Unsplash photo ID ("photo-…") or a local file path such as "assets/img/projector.jpg".
let REL = ''; // set per page so local image paths resolve from nested folders
const isStock = (id) => id.startsWith('photo-');
const imgUrl = (id, w, h) => (isStock(id) ? `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70` : REL + id);
// Product-on-white photos are shown whole instead of cropped (set fit: 'contain' in data.mjs).
const CONTAIN = new Set(PRODUCTS.flatMap((p) => p.images).filter((im) => im.fit === 'contain').map((im) => im.id));
function img(id, { alt = '', w = 800, ratio = 1, sizes = '100vw', eager = false, cls = '' } = {}) {
  if (CONTAIN.has(id)) cls = (cls + ' contain').trim();
  if (!isStock(id)) return `<img${cls ? ` class="${cls}"` : ''} src="${REL + id}" width="${w}" height="${Math.round(w * ratio)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  const widths = [w / 2, w, Math.round(w * 1.5)].map(Math.round);
  const srcset = widths.map((x) => `${imgUrl(id, x, Math.round(x * ratio))} ${x}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${imgUrl(id, w, Math.round(w * ratio))}" srcset="${srcset}" sizes="${sizes}" width="${w}" height="${Math.round(w * ratio)}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

const ICONS = {
  cart: '<path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M8 12l2 2M11 9l2 2M14 6l2 2"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};
const icon = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const WA_ICON = (s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.3c0-.1-.2-.2-.5-.3z"/></svg>`;

/* ------------------------------------------------------------------- layout */
function layout({ path, title, description, page, body, rel, jsonld = [] }) {
  const canonical = SITE.url ? `<link rel="canonical" href="${SITE.url}/${path}">` : '';
  const wa = waLink(`Hi ${SITE.name}, I'd like to know more about your products.`);
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical}
<meta name="theme-color" content="#faf8f4">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231b1915'/%3E%3Cpath d='M8 23V10l8 8 8-8v13' fill='none' stroke='%23ffb627' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/styles.css">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body data-page="${page}" data-root="${rel}">
<a class="skip" href="#main">Skip to content</a>
<div class="announce"><div class="wrap">Your logo, made and delivered anywhere in India · <a href="tel:${SITE.phone}">Call ${SITE.phoneDisplay}</a></div></div>
<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${rel || './'}" aria-label="${esc(SITE.name)} home">
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1b1915"/><path d="M8 23V10l8 8 8-8v13" fill="none" stroke="#ffb627" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>Marquee<b>Goods</b></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="${rel}products/"${page === 'products' || page === 'product' ? ' aria-current="page"' : ''}>Products</a>
      <a href="${rel}contact/"${page === 'contact' ? ' aria-current="page"' : ''}>Contact<span class="hide-sm"> us</span></a>
      <a class="cart-link" href="${rel}cart/"${page === 'cart' ? ' aria-current="page"' : ''} aria-label="Cart">${icon('cart', 22)}<span class="cart-label">Cart</span><span class="count" data-cart-count hidden>0</span></a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
${footer(rel)}
${page !== 'product' && page !== 'cart' ? `<a class="wa-float" href="${wa}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${WA_ICON(26)}</a>` : ''}
<div class="toasts" id="toasts" role="status" aria-live="polite"></div>
<script src="${rel}assets/data.js"></script>
<script src="${rel}assets/app.js"></script>
</body>
</html>
`;
}

function footer(rel) {
  return `<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand on-dark" href="${rel || './'}"><svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#ffb627"/><path d="M8 23V10l8 8 8-8v13" fill="none" stroke="#1b1915" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Marquee<b>Goods</b></span></a>
      <p>Logo projectors, LED sign boards, standees, flags and promotional props for small businesses. Made with your logo, delivered across India since ${SITE.since}.</p>
    </div>
    <nav aria-label="Products">
      <h2 class="foot-h">Products</h2>
      <ul>${PRODUCTS.filter((p) => p.featured).map((p) => `<li><a href="${rel}products/${p.slug}/">${esc(p.name)}</a></li>`).join('')}<li><a href="${rel}products/">All products</a></li></ul>
    </nav>
    <nav aria-label="Company">
      <h2 class="foot-h">Help</h2>
      <ul><li><a href="${rel}contact/">Contact us</a></li><li><a href="${rel}#faq">FAQ</a></li><li><a href="${rel}cart/">Your cart</a></li></ul>
    </nav>
    <div>
      <h2 class="foot-h">Visit or call</h2>
      <ul>
        <li><a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a></li>
        ${SITE.email ? `<li><a href="mailto:${SITE.email}">${SITE.email}</a></li>` : ''}
        <li><a href="${SITE.mapsUrl}" target="_blank" rel="noopener">${esc(SITE.address)}</a></li>
        <li>Open ${SITE.hours}</li>
      </ul>
    </div>
  </div>
  <div class="wrap copyright">© ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</div>
</footer>`;
}

/* ------------------------------------------------------------- components */
function productCard(p, rel, { eager = false } = {}) {
  const [a, b] = p.images;
  return `<li class="card" data-cat="${p.cat}">
  <a class="card-link" href="${rel}products/${p.slug}/">
    <div class="card-media">
      ${img(a.id, { alt: a.alt, w: 600, ratio: 1, sizes: '(min-width: 1024px) 25vw, 50vw', eager })}
      ${b ? img(b.id, { alt: '', w: 600, ratio: 1, sizes: '(min-width: 1024px) 25vw, 50vw', cls: 'alt' }) : ''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${esc(p.name)}</h3>
      <p class="card-sub">${esc(p.summary)}</p>
      <p class="card-price">${priceFrom(p)}</p>
    </div>
  </a>
</li>`;
}

function comboCard(c, rel) {
  const t = comboTotals(c);
  return `<article class="kit">
  <div class="kit-media">${c.items.map((s) => img(bySlug[s].images[0].id, { alt: bySlug[s].name, w: 400, ratio: 1, sizes: '160px' })).join('')}</div>
  <div class="kit-body">
    <p class="kit-save">Save 10%</p>
    <h3>${esc(c.name)}</h3>
    <p class="kit-pitch">${esc(c.pitch)}</p>
    <ul class="kit-items">${c.items.map((s) => `<li><a href="${rel}products/${s}/">${esc(bySlug[s].name)}</a> <span>${bySlug[s].sizes[0].label}</span></li>`).join('')}</ul>
    <div class="kit-foot">
      <p class="kit-price"><strong>${inr(t.now)}</strong> <s>${inr(t.full)}</s>${t.hasQuote ? ' <small>+ items priced on request</small>' : ''}</p>
      <button class="btn btn-secondary btn-sm" type="button" data-add-combo="${c.id}">${icon('plus', 16)}Add kit to cart</button>
    </div>
  </div>
</article>`;
}

const stepsHtml = () => `<ol class="steps">${STEPS.map((s, i) => `<li><span class="step-n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>`;

const faqHtml = (list) => `<div class="faq-list">${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><h3>${esc(f.q)}</h3><span class="plus" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`).join('')}</div>`;

const faqJsonLd = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

const businessJsonLd = () => ({
  '@context': 'https://schema.org', '@type': 'LocalBusiness', name: SITE.name, telephone: SITE.phone,
  ...(SITE.email ? { email: SITE.email } : {}), ...(SITE.url ? { url: SITE.url } : {}),
  address: { '@type': 'PostalAddress', streetAddress: 'Pankha Road, Uttam Nagar', addressLocality: 'New Delhi', addressRegion: 'Delhi', addressCountry: 'IN' },
  areaServed: 'IN', description: 'Logo projectors, 3D LED sign boards, waving standees, feather flags and promotional props for small businesses, delivered across India.',
});

const assurance = () => `<ul class="assure wrap" aria-label="Why businesses choose us">
  <li>${icon('ruler')}<div><strong>Made to your size</strong><span>Your artwork, colours and dimensions</span></div></li>
  <li>${icon('eye')}<div><strong>Design preview included</strong><span>We make it only after you approve</span></div></li>
  <li>${icon('truck')}<div><strong>Pan-India delivery</strong><span>Dispatched in 5–10 working days</span></div></li>
  <li>${icon('chat')}<div><strong>Real people, ${SITE.hours}</strong><span>Call or WhatsApp ${SITE.phoneDisplay}</span></div></li>
</ul>`;

const ctaBand = () => `<section class="cta-band"><div class="wrap cta-inner">
  <div><h2>Not sure what will work for your shop?</h2><p>Send us a photo of your shopfront on WhatsApp. We’ll suggest what to put where, and what it will cost.</p></div>
  <a class="btn btn-wa" href="${waLink(`Hi ${SITE.name}, here's a photo of my shopfront. What would you suggest?`)}" target="_blank" rel="noopener">${WA_ICON()}Send a photo on WhatsApp</a>
</div></section>`;

/* --------------------------------------------------------------------- home */
function home() {
  const rel = ''; REL = rel;
  const tiles = [
    ['logo-projector', 't1'], ['led-sign-board', 't2'], ['waving-standee', 't3'], ['feather-flag', 't4'], ['floor-spin-wheel', 't5'],
  ];
  const featured = PRODUCTS.filter((p) => p.featured);
  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Shopfront advertising for small businesses</p>
      <h1>Get your shop noticed from across the street.</h1>
      <p class="lead">Logo projectors, 3D LED sign boards, waving standees and flags, made with your logo and delivered anywhere in India. Pick a product, share your requirement, get a price on WhatsApp.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="products/">Shop all products ${icon('arrow', 18)}</a>
        <a class="btn btn-secondary" href="${waLink(`Hi ${SITE.name}, I'd like a quote for my shop.`)}" target="_blank" rel="noopener">${WA_ICON(18)}Get a quote on WhatsApp</a>
      </div>
      <p class="hero-proof"><span>${SITE.stats.businesses} businesses</span><span>Since ${SITE.since}</span><span>Pan-India delivery</span></p>
    </div>
    <div class="collage" aria-label="Popular products">
      ${tiles.map(([slug, cls], i) => { const p = bySlug[slug]; return `<a class="tile ${cls}" href="products/${slug}/">${img(p.images[0].id, { alt: p.images[0].alt, w: i === 0 ? 900 : 500, ratio: i === 0 ? 1.15 : 1, sizes: i === 0 ? '(min-width: 1024px) 30vw, 60vw' : '(min-width: 1024px) 16vw, 40vw', eager: true })}<span class="tile-tag"><b>${esc(p.name)}</b>${priceFrom(p)}</span></a>`; }).join('')}
    </div>
  </div>
</section>
${assurance()}

<section class="section" aria-labelledby="best-h">
  <div class="wrap">
    <div class="section-head row"><div><h2 id="best-h">Best sellers</h2><p class="sub">What shop owners order most, with prices up front.</p></div><a class="link-arrow" href="products/">View all products ${icon('arrow', 16)}</a></div>
    <ul class="grid">${featured.map((p, i) => productCard(p, rel, { eager: false })).join('')}</ul>
  </div>
</section>

<section class="section tint" aria-labelledby="kits-h">
  <div class="wrap">
    <div class="section-head"><h2 id="kits-h">Kits that work better together</h2><p class="sub">Products that do more side by side. Order any 2 or more together and save 10%.</p></div>
    <div class="kits">${COMBOS.slice(0, 3).map((c) => comboCard(c, rel)).join('')}</div>
  </div>
</section>

<section class="section" aria-labelledby="how-h">
  <div class="wrap">
    <div class="section-head"><h2 id="how-h">How ordering works</h2><p class="sub">Book with a small token amount. Nothing is made until you approve the design.</p></div>
    ${stepsHtml()}
  </div>
</section>

<section class="section dark" aria-labelledby="who-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Who we work with</p><h2 id="who-h">Made for local businesses like yours</h2><p class="sub">Here’s what works best for each kind of business.</p></div>
    <ul class="ind-grid">${INDUSTRIES.map((x) => `<li class="ind">${img(x.img, { alt: '', w: 500, ratio: 0.75, sizes: '(min-width: 1024px) 25vw, 50vw' })}<div class="ind-text"><h3>${esc(x.name)}</h3><p>${esc(x.use)}</p></div></li>`).join('')}</ul>
    <p class="ind-more"><span>Also:</span> ${MORE_INDUSTRIES.map(esc).join(' · ')}</p>
    <dl class="stats">
      <div><dt>In business since</dt><dd>${SITE.since}</dd></div>
      <div><dt>Businesses served</dt><dd>${SITE.stats.businesses}</dd></div>
      <div><dt>Products delivered</dt><dd>${SITE.stats.delivered}</dd></div>
      <div><dt>Delivery</dt><dd>Pan-India</dd></div>
    </dl>
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-grid">
    <div class="section-head"><h2 id="faq-h">Questions shop owners ask us</h2><p class="sub">Can’t find your answer? Call or WhatsApp us on <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a>, ${SITE.hours}.</p></div>
    ${faqHtml(FAQS)}
  </div>
</section>
${ctaBand()}`;
  out('index.html', layout({
    path: '', rel, page: 'home', body,
    title: 'Logo Projectors, LED Sign Boards & Standees for Shops | Marquee Goods',
    description: 'Get your shop noticed. Custom logo projectors, 3D LED sign boards, waving standees, feather flags and spin wheels for small businesses. Prices from ₹2,499, delivered across India.',
    jsonld: [businessJsonLd(), faqJsonLd(FAQS)],
  }));
}

/* ------------------------------------------------------------ product list */
function productList() {
  const rel = '../'; REL = rel;
  const body = `
<section class="page-head"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span>/</span>Products</nav>
  <h1>All products</h1>
  <p class="sub">Every product is made with your logo. Pick a size, share your requirement and get a price on WhatsApp.</p>
</div></section>
<section class="section pt-0"><div class="wrap">
  <div class="filters" role="group" aria-label="Filter by category">
    <button class="pill" type="button" data-filter="all" aria-pressed="true">All <span>${PRODUCTS.length}</span></button>
    ${CATEGORIES.map((c) => `<button class="pill" type="button" data-filter="${c.id}" aria-pressed="false">${esc(c.name)} <span>${PRODUCTS.filter((p) => p.cat === c.id).length}</span></button>`).join('')}
  </div>
  <ul class="grid" id="product-grid">${PRODUCTS.map((p) => productCard(p, rel)).join('')}</ul>
</div></section>
<section class="section tint"><div class="wrap">
  <div class="section-head"><h2>Save 10% with a kit</h2><p class="sub">Start from a kit or build your own — any 2 or more products together get 10% off.</p></div>
  <div class="kits">${COMBOS.map((c) => comboCard(c, rel)).join('')}</div>
</div></section>
${ctaBand()}`;
  out('products/index.html', layout({
    path: 'products/', rel, page: 'products', body,
    title: 'All Products: Logo Projectors, Sign Boards, Standees & More | Marquee Goods',
    description: 'Browse logo projectors, 3D LED sign boards, waving standees, feather flags, spin wheels, photo booths and awards. Custom sizes available, delivered pan-India.',
  }));
}

/* ------------------------------------------------------------ product page */
function field(f) {
  const id = `f-${f.id}`;
  if (f.type === 'file') {
    return `<div class="field">
  <span class="label">${esc(f.label)} <em>optional</em></span>
  <label class="drop" for="${id}">
    ${icon('upload')}
    <span class="drop-text"><strong>Upload a file</strong><span>${esc(f.hint)}</span></span>
    <input id="${id}" name="logo" type="file" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf" class="visually-hidden">
  </label>
  <p class="drop-status" data-upload-status aria-live="polite"></p>
</div>`;
  }
  if (f.type === 'select') {
    return `<div class="field"><label for="${id}">${esc(f.label)}</label><select id="${id}" name="${f.id}" data-req-field data-label="${esc(f.label)}">${f.choices.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>`;
  }
  return `<div class="field"><label for="${id}">${esc(f.label)} <em>optional</em></label><input id="${id}" name="${f.id}" type="text" maxlength="200" placeholder="${esc(f.placeholder || '')}" data-req-field data-label="${esc(f.label)}"></div>`;
}

// "Build your kit" box: starts from a suggested kit; the visitor can untick items, change sizes and add any product.
function comboOffer(p) {
  const c = COMBOS.find((x) => x.items.includes(p.slug));
  const suggest = c ? c.items.filter((x) => x !== p.slug)
    : PRODUCTS.filter((x) => x.slug !== p.slug && x.cat === p.cat).concat(PRODUCTS.filter((x) => x.featured && x.slug !== p.slug)).map((x) => x.slug).filter((x, i, a) => a.indexOf(x) === i).slice(0, 2);
  const pct = Math.round(SITE.comboDiscount * 100);
  return `<section class="fbt" data-suggest="${suggest.join(',')}" data-kit-name="${esc(c ? c.name : 'Your custom kit')}" aria-labelledby="fbt-h">
  <div class="fbt-head"><h2 id="fbt-h">Build your kit and save ${pct}%</h2><span class="badge">${pct}% off</span></div>
  <p class="fbt-pitch">${esc(c ? c.pitch : 'Order this with any other product and get ' + pct + '% off everything in the kit.')} Remove what you don’t need, or add anything else — any 2 or more products get ${pct}% off.</p>
  <ul class="fbt-list" data-fbt-list></ul>
  <div class="fbt-add">
    <label class="visually-hidden" for="fbt-more">Add another product to your kit</label>
    <select id="fbt-more" data-fbt-more><option value="">+ Add another product to your kit</option></select>
  </div>
  <div class="fbt-foot"><div class="fbt-total" data-fbt-total aria-live="polite"></div><button class="btn btn-primary btn-sm" type="button" data-fbt-add>${icon('plus', 16)}<span>Add kit to cart</span></button></div>
</section>`;
}

function productPage(p) {
  const rel = '../../'; REL = rel;
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.slug !== p.slug).concat(PRODUCTS.filter((x) => x.featured && x.cat !== p.cat)).slice(0, 4);
  const kits = COMBOS.filter((c) => c.items.includes(p.slug));
  const body = `
<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="${rel}">Home</a><span>/</span><a href="${rel}products/">Products</a><span>/</span>${esc(p.name)}</nav></div>
<section class="wrap pdp" data-slug="${p.slug}">
  <div class="gallery">
    <div class="gallery-main">${img(p.images[0].id, { alt: p.images[0].alt, w: 900, ratio: 1, sizes: '(min-width: 1024px) 50vw, 100vw', eager: true })}</div>
    ${p.images.length > 1 ? `<div class="thumbs" role="group" aria-label="Product images">${p.images.map((im, i) => `<button type="button" class="thumb" data-img="${im.id}" data-alt="${esc(im.alt)}" aria-pressed="${i === 0}" aria-label="Show image ${i + 1}">${img(im.id, { alt: '', w: 160, ratio: 1, sizes: '80px' })}</button>`).join('')}</div>` : ''}
  </div>

  <div class="pdp-info">
    <p class="eyebrow">${esc(catName(p.cat))}</p>
    <h1>${esc(p.name)}</h1>
    <p class="pdp-price" id="pdp-price" aria-live="polite">${priceFrom(p)}</p>
    <p class="pdp-tagline">${esc(p.tagline)}</p>

    <form class="req" id="req-form" novalidate>
      <fieldset class="sizes">
        <legend>${esc(p.sizeLabel)}</legend>
        <div class="size-grid">
          ${p.sizes.map((s, i) => `<label class="size"><input type="radio" name="size" value="${i}"${i === 0 ? ' checked' : ''}><span><b>${esc(s.label)}</b><small>${esc(s.detail)}</small><em>${s.price == null ? 'On request' : inr(s.price)}</em></span></label>`).join('')}
          <label class="size"><input type="radio" name="size" value="custom"><span><b>Custom size</b><small>Any size you need</small><em>Quote on WhatsApp</em></span></label>
        </div>
        <div class="custom-size" id="custom-size" hidden>
          <div class="field"><label for="cs-w">Width</label><input id="cs-w" name="cw" inputmode="decimal" maxlength="8" placeholder="e.g. 5"></div>
          <div class="field"><label for="cs-h">Height</label><input id="cs-h" name="ch" inputmode="decimal" maxlength="8" placeholder="e.g. 3"></div>
          <div class="field"><label for="cs-u">Unit</label><select id="cs-u" name="cu"><option>ft</option><option>inch</option><option>cm</option></select></div>
        </div>
      </fieldset>

      <div class="field qty-field">
        <span class="label" id="qty-l">Quantity</span>
        <div class="stepper" role="group" aria-labelledby="qty-l"><button type="button" data-step="-1" aria-label="Decrease quantity">−</button><output id="qty">1</output><button type="button" data-step="1" aria-label="Increase quantity">+</button></div>
      </div>

      <fieldset class="group">
        <legend>Your requirement</legend>
        ${p.fields.map(field).join('')}
        <div class="field"><label for="f-notes">Anything else? <em>optional</em></label><textarea id="f-notes" name="notes" rows="3" maxlength="1000" placeholder="Colours, deadline, where it will go…"></textarea></div>
      </fieldset>

      ${comboOffer(p)}

      <fieldset class="group">
        <legend>Where should we send your price?</legend>
        <div class="two">
          <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" autocomplete="name" maxlength="80" required data-contact></div>
          <div class="field"><label for="c-phone">WhatsApp number</label><input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="10-digit mobile" required data-contact></div>
        </div>
        <div class="field"><label for="c-pin">Pincode <em>optional</em></label><input id="c-pin" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" data-contact></div>
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      </fieldset>

      <p class="form-error" id="form-error" role="alert" hidden></p>
      <div class="pdp-actions">
        <button class="btn btn-wa btn-block" type="submit">${WA_ICON()}Get my price on WhatsApp</button>
        <button class="btn btn-secondary btn-block" type="button" id="add-cart">${icon('cart', 18)}Add to cart</button>
      </div>
      <p class="fine">No payment now. We confirm the final price and design with you first.</p>
    </form>

    <ul class="pdp-assure">
      <li>${icon('clock', 18)}Ready in ${esc(p.leadTime)}</li>
      <li>${icon('truck', 18)}Delivered across India</li>
      <li>${icon('eye', 18)}Design preview before production</li>
    </ul>
  </div>
</section>

<section class="section"><div class="wrap details">
  <div><h2>About the ${esc(p.name)}</h2>${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}</div>
  <div><h2>Specifications</h2><dl class="specs">${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
</div></section>

${kits.length > 1 ? `<section class="section tint"><div class="wrap"><div class="section-head"><h2>More kits with the ${esc(p.name)}</h2></div><div class="kits">${kits.slice(1).map((c) => comboCard(c, rel)).join('')}</div></div></section>` : ''}

<section class="section"><div class="wrap"><div class="section-head"><h2>How ordering works</h2></div>${stepsHtml()}</div></section>

<section class="section tint"><div class="wrap">
  <div class="section-head row"><h2>You may also like</h2><a class="link-arrow" href="${rel}products/">All products ${icon('arrow', 16)}</a></div>
  <ul class="grid">${related.map((x) => productCard(x, rel)).join('')}</ul>
</div></section>`;

  const prices = p.sizes.map((s) => s.price).filter((x) => x != null);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary,
    image: p.images.filter((im) => isStock(im.id) || SITE.url).map((im) => (isStock(im.id) ? imgUrl(im.id, 1200, 1200) : `${SITE.url}/${im.id}`)), brand: { '@type': 'Brand', name: SITE.name }, category: catName(p.cat),
    ...(prices.length ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, availability: 'https://schema.org/InStock' } } : {}),
  };
  out(`products/${p.slug}/index.html`, layout({
    path: `products/${p.slug}/`, rel, page: 'product', body,
    title: `${p.name} for Shops, ${priceFrom(p)} | Custom with Your Logo | ${SITE.name}`,
    description: `${p.summary} ${priceFrom(p)}. Custom sizes available. Delivered across India.`,
    jsonld: [ld],
  }));
}

/* --------------------------------------------------------------------- cart */
function cart() {
  const rel = '../'; REL = rel;
  const body = `
<section class="page-head"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span>/</span>Cart</nav>
  <h1>Your cart</h1>
  <p class="sub">Check your products and requirements, then send the list to us on WhatsApp. No payment now.</p>
</div></section>
<section class="section pt-0"><div class="wrap" id="cart-app"><p class="sub">Loading your cart…</p></div></section>`;
  out('cart/index.html', layout({ path: 'cart/', rel, page: 'cart', body, title: `Your cart | ${SITE.name}`, description: 'Review your products and send your requirement on WhatsApp.' }));
}

/* ------------------------------------------------------------------ contact */
function contact() {
  const rel = '../'; REL = rel;
  const body = `
<section class="page-head"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span>/</span>Contact us</nav>
  <h1>Talk to us</h1>
  <p class="sub">Tell us about your shop and what you need. We reply on WhatsApp, ${SITE.hours}.</p>
</div></section>
<section class="section pt-0"><div class="wrap contact-grid">
  <ul class="contact-list">
    <li>${WA_ICON(22)}<div><span class="k">WhatsApp</span><a href="${waLink(`Hi ${SITE.name}, I have a question.`)}" target="_blank" rel="noopener">${SITE.phoneDisplay}</a></div></li>
    <li>${icon('phone', 22)}<div><span class="k">Call</span><a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a></div></li>
    ${SITE.email ? `<li>${icon('mail', 22)}<div><span class="k">Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div></li>` : ''}
    <li>${icon('pin', 22)}<div><span class="k">Visit</span><a href="${SITE.mapsUrl}" target="_blank" rel="noopener">${esc(SITE.address)}</a></div></li>
    <li>${icon('clock', 22)}<div><span class="k">Hours</span><span>${SITE.hours}</span></div></li>
  </ul>
  <form class="panel contact-form" id="contact-form" novalidate>
    <h2>Send us your requirement</h2>
    <div class="two">
      <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" autocomplete="name" maxlength="80" required data-contact></div>
      <div class="field"><label for="c-phone">WhatsApp number</label><input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="10-digit mobile" required data-contact></div>
    </div>
    <div class="two">
      <div class="field"><label for="c-biz">Business name <em>optional</em></label><input id="c-biz" name="business" autocomplete="organization" maxlength="100" data-contact></div>
      <div class="field"><label for="c-pin">Pincode <em>optional</em></label><input id="c-pin" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" data-contact></div>
    </div>
    <div class="field"><label for="c-msg">What do you need?</label><textarea id="c-msg" name="message" rows="4" maxlength="1500" placeholder="e.g. A logo projector and a flag for my bakery in Janakpuri"></textarea></div>
    <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="form-error" id="form-error" role="alert" hidden></p>
    <button class="btn btn-wa btn-block" type="submit">${WA_ICON()}Send on WhatsApp</button>
    <p class="fine">We only use your number to reply to this enquiry.</p>
  </form>
</div></section>`;
  out('contact/index.html', layout({
    path: 'contact/', rel, page: 'contact', body,
    title: `Contact Us | ${SITE.name}, Uttam Nagar, New Delhi`,
    description: `Call or WhatsApp ${SITE.phoneDisplay} for logo projectors, LED sign boards, standees and flags. ${SITE.address}. Open ${SITE.hours}.`,
    jsonld: [businessJsonLd()],
  }));
}

/* -------------------------------------------------------------------- build */
// Clear generated product folders so removed products don't linger.
if (existsSync(join(ROOT, 'products'))) rmSync(join(ROOT, 'products'), { recursive: true });
home(); productList(); PRODUCTS.forEach(productPage); cart(); contact();

const clientData = {
  site: { name: SITE.name, whatsapp: SITE.whatsapp, leadEndpoint: SITE.leadEndpoint, comboDiscount: SITE.comboDiscount },
  categories: CATEGORIES,
  products: PRODUCTS.map(({ slug, name, cat, images, sizeLabel, sizes, fields }) => ({ slug, name, cat, image: images[0].id, imageFit: images[0].fit || '', sizeLabel, sizes, fields: fields.filter((f) => f.type !== 'file').map(({ id, label }) => ({ id, label })), needsLogo: fields.some((f) => f.type === 'file') })),
  combos: COMBOS.map(({ id, name, items }) => ({ id, name, items })),
};
out('assets/data.js', `/* Generated by _src/build.mjs — do not edit by hand. */\nwindow.MG = ${JSON.stringify(clientData)};\n`);

const pages = ['', 'products/', ...PRODUCTS.map((p) => `products/${p.slug}/`), 'contact/'];
out('robots.txt', `User-agent: *\nAllow: /\nDisallow: /cart/\n${SITE.url ? `Sitemap: ${SITE.url}/sitemap.xml\n` : ''}`);
if (SITE.url) out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${SITE.url}/${p}</loc></url>`).join('\n')}\n</urlset>\n`);

console.log(`Built ${pages.length + 1} pages.`);
