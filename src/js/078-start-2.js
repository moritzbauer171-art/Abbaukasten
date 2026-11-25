/* ================= Start ================= */
function boot() {
  if (DG_VIEW) { dgViewer(DG_VIEW); return; }
  document.addEventListener('keydown', e => { if (!ppOn() || !e.target.closest || !e.target.closest('.pp-th')) return; if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); ppSelect(PP.cur + 1); } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); ppSelect(PP.cur - 1); } else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); openPres(PP.cur); } });
  // Die Bearbeitung einer Folie (unter der großen Folie) nutzt dieselben Handgriffe wie die Karten links
  { const E = $('#editor'), Pn = $('#pp-panel'); if (E && Pn) { const orig = E.addEventListener.bind(E); E.addEventListener = (t, f, o) => { orig(t, f, o); try { Pn.addEventListener(t, f, o); } catch {} }; } }
  // Verstecktes Kanban-Board: Doppelklick (oder Doppeltipp) aufs Logo
  document.addEventListener('dblclick', e => { const tb = e.target.closest && e.target.closest('#pages .blk-table[data-bid]'); if (tb && state.out === 'blatt') { e.preventDefault(); try { getSelection().removeAllRanges(); } catch { } tbmOpen(tb.dataset.bid); return; } });
  document.addEventListener('dblclick', e => { if (e.target.closest && e.target.closest('.brand .logo')) { e.preventDefault(); try { getSelection().removeAllRanges(); } catch {} if (isBasis()) { toast('Das Board gibt es im Modus „Experte“ (Einstellungen ⚙ → App).'); return; } openKanban(); } });
  setUmfang(lsGet(LS_UMFANG) === 'basis' ? 'basis' : 'experte', true); state.a3p = lsGet('abw.a3p') === 'a4x2' ? 'a4x2' : 'a3';
  const ed = $('#editor');
  ed.addEventListener('focusout', e => { const k = e.target && e.target.dataset && e.target.dataset.k; const c = k && e.target.closest('[data-bid]'); if (c && (state.sheet.zrefs || []).some(r => r.f === c.dataset.bid && r.k === k)) scheduleRender(60); });
  // Hinweis unter einem Feld erst kurz nach dem Verlassen ausblenden: sonst rutscht beim Klick auf einen Knopf darunter alles hoch und der Klick geht daneben
  ed.addEventListener('focusout', e => { const f = e.target && e.target.closest && e.target.closest('.f'); if (f && f.querySelector(':scope>small.fh')) { f.classList.add('fh-keep'); clearTimeout(f._fhT); f._fhT = setTimeout(() => f.classList.remove('fh-keep'), 400); } });
  ed.addEventListener('input', onInput); ed.addEventListener('change', onChange); ed.addEventListener('click', onClick);
  ed.addEventListener('keydown', e => { if (!e.target.matches || !e.target.matches('[data-bkq]')) return;
    if (e.key === 'Enter') { e.preventDefault(); const f = $('#bk-list .bk-it'); if (f) f.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); bkClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const f = $('#bk-list .bk-it'); if (f) f.focus(); } });
  ed.addEventListener('keydown', e => { if (!e.target.classList || !e.target.classList.contains('bk-it')) return; const all = [...document.querySelectorAll('#bk-list .bk-it')]; const i = all.indexOf(e.target);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); (all[i + 1] || all[i]).focus(); } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); if (i > 0) all[i - 1].focus(); else { const q = $('#editor [data-bkq]'); if (q) q.focus(); } } else if (e.key === 'Escape') { e.preventDefault(); bkClose(); } });
  document.addEventListener('keydown', e => {
    const typing = e.target && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)); if (typing || state.dlg || document.querySelector('.pr-ov, .lib-open, #cmd-ov, .pp-cf-ov') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '?') { e.preventDefault(); keysOpen(); }
    else if (e.key === 'F5') { e.preventDefault(); openPres(e.shiftKey && ppOn() ? PP.cur : 0); } });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'k' || e.key === 'K') && !state.dlg && !document.querySelector('.pr-ov, .lib-open')) { e.preventDefault(); if (document.getElementById('cmd-ov')) document.getElementById('cmd-ov').remove(); else cmdOpen(); } });
  $('#lib-root').addEventListener('click', onLibClick);
  $('#lib-root').addEventListener('input', e => { if (e.target.id === 'lib-q') { state.libQuery = e.target.value; renderLib(); } if (e.target.id === 'share-q') { state.shareQuery = e.target.value; const l = $('#lib-root .share-list'); if (l) { l.innerHTML = sharedListHTML(); const i = $('#share-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } } });
  $('#lib-root').addEventListener('change', e => { if (e.target.id === 'share-fst' || e.target.id === 'share-fcat') { state.shareF = state.shareF || { stufe: '', cat: '' }; state.shareF[e.target.id === 'share-fst' ? 'stufe' : 'cat'] = e.target.value; renderLib(); return; } if (e.target.id === 'lib-sort') { if (e.target.value === 'eigen') freezeOrder(KL(state.klasse).id); else lsSet(LS_SORT, e.target.value); savePrefs(); renderLib(); } });
  $('#lib-root').addEventListener('keydown', e => {
    const t = e.target;
    if (t.id === 'lib-fnew') { if (e.key === 'Enter') { e.preventDefault(); newFolder(t.value); } else if (e.key === 'Escape') { e.stopPropagation(); state.fNew = false; renderLib(); } }
    else if (t.classList && t.classList.contains('lib-fren')) { if (e.key === 'Enter') { e.preventDefault(); t.parentNode.querySelector('[data-act="lib-fren-ok"]').click(); } else if (e.key === 'Escape') { e.stopPropagation(); state.fEdit = null; renderLib(); } }
  }, true);
  $('#lib-root').addEventListener('dragstart', e => {
    const it = e.target.closest && e.target.closest('.lib-item[draggable="true"]'); const fh = !it && e.target.closest && e.target.closest('.lib-f[draggable="true"]');
    if (!it && !fh) return;
    libDrag = it ? { kind: 'sheet', id: it.dataset.id } : { kind: 'folder', id: fh.dataset.fid };
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', (it || fh).textContent.trim().slice(0, 80)); } catch {}
    const src = it || fh.closest('.lib-fs'); setTimeout(() => src.classList.add('dragging'), 0);
  });
  $('#lib-root').addEventListener('dragover', e => {
    if (!libDrag) return; const t = libTarget(e); libClearDrop();
    if (!t) return; e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch {} t.el.classList.add(t.cls);
  });
  $('#lib-root').addEventListener('drop', e => {
    if (!libDrag) return; const t = libTarget(e); const d = libDrag; libClearDrop(); libDrag = null;
    if (!t) return; e.preventDefault();
    if (d.kind === 'folder') moveFolder(d.id, t.ref, t.before); else moveSheetTo(d.id, t.fid || '', t.ref, t.before);
  });
  $('#lib-root').addEventListener('dragend', () => { libDrag = null; libClearDrop(); document.querySelectorAll('#lib-root .dragging').forEach(n => n.classList.remove('dragging')); });
  $('#dlg-root').addEventListener('click', onDlgClick);
  // Texterkennung: Datei hineinziehen oder Bild einfügen
  const ocrOk = () => state.dlg && state.dlg.mode === 'ocr' && (state.dlg.step === 'pick' || state.dlg.step === 'prep');
  $('#dlg-root').addEventListener('dragover', e => { if (!ocrOk()) return; e.preventDefault(); const z = $('#ocr-drop'); if (z) z.classList.add('over'); });
  $('#dlg-root').addEventListener('dragleave', e => { const z = $('#ocr-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
  $('#dlg-root').addEventListener('drop', e => { if (!ocrOk()) return; e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) ocrTake(f); });
  document.addEventListener('paste', e => { if (!ocrOk()) return; const f = [...((e.clipboardData && e.clipboardData.files) || [])].find(x => /^image\//.test(x.type)); if (f) { e.preventDefault(); ocrTake(f); } });
  $('#dlg-root').addEventListener('submit', onDlgSubmit);
  $('#dlg-root').addEventListener('keydown', e => { if (e.key === 'Enter' && state.dlg && state.dlg.mode === 'new' && e.target.tagName === 'INPUT') { e.preventDefault(); newGo(); } });
  $('#dlg-root').addEventListener('input', e => {
    const t = e.target; const d = state.dlg; if (!d || d.mode !== 'klassen') return;
    if (t.id === 'kl-school') { d.school = t.value; return; }
    const r = t.closest('.kl-row'); if (!r || !t.dataset.kf) return; const row = d.rows[+r.dataset.i];
    const prevLabel = row.label; const prevFach = row.fach; row[t.dataset.kf] = t.value;
    if (t.dataset.kf === 'fach') { const old = FAECHER[prevFach] || {}; if (!String(row.course || '').trim() || row.course === old.course || row.course === old.label || row.course === (old.course || '') + ' ' + row.label) { row.course = FAECHER[t.value].course + (row.label ? ' ' + row.label : ''); const c = r.querySelector('[data-kf="course"]'); if (c) c.value = row.course; } return; }
    // Neue Klasse: Anrede (und in der Grundschule die Klassenstufe) aus dem Namen vorschlagen, solange nicht selbst gewählt
    if (t.dataset.kf === 'label' && row.fresh && !d.setup) { const fc = (FAECHER[row.fach] || {}).course || ''; if (!row.courseTouch && (!row.course || row.course === fc || row.course === fc + ' ' + prevLabel)) { row.course = t.value ? fc + ' ' + t.value : fc; const c = r.querySelector('[data-kf="course"]'); if (c) c.value = row.course; } }
    if (t.dataset.kf === 'course') row.courseTouch = true;
    if (t.dataset.kf === 'label' && row.fresh) { const setSeg = (f, v) => r.querySelectorAll(`[data-f="${f}"]`).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === String(v))));
      if (!row.anTouch) { row.anrede = anredeGuess(t.value, row.stufe); setSeg('anrede', row.anrede); }
      if (row.stufe === 'gs') { const g = jgGuess(t.value); if (g && !row.jgTouch) { row.jg = g; setSeg('jg', g); } } }
    // Kurs automatisch vorschlagen, solange er dem Namen folgt
    if (t.dataset.kf === 'label' && d.setup) { const c = r.querySelector('[data-kf="course"]'); if (c && (!row.course || row.course === 'Deutsch' || row.course === 'Deutsch ' + prevLabel)) { row.course = t.value ? 'Deutsch ' + t.value : 'Deutsch'; c.value = row.course; } }
  });
  $('#dlg-root').addEventListener('change', e => {
    if (e.target.dataset && e.target.dataset.vp != null && state.dlg && state.dlg.mode === 'vp') {
      const k = e.target.dataset.vp; if (k === 'lesson') state.sheet.meta.lesson = e.target.value; else if (k === 'frage') state.sheet.meta.frage = e.target.value.trim(); else vpOf()[k] = e.target.value.trim(); changed(false);
      const pv = $('#vp-prev'); if (pv) pv.innerHTML = vpTableHTML(); return;
    }
    if (presPickChange(e.target)) return;
    if (e.target.id === 'ocr-file' && e.target.files && e.target.files[0]) { ocrTake(e.target.files[0]); return; }
    if (e.target.id === 'sa-kl' && $('#sa-f')) $('#sa-f').innerHTML = saFolderOpts(e.target.value, '');
    if (e.target.dataset && e.target.dataset.mpid != null && state.dlg && state.dlg.mode === 'mappe') { mappeRead(); const d = state.dlg, n = d.list.length - d.off.size; $('#mp-n').textContent = `Blätter: ${n} von ${d.list.length}`; const g = $('#dlg-root [data-act="mp-go"]'); if (g) g.disabled = !n; }
  });
  $('#import-file').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) importBackup(f); });
  $('#btn-fach').addEventListener('click', e => { e.stopPropagation(); toggleFachPop(); });
  $('#fach-pop').addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('#fach-pop [data-fach]'); if (b) { fachAddOpen = false; chooseFach(b.dataset.fach); return; } if (e.target.closest('[data-fach-act="add"]')) { fachAddOpen = !fachAddOpen; const p = $('#fach-pop'); p.innerHTML = fachPopHTML(); const f = p.querySelector(fachAddOpen ? '.fp-new' : '.fp-add'); if (f) f.focus(); return; } if (e.target.closest('[data-fach-act="klassen"]')) { toggleFachPop(false); openKlassen(false); } });
  $('#fach-pop').addEventListener('keydown', e => { const items = [...$('#fach-pop').querySelectorAll('.fp-i')]; const i = items.indexOf(document.activeElement); if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); } else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); } });
  document.addEventListener('click', e => { const p = $('#fach-pop'); if (p && !p.hidden && !e.target.closest('#fach-pop, #btn-fach')) toggleFachPop(false); });
  $('#reiter').addEventListener('click', e => { if (e.target.closest('[data-kl]')) { openKlassen(false); return; } const b = e.target.closest('[data-k]'); if (b) switchKlasse(b.dataset.k); });
  $('#outsw').addEventListener('click', e => { const b = e.target.closest('[data-out]'); if (b) setOut(b.dataset.out); });
  $('#pages').addEventListener('click', e => { const t = e.target.closest('[data-pres]'); if (t) openPres(+t.dataset.pres); });
  const edEl = $('#editor');
  // Lesbarkeit: Klick auf Vorschlag oder „markieren“ soll das Textfeld nicht verlassen (sonst baut sich die Karte neu auf)
  edEl.addEventListener('mousedown', e => { if (e.target.closest && e.target.closest('.rd-sugg button, [data-act="rd-show"]')) e.preventDefault(); });
  edEl.addEventListener('change', e => { if (e.target.matches && e.target.matches('[data-glsug]')) glSugSet(e.target.checked); });
  // Spaltenbreite: Griffe auf dem Lineal ziehen oder mit Pfeiltasten verschieben
  let cwDrag = null;
  edEl.addEventListener('pointerdown', e => {
    const h = e.target.closest && e.target.closest('.cw-h'); if (!h) return;
    const card = h.closest('[data-bid]'); const b = card && target(card.dataset.bid); if (!b) return;
    e.preventDefault(); h.focus({ preventScroll: true }); cwDrag = { h, card, b, i: +h.dataset.i, bar: h.parentElement };
    try { h.setPointerCapture(e.pointerId); } catch {} h.classList.add('drag'); document.body.classList.add('cw-dragging');
  });
  edEl.addEventListener('pointermove', e => {
    if (!cwDrag) return; const r = cwDrag.bar.getBoundingClientRect(); if (!r.width) return;
    const before = JSON.stringify(cwDrag.b.cw || null); cwSet(cwDrag.b, cwDrag.i, (e.clientX - r.left) / r.width * 100);
    if (JSON.stringify(cwDrag.b.cw) !== before) { cwPaint(cwDrag.card, cwDrag.b); changed(false); }
  });
  const cwEnd = () => { if (!cwDrag) return; cwDrag.h.classList.remove('drag'); document.body.classList.remove('cw-dragging'); cwDrag = null; };
  edEl.addEventListener('pointerup', cwEnd); edEl.addEventListener('pointercancel', cwEnd); edEl.addEventListener('lostpointercapture', cwEnd);
  edEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.dataset && e.target.dataset.rlpnew != null) { e.preventDefault(); const bt = e.target.parentNode.querySelector('[data-act="rlp-own-add"]'); if (bt) bt.click(); return; }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.rlpq != null) { e.preventDefault(); return; }
    const h = e.target.closest && e.target.closest('.cw-h'); if (!h || !['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const card = h.closest('[data-bid]'); const b = card && target(card.dataset.bid); if (!b) return; e.preventDefault();
    const i = +h.dataset.i; const w = tbWidths(b); const cum = w.slice(0, i + 1).reduce((a, x) => a + x, 0);
    cwSet(b, i, cum + (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1) * (e.shiftKey ? 5 : 1)); cwPaint(card, b); changed(false);
  });
  let olDrag = null; const olClr = () => document.querySelectorAll('#editor .ol-b,#editor .ol-a').forEach(n => n.classList.remove('ol-b', 'ol-a'));
  edEl.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('.ol-c[draggable="true"]'); if (!c) return; olDrag = c.dataset.ob; try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.textContent); } catch {} setTimeout(() => c.classList.add('dragging'), 0); });
  const olT = e => { const c = e.target.closest && e.target.closest('.ol-c[draggable="true"]'); if (!c || c.dataset.ob === olDrag) return null; const r = c.getBoundingClientRect(); return { c, before: e.clientX < r.left + r.width / 2 }; };
  edEl.addEventListener('dragover', e => { if (!olDrag) return; const t = olT(e); olClr(); if (!t) return; e.preventDefault(); t.c.classList.add(t.before ? 'ol-b' : 'ol-a'); });
  edEl.addEventListener('drop', e => { if (!olDrag) return; const t = olT(e); const id = olDrag; olDrag = null; olClr(); if (!t) return; e.preventDefault(); edDrop(id, t.c.dataset.ob, t.before); });
  edEl.addEventListener('dragend', () => { olDrag = null; olClr(); document.querySelectorAll('#editor .ol-c.dragging').forEach(n => n.classList.remove('dragging')); });
  edEl.addEventListener('dragstart', e => {
    const h = e.target.closest && e.target.closest('.card-h[draggable="true"]'); if (!h) return;
    const c = h.closest('.card'); edDrag = c.dataset.bid;
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.querySelector('.kind') ? c.querySelector('.kind').textContent : 'Baustein'); } catch {}
    setTimeout(() => c.classList.add('dragging'), 0);
  });
  edEl.addEventListener('dragover', e => { if (!edDrag) return; const t = edTarget(e); edClearDrop(); if (!t) return; e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch {} t.el.classList.add(t.cls); });
  edEl.addEventListener('drop', e => { if (!edDrag) return; const t = edTarget(e); const id = edDrag; edClearDrop(); edDrag = null; if (!t) return; e.preventDefault(); edDrop(id, t.ref, t.before); });
  edEl.addEventListener('dragend', () => { edDrag = null; edClearDrop(); document.querySelectorAll('#editor .card.dragging').forEach(n => n.classList.remove('dragging')); });
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return; const k = e.key.toLowerCase(); if (k !== 'z' && k !== 'y') return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (state.dlg || state.libOpen || state.out === 'karten' && false) return;
    e.preventDefault(); if (k === 'y' || e.shiftKey) histRedo(); else histUndo();
  });
  $('#pv-opts').addEventListener('click', e => {
    const b = e.target.closest('[data-pv]'); if (!b || b.disabled) return; const k = b.dataset.pv, v = b.dataset.v;
    if (k.startsWith('pp-')) { ppAct(k, b); return; }
    if (k === 'ehmd') { exportEH(); return; }
    if (k === 'tfbeam') { tfBeamer(); return; }
    if (k === 'msr') { msrToggle(true); return; }
    if (k === 'dz-page') { if (state.dz && state.dz.k === 'page') dzClose(); else dzOpen('page', null, b.getBoundingClientRect()); return; }
    if (k === 'pres') { openPres(0); return; }
    if (k === 'vp') { openVP(); return; }
    if (k === 'vp-docx') { exportVP(); return; }
    if (k === 'st-out') { openOut(); if (state.dlg) { state.dlg.whole = true; renderDlg(); } return; }
    if (k === 'pptx') { exportPPTX(); return; }
    if (k === 'fassung') { state.fassung = v; if (v === 'lehrer') state.sheet.blocks.forEach(x => { if (x.type === 'tasks') x.items.forEach((_, i) => state.taskOpen.add(taskKey(x.id, i, 'eh'))); }); renderEditor(); }
    if (k === 'grp') state.grp = v;
    if (k === 'lvl') state.lvl = v;
    if (k === 'paper') { state.sheet.meta.paper = v; changed(false); }
    if (k === 'a3p') { state.a3p = v; lsSet('abw.a3p', v); }
    closeZl(); renderPreview();
  });
  $('#menu-root').addEventListener('click', onMenuClick);
  $('#zl-root').addEventListener('click', e => { const a = e.target.closest('[data-zl]'); if (!a) return; const k = a.dataset.zl; if (k === 'close') closeZl(); if (k === 'ins') zlInsert(); if (k === 'copy') zlCopy(); });
  const trackField = e => {
    const rt = e.target.closest && e.target.closest('.rtx'); const t = rt || e.target;
    if (!t.dataset || !t.dataset.k || (!rt && (!/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.type === 'checkbox'))) return;
    const card = t.closest('[data-bid]'); const bid = card && card.dataset.bid; const blk = bid && state.sheet.blocks.find(x => x.id === bid);
    if (!blk || blk.type === 'material') return;
    if (rt) {
      const s = getSelection(); if (!s.rangeCount || !rt.contains(s.anchorNode)) return;
      const r = rtSerialize(rt, { caret: s.getRangeAt(0) }); lastField.bid = bid; lastField.k = t.dataset.k; lastField.pos = r.start; lastField.end = r.end; return;
    }
    lastField.bid = bid; lastField.k = t.dataset.k; lastField.pos = t.selectionStart; lastField.end = t.selectionEnd;
  };
  ['focusin', 'keyup', 'mouseup', 'input', 'focusout'].forEach(ev => ed.addEventListener(ev, trackField));
  // Anführungszeichen beim Tippen: „ am Wortanfang, “ am Ende; in Link-Feldern und der Suche bleibt das gerade Zeichen
  const quoteField = t => { const rt = t.closest && t.closest('.rtx'); if (rt) return rt; if ((t.tagName === 'INPUT' && t.type === 'text') || t.tagName === 'TEXTAREA') return t.id === 'lib-q' || (t.dataset && t.dataset.k === 'url') ? null : t; return null; };
  const textBefore = el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value.slice(0, el.selectionStart);
    const s = getSelection(); if (!s.rangeCount) return ''; const r = s.getRangeAt(0);
    let blk = r.startContainer.nodeType === 3 ? r.startContainer.parentNode : r.startContainer;
    while (blk && blk !== el && !/^(DIV|P|LI)$/.test(blk.nodeName)) blk = blk.parentNode;
    const pre = document.createRange(); pre.setStart(blk || el, 0); pre.setEnd(r.startContainer, r.startOffset); return pre.toString();
  };
  document.addEventListener('beforeinput', e => {
    if (e.inputType !== 'insertText' || (e.data !== '"' && e.data !== "'")) return;
    const el = quoteField(e.target); if (!el) return;
    const before = textBefore(el); const prev = before.slice(-1); let q;
    if (e.data === '"') q = !prev || Q_OPEN_BEFORE.test(prev) ? '„' : '“';
    else if (!prev || Q_OPEN_BEFORE.test(prev)) q = '‚';
    else if (/‚[^‘]*$/.test(before.split('\n').pop())) q = '‘';
    else return; // Apostroph bleibt, wie getippt
    e.preventDefault();
    document.execCommand('insertText', false, q);
  }, true);
  document.addEventListener('paste', e => {
    const t = e.target; if (t.closest && t.closest('.rtx')) return; // eigene Behandlung im Editor
    const el = quoteField(t); if (!el) return;
    const raw = e.clipboardData && e.clipboardData.getData('text/plain'); if (!raw || !/["“”„'‘’‚]/.test(raw)) return;
    const fixed = deQuoteStr(t.tagName === 'INPUT' ? raw.replace(/\s*\n\s*/g, ' ') : raw); if (fixed === raw) return;
    e.preventDefault(); document.execCommand('insertText', false, fixed);
  }, true);
  // Strg+Umschalt+V: nur den Text einfügen
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'v' || e.key === 'V')) plainPasteUntil = Date.now() + 1500; }, true);
  // Formatierungsleiste
  const rtb = $('#rt-bar');
  rtb.addEventListener('mousedown', e => e.preventDefault());
  rtb.addEventListener('click', e => { const btn = e.target.closest('[data-rt]'); if (btn) rtCmd(btn.dataset.rt); });
  document.addEventListener('selectionchange', () => requestAnimationFrame(() => { rtBar(); mwState(); }));
  ed.addEventListener('mousedown', e => { if (e.target.closest('.mw-wt button')) e.preventDefault(); });
  ed.addEventListener('click', e => { const bt = e.target.closest('.mw-wt [data-mwc]'); if (bt) { e.stopPropagation(); mwCmd(bt); } }, true);
  ed.addEventListener('input', e => { const w = e.target.closest && e.target.closest('.mw-word'); if (!w) return; const wc = w.querySelector('.mw-wc'); if (wc) wc.textContent = mwWords(e.target.innerText); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.dz && !state.mwBig) { e.preventDefault(); dzClose(); return; } }, true);
  document.addEventListener('mousedown', e => { if (state.dz && !e.target.closest('#dz') && !e.target.closest('#pages') && !e.target.closest('[data-pv="dz-page"]') && !e.target.closest('#pv-tools [data-pv="dz"]')) { dzClose(); const t = $('#pv-tools [data-pv="dz"]'); if (t) t.classList.remove('on'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.mwBig) { e.preventDefault(); e.stopPropagation(); mwBigSet(null); } }, true);
  ed.addEventListener('scroll', () => { if (!rtb.hidden) rtBar(); }, { passive: true });
  window.addEventListener('resize', () => { if (!rtb.hidden) rtBar(); });
  ed.addEventListener('keydown', e => {
    const f = e.target.closest && e.target.closest('.rtx'); if (!f) return;
    if (e.key === 'Enter' && f.dataset.rt === 'line') { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); rtCmd('m'); }
  });
  ed.addEventListener('paste', e => {
    const rt = e.target.closest && e.target.closest('.rtx');
    if (rt) {
      e.preventDefault();
      const cd = e.clipboardData; if (!cd) return;
      const card = rt.closest('[data-bid]'); const blk = card && target(card.dataset.bid); const mode = rt.dataset.rt;
      const isMat = !!(blk && blk.type === 'material' && rt.dataset.k === 'text'); const poem = isMat && blk.form === 'gedicht';
      if (isMat && !(cd.getData('text/plain') || '').trim()) { const img = [...(cd.files || [])].find(x => /^image\//.test(x.type)); if (img) { openOcr(blk.id, img); return; } }
      const html = Date.now() < plainPasteUntil ? '' : (cd.getData('text/html') || '');
      let raw = '', note = '';
      if (/<[a-z][^>]*>/i.test(html)) { try { raw = htmlToRaw(html, mode, { poem, hd: !!rt.dataset.hd }); } catch (err) { console.error(err); raw = ''; } if (raw.trim() && mode !== 'line') note = 'Mit Formatierung und Absätzen eingefügt · Strg+Umschalt+V fügt nur den Text ein'; }
      if (raw.trim()) {
        const pt = cd.getData('text/plain') || '';
        if (!raw.includes('\n')) { if (/^[ \t]/.test(pt) && !/^\s/.test(raw)) raw = ' ' + raw; if (/[ \t]$/.test(pt) && !/\s$/.test(raw)) raw += ' '; }
        rtInsertRaw(rt, raw); if (note) toast(note); return;
      }
      const keep = Date.now() < plainPasteUntil; // Strg+Umschalt+V: Zeilen wie in der Vorlage
      let t = (cd.getData('text/plain') || '').replace(/\r\n?/g, '\n'); if (!t) return;
      if (isMat) { const r = cleanPdf(t, poem || keep); if (r.hy || r.ln) { t = r.t; note = [r.hy ? `${r.hy} Trennstriche` : '', r.ln ? `${r.ln} ${poem ? 'Versnummern' : 'Zeilennummern'}` : ''].filter(Boolean).join(' und ') + ' aus der Vorlage entfernt'; } }
      if (isMat && !poem && !keep) {
        const g = guessParas(t);
        if (g !== t) { t = g; note = (note ? note + ' · ' : '') + 'Jede Zeile als eigener Absatz übernommen'; }
        else { const j = joinLines(t); if (j !== t) { t = j; note = (note ? note + ' · ' : '') + 'Zeilenumbrüche der Vorlage zusammengezogen · Strg+Umschalt+V behält sie'; } }
      }
      if (mode === 'line') t = t.replace(/\s*\n\s*/g, ' ');
      document.execCommand('insertText', false, deQuoteStr(t));
      if (note) toast(note);
      return;
    }
    const t = e.target; if (t.tagName !== 'TEXTAREA' || t.dataset.k !== 'text') return;
    const card = t.closest('[data-bid]'); const blk = card && target(card.dataset.bid); if (!blk || blk.type !== 'material') return;
    const raw = e.clipboardData && e.clipboardData.getData('text'); if (!raw) return;
    const r = cleanPdf(raw); if (!r.hy && !r.ln) return;
    e.preventDefault();
    let ok = false; try { ok = document.execCommand('insertText', false, r.t); } catch {}
    if (!ok) { t.setRangeText(r.t, t.selectionStart, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input', { bubbles: true })); }
    toast([r.hy ? `${r.hy} Trennstriche` : '', r.ln ? `${r.ln} Zeilennummern` : ''].filter(Boolean).join(' und ') + ' aus der Vorlage entfernt');
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); if (!state.dlg) openSaveAs(); return; }
    if (e.key !== 'Escape') return;
    if (!$('#fach-pop').hidden) { toggleFachPop(false); $('#btn-fach').focus(); return; }
    if (menu.open) { closeMenu(); return; }
    if (zl.open) { closeZl(); return; }
    if (gl.open) { closeGloss(); return; }
    if (state.dlg) { if (state.dlg.mode === 'conflict' || (state.dlg.mode === 'klassen' && state.dlg.setup)) return; if (state.dlg.mode === 'login' && loginForced()) return; closeDlg(); return; }
    if (state.libOpen) { if (state.fMenu || state.fDel || state.moveOpen) { state.fMenu = state.fDel = state.moveOpen = null; renderLib(); return; } state.libOpen = false; state.confirmDel = null; state.fNew = false; state.fEdit = null; renderLib(); }
  });
  $('.bar').addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'tab') setView(a.dataset.v);
    if (act === 'undo') histUndo();
    if (act === 'redo') histRedo();
    if (act === 'cmd') cmdOpen();
    if (act === 'pres-go') openPres(0);
    if (act === 'lib-open') {
      state.libOpen = true; renderLib(); refreshLib().catch(() => {});
      const q = $('#lib-q'); if (q && !window.matchMedia('(max-width: 899px)').matches) q.focus();
    }
    if (act === 'login') openDlg('login');
    if (act === 'saveas') openSaveAs();
    if (act === 'out') openOut();
    if (act === 'new') openNew();
    if (act === 'home') homeOpen();
    if (act === 'forum') forumOpen();
    if (act === 'tafel-open') openPres(0, { board: true });
    if (act === 'help') { state.dlg = { mode: 'help' }; renderDlg(); }
    if (act === 'rlp-view') rlpOpen();
    if (act === 'settings') openSettings();
    if (act === 'umfang') { setUmfang(a.dataset.v); toast(a.dataset.v === 'basis' ? 'Basis: nur Arbeitsblätter und die Präsentation dazu. Stundenplanung, Tafelbilder, Druck-Extras, Startseite und Board sind ausgeblendet. Gelöscht wird nichts.' : 'Experte: alle Funktionen.'); }
    if (act === 'pdf') exportPDF();
    if (act === 'docx') exportDOCX();
    if (act === 'print') doPrint();
  });
  $('#btn-wide').addEventListener('click', () => { state.wide = !state.wide; applyResponsive(); });
  $('#btn-zoom').addEventListener('click', () => { state.zoom = state.zoom === 'fit' ? 'full' : 'fit'; applyScale(); });
  $('#gl-root').addEventListener('submit', onGlossSubmit);
  $('#gl-root').addEventListener('keydown', e => { if (e.target.id === 'gl-text' && e.key === 'Enter' && !e.isComposing) { e.preventDefault(); const fm = $('#gl-form'); if (fm) fm.requestSubmit(); } });
  $('#gl-root').addEventListener('input', e => { if (e.target.id === 'gl-text') glFit(); if (e.target.id === 'gl-term') { updOcc(); clearTimeout(glWbT); const v = e.target.value; glWbT = setTimeout(() => glWbRun(v), 600); } });
  $('#gl-root').addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a || !gl.open) return;
    if (a.dataset.act === 'gl-close') closeGloss();
    if (a.dataset.act === 'gl-del') { const o = gl.open; const b = target(o.bid); closeGloss(); if (b && o.idx >= 0) removeGloss(b, o.idx); }
    if (a.dataset.act === 'gl-sg') { const f = $('#gl-text'); if (!f) return; const v = a.dataset.v || ''; f.value = a.dataset.m === 'add' && f.value.trim() ? f.value.replace(/[\s,;]+$/, '') + ', ' + v : v; glFit(); f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch {} }
  });
  document.addEventListener('pointerdown', e => {
    if (gl.open && !e.target.closest('#gpop')) closeGloss();
    if (zl.open && !e.target.closest('#zlpop') && !e.target.closest('#pages .ln-no')) closeZl();
    if (menu.open && !e.target.closest('#mn')) closeMenu();
  }, true);
  // Schließt erst, wenn wirklich weggescrollt wurde (kleine Sprünge durch Fokus ignorieren)
  ['#preview-scroll', '#editor'].forEach(q => $(q).addEventListener('scroll', () => {
    const o = gl.open; if (!o || !o.sc || narrowGloss()) return;
    if (Date.now() - (o.t0 || 0) < 700) { o.sc = { p: $('#preview-scroll').scrollTop, e: $('#editor').scrollTop }; return; }
    if (Math.abs($('#preview-scroll').scrollTop - o.sc.p) > 60 || Math.abs($('#editor').scrollTop - o.sc.e) > 60) closeGloss();
  }, { passive: true }));
  window.addEventListener('resize', () => { if (gl.open) placeGloss(); });
  const selectQuiet = bid => {
    state.sel = bid; markSel();
    document.querySelectorAll('#editor .card.sel').forEach(c => c.classList.remove('sel'));
    const c = document.querySelector(`#editor .card[data-bid="${bid}"]`); if (c) c.classList.add('sel');
  };
  let skipClick = false;
  // Mehrere Wörter markieren → Worterklärung für die Wortgruppe
  $('#pages').addEventListener('mouseup', () => {
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const r = sel.getRangeAt(0); const sc = r.startContainer;
    const blk = (sc.nodeType === 1 ? sc : sc.parentElement).closest('.blk-mat'); if (!blk) return;
    const bid = blk.dataset.bid; if (state.gapEdit === bid) return;
    const picked = [...document.querySelectorAll(`#pages [data-bid="${bid}"] .mat-body .w`)].filter(w => r.intersectsNode(w));
    if (!picked.length) return;
    const rect = rectOf(r); sel.removeAllRanges();
    skipClick = true; setTimeout(() => { skipClick = false; }, 350);
    selectQuiet(bid); glossFromSpans(bid, picked, rect);
  });
  $('#pages').addEventListener('click', e => {
    if (skipClick) { skipClick = false; return; }
    const lnno = e.target.closest('.ln-no');
    if (lnno && lnno.dataset.n) {
      const blk = lnno.closest('.blk-mat');
      if (blk) { const lab = blk.querySelector('.mat-no, .mat-cont'); const mNo = lab ? ((lab.textContent.match(/\b([MQD]\d+)/) || [])[1] || '') : ''; selectQuiet(blk.dataset.bid); openZl(blk.dataset.bid, +lnno.dataset.n, mNo, rectOf(lnno)); return; }
    }
    const w = e.target.closest('.mat-body .w'); const wb = w && w.closest('.blk-mat');
    if (wb && state.gapEdit === wb.dataset.bid) { selectQuiet(wb.dataset.bid); gapToggle(wb.dataset.bid, w); return; }
    if (wb) { selectQuiet(wb.dataset.bid); glossFromSpans(wb.dataset.bid, [w], rectOf(w)); return; }
    const n = e.target.closest('[data-bid]'); if (!n) return;
    const bid = n.dataset.bid; state.sel = bid; if (state.allOpen) state.closed.delete(bid); else openOnly(bid); saveClosed();
    const bb = state.sheet.blocks.find(x => x.id === bid); const dzOn = !!(bb && DZ_TYPES.has(bb.type) && state.out === 'blatt' && !pvOn());
    if (dzOn) dzOpen('block', bid, n.getBoundingClientRect()); else if (state.dz && state.dz.k === 'block' && state.dz.bid !== bid) { dzClose(); const t = $('#pv-tools [data-pv="dz"]'); if (t) t.classList.remove('on'); }
    if (dzOn && window.matchMedia('(max-width: 899px)').matches) { renderEditor(); markSel(); return; }
    if (state.wide) { state.wide = false; applyResponsive(); }
    if (window.matchMedia('(max-width: 899px)').matches) setView('edit');
    renderEditor(); markSel();
    const c = $(`#editor [data-bid="${bid}"]`); if (!c) return;
    // Bild mit Beschriftungen: Klick auf einen Kasten springt zu dessen Feldern, Klick aufs Bild zu den Pfeilzielen
    const lc = e.target.closest('.lb-c[data-lbi]'), lm = !lc && e.target.closest('.blk-lb .lb-mid');
    const row = lc ? c.querySelectorAll('.lb-row-e')[+lc.dataset.lbi] : lm ? c.querySelector('[data-lbpick]') || c.querySelector('input[data-act="img"]') : null;
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.classList.remove('lb-hit'); void row.offsetWidth; row.classList.add('lb-hit');
      const f = lc && row.querySelector(`[data-k="lb.${lc.dataset.lbi}.h"]`); if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch { } }, 350); return; }
    c.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  window.matchMedia('(max-width: 899px)').addEventListener('change', applyResponsive);
  try { new ResizeObserver(() => applyScale()).observe($('#preview-scroll')); } catch { window.addEventListener('resize', applyScale); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkRemote(); });
  window.addEventListener('focus', () => checkRemote());
  window.addEventListener('online', () => { flushPending().then(() => { if (state.sheet && !savePending) idleStatus(); }); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && savePending) saveNow(); });
  window.addEventListener('pagehide', () => { homeTouch(); if (savePending) saveNow(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') homeTouch(); });

  // Erster Stand: zuletzt geöffnetes Blatt dieses Reiters aus dem Zwischenspeicher, sonst Entwurf
  const k = lsGet(LS.klasse); state.klasse = KLASSEN.some(x => x.id === k) ? k : KLASSEN[0].id;
  const cached = lsGet(LS.cur);
  const ok = cached && cached.sheet && cached.sheet.meta && Array.isArray(cached.sheet.blocks) && KL(cached.sheet.klasse).id === state.klasse;
  state.sheet = normalizeSheet(ok ? cached.sheet : draftFor(state.klasse));
  // Ganz neu (noch keine Klassen auf diesem Gerät): keine Startseite vor der Einrichtung
  if (homeAutoDue() && (lsGet(LS_KLCACHE) || lsGet('abw.ordner')) && !DG_VIEW && !COMPANION_PAGE() && !MAPPE_LOCK && !location.hash && !hmS.open) homeOpen(true);
  homeTouch(); setInterval(homeTouch, 5 * 6e4);
  renderTabs(); renderEditor(); applyResponsive(); renderPreview(); setStatus('pending');
  Promise.race([Promise.all(FONT_SPECS.map(f => document.fonts.load(f))), wait(3500)]).then(() => { fontsOK = true; renderPreview(); }).catch(() => {});
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => scheduleRender(60));
  initBackend().catch(err => { console.error(err); useBackend(localB); });
  if (CAM_ID) { camInit(); return; }
  if (TAFEL_APP) { lfcPage(); return; }
  setTimeout(hyInit, 50); lfcWatch();
  setupPWA(); setTimeout(newsMaybe, 1500); pvInit(); tourInit(); mobileInit(); admInit(); foInit();
  $('#home-root').addEventListener('click', homeClick); $('#home-root').addEventListener('change', e => { if (e.target.dataset.hm === 'auto') homeClick(e); });
  document.addEventListener('keydown', e => { if (hmS.open && e.key === 'Escape' && !state.dlg && !state.libOpen && !document.querySelector('.nw-ov,.rlpv')) { e.preventDefault(); homeClose(); } });

  if (isNarrow()) setView(state.area === 'start' ? 'edit' : 'preview');
  $('#tip-root').addEventListener('click', e => { const b = e.target.closest('[data-tip]'); if (!b) return; const k = b.dataset.tip; showTip(k === 'close' ? -1 : k === 'prev' ? tipIdx - 1 : tipIdx + 1 < TIPS.length ? tipIdx + 1 : -1); });

}
boot();

})();
