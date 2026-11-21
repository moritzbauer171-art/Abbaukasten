/* ================= Texterkennung: Material aus Foto oder PDF =================
   Fotos und gescannte Seiten erkennt Tesseract (Sprachpaket Deutsch, wird beim ersten Mal geladen und im Browser zwischengespeichert).
   PDFs mit Textebene liest pdf.js direkt aus. Danach dieselbe Aufbereitung wie beim Einfügen: Trennstriche, Zeilennummern, Absätze. */
const OCR_LIBS = { tess: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js', pdf: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', pdfw: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js' };
const CAM_SVG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5h3l1.5-2h6l1.5 2h3v9.5h-15z"/><circle cx="10" cy="11" r="3"/></svg>';
const OCR_ST = { 'loading tesseract core': 'Texterkennung wird geladen …', 'initializing tesseract': 'Texterkennung startet …', 'loading language traineddata': 'Deutsches Sprachpaket wird geladen (beim ersten Mal einige MB) …', 'loading language traineddata (from cache)': 'Sprachpaket wird geladen …', 'initializing api': 'Texterkennung startet …', 'recognizing text': 'Text wird erkannt …' };
let ocrW = null, ocrRun = 0;
function ocrProg(msg, p) {
  const d = state.dlg; if (!d || d.mode !== 'ocr') return; d.msg = msg; if (p != null) d.p = p;
  const m = $('#ocr-msg'), b = $('#ocr-bar'); if (m) m.textContent = msg; if (b) b.style.width = Math.round((d.p || 0) * 100) + '%';
}
let ocrLang = '';
async function ocrWorker() {
  const want = ({ en: 'eng', es: 'spa', fr: 'fra' })[fachLang()] || 'deu';
  if (ocrW && ocrLang !== want) { try { await ocrW.terminate(); } catch {} ocrW = null; }
  if (ocrW) return ocrW; ocrLang = want;
  await loadScript(OCR_LIBS.tess);
  if (!window.Tesseract || !window.Tesseract.createWorker) throw new Error('Tesseract fehlt');
  ocrW = await window.Tesseract.createWorker(({ en: 'eng', es: 'spa', fr: 'fra' })[fachLang()] || 'deu', 1, { logger: m => { if (m && m.status) ocrProg(OCR_ST[m.status] || 'Texterkennung …', m.progress); } });
  return ocrW;
}
function ocrStop() { const w = ocrW; ocrW = null; if (w) { try { w.terminate(); } catch {} } }
function openOcr(bid, file) {
  const b = target(bid); if (!b || b.type !== 'material') return;
  state.dlg = { mode: 'ocr', bid, step: 'pick', poem: b.form === 'gedicht', rot: 0, pages: '', err: '' };
  renderDlg(); if (file) ocrTake(file);
}
function ocrRead() {
  const d = state.dlg; if (!d || d.mode !== 'ocr') return;
  const p = $('#ocr-poem'), g = $('#ocr-pages'), t = $('#ocr-t'); if (p) d.poem = p.checked; if (g) d.pages = g.value; if (t) d.text = t.value;
}
function ocrTake(file) {
  const d = state.dlg; if (!d || d.mode !== 'ocr' || !file) return; ocrRead();
  const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  if (!pdf && !/^image\/(png|jpe?g|webp|gif|bmp)/i.test(file.type || '')) { d.err = 'Bitte ein Foto (JPG oder PNG) oder ein PDF wählen.'; renderDlg(); return; }
  if (d.url) URL.revokeObjectURL(d.url);
  Object.assign(d, { file, kind: pdf ? 'pdf' : 'img', url: pdf ? '' : URL.createObjectURL(file), rot: 0, err: '', step: 'prep', npages: 0 });
  renderDlg();
  if (pdf) (async () => { try { const doc = await ocrPdfDoc(file); if (state.dlg === d) { d.npages = doc.numPages; if (d.step === 'prep') renderDlg(); } } catch (err) { console.error(err); } })();
}
async function ocrPdfDoc(file) {
  await loadScript(OCR_LIBS.pdf); await loadScript(OCR_LIBS.pdfw); // Worker-Skript im Hauptfenster: läuft auch dort, wo fremde Worker gesperrt sind
  const L = window.pdfjsLib; if (!L) throw new Error('pdf.js fehlt'); L.GlobalWorkerOptions.workerSrc = OCR_LIBS.pdfw;
  return L.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
}
const ocrPages = (spec, n) => {
  const s = String(spec || '').trim(); if (!s) return Array.from({ length: Math.min(n, 12) }, (_, i) => i + 1);
  const out = []; s.split(/[,;]+/).forEach(p => { const m = p.trim().match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/); if (!m) return; const a = +m[1], b = m[2] ? +m[2] : a; for (let i = Math.max(1, Math.min(a, b)); i <= Math.min(n, Math.max(a, b)); i++) if (!out.includes(i)) out.push(i); });
  return out.slice(0, 30);
};
// Textebene eines PDFs: Zeilen nach Höhe sammeln, große Abstände werden Absätze
function pdfItemsText(items) {
  const rows = [];
  items.forEach(it => {
    const s = it.str || ''; if (!s) return; const tr = it.transform || [1, 0, 0, 1, 0, 0]; const x = tr[4], y = tr[5]; const h = Math.abs(it.height || tr[3]) || 10;
    let r = rows[rows.length - 1];
    if (!r || Math.abs(r.y - y) > h * .6) { r = { y, h, t: '', x2: x }; rows.push(r); }
    if (r.t && !/\s$/.test(r.t) && !/^\s/.test(s) && x - r.x2 > h * .2) r.t += ' ';
    r.t += s; r.x2 = x + (it.width || 0);
  });
  const L = rows.filter(r => r.t.trim()); if (!L.length) return '';
  const gaps = L.slice(1).map((r, i) => L[i].y - r.y).filter(g => g > 0).sort((a, b) => a - b); const med = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  let out = L[0].t.trim();
  for (let i = 1; i < L.length; i++) { const g = L[i - 1].y - L[i].y; out += (med && (g > med * 1.45 || g < 0) ? '\n\n' : '\n') + L[i].t.trim(); }
  return out;
}
async function ocrCanvas(url, rot) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Bild nicht lesbar')); i.src = url; });
  let w = img.naturalWidth, h = img.naturalHeight; const long = Math.max(w, h);
  const sc = long > 2600 ? 2600 / long : long < 1400 ? Math.min(2, 1400 / long) : 1; w = Math.round(w * sc); h = Math.round(h * sc);
  const q = rot % 180 !== 0; const c = document.createElement('canvas'); c.width = q ? h : w; c.height = q ? w : h;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.translate(c.width / 2, c.height / 2); x.rotate(rot * Math.PI / 180); try { x.filter = 'grayscale(1) contrast(1.15)'; } catch {}
  x.drawImage(img, -w / 2, -h / 2, w, h); return c;
}
async function ocrPdf(file, spec, run) {
  ocrProg('PDF wird geöffnet …', 0);
  const doc = await ocrPdfDoc(file); const list = ocrPages(spec, doc.numPages); const parts = []; let ocr = 0, txt = 0;
  for (let k = 0; k < list.length; k++) {
    if (run !== ocrRun) return { text: '', ocr, txt };
    ocrProg(`Seite ${list[k]} von ${doc.numPages} …`, k / list.length);
    const page = await doc.getPage(list[k]); const t = pdfItemsText((await page.getTextContent()).items);
    if (t.replace(/\s/g, '').length >= 30) { parts.push(t); txt++; continue; }
    const vp = page.getViewport({ scale: 2.2 }); const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); await page.render({ canvasContext: cx, viewport: vp }).promise;
    const w = await ocrWorker(); if (run !== ocrRun) return { text: '', ocr, txt };
    const { data } = await w.recognize(c); parts.push(data.text || ''); ocr++;
  }
  return { text: parts.join('\n\n'), ocr, txt };
}
function ocrClean(raw, poem) {
  let t = String(raw || '').replace(/\r/g, '').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff').replace(/[|]/g, 'I')
    .replace(/[ \t]+$/gm, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  // Zeilen, die nur aus einer Zahl bestehen (Zeilen- oder Seitenzahlen am Rand), und Trennungen über eine Leerzeile hinweg
  let solo = 0, hy0 = 0; t = t.split('\n').filter(l => { if (/^\s*\d{1,3}\s*$/.test(l)) { solo++; return false; } return true; }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!poem) t = t.replace(/(\p{L})-[ \t]*\n[ \t]*\n[ \t]*(\p{Ll})/gu, (m, a, b) => { hy0++; return a + b; });
  const notes = []; const r = cleanPdf(t, poem); t = r.t; const hy = r.hy + hy0, ln = r.ln + solo;
  if (hy) notes.push(`${hy} ${hy === 1 ? 'Trennstrich' : 'Trennstriche'} zusammengefügt`); if (ln) notes.push(`${ln} ${poem ? (ln === 1 ? 'Versnummer' : 'Versnummern') : (ln === 1 ? 'Zeilennummer' : 'Zeilennummern')} entfernt`);
  if (!poem) { const g = guessParas(t); t = g !== t ? g : joinLines(t); }
  return { t: deQuoteStr(t).trim(), notes };
}
async function ocrGo() {
  const d = state.dlg; if (!d || d.mode !== 'ocr' || !d.file) return; ocrRead();
  const run = ++ocrRun; Object.assign(d, { step: 'run', msg: 'Wird vorbereitet …', p: 0, err: '' }); renderDlg(); const t0 = Date.now();
  try {
    let raw = ''; const note = [];
    if (d.kind === 'pdf') { const r = await ocrPdf(d.file, d.pages, run); raw = r.text; if (r.txt) note.push(`${r.txt} ${r.txt === 1 ? 'Seite' : 'Seiten'} aus der Textebene`); if (r.ocr) note.push(`${r.ocr} ${r.ocr === 1 ? 'Seite' : 'Seiten'} per Texterkennung`); }
    else { const c = await ocrCanvas(d.url, d.rot); if (run !== ocrRun) return; const w = await ocrWorker(); if (run !== ocrRun) return; ocrProg('Text wird erkannt …', 0); const { data } = await w.recognize(c); raw = data.text || ''; if (data.confidence != null) note.push(`Sicherheit ${Math.round(data.confidence)} %`); }
    if (run !== ocrRun || state.dlg !== d) return;
    if (!raw.replace(/\s/g, '')) { Object.assign(d, { step: 'prep', err: 'Hier wurde kein Text gefunden. Ein gerades, scharfes Foto bei gutem Licht hilft, eventuell erst drehen.' }); renderDlg(); return; }
    const cl = ocrClean(raw, d.poem); Object.assign(d, { text: cl.t, step: 'done', info: [...note, ...cl.notes, `${Math.max(1, Math.round((Date.now() - t0) / 1000))} s`].join(' · ') }); renderDlg();
  } catch (err) {
    console.error(err); if (run !== ocrRun || state.dlg !== d) return; ocrStop();
    Object.assign(d, { step: 'prep', err: 'Die Texterkennung ließ sich nicht starten. Beim ersten Mal braucht sie eine Internetverbindung, um das Sprachpaket zu laden. Bitte erneut versuchen.' }); renderDlg();
  }
}
function ocrApply(how) {
  ocrRead(); const d = state.dlg; const b = d && target(d.bid); const t = String(d && d.text || '').trim(); if (!b || !t) return;
  if (d.poem && b.form !== 'gedicht') b.form = 'gedicht'; if (!d.poem && b.form === 'gedicht' && how === 'set') delete b.form;
  const old = String(b.text || '').trim();
  b.text = how === 'add' && old ? old + '\n\n' + t : t; b.nl = 1;
  closeDlg(); state.closed.delete(b.id); changed(true);
  toast('Text übernommen. Bitte einmal gegenlesen, die Erkennung irrt sich gelegentlich.', 'Rückgängig', histUndo);
}
function ocrHTML() {
  const d = state.dlg; const b = target(d.bid) || {}; const err = d.err ? `<div class="err" role="alert">${esc(d.err)}</div>` : '';
  const poemCk = `<label class="chk"><input type="checkbox" id="ocr-poem"${d.poem ? ' checked' : ''}>Gedicht: Verse und Strophen beibehalten</label>`;
  let body = '';
  if (d.step === 'pick') body = `<label class="ocr-drop" id="ocr-drop"><input type="file" id="ocr-file" accept="image/png,image/jpeg,image/webp,application/pdf,.pdf" hidden>${CAM_SVG}<b>Foto oder PDF wählen</b><span>oder hierher ziehen oder einfügen (Strg+V). Auf dem Handy geht auch die Kamera.</span></label>${poemCk}
    <p class="hint">Am besten gelingt ein gerades, scharfes Foto bei gutem Licht, auf dem nur der Text zu sehen ist. Aus PDFs mit Textebene wird der Text direkt übernommen.</p>`;
  if (d.step === 'prep') body = d.kind === 'img'
    ? `<div class="ocr-prev"><img src="${d.url}" alt="Vorschau"${d.rot % 180 ? ' class="q"' : ''} style="transform:rotate(${d.rot}deg)"></div><div class="row ocr-tools"><button class="btn sm" type="button" data-act="ocr-rot">↻ Drehen</button><button class="link" type="button" data-act="ocr-other">Anderes Bild</button></div>${poemCk}`
    : `<div class="ocr-pdf">PDF: <b>${esc(d.file.name || 'Dokument')}</b>${d.npages ? ` · ${d.npages} ${d.npages === 1 ? 'Seite' : 'Seiten'}` : ''}</div><label class="f"><span>Seiten</span><input class="inp" id="ocr-pages" type="text" value="${esc(d.pages)}" placeholder="leer = alle (bis 12), sonst z. B. 2–3"></label><div class="row ocr-tools"><button class="link" type="button" data-act="ocr-other">Andere Datei</button></div>${poemCk}`;
  if (d.step === 'run') body = `<div class="ocr-run"><div class="ocr-bar"><i id="ocr-bar" style="width:${Math.round((d.p || 0) * 100)}%"></i></div><span id="ocr-msg">${esc(d.msg || '…')}</span></div>`;
  if (d.step === 'done') body = `<label class="f"><span>Erkannter Text: bitte gegenlesen und bei Bedarf korrigieren</span><textarea class="inp ocr-t" id="ocr-t" rows="14" spellcheck="true" lang="de">${esc(d.text)}</textarea></label><small class="hint">${esc(d.info || '')}</small>`;
  const empty = !String(b.text || '').trim();
  const close = '<button class="btn" type="button" data-act="dlg-close">Abbrechen</button>';
  const btns = d.step === 'prep' ? `<button class="btn primary" type="button" data-act="ocr-go">${d.kind === 'pdf' ? 'Text holen' : 'Text erkennen'}</button>${close}`
    : d.step === 'run' ? '<button class="btn" type="button" data-act="ocr-cancel">Abbrechen</button>'
    : d.step === 'done' ? (empty ? '<button class="btn primary" type="button" data-act="ocr-apply" data-v="set">Ins Material übernehmen</button>' : '<button class="btn primary" type="button" data-act="ocr-apply" data-v="set">Text ersetzen</button><button class="btn" type="button" data-act="ocr-apply" data-v="add">Anhängen</button>') + close
    : close;
  return `<h2 id="dlg-t">Text aus Foto oder PDF</h2>${body}${err}<div class="row">${btns}</div>`;
}

