/* ===================== Folien wie in PowerPoint =====================
   Links die Folienleiste (Abschnitte = Phasen), in der Mitte die große Folie, darunter die Bearbeitung der Folie,
   oben ein Menüband (Start, Einfügen, Übergänge, Bildschirmpräsentation). Folien aus dem Arbeitsblatt bleiben verknüpft,
   bis man die Verknüpfung für eine einzelne Folie ausdrücklich löst. */
const PP = { cur: 0, tab: 'start', S: [], edit: false };
const PP_TW = 196;
const ppOn = () => state.area === 'pres' && state.out === 'pres' && !state.ppList && !isNarrow();
const PP_KIND = { title: 'Titelfolie', abhead: 'Zwischentitel', tasks: 'Aufgaben', mat: 'Material', tafel: 'Tafelbild', info: 'Infokasten', quote: 'Zitat', image: 'Bild', table: 'Tabelle', phr: 'Formulierungshilfen', match: 'Zuordnen', qr: 'QR-Code', step: 'Eigene Folie' };
const PP_IC = {
  neu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M12 8.5v5M9.5 11h5"/></svg>',
  dup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  hide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 4l16 16"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  unlink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/><path d="M4 4l16 16"/></svg>',
  ab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  playh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pptx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9.5 17v-6h2.2a1.8 1.8 0 0 1 0 3.6H9.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  tafel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M8 21l2-4.5M16 21l-2-4.5"/></svg>',
  folie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></svg>'
};
function ppSlides() {
  let S = []; PP.edit = true; try { S = presSlides(true); } catch (e) { console.error(e); } finally { PP.edit = false; }
  PP.S = S; if (PP.cur >= S.length) PP.cur = Math.max(0, S.length - 1); if (PP.cur < 0) PP.cur = 0; return S;
}
const ppOwn = s => !!s && s.k === 'step';
const ppBlockOf = s => (!s ? null : s.b || (s.bid ? stBlocks().find(x => x.id === s.bid) : null));
const ppABof = blk => (blk ? stABs().find(A => A.blocks.includes(blk)) || null : null);
const ppCanUnlink = s => !!s && ['title', 'tasks', 'mat', 'info', 'quote', 'image'].includes(s.k);
const ppSlideBox = (x, i, bar) => `<div class="pr-slide pr-k-${x.k}${bar.length ? ' has-bar' : ''}"><div class="pr-accent"></div>${presSlideHTML(x, bar)}${presBarHTML(bar, x.bi)}<div class="pr-foot"><span></span><span>${i + 1}</span></div></div>`;
function ppFit(root, S) { setAccent(root, state.sheet.meta); root.querySelectorAll('.pr-slide').forEach(sl => { const i = +(sl.closest('[data-i]') || {}).dataset?.i; const x = S[Number.isFinite(i) ? i : PP.cur]; const f = sl.querySelector('.pr-fit'), body = sl.querySelector('.pr-body'); try { if (x && f && body && PR_MAX[x.k]) fitUp(f, body, PR_MAX[x.k]); tfDraw(sl); phbFit(sl); } catch {} }); }
function ppStripHTML() {
  const S = ppSlides(); const bar = S.bar || []; let h = '', last = null;
  S.forEach((x, i) => {
    const ph = x.k === 'title' ? '' : x.ph || '';
    if (i > 0) h += `<div class="pp-gap" data-act="pp-gal" data-after="${i - 1}"><button type="button" class="pp-plus" data-act="pp-gal" data-after="${i - 1}" title="Neue Folie zwischen ${i} und ${i + 1}" aria-label="Neue Folie nach Folie ${i}">+</button></div>`;
    if (ph && ph !== last && PHASEN[ph]) h += `<div class="pp-sec" style="--phc:${PHASEN[ph].c}">${esc(PHASEN[ph].label)}</div>`;
    if (ph) last = ph;
    h += `<div class="pp-row" data-i="${i}"><span class="pp-n">${i + 1}</span><button type="button" class="pp-th${i === PP.cur ? ' on' : ''}" data-act="pp-sel" data-i="${i}" aria-label="Folie ${i + 1}: ${esc(PP_KIND[x.k] || 'Folie')}"${i === PP.cur ? ' aria-current="true"' : ''}>${ppSlideBox(x, i, bar)}${ppOwn(x) ? '' : '<em class="pp-ab" title="Mit dem Arbeitsblatt verknüpft">AB</em>'}</button></div>`;
  });
  return `<div class="pp-strip" id="pp-strip" style="--k:${(PP_TW / 1600).toFixed(4)};--tw:${PP_TW}px">${h || '<div class="pv-empty" style="padding:20px 8px">Noch keine Folien. Aufgaben im Arbeitsblatt kommen von selbst auf die Folien.</div>'}<button type="button" class="pp-new" data-act="pp-gal">+ Neue Folie</button></div>
    <div class="pp-foot"><button type="button" class="link" data-act="pp-list">Liste mit Zeitplan und Folienauswahl</button></div>`;
}
function ppAfterStrip() { const st = document.getElementById('pp-strip'); if (!st) return; ppFit(st, PP.S); const on = st.querySelector('.pp-th.on'); if (on) { const r = on.getBoundingClientRect(), er = $('#editor').getBoundingClientRect(); if (r.top < er.top + 40 || r.bottom > er.bottom) on.scrollIntoView({ block: 'nearest' }); } }
function ppStage(host) {
  const S = ppSlides(); const bar = S.bar || []; const x = S[PP.cur];
  if (!x) { host.innerHTML = '<div class="pv-empty">Noch keine Folie. Über „Neue Folie“ legst du eine an; Aufgaben aus dem Arbeitsblatt erscheinen von selbst.</div>'; return 0; }
  const sc = $('#preview-scroll'); const w = Math.max(320, Math.min(sc.clientWidth - 48, (sc.clientHeight - 36) * 16 / 9, 1280));
  host.innerHTML = `<div class="pp-stage"><div class="pp-big" style="--k:${(w / 1600).toFixed(4)};--tw:${Math.round(w)}px" data-i="${PP.cur}">${ppSlideBox(x, PP.cur, bar)}</div></div>`;
  ppFit(host, S);
  // Vorschaubild der Folie links gleich mitziehen (beim Tippen wird die Leiste sonst nicht neu gezeichnet)
  const th = document.querySelector(`#pp-strip .pp-th[data-i="${PP.cur}"]`); if (th) { th.innerHTML = ppSlideBox(x, PP.cur, bar) + (ppOwn(x) ? '' : '<em class="pp-ab" title="Mit dem Arbeitsblatt verknüpft">AB</em>'); const row = th.closest('.pp-row'); if (row) ppFit(row, S); }
  return S.length;
}
function ppPhOf(s) { const blk = ppBlockOf(s); if (!s || !blk) return null; if (s.k === 'tasks') { const P0 = s.items.map(x => itPh(x.it)); return P0.every(p => p === P0[0]) ? P0[0] : '__mix'; } return itPh(blk); }
function ppPhaseHTML(s) {
  if (!s || s.k === 'title' || s.k === 'abhead' || s.k === 'qr' || !ppBlockOf(s)) return '';
  const cur = ppPhOf(s);
  return `<div class="pp-ph" role="group" aria-label="Phase dieser Folie"><span>Phase</span>${Object.entries(PHASEN).map(([k, x]) => `<button type="button" data-act="pp-ph" data-v="${k}" style="--phc:${x.c}" aria-pressed="${cur === k}">${x.label}</button>`).join('')}<button type="button" class="pp-ph0" data-act="pp-ph" data-v="" aria-pressed="${!cur}">keine</button>${cur === '__mix' ? '<small>gemischt</small>' : ''}</div>`;
}
function ppSetPh(v) {
  const s = PP.S[PP.cur]; const blk = ppBlockOf(s); if (!blk) return; v = PHASEN[v] ? v : '';
  if (s.k === 'tasks') s.items.forEach(x => { if (v) x.it.ph = v; else delete x.it.ph; }); else { if (v) blk.ph = v; else delete blk.ph; }
  changed(true); ppRefresh(true);
}
function ppPanelHTML() {
  const s = PP.S[PP.cur]; if (!s) return '';
  return ppPhaseHTML(s) + ppPanelBody(s);
}
function ppPanelBody(s) {
  if (ppOwn(s)) {
    const b = s.b; const i = state.sheet.blocks.indexOf(b); if (i < 0) return '<div class="pp-pn-h"><b>Diese Folie gehört zu einem anderen Arbeitsblatt.</b></div>';
    return `<div class="pp-pn-h"><span class="pp-badge own">${PP_IC.folie}Eigene Folie</span><b>Folie ${PP.cur + 1} · ${esc(stepLabel(b))}</b><small>steht nur in der Präsentation, nicht auf dem Arbeitsblatt</small></div><div class="card pp-card" data-bid="${b.id}"><div class="card-b">${stepEditor(b, true)}</div></div>`;
  }
  const blk = ppBlockOf(s), A = ppABof(blk); const lab = A ? abLabel(A.meta, A.k) : 'dem Arbeitsblatt';
  let what = PP_KIND[s.k] || 'Folie';
  if (s.k === 'tasks') { const nos = s.items.map(x => x.no).filter(Boolean); what = nos.length > 1 ? `Aufgaben ${nos[0]}–${nos[nos.length - 1]}` : nos.length ? `Aufgabe ${nos[0]}` : 'Auftrag'; }
  if (s.k === 'mat') what = `${s.tag || 'Material'}${s.of > 1 ? ` (Teil ${s.part} von ${s.of})` : ''}`;
  const can = ppCanUnlink(s);
  const eh = s.k === 'tasks' ? s.items.flatMap(x => ehLines(x.it)) : [];
  return `<div class="pp-link"><span class="pp-link-i">${PP_IC.link}</span><div class="pp-link-t"><b>Verknüpft mit ${esc(lab)} · ${esc(what)}</b><span>Änderungen am Arbeitsblatt erscheinen auf dieser Folie automatisch. Willst du nur die Folie anders haben, löse die Verknüpfung für diese eine Folie.</span></div></div>
    <div class="pp-link-a"><button class="btn sm" type="button" data-act="pp-ab">${PP_IC.ab}Im Arbeitsblatt bearbeiten</button>${can ? `<button class="btn sm" type="button" data-act="pp-unlink">${PP_IC.unlink}Verknüpfung lösen und hier bearbeiten …</button>` : '<small class="hint">Diese Art Folie lässt sich nur im Arbeitsblatt bearbeiten.</small>'}<button class="btn sm ghost" type="button" data-act="pp-hide">${PP_IC.hide}Von den Folien nehmen</button></div>
    ${eh.length ? `<div class="pp-notes"><b>Erwartung (Notizen in der Referentenansicht)</b><ul>${eh.map(z => `<li>${inlineHTML(z)}</li>`).join('')}</ul></div>` : ''}`;
}
function ppPanelRender(force) {
  const p = document.getElementById('pp-panel'); if (!p) return;
  if (!ppOn()) { p.hidden = true; p.innerHTML = ''; return; }
  const a = document.activeElement; if (!force && a && p.contains(a) && (a.matches('input,textarea,select') || a.isContentEditable)) return;
  p.hidden = false; p.innerHTML = ppPanelHTML();
}
function ppRibbonHTML() {
  const tabs = [['start', 'Start'], ['ins', 'Einfügen'], ...(ADM.is ? [['ueb', 'Übergänge']] : []), ['show', 'Bildschirmpräsentation']];
  if (!tabs.some(t => t[0] === PP.tab)) PP.tab = 'start';
  const s = PP.S[PP.cur]; const own = ppOwn(s);
  const B = (pv, ic, l, dis, title, extra) => `<button type="button" class="pp-rb${extra || ''}" data-pv="${pv}"${dis ? ' disabled' : ''} title="${esc(title || l)}">${ic}<span>${l}</span></button>`;
  const SEP = '<span class="pp-sep"></span>'; let body = '';
  if (PP.tab === 'start') body = B('pp-gal', PP_IC.neu, 'Neue Folie ▾', false, 'Neue Folie nach der markierten einfügen') + SEP
    + B('pp-dup', PP_IC.dup, 'Duplizieren', !own, own ? 'Folie duplizieren' : 'Nur eigene Folien; Folien aus dem Arbeitsblatt zuerst lösen')
    + B(own ? 'pp-del' : 'pp-hide', own ? PP_IC.del : PP_IC.hide, own ? 'Löschen' : 'Ausblenden', !s, own ? 'Folie löschen' : 'Folie aus der Präsentation nehmen (bleibt auf dem Arbeitsblatt)')
    + B('pp-up', PP_IC.up, 'Früher', !own || PP.cur === 0, 'Folie eine Position nach vorn') + B('pp-down', PP_IC.down, 'Später', !own || PP.cur >= PP.S.length - 1, 'Folie eine Position nach hinten') + SEP
    + B('pp-unlink', PP_IC.unlink, 'Verknüpfung lösen', own || !ppCanUnlink(s), own ? 'Eigene Folien sind nicht verknüpft' : ppCanUnlink(s) ? 'Folie vom Arbeitsblatt lösen und hier bearbeiten' : 'Diese Art Folie lässt sich nur im Arbeitsblatt bearbeiten')
    + B('pp-ab', PP_IC.ab, 'Im Blatt bearbeiten', own || !s, 'Zum Baustein im Arbeitsblatt springen');
  else if (PP.tab === 'ins') body = ZW_KINDS.map(([k, l, d]) => B('pp-ins" data-k="' + k, `<i class="pp-ins-i">${esc(l.slice(0, 1))}</i>`, l, false, d)).join('');
  else if (PP.tab === 'ueb') { const cur = (state.prefs && state.prefs.trans) || 'none'; body = Object.entries(PR_VT).map(([k, l]) => B('pp-trans" data-v="' + k, `<i class="pp-vt pp-vt-${k}"></i>`, l, false, l + ' (für alle Folien)', cur === k ? ' on' : '')).join('') + '<small class="pp-rnote">Gilt für alle Folien und nur in deinem Konto.</small>'; }
  else { const pm = presModeOf(state.sheet.klasse);
    body = B('pres', PP_IC.play, 'Von Beginn an', false, 'Präsentation ab Folie 1 (F5)') + B('pp-here', PP_IC.playh, 'Ab aktueller Folie', !s, 'Präsentation ab der markierten Folie') + SEP
      + B('pp-mode" data-v="folien', PP_IC.folie, 'Ansicht: Folien', false, 'Beim Präsentieren die Folien zeigen', pm === 'folien' ? ' on' : '') + B('pp-mode" data-v="tafel', PP_IC.tafel, 'Ansicht: Tafel', false, 'Beim Präsentieren die Tafel zeigen', pm === 'tafel' ? ' on' : '') + SEP
      + B('pptx', PP_IC.pptx, 'PowerPoint-Datei', false, 'Als .pptx herunterladen') + B('pp-list', PP_IC.list, 'Zeitplan & Auswahl', false, 'Liste mit Phasen, Zeiten, Timern und Folienauswahl'); }
  return `<div class="pp-rib"><div class="pp-tabs" role="tablist" aria-label="Menüband">${tabs.map(([k, l]) => `<button type="button" role="tab" class="pp-tab" data-pv="pp-tab" data-v="${k}" aria-selected="${PP.tab === k}">${l}</button>`).join('')}<span class="pp-tabs-r">Folie ${PP.S.length ? PP.cur + 1 : 0} von ${PP.S.length}</span></div><div class="pp-tools">${body}</div></div>`;
}
function ppRefresh(scroll) { renderEditor(); clearTimeout(renderTimer); renderPreview(); ppPanelRender(true); if (scroll) ppAfterStrip(); }
function ppSelect(i) {
  const S = PP.S.length ? PP.S : ppSlides(); if (!S.length) return; i = Math.max(0, Math.min(S.length - 1, i));
  const blk = ppBlockOf(S[i]), A = ppABof(blk); PP.cur = i;
  if (A && state.sheet.abs && A.k !== (state.sheet.abActive || 0)) { abSwitch(A.k); hist.last = histSig(state.sheet); }
  ppRefresh(true); const th = document.querySelector(`#pp-strip .pp-th[data-i="${PP.cur}"]`); if (th) th.focus({ preventScroll: true });
}
function ppSelectBlock(blk) { const S = ppSlides(); const i = S.findIndex(x => x.b === blk); if (i >= 0) PP.cur = i; }
function ppConfirm(title, text, ok, fn) {
  const ov = document.createElement('div'); ov.className = 'pp-cf-ov';
  ov.innerHTML = `<div class="pp-cf" role="alertdialog" aria-modal="true" aria-labelledby="pp-cf-h"><h3 id="pp-cf-h">${title}</h3><p>${text}</p><div class="pp-cf-a"><button type="button" class="btn" data-cf="no">Abbrechen</button><button type="button" class="btn primary" data-cf="ok">${ok}</button></div></div>`;
  document.body.append(ov); const close = () => { ov.remove(); document.removeEventListener('keydown', key, true); };
  const key = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
  document.addEventListener('keydown', key, true);
  ov.addEventListener('click', e => { const b = e.target.closest('[data-cf]'); if (e.target === ov || (b && b.dataset.cf === 'no')) close(); else if (b) { close(); fn(); } });
  setTimeout(() => { const b = ov.querySelector('[data-cf="ok"]'); if (b) b.focus(); }, 0);
}
// Verknüpfung einer Folie lösen: aus dem Inhalt des Bausteins wird eine eigene Folie (Unterrichtsschritt mit Folie), der Baustein verschwindet von den Folien
function ppUnlinkDo(s) {
  const blk = ppBlockOf(s); const A = s.k === 'title' ? null : ppABof(blk); if (s.k !== 'title' && !A) return;
  const P = state.sheet; snapshot(); let nb = null;
  const off = new Set(Array.isArray(P.meta.presOff) ? P.meta.presOff : []);
  const make = () => {
    const m = state.sheet.meta, blocks = state.sheet.blocks; const n = newBlock('step'); n.tpl = 'frei'; n.pp = true; let at = 0;
    if (s.k === 'title') { Object.assign(n, { fol: 'titel', title: 'Titelfolie', head: plainText(stTitle(P) || m.title || ''), text: plainText(m.topic || '') }); off.add('title'); at = 0; }
    else {
      at = blocks.indexOf(blk) + 1; const b = blk;
      if (s.k === 'tasks') {
        const nos = s.items.map(x => x.no).filter(Boolean); const one = s.items.length === 1;
        Object.assign(n, { fol: 'text', title: one && nos.length ? 'Aufgabe ' + nos[0] : 'Arbeitsauftrag', head: one ? (nos.length ? 'Aufgabe ' + nos[0] : 'Arbeitsauftrag') : nos.length > 1 ? `Aufgaben ${nos[0]}–${nos[nos.length - 1]}` : 'Arbeitsauftrag',
          text: s.items.map(x => (one || !x.no ? '' : x.no + '. ') + tfStr(x.it.text).trim()).join('\n'), eh: s.items.map(x => tfStr(x.it.eh).trim()).filter(Boolean).join('\n') });
        const it0 = s.items[0] && s.items[0].it; if (it0) { n.ph = itPh(it0) || itPh(b) || ''; n.soz = it0.soz || ''; n.min = String(itMin(b) || itMin(it0) || ''); }
        s.items.forEach(x => { const k = b.items.indexOf(x.it); if (k >= 0) off.add(b.id + ':' + k); });
      } else if (s.k === 'mat') { Object.assign(n, { fol: 'text', title: plainText(matTitle(b) || '') || 'Material', head: plainText(matTitle(b) || '') || (s.tag || 'Material'), text: tfStr(b.text) }); delete b.pres; }
      else if (s.k === 'info') { Object.assign(n, { fol: 'text', title: tfStr(b.title).trim() || b.kind || 'Info', head: tfStr(b.title).trim() || b.kind || 'Info', text: tfStr(b.text) }); delete b.pres; }
      else if (s.k === 'quote') { Object.assign(n, { fol: 'zitat', title: 'Zitat', quote: tfStr(b.text), author: tfStr(b.author) }); delete b.pres; }
      else if (s.k === 'image') { Object.assign(n, { fol: 'bild', title: 'Bild', src: b.src, cap: tfStr(b.caption) }); delete b.pres; }
      if (!n.ph && itPh(b)) n.ph = itPh(b);
    }
    blocks.splice(at, 0, n); nb = n;
  };
  if (A && state.sheet.abs && A.k !== (P.abActive || 0)) withAB(A.k, make); else make();
  P.meta.presOff = [...off];
  changed(true); ppSelectBlock(nb); ppRefresh(true);
  toast('Verknüpfung gelöst: Die Folie ist jetzt eine eigene Folie. Das Arbeitsblatt bleibt unverändert.', 'Rückgängig', () => { histUndo(); ppRefresh(true); });
}
function ppHide(s) {
  const P = state.sheet; const off = new Set(Array.isArray(P.meta.presOff) ? P.meta.presOff : []); const blk = ppBlockOf(s);
  if (s.k === 'title') off.add('title');
  else if (s.k === 'abhead') { const A = stABs().find(x => abLabel(x.meta, x.k) === s.lab); if (A) off.add('ab:' + A.id); }
  else if (s.k === 'qr') off.add(P.abs ? 'qr:' + (stABs()[P.abActive || 0] || {}).id : 'qr');
  else if (s.k === 'tasks' && blk) s.items.forEach(x => { const k = blk.items.indexOf(x.it); if (k >= 0) off.add(blk.id + ':' + k); });
  else if (blk) { if (PRES_OPT.has(blk.type)) delete blk.pres; else off.add(blk.id); }
  P.meta.presOff = [...off]; changed(true); ppRefresh(true);
  toast('Folie ausgeblendet. Unter „Bildschirmpräsentation → Zeitplan & Auswahl“ holst du sie zurück.', 'Rückgängig', () => { histUndo(); ppRefresh(true); });
}
function ppMove(dir) {
  const s = PP.S[PP.cur]; if (!ppOwn(s)) return; const t = PP.S[PP.cur + dir]; if (!t) return;
  const blocks = state.sheet.blocks; const b = s.b; const tb = ppBlockOf(t);
  if (t.k === 'title' || t.k === 'abhead') { if (dir > 0) return; blocks.splice(blocks.indexOf(b), 1); blocks.splice(0, 0, b); }
  else { if (!tb || !blocks.includes(tb)) { toast('Folien lassen sich nur innerhalb eines Arbeitsblatts verschieben.'); return; }
    blocks.splice(blocks.indexOf(b), 1); const j = blocks.indexOf(tb); blocks.splice(dir < 0 ? j : j + 1, 0, b); }
  changed(true); ppSelectBlock(b); ppRefresh(true);
}
function ppInsert(k) {
  const s = PP.S[PP.cur]; const blk = ppBlockOf(s); const A = ppABof(blk);
  if (A && state.sheet.abs && A.k !== (state.sheet.abActive || 0)) { abSwitch(A.k); }
  const blocks = state.sheet.blocks; const at = blk && blocks.includes(blk) ? blocks.indexOf(blk) + 1 : (s && (s.k === 'title' || s.k === 'abhead') ? 0 : blocks.length);
  zwNew(k, at); const nb = state.sheet.blocks[at]; if (nb) { nb.pp = true; if (!stepSlideFol(nb) && !tfStr(nb.head).trim()) nb.head = (ZW_KINDS.find(x => x[0] === k) || [0, 'Neue Folie'])[1]; }
  state.zwOpen = null; ppSelectBlock(nb); ppRefresh(true);
}
function ppGal(anchor) {
  const old = document.getElementById('pp-gal'); if (old) { old.remove(); return; }
  const g = document.createElement('div'); g.id = 'pp-gal'; g.className = 'pp-gal'; g.setAttribute('role', 'menu');
  g.innerHTML = `<div class="pp-gal-h">Neue Folie nach Folie ${PP.S.length ? PP.cur + 1 : 0}</div><div class="pp-gal-g">${ZW_KINDS.map(([k, l, d]) => `<button type="button" role="menuitem" data-ppk="${k}"><span class="pp-gal-p pp-gal-${k}"><i></i><i></i><i></i></span><b>${esc(l)}</b><small>${esc(d)}</small></button>`).join('')}</div>`;
  document.body.append(g); const r = anchor.getBoundingClientRect(); g.style.left = Math.max(8, Math.min(innerWidth - g.offsetWidth - 8, r.left)) + 'px'; g.style.top = Math.min(innerHeight - g.offsetHeight - 8, r.bottom + 6) + 'px';
  const close = e => { if (e && g.contains(e.target)) return; g.remove(); document.removeEventListener('mousedown', close, true); };
  setTimeout(() => document.addEventListener('mousedown', close, true), 0);
  g.addEventListener('click', e => { const b = e.target.closest('[data-ppk]'); if (!b) return; close(); ppInsert(b.dataset.ppk); });
  const f = g.querySelector('button'); if (f) f.focus();
}
function ppAct(act, a) {
  const s = PP.S[PP.cur];
  if (act === 'pp-sel') return ppSelect(+a.dataset.i);
  if (act === 'pp-ph') return ppSetPh(a.dataset.v);
  if (act === 'pp-tab') { PP.tab = a.dataset.v; renderOut(); return; }
  if (act === 'pp-gal') { if (a.dataset.after != null && PP.S[+a.dataset.after]) { PP.cur = +a.dataset.after; document.querySelectorAll('#pp-strip .pp-th').forEach(x => x.classList.toggle('on', +x.dataset.i === PP.cur)); } return ppGal(a); }
  if (act === 'pp-ins') return ppInsert(a.dataset.k);
  if (act === 'pp-here') return openPres(PP.cur);
  if (act === 'pp-mode') { setPresMode(a.dataset.v); renderOut(); return; }
  if (act === 'pp-trans') { if (PR_VT[a.dataset.v] && ADM.is) { state.prefs.trans = a.dataset.v; savePrefs(); renderOut(); toast('Folienübergang: ' + PR_VT[a.dataset.v]); } return; }
  if (act === 'pp-list') { state.ppList = !state.ppList; renderEditor(); clearTimeout(renderTimer); renderPreview(); ppPanelRender(true); applyResponsive(); return; }
  if (!s) return;
  if (act === 'pp-up' || act === 'pp-down') return ppMove(act === 'pp-up' ? -1 : 1);
  if (act === 'pp-dup' && ppOwn(s)) { const blocks = state.sheet.blocks; const i = blocks.indexOf(s.b); if (i < 0) return; const c = clone(s.b); c.id = 'b' + uid(); blocks.splice(i + 1, 0, c); changed(true); ppSelectBlock(c); ppRefresh(true); toast('Folie dupliziert', 'Rückgängig', () => { histUndo(); ppRefresh(true); }); return; }
  if (act === 'pp-del' && ppOwn(s)) { const blocks = state.sheet.blocks; const i = blocks.indexOf(s.b); if (i < 0) return; snapshot(); blocks.splice(i, 1); if (PP.cur > 0) PP.cur--; changed(true); ppRefresh(true); toast('Folie gelöscht', 'Rückgängig', () => { histUndo(); ppRefresh(true); }); return; }
  if (act === 'pp-hide' && !ppOwn(s)) return ppHide(s);
  if (act === 'pp-unlink' && ppCanUnlink(s)) return ppConfirm('Verknüpfung zum Arbeitsblatt lösen?', `Folie ${PP.cur + 1} wird zu einer eigenen Folie, die du hier frei bearbeiten kannst. Änderungen am Arbeitsblatt erscheinen danach <b>nicht mehr</b> auf dieser Folie. Das Arbeitsblatt selbst bleibt unverändert.`, 'Verknüpfung lösen', () => ppUnlinkDo(s));
  if (act === 'pp-ab' && !ppOwn(s)) { const blk = ppBlockOf(s); setArea('blatt'); if (blk) { state.sel = blk.id; openOnly(blk.id); renderEditor(); const c = $(`#editor [data-bid="${blk.id}"]`); if (c) c.scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
}
function renderPresPreview(host) {
  if (ppOn()) return ppStage(host);
  let S = []; try { S = presSlides(true); } catch (err) { console.error(err); }
  if (!S.length) { host.innerHTML = '<div class="pv-empty">Keine Folie ausgewählt. Links unter „Folien“ lassen sich Folien wählen.</div>'; return 0; }
  const bar = S.bar || []; const w = Math.max(240, $('#preview-scroll').clientWidth - 48); const cols = w > 760 ? 2 : 1; const tw = Math.floor((w - (cols - 1) * 18) / cols);
  host.innerHTML = `<div class="pr-grid" style="--k:${(tw / 1600).toFixed(4)};--tw:${tw}px;--cols:${cols}">${S.map((x, i) => `<button type="button" class="pr-thumb" data-pres="${i}" title="Ab dieser Folie präsentieren"><div class="pr-slide pr-k-${x.k}${bar.length ? ' has-bar' : ''}"><div class="pr-accent"></div>${presSlideHTML(x, bar)}${presBarHTML(bar, x.bi)}<div class="pr-foot"><span></span><span>${i + 1}</span></div></div><span class="pr-tn">${i + 1}</span></button>`).join('')}</div>`;
  const grid = host.firstChild; setAccent(grid, state.sheet.meta);
  grid.querySelectorAll('.pr-thumb .pr-slide').forEach((sl, i) => { const f = sl.querySelector('.pr-fit'), body = sl.querySelector('.pr-body'); try { if (f && body && PR_MAX[S[i].k]) fitUp(f, body, PR_MAX[S[i].k]); tfDraw(sl); phbFit(sl); } catch {} });
  return S.length;
}

