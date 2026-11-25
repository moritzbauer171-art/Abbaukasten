/* ================= Export ================= */
const loaded = {};
function loadScript(src) {
  if (loaded[src]) return loaded[src];
  return loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('Bibliothek nicht geladen')); }; document.head.appendChild(s); });
}
const fileBase = () => { const m = state.sheet.meta; return (m.nr ? 'AB' + slug(m.nr) + '_' : '') + slug(m.title); };
/* Ganze Stunde in einen Ordner: im Browser als ZIP, in der Windows-App direkt in einen gewählten Ordner */
let CAPTURE = null, stundeRun = false;
async function exportStunde() {
  if (stundeRun || busy) return; stundeRun = true;
  const P = state.sheet; const keep = { out: state.out, fassung: state.fassung, grp: state.grp, lvl: state.lvl, a3p: state.a3p, ab: P.abActive || 0, sel: state.sel };
  const files = []; let n = 0; const add = (name, blob, what) => files.push({ name: `${String(++n).padStart(2, '0')}_${name}`, blob, what });
  const capture = async fn => { let got = null; CAPTURE = (blob, name) => { got = { blob, name }; }; try { await fn(); } catch (err) { console.error(err); } finally { CAPTURE = null; } return got; };
  const show = (out, fassung) => { state.out = out; if (fassung) state.fassung = fassung; clearTimeout(renderTimer); renderPreview(); };
  const notes = [];
  try {
    state.grp = 'all'; state.lvl = 'all';
    for (const A of stABs()) {
      if (P.abs) abSwitch(A.k, true);
      const base = fileBase(); const lab = abLabel(P.meta, A.k) + ' ' + plainText(P.meta.title || '');
      overlay(`Stunde wird zusammengestellt … ${lab}`);
      for (const f of ['schueler', 'lehrer']) { show('blatt', f); const r = await capture(() => exportPDF()); if (r) add(`${base}${f === 'lehrer' ? '_Lehrerfassung' : ''}.pdf`, r.blob, `${lab}: ${f === 'lehrer' ? 'Lehrerfassung mit Erwartungen' : 'Schülerfassung'} (PDF)`); }
      show('blatt', 'schueler'); { const r = await capture(() => exportDOCX()); if (r) add(`${base}.docx`, r.blob, `${lab}: Word-Datei zum Weiterbearbeiten`); }
      add(`${base}_Erwartungshorizont.md`, new Blob([ehMarkdown()], { type: 'text/markdown' }), `${lab}: Erwartungshorizont`);
      if (tipCards().length) { show('tipps'); const r = await capture(() => exportPDF()); if (r) add(`${base}_Tippkarten.pdf`, r.blob, `${lab}: Tippkarten`); show('blatt'); }
      try { overlay(`Digitale Fassung … ${lab}`); const m = P.meta; const html = dgDoc(await dgBuild({ id: (m.dg && m.dg.id) || dgId(), ...dgOpts() })); add(`${base}_digital.html`, new Blob([html], { type: 'text/html' }), `${lab}: digitale Fassung zum Ausfüllen im Browser`); } catch (err) { console.error(err); notes.push(`${lab}: digitale Fassung ließ sich nicht erstellen.`); }
    }
    if (P.abs) abSwitch(keep.ab, true);
    const stem = P.abs ? 'Stunde' : fileBase(); const SB = stBlocks();
    if ((P.cards || []).length) { overlay('Tafelkarten …'); show('karten'); const r = await capture(() => exportPDF()); if (r) add(`${stem}_Tafelkarten.pdf`, r.blob, 'Tafelkarten'); }
    if (SB.some(b => b.type === 'tafel')) { overlay('Tafelbild …'); for (const f of ['lehrer', 'schueler']) { show('tafel', f); const r = await capture(() => exportPDF()); if (r) add(`${stem}_Tafelbild${f === 'schueler' ? '_Lueckenfassung' : ''}.pdf`, r.blob, f === 'schueler' ? 'Tafelbild als Lückenfassung' : 'Tafelbild vollständig (A4 quer)'); } }
    if (SB.some(b => b.type === 'a3' && a3Fmt(b) === 'a4')) { overlay('A4-Vorlagen …'); show('a4'); const r = await capture(() => exportPDF()); if (r) add(`${stem}_A4-Vorlagen.pdf`, r.blob, 'A4-Vorlagen: Karten, Lernkarten, Satzstreifen, Tandembogen'); }
    if (SB.some(b => b.type === 'a3' && a3Fmt(b) === 'a3')) { overlay('A3-Vorlagen …'); for (const p of ['a3', 'a4x2']) { state.a3p = p; show('a3'); const r = await capture(() => exportPDF()); if (r) add(`${stem}_A3-Vorlagen${p === 'a4x2' ? '_2xA4' : ''}.pdf`, r.blob, p === 'a4x2' ? 'A3-Vorlagen verteilt auf je zwei A4-Blätter zum Kleben' : 'A3-Vorlagen in A3'); } state.a3p = keep.a3p; }
    if (exitSteps().length) { overlay('Exit-Tickets …'); show('exit'); const r = await capture(() => exportPDF()); if (r) add(`${stem}_Exit-Tickets.pdf`, r.blob, 'Exit-Tickets zum Ausdrucken und Ausschneiden'); }
    show('blatt', 'schueler');
    overlay('Präsentation …'); { const r = await capture(() => exportPPTX()); if (r) add(`${stem}_Praesentation.pptx`, r.blob, 'Präsentation (PowerPoint)'); else notes.push('Die PowerPoint-Datei fehlt: Dafür braucht der Browser Internet.'); }
    const title = stTitle(P); const folder = slug(title) ? (P.abs ? 'Stunde_' : (stNr(P) ? 'AB' + slug(String(stNr(P))) + '_' : '')) + slug(title) : 'Stunde';
    const inhalt = [`Stunde: ${title}`, [P.meta.course, P.meta.school].filter(Boolean).join(' · '), `Zusammengestellt mit dem LehrWerk am ${new Date().toLocaleDateString('de-DE')}`, '', 'Inhalt:', ...files.map(f => `${f.name}  –  ${f.what}`), ...(notes.length ? ['', 'Hinweise:', ...notes] : [])].join('\r\n');
    files.push({ name: '00_Inhalt.txt', blob: new Blob([inhalt], { type: 'text/plain' }) });
    overlay('Ordner wird gespeichert …');
    if (window.abDesktop && window.abDesktop.saveFolder) {
      const list = []; for (const f of files) list.push({ name: f.name, bytes: new Uint8Array(await f.blob.arrayBuffer()) });
      const r = await window.abDesktop.saveFolder(folder, list); overlay('');
      if (r && r.ok) toast(`Stunde gespeichert: ${r.n} Dateien im Ordner „${folder}“`, 'Ordner öffnen', () => window.abDesktop.open(r.path)); else if (r && r.canceled) toast('Speichern abgebrochen'); else toast('Der Ordner ließ sich nicht speichern.');
    } else {
      await loadScript(LIBS.zip); const zip = new window.JSZip(); const dir = zip.folder(folder); files.forEach(f => dir.file(f.name, f.blob));
      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' }); overlay('');
      await deliver(folder + '.zip', blob);
    }
  } catch (err) { console.error(err); toast('Die Stunde ließ sich nicht vollständig ausgeben.'); }
  finally {
    CAPTURE = null; if (P.abs) abSwitch(keep.ab, true); Object.assign(state, { out: keep.out, fassung: keep.fassung, grp: keep.grp, lvl: keep.lvl, a3p: keep.a3p, sel: keep.sel });
    stundeRun = false; overlay(''); renderEditor(); clearTimeout(renderTimer); renderPreview();
  }
}
async function deliver(name, blob) {
  if (CAPTURE) { CAPTURE(blob, name); return; }
  if (window.abDesktop) {
    try {
      const r = await window.abDesktop.save(name, new Uint8Array(await blob.arrayBuffer()));
      if (r && r.ok) toast(`${r.name} gespeichert`, 'Ordner öffnen', () => window.abDesktop.reveal(r.path));
      else if (r && r.canceled) toast('Speichern abgebrochen');
      else toast('Die Datei konnte nicht gespeichert werden.');
    } catch (err) { console.error(err); toast('Die Datei konnte nicht gespeichert werden.'); }
    return;
  }
  if (store.dl) {
    try { await store.dl.save({ filename: name, data: blob }); toast(`${name} gespeichert`); return; }
    catch (err) {
      const c = err && err.code;
      if (c === 'declined') { toast('Speichern abgebrochen'); return; }
      if (c === 'rate_limited') { toast('Bitte kurz warten und erneut versuchen'); return; }
      if (c === 'too_large') { toast('Die Datei ist zu groß für dieses Ziel'); return; }
    }
  }
  if (!isFramed || location.protocol === 'file:') {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000); toast('Download gestartet'); return;
  }
  toast('Dateien lassen sich in dieser Ansicht nicht speichern. Öffne die Seite in claude.ai.');
}
async function fontsIn(doc) { const specs = FONT_SPECS.concat(DESIGN_FONTS[designOf(state.sheet.meta)] || [], EXTRA_FONTS); try { await Promise.race([Promise.all(specs.map(f => doc.fonts.load(f))), wait(3500)]); } catch {} }

const outSuffix = () => state.out === 'exit' ? '_Exit-Tickets' : state.out === 'a4' ? '_A4-Vorlagen' : state.out === 'a3' ? (state.a3p === 'a4x2' ? '_A3-Vorlagen_2xA4' : '_A3-Vorlagen') : state.out === 'tipps' ? '_Tippkarten' : state.out === 'tafel' ? (state.fassung === 'lehrer' ? '_Tafelbild' : '_Tafelbild_Lueckenfassung') : state.out === 'karten' ? '_Tafelkarten'
  : (state.fassung === 'lehrer' ? '_Lehrerfassung' : '') + (state.sheet.meta.groupsOn && state.grp !== 'all' ? '_Gruppe-' + state.grp : '') + (state.sheet.meta.levelsOn && state.lvl && state.lvl !== 'all' ? '_' + LV[state.lvl].name : '') + (state.sheet.meta.paper === 'a5x2' ? '_A5' : state.sheet.meta.paper === 'buch' ? '_A5-Buch' : '');
async function exportPDF() {
  if (busy) return;
  clearTimeout(renderTimer); renderPreview();
  const pages = [...document.querySelectorAll('#pages .pout')];
  if (!pages.length) { toast(state.out === 'exit' ? 'Es gibt noch kein Exit-Ticket.' : state.out === 'tipps' ? 'Es gibt noch keine Tippkarten.' : state.out === 'tafel' ? 'Es gibt noch kein Tafelbild.' : state.out === 'a3' ? 'Es gibt noch keine A3-Vorlage.' : state.out === 'a4' ? 'Es gibt noch keine A4-Vorlage.' : 'Es gibt noch keine Tafelkarten.'); return; }
  busy = true;
  try { await pagesToPdf(pages, fileBase() + outSuffix() + '.pdf', { title: (state.sheet.meta.nr ? 'AB ' + state.sheet.meta.nr + ' – ' : '') + (state.sheet.meta.title || ''), subject: state.sheet.meta.topic || '' }); }
  finally { busy = false; }
}
async function pagesToPdf(pages, name, props) {
  if (window.abDesktop && CAPTURE && window.abDesktop.pdfData) {
    try { await fontsIn(document); const info = preparePrint(); if (!info) return; const bytes = await window.abDesktop.pdfData(info); CAPTURE(new Blob([bytes], { type: 'application/pdf' }), name); } catch (err) { console.error(err); }
    return;
  }
  if (window.abDesktop) {
    try {
      overlay('PDF wird erstellt …'); await fontsIn(document);
      const info = preparePrint(); if (!info) return; info.name = name;
      const r = await window.abDesktop.pdf(info);
      overlay('');
      if (r && r.ok) toast(`${r.name} gespeichert`, 'Öffnen', () => window.abDesktop.open(r.path));
      else if (r && r.canceled) toast('Speichern abgebrochen');
      else toast('PDF konnte nicht erstellt werden. Bitte erneut versuchen.');
    } catch (err) { console.error(err); toast('PDF konnte nicht erstellt werden. Bitte erneut versuchen.'); }
    finally { overlay(''); }
    return;
  }
  try {
    overlay('PDF wird vorbereitet …');
    await Promise.all([loadScript(LIBS.h2c), loadScript(LIBS.pdf)]);
    const { jsPDF } = window.jspdf; let pdf = null;
    for (let i = 0; i < pages.length; i++) {
      overlay(`PDF wird erstellt … ${i + 1} von ${pages.length}`);
      const pg = pages[i]; const wmm = +pg.dataset.w || 210, hmm = +pg.dataset.h || 297; const orient = wmm > hmm ? 'landscape' : 'portrait';
      pg.setAttribute('data-x', '1');
      let canvas;
      try {
        canvas = await window.html2canvas(pg, {
          scale: Math.max(wmm, hmm) > 300 ? 1.8 : 2.5, backgroundColor: '#ffffff', useCORS: true, logging: false,
          x: 0, y: 0, width: Math.round(wmm * MMPX), height: Math.round(hmm * MMPX), scrollX: 0, scrollY: 0, windowWidth: Math.max(1400, Math.round(wmm * MMPX) + 40), windowHeight: Math.max(1400, Math.round(hmm * MMPX) + 40),
          onclone: async doc => {
            const c = doc.querySelector('[data-x="1"]');
            const host = doc.createElement('div'); host.style.cssText = 'position:absolute;left:0;top:0;margin:0;padding:0;background:#fff;z-index:9999';
            doc.body.appendChild(host); host.appendChild(c);
            c.style.transform = 'none'; c.style.boxShadow = 'none'; c.style.position = 'relative';
            c.querySelectorAll('.is-sel,.zsel').forEach(n => n.classList.remove('is-sel', 'zsel')); c.querySelectorAll('.lb-tip').forEach(n => n.remove());
            const app = doc.getElementById('app'); if (app) app.style.display = 'none';
            const mh = doc.getElementById('measure-host'); if (mh) mh.remove();
            doc.documentElement.style.padding = '0'; doc.body.style.padding = '0'; doc.body.style.margin = '0';
            await fontsIn(doc);
          }
        });
      } finally { pg.removeAttribute('data-x'); }
      const pf = Math.min(wmm, hmm) === 210 && Math.max(wmm, hmm) === 297 ? 'a4' : [Math.min(wmm, hmm), Math.max(wmm, hmm)];
      if (!pdf) pdf = new jsPDF({ unit: 'mm', format: pf, orientation: orient, compress: true }); else pdf.addPage(pf, orient);
      pdf.addImage(canvas.toDataURL('image/jpeg', .92), 'JPEG', 0, 0, wmm, hmm, undefined, 'FAST');
    }
    pdf.setProperties({ title: props.title || '', subject: props.subject || '', creator: 'LehrWerk' });
    overlay('');
    await deliver(name, pdf.output('blob'));
  } catch (err) { console.error(err); overlay(''); toast('PDF konnte nicht erstellt werden. Bitte erneut versuchen.'); }
  finally { overlay(''); }
}

