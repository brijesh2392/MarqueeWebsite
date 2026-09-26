/**
 * Marquee Goods — lead capture backend (Google Apps Script web app).
 * Saves every enquiry to the "Leads" sheet and customer logos to a private Drive folder.
 * Setup: see backend/README.md.
 *
 * One row per enquiry (Lead ID). Rows are updated in place as the visitor fills the form:
 *   partial   → phone typed, WhatsApp not tapped yet   (call these back!)
 *   whatsapp  → visitor tapped "Send on WhatsApp"
 */

// Optional: address to email when a new lead arrives. Leave '' to disable.
var NOTIFY_EMAIL = '';

var SHEET_NAME = 'Leads';
var FOLDER_NAME = 'Marquee Goods – customer logos';
var MAX_FILE_BYTES = 5 * 1024 * 1024;
var HEADERS = ['Created', 'Updated', 'Ref', 'Status', 'Name', 'Phone', 'Business', 'Pincode', 'Source', 'Products', 'Estimate shown (₹)', 'Logo files', 'Message', 'Page', 'Lead ID', 'Follow-up notes'];
var STAGE_RANK = { partial: 1, whatsapp: 2 };
var SOURCES = ['home', 'products', 'product', 'cart', 'contact'];

function doGet() {
  return json_({ ok: true });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!isObj_(body)) return json_({ ok: false });
    if (body.type === 'upload') return json_(handleUpload_(body));
    if (body.type === 'lead') return json_(handleLead_(body));
    return json_({ ok: false });
  } catch (err) {
    console.error(err && err.stack || err);
    return json_({ ok: false }); // generic message to the client; details stay in the Apps Script logs
  }
}

/* ------------------------------------------------------------------ leads */
function handleLead_(b) {
  if (str_(b.website, 200)) return { ok: true }; // honeypot filled → bot; pretend success
  var leadId = str_(b.leadId, 40);
  if (!/^mg-[a-z0-9]{8,32}$/.test(leadId)) return { ok: false };
  if (!rateOk_('lead:' + leadId, 40)) return { ok: false };

  var stage = STAGE_RANK[b.stage] ? b.stage : 'partial';
  var c = isObj_(b.contact) ? b.contact : {};
  var phone = str_(c.phone, 20).replace(/[^\d+ ]/g, '');
  if (phone.replace(/\D/g, '').length < 10) return { ok: false };

  var items = Array.isArray(b.items) ? b.items.slice(0, 30) : [];
  var productLines = [];
  var logoLinks = [];
  items.forEach(function (it, i) {
    if (!isObj_(it)) return;
    var line = (i + 1) + '. ' + str_(it.product, 80) + ' — ' + str_(it.size, 60) + ' × ' + int_(it.qty, 1, 99);
    var price = num_(it.lineTotal);
    line += price == null ? ' — on request' : ' — ₹' + price;
    if (str_(it.kit, 60)) line += ' [' + str_(it.kit, 60) + ']';
    if (str_(it.requirements, 600)) line += '\n   ' + str_(it.requirements, 600);
    if (str_(it.notes, 1000)) line += '\n   Notes: ' + str_(it.notes, 1000);
    productLines.push(line);
    var fid = str_(it.logoFileId, 80);
    if (/^[\w-]{20,80}$/.test(fid)) logoLinks.push('https://drive.google.com/file/d/' + fid + '/view');
    else if (str_(it.logoName, 80)) logoLinks.push(str_(it.logoName, 80) + ' (not uploaded)');
  });

  var t = isObj_(b.totals) ? b.totals : null;
  var estimate = t && num_(t.estimate) != null ? num_(t.estimate) : '';
  var source = SOURCES.indexOf(b.source) >= 0 ? b.source : '';

  var now = new Date();
  var row = [
    now, now, leadId.slice(-6).toUpperCase(), stage,
    str_(c.name, 80), phone, str_(c.business, 100), str_(c.pincode, 6).replace(/\D/g, ''),
    source, productLines.join('\n'), estimate, uniq_(logoLinks).join('\n'),
    str_(b.message, 1500), str_(b.page, 200), leadId, '',
  ].map(safeCell_);

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_();
    var found = sheet.getRange(2, 15, Math.max(sheet.getLastRow() - 1, 1), 1)
      .createTextFinder(leadId).matchEntireCell(true).findNext();
    if (found) {
      var r = found.getRow();
      var existing = sheet.getRange(r, 1, 1, HEADERS.length).getValues()[0];
      row[0] = existing[0]; // keep created time
      if (STAGE_RANK[existing[3]] > STAGE_RANK[stage]) row[3] = existing[3]; // never downgrade status
      // Keep earlier details if this update is missing them.
      [4, 6, 7, 9, 10, 11, 12].forEach(function (i) { if (row[i] === '' && existing[i] !== '') row[i] = existing[i]; });
      row[15] = existing[15]; // team's follow-up notes
      sheet.getRange(r, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
      notify_(row);
    }
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/* ---------------------------------------------------------------- uploads */
function handleUpload_(b) {
  var leadId = str_(b.leadId, 40);
  if (!/^mg-[a-z0-9]{8,32}$/.test(leadId)) return { ok: false };
  if (!rateOk_('up:' + leadId, 10) || !rateOk_('up:all', 300)) return { ok: false };
  var data = typeof b.data === 'string' ? b.data : '';
  if (!data || data.length > Math.ceil(MAX_FILE_BYTES * 4 / 3) + 8) return { ok: false };

  var bytes = Utilities.base64Decode(data);
  if (bytes.length > MAX_FILE_BYTES) return { ok: false };
  var kind = sniff_(bytes); // decide type from the file contents, not the name or declared type
  if (!kind) return { ok: false };

  var name = leadId + '-' + Utilities.getUuid().slice(0, 8) + '.' + kind.ext;
  var blob = Utilities.newBlob(bytes, kind.mime, name);
  var file = folder_().createFile(blob);
  file.setDescription('Original name: ' + str_(b.filename, 80));
  return { ok: true, fileId: file.getId() };
}

function sniff_(bytes) {
  var b = function (i) { return (bytes[i] + 256) % 256; };
  if (bytes.length < 12) return null;
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47) return { ext: 'png', mime: 'image/png' };
  if (b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50) return { ext: 'webp', mime: 'image/webp' };
  if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return { ext: 'pdf', mime: 'application/pdf' };
  var head = Utilities.newBlob(bytes.slice(0, 1024)).getDataAsString().toLowerCase();
  if (/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[^>]*>\s*)?<svg[\s>]/.test(head)) return { ext: 'svg', mime: 'image/svg+xml' };
  return null;
}

/* ---------------------------------------------------------------- helpers */
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.getRange('J:J').setWrap(true);
  }
  return sh;
}

function folder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* recreate below */ } }
  var f = DriveApp.createFolder(FOLDER_NAME); // private to the owner by default
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function notify_(row) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'New website lead: ' + row[4] + ' (' + row[5] + ')',
      'Status: ' + row[3] + '\nName: ' + row[4] + '\nPhone: ' + row[5] + '\nBusiness: ' + row[6] + '\nPincode: ' + row[7] +
      '\n\nProducts:\n' + row[9] + '\n\nMessage: ' + row[12] + '\n\nOpen the sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  } catch (e) { console.error(e); }
}

// Simple per-key limiter: at most `max` calls per 10 minutes.
function rateOk_(key, max) {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 600);
  return n <= max;
}

function isObj_(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function str_(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : ''; }
function num_(v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v < 1e8 ? Math.round(v) : null; }
function int_(v, lo, hi) { v = Number(v); return Number.isInteger(v) && v >= lo && v <= hi ? v : lo; }
function uniq_(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
// Stop spreadsheet formula injection: text starting with = + - @ is stored as plain text.
function safeCell_(v) { return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
