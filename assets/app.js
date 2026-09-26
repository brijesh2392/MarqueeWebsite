/* Marquee Goods — site behaviour. No dependencies. Data comes from assets/data.js (window.MG). */
(() => {
  'use strict';

  const MG = window.MG;
  const SITE = MG.site;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ROOT = document.body.dataset.root || '';
  const PAGE = document.body.dataset.page;
  const bySlug = Object.fromEntries(MG.products.map((p) => [p.slug, p]));
  const comboById = Object.fromEntries(MG.combos.map((c) => [c.id, c]));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const imgUrl = (id, w) => (id.startsWith('photo-') ? `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=70` : ROOT + id);

  /* ------------------------------------------------------------- storage */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* storage unavailable */ } },
  };
  const K = { cart: 'mg-cart-v2', contact: 'mg-contact', lead: 'mg-lead-id' };

  /* ---------------------------------------------------------------- cart */
  const uid = () => Math.random().toString(36).slice(2, 10);
  const validItem = (it) => it && bySlug[it.slug] && Number.isInteger(it.qty) && it.qty >= 1 && it.qty <= 99 &&
    (it.size === 'custom' || (Number.isInteger(it.size) && it.size >= 0 && it.size < bySlug[it.slug].sizes.length));
  let cart = store.get(K.cart, []).filter(validItem);

  const saveCart = () => { store.set(K.cart, cart); paintCount(); };
  const unitPrice = (it) => (it.size === 'custom' ? null : bySlug[it.slug].sizes[it.size].price);
  const sizeText = (it) => {
    if (it.size !== 'custom') return bySlug[it.slug].sizes[it.size].label;
    const c = it.custom || {};
    return c.w && c.h ? `Custom ${c.w} × ${c.h} ${c.u || 'ft'}` : 'Custom size';
  };

  // A kit is any group of items added together. The discount applies while it still holds 2+ different products.
  const KIT_MIN = 2;
  const kitName = (it) => it.kitName || (comboById[it.combo] && comboById[it.combo].name) || 'Your kit';
  function kitStatus(kitId) {
    const count = new Set(cart.filter((it) => it.combo === kitId).map((it) => it.slug)).size;
    return { complete: count >= KIT_MIN, count };
  }
  const fromPrice = (q) => { const ps = q.sizes.map((x) => x.price).filter((x) => x != null); return ps.length ? (q.sizes.length > 1 ? 'from ' : '') + inr(Math.min(...ps)) : 'price on request'; };
  const thumb = (q, size = 48) => `<img src="${imgUrl(q.image, size * 2)}" alt="" width="${size}" height="${size}" loading="lazy"${q.imageFit === 'contain' ? ' class="contain"' : ''}>`;

  function totals() {
    let subtotal = 0, savings = 0, quoteItems = 0;
    const done = {};
    cart.forEach((it) => {
      const up = unitPrice(it);
      if (up == null) { quoteItems += it.qty; return; }
      const line = up * it.qty;
      subtotal += line;
      if (it.combo) {
        if (!(it.combo in done)) done[it.combo] = kitStatus(it.combo).complete;
        if (done[it.combo]) savings += line * SITE.comboDiscount;
      }
    });
    savings = Math.round(savings);
    return { subtotal, savings, estimate: subtotal - savings, quoteItems };
  }

  function addItem(item) {
    cart.push({ key: uid(), qty: 1, req: {}, notes: '', logo: null, combo: null, ...item });
    saveCart();
  }

  // Adds a group of items as one kit (each kit gets its own id, so two kits never mix).
  function addKit(items, name) {
    const id = 'kit-' + uid();
    items.forEach((it) => addItem({ ...it, combo: id, kitName: name }));
    toast(`${name} added — ${Math.round(SITE.comboDiscount * 100)}% off applied`, true);
  }
  function addCombo(comboId) {
    const c = comboById[comboId];
    if (c) addKit(c.items.map((slug) => ({ slug, size: 0 })), c.name);
  }

  function paintCount() {
    const n = cart.reduce((s, it) => s + it.qty, 0);
    $$('[data-cart-count]').forEach((el) => { el.hidden = n === 0; el.textContent = n > 99 ? '99+' : String(n); });
    $$('.cart-link').forEach((a) => a.setAttribute('aria-label', n ? `Cart, ${n} item${n > 1 ? 's' : ''}` : 'Cart, empty'));
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== K.cart) return;
    cart = store.get(K.cart, []).filter(validItem);
    paintCount();
    if (PAGE === 'cart') renderCart();
  });

  /* --------------------------------------------------------------- toast */
  function toast(msg, withCart = false) {
    const region = $('#toasts');
    if (!region) return;
    while (region.children.length >= 2) region.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="msg">${esc(msg)}</span>${withCart ? `<a href="${ROOT}cart/">View cart</a>` : ''}`;
    region.append(el);
    requestAnimationFrame(() => el.setAttribute('data-in', ''));
    setTimeout(() => { el.removeAttribute('data-in'); setTimeout(() => el.remove(), 250); }, 3600);
  }

  /* --------------------------------------------------------------- leads */
  const newLeadId = () => 'mg-' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Date.now().toString(36) + uid());
  function leadId() {
    let id = store.get(K.lead, null);
    if (!id || !/^mg-[a-z0-9]{8,32}$/.test(id)) { id = newLeadId(); store.set(K.lead, id); }
    return id;
  }
  const leadRef = () => leadId().slice(-6).toUpperCase();
  const rotateLead = () => store.set(K.lead, newLeadId());

  // Indian mobile numbers: accepts 98840 28699, +91 98840 28699, 098840 28699.
  function normPhone(v) {
    let d = String(v || '').replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }

  function send(payload, { beacon = false } = {}) {
    if (!SITE.leadEndpoint) { console.info('[lead — set SITE.leadEndpoint to save]', payload); return Promise.resolve(null); }
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon && navigator.sendBeacon(SITE.leadEndpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return Promise.resolve(null);
    return fetch(SITE.leadEndpoint, { method: 'POST', body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: body.length < 60000 })
      .then((r) => r.json()).catch(() => null);
  }

  function itemForLead(it) {
    const p = bySlug[it.slug];
    const up = unitPrice(it);
    const req = p.fields.map((f) => (it.req && it.req[f.id] ? `${f.label}: ${it.req[f.id]}` : null)).filter(Boolean).join('; ');
    return {
      product: p.name, size: sizeText(it), qty: it.qty, unitPrice: up, lineTotal: up == null ? null : up * it.qty,
      requirements: req, notes: it.notes || '', logoFileId: it.logo && it.logo.fileId ? it.logo.fileId : '',
      logoName: it.logo ? it.logo.name : '', kit: it.combo ? kitName(it) : '',
    };
  }

  function leadPayload(stage, form, items, extra = {}) {
    const d = new FormData(form);
    const val = (k) => String(d.get(k) || '').trim();
    return {
      type: 'lead', leadId: leadId(), stage, source: PAGE, page: location.pathname,
      contact: { name: val('name'), phone: normPhone(val('phone')) || val('phone'), business: val('business'), pincode: val('pincode') },
      message: val('message'), website: val('website'),
      items: items.map(itemForLead), totals: extra.totals || null,
    };
  }

  // Saves name + phone (and whatever else is filled in) as soon as a valid phone number is typed,
  // and again when the visitor leaves the page — so the lead is kept even if they never tap WhatsApp.
  function capturePartial(form, getItems) {
    let lastSent = '';
    let timer = 0;
    const snapshot = () => {
      const p = leadPayload('partial', form, getItems());
      if (!normPhone(p.contact.phone)) return null;
      return p;
    };
    const push = (beacon) => {
      const p = snapshot();
      if (!p) return;
      const sig = JSON.stringify([p.contact, p.message, p.items]);
      if (sig === lastSent) return;
      lastSent = sig;
      send(p, { beacon });
    };
    form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => push(false), 1500); });
    form.addEventListener('change', () => { clearTimeout(timer); timer = setTimeout(() => push(false), 800); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(true); });
    window.addEventListener('pagehide', () => push(true));
    return { markSent: () => { const p = snapshot(); if (p) lastSent = JSON.stringify([p.contact, p.message, p.items]); } };
  }

  // Remember contact details between pages (per-browser convenience only).
  function wireContactFields(form) {
    const saved = store.get(K.contact, {});
    $$('[data-contact]', form).forEach((el) => {
      if (saved[el.name] && !el.value) el.value = saved[el.name];
      el.addEventListener('input', () => { const s = store.get(K.contact, {}); s[el.name] = el.value.slice(0, 200); store.set(K.contact, s); });
    });
  }

  function validateContact(form) {
    const name = $('[name="name"]', form);
    const phone = $('[name="phone"]', form);
    const err = $('#form-error', form);
    let msg = '';
    let bad = null;
    if (!name.value.trim()) { msg = 'Please enter your name.'; bad = name; }
    else if (!normPhone(phone.value)) { msg = 'Please enter a valid 10-digit mobile number.'; bad = phone; }
    [name, phone].forEach((el) => el.removeAttribute('aria-invalid'));
    if (bad) { bad.setAttribute('aria-invalid', 'true'); bad.focus(); }
    err.hidden = !msg;
    err.textContent = msg;
    return !msg;
  }

  function openWhatsApp(text) {
    const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  }

  function itemLines(items) {
    return items.map((it, i) => {
      const p = bySlug[it.slug];
      const up = unitPrice(it);
      const out = [`${i + 1}. ${p.name} — ${sizeText(it)} × ${it.qty} — ${up == null ? 'price on request' : inr(up * it.qty)}`];
      p.fields.forEach((f) => { if (it.req && it.req[f.id]) out.push(`   ${f.label}: ${it.req[f.id]}`); });
      if (p.needsLogo) out.push(`   Logo: ${it.logo ? `uploaded (${it.logo.name})` : 'will share here'}`);
      if (it.notes) out.push(`   Notes: ${it.notes}`);
      if (it.combo) out.push(`   Part of: ${kitName(it)}`);
      return out.join('\n');
    });
  }

  function contactLines(form) {
    const d = new FormData(form);
    const v = (k) => String(d.get(k) || '').trim();
    return [`Name: ${v('name')}`, `Phone: ${v('phone')}`, v('business') && `Business: ${v('business')}`, v('pincode') && `Pincode: ${v('pincode')}`].filter(Boolean);
  }

  /* --------------------------------------------------------------- upload */
  const OK_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
  const MAX_BYTES = 5 * 1024 * 1024;

  function uploadLogo(file, statusEl) {
    const setStatus = (t, cls = '') => { if (statusEl) { statusEl.textContent = t; statusEl.className = 'drop-status ' + cls; } };
    if (!file) return Promise.resolve(null);
    if (!OK_TYPES.includes(file.type)) { setStatus('Please choose a PNG, JPG, WEBP, SVG or PDF file.', 'err'); return Promise.resolve(null); }
    if (file.size > MAX_BYTES) { setStatus('That file is over 5 MB. Choose a smaller one, or send it to us on WhatsApp.', 'err'); return Promise.resolve(null); }
    const name = file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 80);
    if (!SITE.leadEndpoint) { setStatus(`${name} attached. Please also send it to us on WhatsApp.`, 'ok'); return Promise.resolve({ name, fileId: '' }); }
    setStatus(`Uploading ${name}…`);
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        const data = String(fr.result).split(',')[1];
        fetch(SITE.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ type: 'upload', leadId: leadId(), filename: name, mime: file.type, data }) })
          .then((r) => r.json())
          .then((j) => {
            if (j && j.ok && j.fileId) { setStatus(`${name} uploaded.`, 'ok'); resolve({ name, fileId: j.fileId }); }
            else throw new Error('upload failed');
          })
          .catch(() => { setStatus(`We couldn’t upload ${name}. You can send it to us on WhatsApp instead.`, 'err'); resolve({ name, fileId: '' }); });
      };
      fr.onerror = () => { setStatus('Could not read that file.', 'err'); resolve(null); };
      fr.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------ kit add buttons */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add-combo]');
    if (b) addCombo(b.dataset.addCombo);
  });

  /* --------------------------------------------------------- products page */
  function initProducts() {
    const pills = $$('[data-filter]');
    pills.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      pills.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('#product-grid > li').forEach((li) => { li.hidden = f !== 'all' && li.dataset.cat !== f; });
    }));
  }

  /* ---------------------------------------------------------- product page */
  function initProduct() {
    const root = $('.pdp');
    const p = bySlug[root.dataset.slug];
    const form = $('#req-form');
    const priceEl = $('#pdp-price');
    const qtyEl = $('#qty');
    const customBox = $('#custom-size');
    const state = { qty: 1, logo: null };

    // Gallery
    const main = $('.gallery-main img');
    $$('.thumb').forEach((t) => t.addEventListener('click', () => {
      const id = t.dataset.img;
      main.src = imgUrl(id, 900);
      if (id.startsWith('photo-')) main.srcset = [450, 900, 1350].map((w) => `${imgUrl(id, w)} ${w}w`).join(', '); else main.removeAttribute('srcset');
      main.alt = t.dataset.alt;
      $$('.thumb').forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    }));

    const sizeVal = () => { const v = $('input[name="size"]:checked', form).value; return v === 'custom' ? 'custom' : Number(v); };
    let onSelfChange = () => {};
    function paintPrice() {
      onSelfChange();
      const s = sizeVal();
      customBox.hidden = s !== 'custom';
      if (s === 'custom') { priceEl.textContent = 'Custom size — we’ll quote on WhatsApp'; return; }
      const up = p.sizes[s].price;
      priceEl.innerHTML = up == null ? 'Price on request' : `${inr(up * state.qty)}${state.qty > 1 ? ` <small>${state.qty} × ${inr(up)}</small>` : ''}`;
    }
    form.addEventListener('change', (e) => { if (e.target.name === 'size') paintPrice(); });

    $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
      state.qty = Math.min(99, Math.max(1, state.qty + Number(b.dataset.step)));
      qtyEl.textContent = state.qty;
      paintPrice();
    }));

    const file = $('input[type="file"]', form);
    if (file) file.addEventListener('change', async () => {
      state.logo = await uploadLogo(file.files[0], $('[data-upload-status]', form));
    });

    function currentItem() {
      const req = {};
      $$('[data-req-field]', form).forEach((el) => { if (el.value.trim()) req[el.name] = el.value.trim().slice(0, 200); });
      const size = sizeVal();
      const custom = size === 'custom' ? { w: $('#cs-w').value.trim().slice(0, 8), h: $('#cs-h').value.trim().slice(0, 8), u: $('#cs-u').value } : null;
      return { slug: p.slug, size, custom, qty: state.qty, req, notes: $('#f-notes').value.trim().slice(0, 1000), logo: state.logo };
    }

    function customOk() {
      if (sizeVal() !== 'custom') return true;
      const w = $('#cs-w'), h = $('#cs-h');
      const bad = [w, h].find((el) => !/^\d+(\.\d+)?$/.test(el.value.trim()));
      if (bad) {
        const err = $('#form-error');
        err.hidden = false;
        err.textContent = 'Please enter the width and height for your custom size.';
        bad.focus();
        return false;
      }
      return true;
    }

    $('#add-cart').addEventListener('click', () => {
      $('#form-error').hidden = true;
      if (!customOk()) return;
      addItem(currentItem());
      toast(`${p.name} added to cart`, true);
    });

    // Build your kit: this product + suggested items; visitors can remove items, change sizes and add any product.
    const fbt = $('.fbt');
    if (fbt) {
      const pct = Math.round(SITE.comboDiscount * 100);
      const rows = fbt.dataset.suggest.split(',').filter((x) => bySlug[x]).map((slug) => ({ slug, size: 0 }));
      const list = $('[data-fbt-list]', fbt);
      const more = $('[data-fbt-more]', fbt);
      const btn = $('[data-fbt-add]', fbt);
      const selfUnit = () => (sizeVal() === 'custom' ? null : p.sizes[sizeVal()].price);
      const rowPrice = (r) => bySlug[r.slug].sizes[r.size].price;

      const paintTotal = () => {
        const n = 1 + rows.length;
        const lines = [[selfUnit(), state.qty], ...rows.map((r) => [rowPrice(r), 1])];
        const full = lines.reduce((sum, [u, q]) => sum + (u == null ? 0 : u * q), 0);
        const quote = lines.some(([u]) => u == null);
        const on = n >= KIT_MIN;
        const save = on ? Math.round(full * SITE.comboDiscount) : 0;
        $('[data-fbt-total]', fbt).innerHTML = on
          ? `<strong>${inr(full - save)}</strong> <s>${inr(full)}</s><small class="fbt-save">You save ${inr(save)}${quote ? ' · plus items priced on request' : ''}</small>`
          : `<strong>${inr(full)}</strong><small>Add one more product to get ${pct}% off</small>`;
        btn.disabled = !on;
        $('span', btn).textContent = on ? `Add kit to cart · ${n} items` : 'Add a product to build a kit';
      };

      const paintList = () => {
        const su = selfUnit();
        const sl = sizeVal() === 'custom' ? 'Custom size' : p.sizes[sizeVal()].label;
        list.innerHTML = `<li class="fbt-item is-self">${thumb(p)}<span class="fbt-name"><span>${esc(p.name)} <em>· This item</em></span><small>${esc(sl)}${state.qty > 1 ? ` × ${state.qty}` : ''}</small></span><span class="fbt-price">${su == null ? 'On request' : inr(su * state.qty)}</span><span></span></li>` +
          rows.map((r, i) => {
            const q = bySlug[r.slug];
            const pr = rowPrice(r);
            const size = q.sizes.length > 1
              ? `<select data-size="${i}" aria-label="${esc(q.sizeLabel)} for ${esc(q.name)}">${q.sizes.map((x, j) => `<option value="${j}"${j === r.size ? ' selected' : ''}>${esc(x.label)}</option>`).join('')}</select>`
              : `<small>${esc(q.sizes[0].label)}</small>`;
            return `<li class="fbt-item">${thumb(q)}<span class="fbt-name"><a href="${ROOT}products/${q.slug}/">${esc(q.name)}</a>${size}</span><span class="fbt-price">${pr == null ? 'On request' : inr(pr)}</span><button type="button" class="fbt-x" data-rm="${i}" aria-label="Remove ${esc(q.name)} from kit"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`;
          }).join('');
        const inKit = new Set([p.slug, ...rows.map((r) => r.slug)]);
        const opts = MG.products.filter((x) => !inKit.has(x.slug));
        more.innerHTML = '<option value="">+ Add another product to your kit</option>' + opts.map((x) => `<option value="${x.slug}">${esc(x.name)} · ${fromPrice(x)}</option>`).join('');
        more.parentElement.hidden = !opts.length;
        paintTotal();
      };
      onSelfChange = paintList;

      list.addEventListener('click', (e) => {
        const b = e.target.closest('[data-rm]');
        if (!b) return;
        const name = bySlug[rows[Number(b.dataset.rm)].slug].name;
        rows.splice(Number(b.dataset.rm), 1);
        paintList();
        more.focus();
        toast(`${name} removed from your kit`);
      });
      list.addEventListener('change', (e) => {
        const sel = e.target.closest('[data-size]');
        if (sel) { rows[Number(sel.dataset.size)].size = Number(sel.value); paintList(); }
      });
      more.addEventListener('change', () => {
        if (!bySlug[more.value]) return;
        rows.push({ slug: more.value, size: 0 });
        paintList();
        more.focus();
      });
      btn.addEventListener('click', () => {
        if (!customOk() || rows.length + 1 < KIT_MIN) return;
        const slugs = [p.slug, ...rows.map((r) => r.slug)];
        const preset = MG.combos.find((c) => c.items.length === slugs.length && c.items.every((x) => slugs.includes(x)));
        addKit([currentItem(), ...rows.map((r) => ({ slug: r.slug, size: r.size }))], preset ? preset.name : 'Your custom kit');
      });
      paintList();
    }

    wireContactFields(form);
    const partial = capturePartial(form, () => [currentItem()]);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateContact(form) || !customOk()) return;
      const item = currentItem();
      const lead = leadPayload('whatsapp', form, [item]);
      send(lead, { beacon: true });
      partial.markSent();
      const text = [`Hi ${SITE.name}, I'd like a price for:`, '', ...itemLines([item]), '', ...contactLines(form), `Ref: ${leadRef()}`].join('\n');
      rotateLead();
      openWhatsApp(text);
    });

    paintPrice();
  }

  /* -------------------------------------------------------------- cart page */
  let cartForm = null;
  let cartLogo = null;

  function renderCart() {
    const app = $('#cart-app');
    if (!cart.length) {
      app.innerHTML = `<div class="empty">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>
        <h2>Your cart is empty</h2>
        <p>Add a product, choose a size and tell us your requirement. We’ll send the price on WhatsApp.</p>
        <a class="btn btn-primary" href="${ROOT}products/">Browse products</a>
      </div>`;
      cartForm = null;
      return;
    }
    if (!cartForm) {
      app.innerHTML = `<div class="cart-grid">
        <div><ul class="lines" id="lines"></ul></div>
        <aside class="panel summary" aria-labelledby="sum-h">
          <h2 id="sum-h">Summary</h2>
          <dl class="totals" id="totals"></dl>
          <p class="fine">Estimate only. Delivery is added to your final quote, which we confirm on WhatsApp before you pay.</p>
          <form id="cart-form" novalidate>
            <h3>Your details</h3>
            <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" autocomplete="name" maxlength="80" required data-contact></div>
            <div class="field"><label for="c-phone">WhatsApp number</label><input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="10-digit mobile" required data-contact></div>
            <div class="two">
              <div class="field"><label for="c-biz">Business name <em>optional</em></label><input id="c-biz" name="business" autocomplete="organization" maxlength="100" data-contact></div>
              <div class="field"><label for="c-pin">Pincode <em>optional</em></label><input id="c-pin" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" data-contact></div>
            </div>
            <div class="field">
              <span class="label">Logo for all products <em>optional</em></span>
              <label class="drop drop-sm" for="cart-logo"><svg class="i" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg><span class="drop-text"><strong>Upload a file</strong><span>PNG, JPG, SVG or PDF, up to 5 MB</span></span>
                <input id="cart-logo" type="file" class="visually-hidden" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"></label>
              <p class="drop-status" data-upload-status aria-live="polite"></p>
            </div>
            <div class="field"><label for="c-msg">Message <em>optional</em></label><textarea id="c-msg" name="message" rows="3" maxlength="1500" placeholder="Deadline, installation address, anything else…"></textarea></div>
            <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <p class="form-error" id="form-error" role="alert" hidden></p>
            <button class="btn btn-wa btn-block" type="submit"><svg class="i" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg>Send enquiry on WhatsApp</button>
            <p class="fine">No payment now. We reply with the final price and a design preview.</p>
          </form>
        </aside>
      </div>`;
      cartForm = $('#cart-form');
      wireCartForm(cartForm);
    }
    renderLines();
    renderTotals();
  }

  function renderLines() {
    const shown = new Set();
    $('#lines').innerHTML = cart.map((it) => {
      const p = bySlug[it.slug];
      const up = unitPrice(it);
      let kitNote = '';
      if (it.combo && !shown.has(it.combo)) {
        shown.add(it.combo);
        const k = kitStatus(it.combo);
        kitNote = k.complete
          ? `<p class="kit-note ok">${esc(kitName(it))}: ${Math.round(SITE.comboDiscount * 100)}% off applied</p>`
          : `<div class="kit-note"><p>Only one product is left in ${esc(kitName(it))}. Add another to keep ${Math.round(SITE.comboDiscount * 100)}% off.</p><label class="visually-hidden" for="ka-${it.combo}">Add a product to this kit</label><select id="ka-${it.combo}" data-kit-add="${it.combo}"><option value="">+ Add a product to this kit</option>${MG.products.filter((x) => x.slug !== it.slug).map((x) => `<option value="${x.slug}">${esc(x.name)} · ${fromPrice(x)}</option>`).join('')}</select></div>`;
      }
      const req = p.fields.map((f) => (it.req && it.req[f.id] ? `<li><span>${esc(f.label)}</span> ${esc(it.req[f.id])}</li>` : '')).join('');
      return `<li class="line" data-key="${it.key}">
        ${kitNote}
        <div class="line-row">
          <a class="line-img" href="${ROOT}products/${p.slug}/">${thumb(p, 96)}</a>
          <div class="line-main">
            <div class="line-top">
              <a class="line-name" href="${ROOT}products/${p.slug}/">${esc(p.name)}</a>
              <span class="line-price">${up == null ? 'On request' : inr(up * it.qty)}</span>
            </div>
            ${it.combo ? `<span class="badge">${esc(kitName(it))}</span>` : ''}
            <div class="line-ctrl">
              <label class="visually-hidden" for="sz-${it.key}">${esc(p.sizeLabel)}</label>
              <select id="sz-${it.key}" data-act="size">${p.sizes.map((s, i) => `<option value="${i}"${it.size === i ? ' selected' : ''}>${esc(s.label)} · ${s.price == null ? 'On request' : inr(s.price)}</option>`).join('')}<option value="custom"${it.size === 'custom' ? ' selected' : ''}>Custom size · quote</option></select>
              <div class="stepper sm" role="group" aria-label="Quantity for ${esc(p.name)}"><button type="button" data-act="dec" aria-label="Decrease"${it.qty <= 1 ? ' disabled' : ''}>−</button><output>${it.qty}</output><button type="button" data-act="inc" aria-label="Increase"${it.qty >= 99 ? ' disabled' : ''}>+</button></div>
              <button type="button" class="link muted" data-act="rm">Remove</button>
            </div>
            ${it.size === 'custom' ? `<div class="custom-inline"><input aria-label="Width" data-act="cw" inputmode="decimal" maxlength="8" placeholder="Width" value="${esc(it.custom?.w || '')}"><span>×</span><input aria-label="Height" data-act="ch" inputmode="decimal" maxlength="8" placeholder="Height" value="${esc(it.custom?.h || '')}"><select aria-label="Unit" data-act="cu">${['ft', 'inch', 'cm'].map((u) => `<option${(it.custom?.u || 'ft') === u ? ' selected' : ''}>${u}</option>`).join('')}</select></div>` : ''}
            ${req ? `<ul class="req-list">${req}</ul>` : ''}
            ${p.needsLogo ? `<p class="line-logo">${it.logo ? `Logo: ${esc(it.logo.name)}` : 'No logo yet — upload one below or share it on WhatsApp.'}</p>` : ''}
            <label class="visually-hidden" for="nt-${it.key}">Notes for ${esc(p.name)}</label>
            <textarea id="nt-${it.key}" class="line-notes" data-act="notes" rows="1" maxlength="1000" placeholder="Add a note for this product">${esc(it.notes || '')}</textarea>
          </div>
        </div>
      </li>`;
    }).join('');
  }

  function renderTotals() {
    const t = totals();
    $('#totals').innerHTML = `
      <div><dt>Subtotal</dt><dd>${inr(t.subtotal)}</dd></div>
      ${t.savings ? `<div class="save"><dt>Kit savings (10%)</dt><dd>−${inr(t.savings)}</dd></div>` : ''}
      ${t.quoteItems ? `<div><dt>Priced on request</dt><dd>${t.quoteItems} item${t.quoteItems > 1 ? 's' : ''}</dd></div>` : ''}
      <div class="grand"><dt>Estimated total</dt><dd>${inr(t.estimate)}</dd></div>`;
  }

  function wireCartForm(form) {
    wireContactFields(form);
    const partial = capturePartial(form, () => cart);
    const logoInput = $('#cart-logo', form);
    logoInput.addEventListener('change', async () => {
      cartLogo = await uploadLogo(logoInput.files[0], $('[data-upload-status]', form));
      if (cartLogo) { cart.forEach((it) => { if (bySlug[it.slug].needsLogo && !it.logo) it.logo = cartLogo; }); saveCart(); renderLines(); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      const t = totals();
      send(leadPayload('whatsapp', form, cart, { totals: t }), { beacon: true });
      partial.markSent();
      const msg = String(new FormData(form).get('message') || '').trim();
      const text = [
        `Hi ${SITE.name}, I'd like a quote for:`, '', ...itemLines(cart), '',
        t.savings ? `Kit savings: −${inr(t.savings)}` : null,
        `Estimated total: ${inr(t.estimate)}${t.quoteItems ? ` + ${t.quoteItems} item${t.quoteItems > 1 ? 's' : ''} priced on request` : ''}`,
        msg ? `\n${msg}` : null, '', ...contactLines(form), `Ref: ${leadRef()}`,
      ].filter((x) => x != null).join('\n');
      rotateLead();
      openWhatsApp(text);
    });
  }

  function initCart() {
    renderCart();
    const app = $('#cart-app');
    const find = (el) => cart.find((x) => x.key === el.closest('.line')?.dataset.key);
    app.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
      const it = find(b);
      if (!it) return;
      if (b.dataset.act === 'inc') it.qty = Math.min(99, it.qty + 1);
      if (b.dataset.act === 'dec') it.qty = Math.max(1, it.qty - 1);
      if (b.dataset.act === 'rm') cart = cart.filter((x) => x !== it);
      saveCart();
      renderCart();
    });
    app.addEventListener('change', (e) => {
      const el = e.target;
      if (el.dataset.kitAdd && bySlug[el.value]) {
        const mate = cart.find((x) => x.combo === el.dataset.kitAdd);
        addItem({ slug: el.value, size: 0, combo: el.dataset.kitAdd, kitName: mate ? mate.kitName : '' });
        renderLines(); renderTotals();
        toast(`${bySlug[el.value].name} added — ${Math.round(SITE.comboDiscount * 100)}% off applied`);
        return;
      }
      const it = find(el);
      if (!it) return;
      if (el.dataset.act === 'size') { it.size = el.value === 'custom' ? 'custom' : Number(el.value); if (it.size === 'custom' && !it.custom) it.custom = { w: '', h: '', u: 'ft' }; saveCart(); renderLines(); renderTotals(); }
      if (el.dataset.act === 'cu') { it.custom.u = el.value; saveCart(); }
    });
    app.addEventListener('input', (e) => {
      const el = e.target;
      const it = find(el);
      if (!it) return;
      if (el.dataset.act === 'notes') it.notes = el.value.slice(0, 1000);
      if (el.dataset.act === 'cw') it.custom.w = el.value.slice(0, 8);
      if (el.dataset.act === 'ch') it.custom.h = el.value.slice(0, 8);
      saveCart();
    });
  }

  /* ----------------------------------------------------------- contact page */
  function initContact() {
    const form = $('#contact-form');
    wireContactFields(form);
    const partial = capturePartial(form, () => []);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      send(leadPayload('whatsapp', form, []), { beacon: true });
      partial.markSent();
      const msg = String(new FormData(form).get('message') || '').trim();
      const text = [`Hi ${SITE.name},`, msg || 'I’d like to know more about your products.', '', ...contactLines(form), `Ref: ${leadRef()}`].join('\n');
      rotateLead();
      openWhatsApp(text);
    });
  }

  /* ------------------------------------------------------------------ boot */
  paintCount();
  if (PAGE === 'products') initProducts();
  if (PAGE === 'product') initProduct();
  if (PAGE === 'cart') initCart();
  if (PAGE === 'contact') initContact();
})();
