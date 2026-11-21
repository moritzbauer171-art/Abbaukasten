/* ================= Handy: untere Leiste, „Mehr“-Menü, Zurück-Geste ================= */
const isPhone = () => window.matchMedia('(max-width: 640px)').matches;
function mbarSync() { const v = state.view === 'preview' ? 'preview' : 'edit'; document.querySelectorAll('#mbar [data-mb="edit"],#mbar [data-mb="preview"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mb === v))); }
function mmoreHTML(kind) {
  const it = (id, ic, l, k) => `<button type="button" role="menuitem" data-mm="${id}"><span class="mm-i">${ic}</span>${l}${k ? `<span class="mm-k">${k}</span>` : ''}</button>`;
  const ICON = { rlp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.2c1.8-.8 3.7-.8 5.5.3 1.8-1.1 3.7-1.1 5.5-.3v9.3c-1.8-.8-3.7-.8-5.5.3-1.8-1.1-3.7-1.1-5.5-.3z"/><path d="M8 3.5v9.3"/></svg>',
    save: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.5 2.5h8.3l2.7 2.7v8.3h-11z"/><path d="M5.2 2.5v3.2h4.6V2.5"/></svg>',
    set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/></svg>',
    forum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>',
    tafel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M8 21l2-4.5M16 21l-2-4.5"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
    folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 3.5h4l1.2 1.5h5.8v7.5h-11z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11h13V9"/></svg>',
    login: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="5.5" r="2.8"/><path d="M2.8 14c.8-2.8 2.8-4 5.2-4s4.4 1.2 5.2 4"/></svg>' };
  const vis = id => { const e = document.getElementById(id); return e && !e.hidden; };
  const H = t => `<div class="mm-h">${t}</div>`, SEP = '<div class="mm-sep"></div>';
  if (kind === 'stunden') return it('btn-new', ICON.plus, 'Neue Stunde') + it('btn-lib', ICON.folder, 'Meine Stunden') + it('btn-saveas', ICON.save, 'Speichern unter …', 'Strg ⇧ S') + `<button type="button" role="menuitem" data-cra="fass"><span class="mm-i"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8"/><path d="M2.5 2.8v2.6h2.6"/><path d="M8 5.2V8l2 1.3"/></svg></span>Frühere Fassungen …</button>` + (isBasis() ? '' : SEP + it('btn-home', ICON.home, 'Startseite'));
  if (kind === 'kl') { const fk = fachKey(state.klasse);
    return H('Klasse') + KLASSEN.filter(k => k.fach === fk).map(k => `<button type="button" role="menuitem" data-crk="${esc(k.id)}" class="${state.klasse === k.id ? 'on' : ''}"><span class="mm-dot" style="background:${(ACCENTS[k.accent] || ACCENTS.tinte).c}"></span>${esc(k.label)}<small>${(state.lib || []).filter(d => d.klasse === k.id).length || ''}</small></button>`).join('') + SEP + `<button type="button" role="menuitem" data-cra="klassen"><span class="mm-i">${ICON.plus}</span>Klassen anlegen und bearbeiten</button>`; }
  if (kind === 'st') { const cur = state.sheet; const L = (state.lib || []).filter(d => d.klasse === state.klasse).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 8);
    return H('Stunden · ' + esc((KL(state.klasse) || {}).label || '')) + (L.length ? L.map(d => `<button type="button" role="menuitem" data-cro="${esc(d.id)}" class="${cur && cur.id === d.id ? 'on' : ''}">${esc(d.title || 'Ohne Titel')}<small>${esc(relTime(d.updatedAt))}</small></button>`).join('') : '<div class="mm-h" style="text-transform:none;letter-spacing:0;font-weight:500">Noch keine gespeicherten Stunden</div>')
      + SEP + it('btn-lib', ICON.folder, 'Alle Stunden …') + it('btn-new', ICON.plus, 'Neue Stunde'); }
  if (kind === 'ab') { const P = state.sheet; if (!P) return ''; const A = stABs();
    return H('Arbeitsblätter dieser Stunde') + A.map(x => `<button type="button" role="menuitem" data-crab="${x.k}" class="${x.k === (P.abActive || 0) ? 'on' : ''}"><b style="margin-right:8px">${esc(abLabel(x.meta, x.k))}</b>${esc(plainText(x.meta.title || '') || 'ohne Titel')}</button>`).join('')
      + SEP + `<button type="button" role="menuitem" data-cra="abx-add"><span class="mm-i">${ICON.plus}</span>Weiteres Arbeitsblatt</button>` + (A.length > 1 ? `<button type="button" role="menuitem" data-cra="abx-out"><span class="mm-i">${ICON.save}</span>Ganze Stunde ausgeben</button>` : ''); }
  const n = (typeof FO !== 'undefined' && FO.threads) ? FO.threads.filter(foUnread).length : 0;
  return H('Werkzeuge') + it('btn-tafel', ICON.tafel, 'Tafel öffnen') + (isPhone() ? it('btn-rlp', ICON.rlp, 'Rahmenlehrplan') : '') + it('btn-forum', ICON.forum, 'Lehrerzimmer' + (n ? ` <em class="fo-badge" style="margin-left:6px">${n > 9 ? '9+' : n}</em>` : ''))
    + SEP + it('btn-set', ICON.set, 'Einstellungen') + it('btn-help', '<b>?</b>', 'Hilfe und Kniffe') + `<button type="button" role="menuitem" data-cra="keys"><span class="mm-i"><b>⌨</b></span>Tastenkürzel<span class="mm-k">?</span></button>` + (isPhone() ? it('btn-saveas', ICON.save, 'Speichern unter …') : '')
    + (vis('btn-login') ? it('btn-login', ICON.login, 'Anmelden') : '') + SEP + it('btn-coffee', ICON.coffee, 'Einen Kaffee spendieren');
}
let MM_KIND = 'mehr';
const mmAnchor = k => k === 'mehr' ? $('#btn-mmore') : document.querySelector(`[data-mmk="${k}"]`);
function mmoreToggle(open, kind) {
  const p = $('#mmore-pop'); if (!p) return; kind = kind || (open === false ? MM_KIND : 'mehr');
  const same = !p.hidden && MM_KIND === kind; const on = open === undefined ? !same : open;
  document.querySelectorAll('[data-mmk], #btn-mmore').forEach(x => x.setAttribute('aria-expanded', 'false'));
  if (on) { const b = mmAnchor(kind); if (!b) return; MM_KIND = kind; p.innerHTML = mmoreHTML(kind); p.dataset.kind = kind; const r = b.getBoundingClientRect();
    p.style.top = (r.bottom + 6) + 'px'; if (kind === 'kl' || kind === 'st' || kind === 'ab') { p.style.left = Math.max(8, r.left) + 'px'; p.style.right = 'auto'; } else { p.style.right = Math.max(8, innerWidth - r.right) + 'px'; p.style.left = 'auto'; }
    b.setAttribute('aria-expanded', 'true'); }
  p.hidden = !on; if (on) { const f = p.querySelector('button.on') || p.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
}
// Pfad oben: Klasse › Stunde › Arbeitsblatt
function crumbsRender() {
  const kl = $('#cr-kl'), st = $('#cr-st'), ab = $('#cr-ab'); if (!kl) return; const CH = '<svg class="cr-ch" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';
  const k = KL(state.klasse) || {}; kl.innerHTML = `<i class="cr-dot" style="background:${(ACCENTS[k.accent] || ACCENTS.tinte).c}"></i><span>${esc(k.label || 'Klasse')}</span>${CH}`;
  const P = state.sheet; st.hidden = ab.hidden = !P; if (!P) return;
  st.innerHTML = `<span>${esc(plainText(stTitle(P) || '') || 'Ohne Titel')}</span>${CH}`;
  const A = stABs(), x = A[P.abActive || 0] || A[0]; const t = plainText(x.meta.title || ''); const showT = A.length > 1 && t && t !== plainText(stTitle(P) || '');
  ab.innerHTML = `<b class="cr-ab">${esc(abLabel(x.meta, x.k))}</b>${showT ? `<span>${esc(t)}</span>` : ''}${A.length > 1 ? `<small style="color:var(--muted);font-weight:600">${(P.abActive || 0) + 1}/${A.length}</small>` : ''}${CH}`;
}
// Zurück-Geste auf dem Handy: erst Fenster schließen, dann von der Vorschau zurück zum Bearbeiten
function backClose() {
  if (FO.open) { if (FO.view !== 'list') { foKeep(); FO.view = 'list'; FO.edit = ''; foRender(); } else forumClose(); return true; }
  if (ADM.open) { admClose(); return true; }
  if (document.getElementById('don-ov')) { document.getElementById('don-ov').remove(); return true; }
  if (typeof tour !== 'undefined' && tour.i >= 0) { tourEnd(); return true; }
  if (!$('#mmore-pop').hidden) { mmoreToggle(false); return true; }
  if (!$('#fach-pop').hidden) { toggleFachPop(false); return true; }
  if (PVT && PVT.ins != null) { pvInsClose(); return true; }
  if (rlpv.open) { rlpClose(); return true; }
  if (state.dz) { dzClose(); return true; }
  if (gl.open) { closeGloss(); return true; }
  if (state.bkOpen) { bkClose(); return true; }
  if (state.dlg && !state.needSetup) { closeDlg(); return true; }
  if (state.libOpen) { state.libOpen = false; renderLib(); return true; }
  if (hmS.open) { homeClose(); return true; }
  if (state.area === 'einst') { setArea(state.prevArea && state.prevArea !== 'einst' ? state.prevArea : 'blatt'); return true; }
  if (state.view === 'preview') { setView('edit'); return true; }
  return false;
}
function mobileInit() {
  const bar = $('#mbar');
  bar.addEventListener('click', e => { const b = e.target.closest('[data-mb]'); if (!b) return; const k = b.dataset.mb; if (window.__hdShow) window.__hdShow();
    if (k === 'edit' || k === 'preview') { if (hmS.open) homeClose(); setView(k); window.scrollTo({ top: 0 }); return; }
    if (k === 'add') { if (hmS.open) homeClose(); if ((state.area || 'blatt') !== 'blatt' && state.area !== 'extras') setArea('blatt'); setView('edit'); bkOpen(); setTimeout(() => { const q = document.querySelector('#editor .bk-q, #editor .bk input, #editor [data-bk-q]'); const box = q && (q.closest('.bk') || q); if (box) box.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 80); return; }
    if (k === 'out') { const o = $('#btn-out'); if (o) o.click(); } });
  $('#btn-mmore').addEventListener('click', e => { e.stopPropagation(); mmoreToggle(undefined, 'mehr'); });
  document.querySelectorAll('[data-mmk]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); mmoreToggle(undefined, b.dataset.mmk); }));
  $('#mmore-pop').addEventListener('click', async e => { e.stopPropagation();
    const b = e.target.closest('[data-mm], [data-crk], [data-cro], [data-crab], [data-cra]'); if (!b) return; mmoreToggle(false);
    if (b.dataset.mm) { const t = document.getElementById(b.dataset.mm); if (t) t.click(); return; }
    if (b.dataset.crk) { if (b.dataset.crk !== state.klasse) switchKlasse(b.dataset.crk); return; }
    if (b.dataset.cro) { const d = (state.lib || []).find(x => x.id === b.dataset.cro); if (d && (!state.sheet || state.sheet.id !== d.id)) { if (hmS.open) homeClose(); await openById(d.id); } return; }
    if (b.dataset.crab != null) { abGo(+b.dataset.crab); return; }
    if (b.dataset.cra === 'klassen') { openKlassen(false); return; }
    if (b.dataset.cra === 'keys') { keysOpen(); return; }
    if (b.dataset.cra === 'fass') { openFass(); return; }
    if (b.dataset.cra) abAct(b.dataset.cra, b); });
  document.addEventListener('click', e => { const p = $('#mmore-pop'); if (p && !p.hidden && !e.target.closest('#mmore-pop, #btn-mmore, [data-mmk]')) mmoreToggle(false); });
  // Zurück-Geste: eigener Eintrag im Verlauf, solange keine Freigabe- oder Mappen-Adresse offen ist
  if (!location.hash && !DG_VIEW && !MAPPE_LOCK && window.history && history.pushState) {
    try { history.replaceState({ abw: 0 }, ''); history.pushState({ abw: 1 }, ''); } catch {}
    window.addEventListener('popstate', () => { if (!isNarrow()) { try { history.pushState({ abw: 1 }, ''); } catch {} return; } if (backClose()) { try { history.pushState({ abw: 1 }, ''); } catch {} } else history.back(); });
  }
  mbarSync();
}
async function rlpOpen() { rlpv.open = true; rlpv.err = ''; await rlpLoad(); rlpRender(); if (!rlpv.rec) rlpAutoFetch(); }
// Ohne gespeicherte PDF einmal versuchen, sie selbst zu laden (geht nur, wenn der Server das erlaubt); dann gibt es Suche und „Stelle merken“
async function rlpAutoFetch() {
  const { d } = rlpSel(); if (!/\.pdf$/i.test(d[2]) || rlpAutoFetch.tried[d[0]]) return; rlpAutoFetch.tried[d[0]] = 1;
  try { const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 20000); const r = await fetch(d[2], { mode: 'cors', signal: ac.signal }); clearTimeout(to);
    if (!r.ok) return; const b = await r.blob(); if (b.size < 20000 || !/pdf/i.test(b.type || 'application/pdf')) return;
    await OFF.set('rlp:' + d[0], { name: d[2].split('/').pop(), at: Date.now(), blob: b }); if (rlpv.open && rlpv.doc === d[0]) { await rlpLoad(); rlpRender(); }
  } catch {}
}
rlpAutoFetch.tried = {};
function rlpClose() { rlpPosSave(); rlpv.open = false; rlpRender(); if (rlpv.url) { URL.revokeObjectURL(rlpv.url); rlpv.url = ''; } }
async function rlpClick(e) {
  const a = e.target.closest('[data-rlp]'); if (!a) return; const k = a.dataset.rlp;
  if (k === 'x') return rlpClose();
  if (k === 'st') { rlpSave({ st: a.dataset.v, d: '' }); await rlpLoad(); return rlpRender(); }
  if (k === 'del') { await OFF.del('rlp:' + rlpv.doc); rpv.key = ''; await rlpLoad(); return rlpRender(); }
  if (k === 'hx') return rlpJump(rpv.hi + 1);
  if (k === 'hp') return rlpJump(rpv.hi - 1);
  if (k === 'zi' || k === 'zo') { const host = document.getElementById('rlp-view'); const f = host ? host.scrollTop / Math.max(1, host.scrollHeight) : 0; rpv.zoom = Math.max(0.5, Math.min(3, rpv.zoom * (k === 'zi' ? 1.25 : 0.8))); await rlpViewer(); rpv.pages.forEach((_, j) => rlpMarks(j + 1)); if (host) host.scrollTop = f * host.scrollHeight; return; }
}
async function rlpChange(e) {
  if (e.target.matches('[data-rlp-doc]')) { rlpSave({ d: e.target.value }); await rlpLoad(); return rlpRender(); }
  if (e.target.matches('[data-rlp-file]')) rlpImport(e.target.files[0]);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && rlpv.open) { e.preventDefault(); e.stopImmediatePropagation(); rlpClose(); } }, true);

