/* ================= Stunde: ein oder mehrere Arbeitsblätter =================
   Das gespeicherte Dokument ist die Stunde. Das aktive AB liegt wie bisher in meta (nr, title, topic, dg, paper), blocks und zrefs;
   weitere ABs liegen in abs[k] (aktives Fach: { id, active: true }). Kurs, Design, Anrede, Tafelkarten, Verlaufsplan usw. gelten für die ganze Stunde. */
const AB_KEYS = ['nr', 'title', 'topic', 'dg', 'paper', 'par'];
const stTitle = sh => (sh && sh.abs && sh.stunde && String(sh.stunde.title || '').trim()) || (sh && sh.meta && sh.meta.title) || 'Ohne Titel';
const stNr = sh => (!sh.abs || !sh.abActive ? sh.meta.nr : ((sh.abs[0] && sh.abs[0].meta) || {}).nr) || '';
function abNorm(sh) {
  if (!sh) return sh;
  if (!Array.isArray(sh.abs) || sh.abs.length < 2) { delete sh.abs; sh.abActive = 0; return sh; }
  sh.abActive = Math.min(Math.max(0, +sh.abActive || 0), sh.abs.length - 1);
  sh.abs = sh.abs.map((a, i) => { a = a && typeof a === 'object' ? a : {}; if (!a.id) a.id = 'ab' + uid(); if (i === sh.abActive) return { id: a.id, active: true }; if (!Array.isArray(a.blocks)) a.blocks = []; if (!a.meta || typeof a.meta !== 'object') a.meta = {}; if (!Array.isArray(a.zrefs)) a.zrefs = []; delete a.active; return a; });
  if (!sh.stunde || typeof sh.stunde !== 'object') sh.stunde = { title: sh.meta.title || '' };
  return sh;
}
const abPick = m => { const o = {}; AB_KEYS.forEach(k => { if (m[k] !== undefined) o[k] = m[k]; }); return o; };
function abMeta(k) { const P = state.sheet; if (!P.abs || k === P.abActive) return P.meta; const base = { ...P.meta }; AB_KEYS.forEach(x => delete base[x]); return { ...base, ...(P.abs[k].meta || {}) }; }
function abSwitch(k, quiet) {
  const P = state.sheet; if (!P || !P.abs) return; k = Math.min(Math.max(0, k), P.abs.length - 1); if (k === P.abActive) return;
  if (!quiet && hist.timer) histCommit();
  const cur = P.abActive; P.abs[cur] = { id: P.abs[cur].id, meta: abPick(P.meta), blocks: P.blocks, zrefs: Array.isArray(P.zrefs) ? P.zrefs : [] };
  const nx = P.abs[k]; P.blocks = Array.isArray(nx.blocks) ? nx.blocks : []; P.zrefs = Array.isArray(nx.zrefs) ? nx.zrefs : [];
  AB_KEYS.forEach(x => { if (nx.meta && nx.meta[x] !== undefined) P.meta[x] = nx.meta[x]; else delete P.meta[x]; });
  if (P.meta.title === undefined) P.meta.title = '';
  P.abs[k] = { id: nx.id, active: true }; P.abActive = k;
  if (!quiet) hist.last = histSig(P);
}
// fn läuft mit AB k als aktivem AB (synchron); danach ist alles wie vorher
function withAB(k, fn) { const P = state.sheet; if (!P || !P.abs || k === P.abActive) return fn(); const cur = P.abActive; abSwitch(k, true); try { return fn(); } finally { abSwitch(cur, true); } }
function stABs() { const P = state.sheet; if (!P.abs) return [{ k: 0, id: 'ab0', meta: P.meta, blocks: P.blocks }]; return P.abs.map((a, k) => (k === P.abActive ? { k, id: a.id, meta: P.meta, blocks: P.blocks } : { k, id: a.id, meta: abMeta(k), blocks: a.blocks || [] })); }
const stBlocks = () => stABs().flatMap(x => x.blocks);
const abLabel = (m, k) => (String(m.nr || '').trim() ? 'AB ' + m.nr : 'AB ' + (k + 1));
function abBarHTML() {
  const P = state.sheet; const A = stABs(); const multi = A.length > 1;
  return `<div class="ab-bar">${multi ? `<label class="ab-st"><span>Stunde</span><input type="text" data-st="title" value="${esc(stTitle(P))}" placeholder="Titel der Stunde" aria-label="Titel der Stunde"></label>` : ''}
    <div class="ab-tabs" role="tablist" aria-label="Arbeitsblätter dieser Stunde">${A.map(x => `<button type="button" role="tab" class="ab-tab" data-act="abx-go" data-abk="${x.k}" aria-selected="${x.k === (P.abActive || 0)}" title="${esc(plainText(x.meta.title || '') || 'ohne Titel')}"><b>${esc(abLabel(x.meta, x.k))}</b><span>${esc(plainText(x.meta.title || '') || 'ohne Titel')}</span></button>`).join('')}<button type="button" class="ab-add" data-act="abx-add" title="Weiteres Arbeitsblatt in dieser Stunde anlegen, z. B. Hausaufgabe oder Differenzierung">+ Arbeitsblatt</button></div>
    ${multi ? `<label class="ab-par" title="Arbeitsteilig: Nebeneinanderliegende ABs mit diesem Haken laufen gleichzeitig. In der Präsentation stehen ihre Aufgaben auf einer gemeinsamen Folie, je AB eine Spalte."><input type="checkbox" data-act="abx-par"${P.meta.par ? ' checked' : ''}> <span><b>Arbeitsteilig</b> – läuft parallel zu ${(() => { const k = P.abActive || 0, nb = A.filter(x => x.k !== k && Math.abs(x.k - k) === 1 && x.meta.par); return nb.length ? nb.map(x => esc(abLabel(x.meta, x.k))).join(' und ') : 'den Nachbar-ABs mit Haken'; })()}</span></label>` : ''}
    <div class="ab-acts">${multi ? `<button class="link" type="button" data-act="abx-left"${P.abActive ? '' : ' disabled'}>← nach vorn</button><button class="link" type="button" data-act="abx-right"${P.abActive < A.length - 1 ? '' : ' disabled'}>nach hinten →</button><button class="link" type="button" data-act="abx-dup">Duplizieren</button><button class="link danger" type="button" data-act="abx-del">Dieses AB löschen</button>` : '<small class="hint">Eine Stunde kann mehrere Arbeitsblätter haben.</small>'}${isBasis() ? '' : '<button class="link" type="button" data-act="abx-out" style="margin-left:auto" title="Alle ABs, Tafelkarten, Tafelbild, A3-Vorlagen und Präsentation in einen Ordner">Ganze Stunde ausgeben</button>'}</div></div>`;
}
function abGo(k) {
  const P = state.sheet; if (!P.abs || k === P.abActive) return; abSwitch(k);
  state.sel = null; state.closed = defaultClosed(); state.taskOpen = new Set(); closeGloss(); closeZl(); closeMenu();
  renderEditor(); $('#editor').scrollTop = 0; clearTimeout(renderTimer); renderPreview();
}
function abAdd() {
  const P = state.sheet; if (hist.timer) histCommit();
  if (!P.abs) { P.abs = [{ id: 'ab' + uid(), active: true }]; P.abActive = 0; P.stunde = { title: P.meta.title || '' }; }
  const n = P.abs.length + 1; const nr0 = String(abMeta(0).nr || '').trim();
  const nr = /^\d+$/.test(nr0) ? nr0 + String.fromCharCode(96 + n) : '';
  P.abs.push({ id: 'ab' + uid(), meta: { nr, title: 'Arbeitsblatt ' + n, topic: '' }, blocks: [newBlock('tasks')], zrefs: [] });
  abSwitch(P.abs.length - 1, true); state.sel = 'meta'; state.closed = new Set(cardIds().filter(x => x !== 'meta')); state.taskOpen = new Set();
  changed(true); clearTimeout(renderTimer); renderPreview(); toast(`${abLabel(P.meta, P.abActive)} angelegt · Titel und Nummer oben im Kopf`, 'Rückgängig', histUndo);
}
function abAct(act, a) {
  const P = state.sheet;
  if (act === 'abx-go') { abGo(+a.dataset.abk); return; }
  if (act === 'abx-add') { abAdd(); return; }
  if (act === 'abx-out') { openOut(); if (state.dlg) { state.dlg.whole = true; renderDlg(); } return; }
  if (!P.abs) return; const k = P.abActive; if (hist.timer) histCommit();
  if (act === 'abx-par') { if (a.checked) P.meta.par = true; else delete P.meta.par; changed(true); clearTimeout(renderTimer); renderPreview(); return; }
  if (act === 'abx-left' || act === 'abx-right') { const j = act === 'abx-left' ? k - 1 : k + 1; if (j < 0 || j >= P.abs.length) return; [P.abs[k], P.abs[j]] = [P.abs[j], P.abs[k]]; P.abActive = j; changed(true); clearTimeout(renderTimer); renderPreview(); return; }
  if (act === 'abx-dup') {
    const c = clone({ meta: abPick(P.meta), blocks: P.blocks }); c.id = 'ab' + uid(); c.zrefs = []; c.blocks.forEach(b => { b.id = 'b' + uid(); }); c.meta.title = (c.meta.title || 'Arbeitsblatt') + ' (Kopie)'; delete c.meta.dg;
    P.abs.splice(k + 1, 0, c); abSwitch(k + 1, true); state.sel = null; changed(true); clearTimeout(renderTimer); renderPreview(); toast('Arbeitsblatt dupliziert', 'Rückgängig', histUndo); return;
  }
  if (act === 'abx-del') {
    const lab = abLabel(P.meta, k);
    abSwitch(k > 0 ? k - 1 : 1, true); const cur = P.abActive; P.abs.splice(k, 1); if (cur > k) P.abActive = cur - 1;
    if (P.abs.length === 1) { delete P.abs; P.abActive = 0; delete P.stunde; }
    state.sel = null; changed(true); clearTimeout(renderTimer); renderPreview(); toast(`${lab} gelöscht`, 'Rückgängig', histUndo);
  }
}


/* Seite als neues AB abtrennen: alle Bausteine, die auf dieser Seite der Vorschau beginnen, wandern in ein neues AB direkt dahinter.
   „arbeitsteilig“ markiert beide ABs als parallel – ihre Aufträge stehen dann nebeneinander auf der Folie. */
function pageBids() {
  const seen = new Set();
  return [...document.querySelectorAll('#pages .page')].map(pg => { const L = []; pg.querySelectorAll('[data-bid]').forEach(n => { const id = n.dataset.bid; if (!id || seen.has(id) || L.includes(id)) return; L.push(id); }); L.forEach(id => seen.add(id)); return L; });
}
// Aufgaben einer Seite arbeitsteilig zum Aufgabenbaustein davor stellen (z. B. Fenster-/Wandseite): gleiche Nummern, auf der Folie nebeneinander
function pageParTask(pi) {
  const P = state.sheet; const on = new Set(pageBids()[pi] || []);
  const bi = P.blocks.findIndex(b => b.type === 'tasks' && on.has(b.id)); if (bi < 0) return null;
  return P.blocks.slice(0, bi).some(b => b.type === 'tasks') ? P.blocks[bi] : null;
}
function parToggle(b) {
  if (!b) return; if (hist.timer) histCommit();
  b.par = !b.par; changed(true); clearTimeout(renderTimer); renderPreview(); if (typeof renderEditor === 'function') renderEditor();
  toast(b.par ? 'Arbeitsteilig: Diese Aufgaben laufen parallel zu den Aufgaben davor – gleiche Nummern, auf der Folie nebeneinander' : 'Nicht mehr arbeitsteilig – die Aufgaben zählen wieder weiter', 'Rückgängig', histUndo);
}
// Knopf beim Überfahren einer Seite
(() => {
  let cur = -1, hideT = 0;
  const IC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="7" height="16" rx="1.4"/><rect x="13.5" y="4" width="7" height="16" rx="1.4"/></svg>';
  const btn = () => { let b = document.getElementById('pg-split'); if (b) return b;
    b = document.createElement('div'); b.id = 'pg-split'; b.hidden = true;
    b.innerHTML = '<button type="button" class="pgs-b" aria-pressed="false"></button>';
    document.body.appendChild(b);
    b.addEventListener('mouseenter', () => clearTimeout(hideT)); b.addEventListener('mouseleave', () => { hideT = setTimeout(hide, 300); });
    b.addEventListener('click', e => { if (!e.target.closest('.pgs-b') || cur < 0) return; const t = pageParTask(cur); parToggle(t); paint(t); });
    return b; };
  const paint = t => { const b = btn().querySelector('.pgs-b'); const on = !!(t && t.par);
    b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on);
    b.innerHTML = IC + '<span>' + (on ? 'Arbeitsteilig ✓' : 'Arbeitsteilig zu den Aufgaben davor') + '</span>';
    b.title = on ? 'Die Aufgaben dieser Seite laufen parallel zu den Aufgaben davor (gleiche Nummern, auf der Folie nebeneinander) · klicken zum Aufheben' : 'Die Aufgaben dieser Seite laufen parallel zu den Aufgaben davor, z. B. Fenster- und Wandseite: gleiche Nummern, auf der Folie nebeneinander'; };
  const top0 = () => { const sc = document.getElementById('preview-scroll'); return sc ? sc.getBoundingClientRect().top : 0; };
  const hide = () => { const b = document.getElementById('pg-split'); if (b) b.hidden = true; cur = -1; };
  const place = pg => { const b = btn(), r = pg.getBoundingClientRect(); b.style.left = Math.max(8, r.right - 8) + 'px'; b.style.top = Math.max(top0() + 8, r.top + 8) + 'px'; };
  document.addEventListener('mouseover', e => {
    const pg = e.target.closest && e.target.closest('#pages .page');
    if (!pg) { if (cur >= 0 && !(e.target.closest && e.target.closest('#pg-split'))) { clearTimeout(hideT); hideT = setTimeout(hide, 300); } return; }
    const pages = [...document.querySelectorAll('#pages .page')];
    if (state.out !== 'blatt' || pages.length < 2) return hide();
    clearTimeout(hideT); const i = pages.indexOf(pg); const b = btn(); if (i === cur && !b.hidden) return;
    const t = pageParTask(i); if (!t) return hide();
    cur = i; paint(t); place(pg); b.hidden = false;
  });
  // beim Scrollen mitwandern statt verschwinden
  document.addEventListener('scroll', () => { const b = document.getElementById('pg-split'); if (!b || b.hidden || cur < 0) return; const pg = document.querySelectorAll('#pages .page')[cur]; if (!pg) return hide(); const r = pg.getBoundingClientRect(); if (r.bottom < top0() + 40 || r.top > innerHeight - 40) return hide(); place(pg); }, true);
})();
