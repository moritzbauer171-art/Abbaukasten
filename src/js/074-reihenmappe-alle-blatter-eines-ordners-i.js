/* ================= Reihenmappe: alle Blätter eines Ordners in einer Datei ================= */
const LS_MPFMT = 'abw.mappefmt';
const MP_TOC_ROWS = 20;
function openMappeDlg(fid) {
  const f = state.prefs.folders.find(x => x.id === fid); if (!f) return;
  const kl = f.klasse; const order = libSort() === 'neu' ? 'nr' : libSort();
  const list = sortLibList(state.lib.filter(x => x.klasse === kl && folderOf(x.id, kl) === fid), fid, kl, order).map(x => ({ id: x.id, nr: x.nr, title: x.title }));
  const cur = state.sheet;
  if (cur && KL(cur.klasse).id === kl && folderOf(cur.id, kl) === fid) { const e = list.find(x => x.id === cur.id); if (e) { e.nr = String(cur.meta.nr || ''); e.title = cur.meta.title || 'Ohne Titel'; } else list.unshift({ id: cur.id, nr: String(cur.meta.nr || ''), title: cur.meta.title || 'Ohne Titel' }); }
  if (!list.length) { toast('Der Ordner ist noch leer.'); return; }
  state.dlg = { mode: 'mappe', fid, kl, list, off: new Set(), title: f.name, sub: '', fassung: 'schueler', cover: true, toc: true, fmt: lsGet(LS_MPFMT) === 'print' && canPrint ? 'print' : 'pdf' };
  renderDlg();
}
function mappeHTML() {
  const d = state.dlg; const n = d.list.length - d.off.size;
  const seg = (f, opts, cur) => `<div class="seg sm" role="group">${opts.map(([v, t]) => `<button type="button" data-act="mp-set" data-f="${f}" data-v="${v}" aria-pressed="${cur === v}">${t}</button>`).join('')}</div>`;
  return `<h2 id="dlg-t">Als Mappe ausgeben</h2>
    <p class="rlp-stat">Die Blätter des Ordners hintereinander in einer Datei, mit Deckblatt, Inhaltsverzeichnis und durchgehenden Seitenzahlen.</p>
    <div class="row mp-row"><label class="f"><span>Titel</span><input class="inp" id="mp-title" type="text" maxlength="80" value="${esc(d.title)}"></label><label class="f"><span>Unterzeile</span><input class="inp" id="mp-sub" type="text" maxlength="100" value="${esc(d.sub)}" placeholder="z. B. 1. Kurshalbjahr"></label></div>
    <div class="f"><span>Fassung</span>${seg('fassung', [['schueler', 'Schülerfassung'], ['lehrer', 'Lehrerfassung']], d.fassung)}</div>
    <div class="f"><div class="chks"><label class="chk"><input type="checkbox" id="mp-cover"${d.cover ? ' checked' : ''}>Deckblatt</label><label class="chk"><input type="checkbox" id="mp-toc"${d.toc ? ' checked' : ''}>Inhaltsverzeichnis</label></div></div>
    <div class="f"><span id="mp-n">Blätter: ${n} von ${d.list.length}</span><div class="mp-list">${d.list.map(x => `<label class="chk"><input type="checkbox" data-mpid="${esc(x.id)}"${d.off.has(x.id) ? '' : ' checked'}><span>${x.nr ? `<b>AB ${esc(x.nr)}</b> ` : ''}${esc(x.title || 'Ohne Titel')}</span></label>`).join('')}</div><small>Reihenfolge wie im Ordner. Umstellen: in „Meine Stunden“ ziehen.</small></div>
    ${canPrint ? `<div class="f"><span>Als</span>${seg('fmt', [['pdf', 'PDF'], ['print', 'Drucken']], d.fmt)}</div>` : ''}
    <div class="row"><button class="btn primary" type="button" data-act="mp-go"${n ? '' : ' disabled'}>${d.fmt === 'print' ? 'Drucken' : 'PDF erstellen'}</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
}
function mappeRead() {
  const d = state.dlg; if (!d || d.mode !== 'mappe') return;
  const t = $('#mp-title'), u = $('#mp-sub'), c = $('#mp-cover'), o = $('#mp-toc');
  if (t) d.title = t.value; if (u) d.sub = u.value; if (c) d.cover = c.checked; if (o) d.toc = o.checked;
  document.querySelectorAll('#dlg-root [data-mpid]').forEach(x => { if (x.checked) d.off.delete(x.dataset.mpid); else d.off.add(x.dataset.mpid); });
}
function mpPage(meta) { const pg = document.createElement('div'); pg.className = 'page mp'; setAccent(pg, meta); pg.dataset.w = 210; pg.dataset.h = 297; return pg; }
function mpNumber(pg, n, total) {
  const f = pg.querySelector(':scope > .pg-foot'); const r = f && f.lastElementChild; if (!r) return;
  const lab = `Seite ${n} von ${total}`; const x = r.querySelector('.pg-no');
  if (x) x.textContent = lab; else r.insertAdjacentHTML('beforeend', (r.textContent.trim() ? ' · ' : '') + `<span class="pg-no">${lab}</span>`);
}
function mpEntry(sh) {
  const m = sh.meta; const isK = m.mode === 'klausur';
  return { nr: isK ? ((m.exam && m.exam.label) || 'Klausur') : (m.nr ? 'AB ' + m.nr : ''), title: m.title || 'Ohne Titel', topic: isK ? '' : String(m.topic || '').trim(), std: rlpSheetIds(sh).map(id => { const x = rlpInfo(id); return x.own ? 'eigen' : x.code; }) };
}
function mappeAssemble(parts, opt) {
  const meta0 = parts[0].sh.meta, K = KL(parts[0].sh.klasse), lehrer = opt.fassung === 'lehrer';
  const school = meta0.school || K.school || '', course = meta0.course || K.course || '';
  const nToc = opt.toc ? Math.ceil(parts.length / MP_TOC_ROWS) : 0;
  // Seitengruppen: eine Nummer je Seite, bei „A5 doppelt“ tragen beide Kopien dieselbe
  const groups = parts.map(p => p.units.flatMap(u => !u.classList.contains('bogen') ? [[u]] : u.classList.contains('buch') ? [...u.querySelectorAll(':scope > .page')].map(x => [x]) : [[...u.querySelectorAll(':scope > .page')]]));
  const before = (opt.cover ? 1 : 0) + nToc; const total = before + groups.reduce((a, g) => a + g.length, 0);
  let no = before; const starts = groups.map(g => { const st = no + 1; g.forEach(gr => { no++; gr.forEach(pg => mpNumber(pg, no, total)); }); return st; });
  const out = [];
  if (opt.cover) {
    const pg = mpPage(meta0); pg.classList.add('mp-cover');
    pg.innerHTML = `<div class="mp-c-top"><span>${esc(school)}</span><span>${esc(course)}</span></div>
      <div class="mp-c-mid"><div class="mp-c-kick">Mappe · ${parts.length} ${parts.length === 1 ? 'Blatt' : 'Blätter'}</div><h1>${esc(opt.title || 'Reihe')}</h1>${String(opt.sub || '').trim() ? `<p>${esc(opt.sub.trim())}</p>` : ''}<div class="mp-c-rule"></div></div>
      ${lehrer ? '' : '<div class="mp-c-name"><span>Name</span><i></i></div>'}
      <div class="mp-c-foot"><span>${lehrer ? 'Lehrerfassung' : ''}</span><span>${esc(new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }))}</span></div>`;
    if (lehrer) pg.appendChild(el('<div class="pg-badge">Lehrerfassung</div>'));
    out.push(pg);
  }
  const left = [school, course].filter(Boolean).map(esc).join(' · ');
  for (let t = 0; t < nToc; t++) {
    const pg = mpPage(meta0); pg.classList.add('mp-toc'); const a = t * MP_TOC_ROWS;
    const rows = parts.slice(a, a + MP_TOC_ROWS).map((p, j) => ({ ...mpEntry(p.sh), page: starts[a + j] }));
    pg.innerHTML = `<div class="pg-body"><div class="mp-t-h"><h2>Inhalt${t ? ' (Fortsetzung)' : ''}</h2><span>${esc(opt.title || '')}</span></div>
      <ol class="mp-t-list">${rows.map(r => `<li><span class="nr">${esc(r.nr)}</span><span class="tt"><b>${esc(r.title)}</b>${r.topic ? `<small>${esc(r.topic)}</small>` : ''}${lehrer && r.std.length ? `<small class="std">Standards: ${esc(r.std.join(' · '))}</small>` : ''}</span><span class="dots"></span><span class="pn">${r.page}</span></li>`).join('')}</ol></div>
      <div class="pg-foot"><span>${left}</span><span>${lehrer ? 'Lehrerfassung · ' : ''}<span class="pg-no">Seite ${(opt.cover ? 2 : 1) + t} von ${total}</span></span></div>`;
    if (lehrer) pg.appendChild(el('<div class="pg-badge">Lehrerfassung</div>'));
    out.push(pg);
  }
  parts.forEach(p => out.push(...p.units));
  return { units: out, total };
}
async function mappeGo() {
  mappeRead(); const d = state.dlg; if (!d || busy) return;
  const ids = d.list.filter(x => !d.off.has(x.id)).map(x => x.id); if (!ids.length) return;
  lsSet(LS_MPFMT, d.fmt); const opt = { ...d }; state.dlg = null; renderDlg();
  if (state.libOpen) { state.libOpen = false; renderLib(); }
  busy = true; const orig = state.sheet; const keep = { fassung: state.fassung, grp: state.grp, lvl: state.lvl, out: state.out, bookPages: state.bookPages };
  let res = null;
  try {
    const sheets = [];
    for (let j = 0; j < ids.length; j++) {
      overlay(`Mappe: Blätter werden geladen … ${j + 1} von ${ids.length}`);
      if (ids[j] === orig.id) { sheets.push(orig); continue; }
      try { const sh = backend ? await backend.load(ids[j]) : null; if (sh) sheets.push(normalizeSheet(sh)); } catch (err) { console.error(err); }
    }
    if (!sheets.length) throw new Error('Keine Blätter geladen');
    overlay('Mappe wird gesetzt …');
    const designs = [...new Set(sheets.map(sh => designOf(sh.meta)))];
    EXTRA_FONTS = designs.flatMap(dg => DESIGN_FONTS[dg] || []);
    try { await Promise.race([Promise.all(FONT_SPECS.concat(EXTRA_FONTS).map(f => document.fonts.load(f))), wait(3500)]); } catch {}
    MAPPE_LOCK = true; clearTimeout(renderTimer);
    state.out = 'blatt'; state.fassung = opt.fassung; state.grp = 'all'; state.lvl = 'all';
    const parts = [];
    try { for (const sh of sheets) { state.sheet = sh; abNorm(sh); (sh.abs ? sh.abs.map((_, k) => k) : [0]).forEach(k => withAB(k, () => parts.push({ sh: { ...sh, meta: { ...sh.meta }, blocks: sh.blocks.slice() }, units: layout().map(o => o.pg) }))); } }
    finally { state.sheet = orig; Object.assign(state, keep); }
    res = mappeAssemble(parts, opt);
    if (sheets.length < ids.length) toast(`${ids.length - sheets.length} ${ids.length - sheets.length === 1 ? 'Blatt ließ' : 'Blätter ließen'} sich nicht laden und fehlen in der Mappe.`);
  } catch (err) { console.error(err); MAPPE_LOCK = false; EXTRA_FONTS = []; overlay(''); busy = false; renderPreview(); toast('Die Mappe konnte nicht erstellt werden. Bitte erneut versuchen.'); return; }
  // Die Seiten kommen kurz in die Vorschau; PDF und Druck verarbeiten sie dort wie gewohnt
  const host = $('#pages'); host.innerHTML = '';
  res.units.forEach(u => { u.classList.add('pout'); const slot = document.createElement('div'); slot.className = 'slot'; slot.appendChild(u); host.appendChild(slot); });
  applyScale(); lbArrows(host); $('#pagecount').textContent = `Mappe · ${res.total} Seiten`;
  const name = 'Mappe_' + slug(opt.title || 'Reihe') + (opt.fassung === 'lehrer' ? '_Lehrerfassung' : '') + '.pdf';
  try {
    if (opt.fmt === 'print') { overlay(''); await fontsIn(document); doPrint(); }
    else await pagesToPdf([...host.querySelectorAll('.pout')], name, { title: 'Mappe: ' + (opt.title || ''), subject: opt.sub || '' });
  } finally { MAPPE_LOCK = false; EXTRA_FONTS = []; busy = false; overlay(''); renderPreview(); }
}

let busy = false;

/* ---------- Word (.docx), selbst gebautes OOXML ---------- */
const TW = mm => Math.round(mm * 56.6929);
let CW = TW(174); // Satzbreite; bei A4 quer 261 mm (wird beim Export gesetzt)
const xesc = s => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SANS = 'Arial', SERIF = 'Georgia';
function xr(text, o = {}) {
  if (!o.emo && text && EMO_TEST.test(text)) return String(text).split(EMO_SPLIT).map((part, i) => part ? xr(part, i % 2 ? { ...o, font: 'Segoe UI Emoji', ea: 1, emo: 1 } : { ...o, emo: 1 }) : '').join('');
  const p = [];
  if (o.font) p.push(`<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"${o.ea ? ` w:eastAsia="${o.font}"` : ''}/>`);
  if (o.b) p.push('<w:b/><w:bCs/>');
  if (o.i) p.push('<w:i/><w:iCs/>');
  if (o.caps) p.push('<w:caps/>');
  if (o.color) p.push(`<w:color w:val="${o.color}"/>`);
  if (o.sp) p.push(`<w:spacing w:val="${o.sp}"/>`);
  if (o.sz) p.push(`<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`);
  if (o.u) p.push('<w:u w:val="single"/>');
  if (o.mark) p.push(`<w:shd w:val="clear" w:color="auto" w:fill="${o.mark}"/>`);
  if (o.sup) p.push('<w:vertAlign w:val="superscript"/>');
  return `<w:r>${p.length ? `<w:rPr>${p.join('')}</w:rPr>` : ''}<w:t xml:space="preserve">${xesc(text)}</w:t></w:r>`;
}
let DOCX_MARK = 'C9D3EA', DOCX_ACC = '1F4FA0';
const xfnRef = (id, mark, base) => `<w:r><w:rPr>${base.font ? `<w:rFonts w:ascii="${base.font}" w:hAnsi="${base.font}" w:cs="${base.font}"/>` : ''}${base.sz ? `<w:sz w:val="${base.sz}"/><w:szCs w:val="${base.sz}"/>` : ''}<w:vertAlign w:val="superscript"/></w:rPr><w:footnoteReference w:id="${id}"/></w:r>`;
const xrInline = (str, base = {}) => inlineTokens(str).map(t => t.gap ? xr(' '.repeat(18), { ...base, b: 0, i: 0, u: 1, mark: null }) : String(t.t).split(/(\d+)/).map((part, i) => i % 2 ? (base.fn && base.fn(part) ? xfnRef(base.fn(part), part, base) : xr(part, { ...base, sup: 1 })) : (part ? xr(part, { ...base, b: base.b || t.b, i: base.i || t.i, u: base.u || t.u, mark: t.m ? DOCX_MARK : base.mark, sup: t.sup }) : '')).join('')).join('');
// Absätze mit Listen als Word-Absätze (Aufzählung mit hängendem Einzug)
function xpRich(str, base = {}, o = {}) {
  const L = o.indMm || 0; const out = []; const indP = L ? `<w:ind w:left="${TW(L)}"/>` : '';
  lineParas(str).forEach(p => {
    let buf = [], n = 0;
    const flushP = () => { if (buf.length) out.push(xp(buf.map(l => xrInline(l, base)).join('<w:r><w:br/></w:r>'), { before: out.length ? (o.gap ?? 100) : (o.first || 0), ind: indP })); buf = []; };
    p.split('\n').forEach(l => {
      const m = l.match(LIST_LINE);
      if (!m) { n = 0; buf.push(l); return; }
      flushP(); n = m[1] ? 0 : n + 1;
      out.push(xp(xr(m[1] ? '•' : n + '.', { ...base, b: 1, color: DOCX_ACC }) + '<w:r><w:tab/></w:r>' + xrInline(m[3], base), { before: out.length ? 40 : (o.first || 0), ind: `<w:ind w:left="${TW(L + 6)}" w:hanging="${TW(5)}"/>` }));
    });
    flushP();
  });
  return out.join('');
}
const xrLines = (str, base = {}) => String(str).split('\n').map(l => xrInline(l, base)).join('<w:r><w:br/></w:r>');
function xp(runs, o = {}) {
  const p = [];
  if (o.style) p.push(`<w:pStyle w:val="${o.style}"/>`);
  if (o.keepNext) p.push('<w:keepNext/>');
  if (o.keepLines) p.push('<w:keepLines/>');
  if (o.noLn !== false) p.push('<w:suppressLineNumbers/>');
  if (o.bdr) p.push(o.bdr);
  if (o.tabs) p.push(o.tabs);
  p.push(`<w:spacing w:before="${o.before || 0}" w:after="${o.after || 0}" w:line="${o.line || 264}" w:lineRule="${o.rule || 'auto'}"/>`);
  if (o.ind) p.push(o.ind);
  if (o.jc) p.push(`<w:jc w:val="${o.jc}"/>`);
  if (o.mark) p.push(`<w:rPr><w:sz w:val="${o.mark}"/><w:szCs w:val="${o.mark}"/></w:rPr>`);
  if (o.sect) p.push(o.sect);
  return `<w:p><w:pPr>${p.join('')}</w:pPr>${runs || ''}</w:p>`;
}
const NIL = s => `<w:${s} w:val="nil"/>`;
const LINE = (s, sz, col) => `<w:${s} w:val="single" w:sz="${sz}" w:space="0" w:color="${col}"/>`;
function xtc(content, o = {}) {
  return `<w:tc><w:tcPr><w:tcW w:w="${o.w}" w:type="dxa"/>${o.span ? `<w:gridSpan w:val="${o.span}"/>` : ''}${o.vm ? `<w:vMerge${o.vm === 'restart' ? ' w:val="restart"' : ''}/>` : ''}${o.borders ? `<w:tcBorders>${o.borders}</w:tcBorders>` : ''}${o.shd ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>` : ''}${o.mar ? `<w:tcMar>${o.mar}</w:tcMar>` : ''}${o.v ? `<w:vAlign w:val="${o.v}"/>` : ''}</w:tcPr>${content || '<w:p><w:pPr><w:suppressLineNumbers/></w:pPr></w:p>'}</w:tc>`;
}
function xtbl(widths, rowsXml, borders, mar) {
  return `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar>${mar || '<w:top w:w="0" w:type="dxa"/><w:left w:w="85" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="85" w:type="dxa"/>'}</w:tblCellMar><w:tblLook w:val="0000"/></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${rowsXml}</w:tbl>`;
}
const xtr = (cells, o = {}) => `<w:tr><w:trPr>${o.cant ? '<w:cantSplit/>' : ''}${o.h ? `<w:trHeight w:val="${o.h}" w:hRule="${o.rule || 'atLeast'}"/>` : ''}${o.header ? '<w:tblHeader/>' : ''}</w:trPr>${cells}</w:tr>`;
const NOB = NIL('top') + NIL('left') + NIL('bottom') + NIL('right') + NIL('insideH') + NIL('insideV');


async function imageBytes(src) {
  if (src.startsWith('data:')) { const b64 = src.split(',')[1]; const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  const r = await fetch(src); return new Uint8Array(await r.arrayBuffer());
}

async function exportDOCX() {
  if (busy) return; busy = true;
  try {
    overlay('Word-Datei wird erstellt …');
    await loadScript(LIBS.zip);
    const sh = state.sheet, m = sh.meta; const acc = ACCENTS[m.accent] || ACCENTS.tinte; const QUER = m.paper === 'a4q'; CW = TW(QUER ? 261 : 174);
    const A = acc.c.slice(1).toUpperCase(), AT = acc.t.slice(1).toUpperCase(), GREY = '5A606E', RULE = '8E95A3';
    DOCX_ACC = A; DOCX_MARK = mixHex(acc.c, .74).slice(1);
    const step = Number(m.lineStep) || 5;
    const v = sheetView(); const isK = m.mode === 'klausur'; const blocksV = sh.blocks.filter(b => blockVisible(b, v)); const tagsW = matTags(blocksV);
    const tagW = [v.lehrer ? 'Lehrerfassung' : '', v.grp !== 'all' ? grpName(m, v.grp) : '', v.lvl !== 'all' ? LV[v.lvl].sym : ''].filter(Boolean).join(' · ');
    const parts = []; const media = []; let first = true; let secOpen = false;
    const sozRel = {}; let drawId = 1000;
    for (const k of Object.keys(SOZ)) {
      if (!sh.blocks.some(x => x.type === 'tasks' && x.items.some(it => it.soz === k))) continue;
      try { const n = media.length + 1; media.push({ n, bytes: await sozPNG(k, acc.c), ext: 'png' }); sozRel[k] = n; } catch {}
    }
    const arbRel = {};
    for (const k of Object.keys(ARB)) {
      if (!sh.blocks.some(x => x.type === 'tasks' && x.items.some(it => arbOf(it).includes(k)))) continue;
      try { const n = media.length + 1; media.push({ n, bytes: await arbPNG(k, acc.c), ext: 'png' }); arbRel[k] = n; } catch {}
    }
    const picXml = (rel, cx, cy, label) => { const id = ++drawId; return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${xesc(label)}" descr="${xesc(label)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${id}" name="soz${rel}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${rel}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`; };
    const sect = (ln, two) => `<w:sectPr><w:footerReference w:type="default" r:id="rIdFtr"/><w:footnotePr><w:numRestart w:val="eachSect"/></w:footnotePr>${first ? '' : '<w:type w:val="continuous"/>'}${QUER ? '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' : '<w:pgSz w:w="11906" w:h="16838"/>'}<w:pgMar w:top="${TW(14)}" w:right="${TW(18)}" w:bottom="${TW(25 + ({ m: 8, l: 18 }[m.botGap] || 0))}" w:left="${TW(18)}" w:header="${TW(8)}" w:footer="${TW(8)}" w:gutter="0"/>${ln ? `<w:lnNumType w:countBy="${step}" w:distance="${TW(3)}" w:restart="newSection"/>` : ''}${two ? `<w:cols w:num="2" w:space="${TW(9)}"/>` : '<w:cols w:space="708"/>'}</w:sectPr>`;
    const closeSect = (ln, two) => { parts.push(xp('', { line: 20, rule: 'exact', mark: 2, sect: sect(ln, two) })); first = false; secOpen = false; };
    const spacer = () => xp('', { line: TW(5), rule: 'exact', mark: 4 });

    // Kopf
    const course = [m.course, m.school].filter(Boolean).join(' · ');
    let tabs = '', fieldRuns = '';
    if (m.showName && m.showDate) { tabs = `<w:tabs><w:tab w:val="left" w:pos="${TW(88)}"/><w:tab w:val="left" w:leader="underscore" w:pos="${TW(138)}"/><w:tab w:val="left" w:pos="${TW(142)}"/><w:tab w:val="right" w:leader="underscore" w:pos="${CW}"/></w:tabs>`; fieldRuns = '<w:r><w:tab/></w:r>' + xr('Name ', { sz: 17, color: GREY }) + '<w:r><w:tab/></w:r><w:r><w:tab/></w:r>' + xr('Datum ', { sz: 17, color: GREY }) + '<w:r><w:tab/></w:r>'; }
    else if (m.showName) { tabs = `<w:tabs><w:tab w:val="left" w:pos="${TW(100)}"/><w:tab w:val="right" w:leader="underscore" w:pos="${CW}"/></w:tabs>`; fieldRuns = '<w:r><w:tab/></w:r>' + xr('Name ', { sz: 17, color: GREY }) + '<w:r><w:tab/></w:r>'; }
    else if (m.showDate) { tabs = `<w:tabs><w:tab w:val="left" w:pos="${TW(132)}"/><w:tab w:val="right" w:leader="underscore" w:pos="${CW}"/></w:tabs>`; fieldRuns = '<w:r><w:tab/></w:r>' + xr('Datum ', { sz: 17, color: GREY }) + '<w:r><w:tab/></w:r>'; }
    if (isK) {
      const ex = m.exam || {};
      parts.push(xp(xr([m.school, m.course].filter(Boolean).join(' · '), { caps: 1, b: 1, sz: 15, color: GREY, sp: 10 }), { bdr: `<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="${A}"/></w:pBdr>` }));
      parts.push(xp(xr(ex.label || 'Klausur', { font: SERIF, b: 1, sz: 52 }), { before: 900, after: 80 }));
      const sub = [m.course, ex.halbjahr].filter(Boolean).join(' · '); if (sub) parts.push(xp(xr(sub, { sz: 22, color: GREY }), { after: 240 }));
      const fbd = NIL('top') + NIL('left') + LINE('bottom', 4, RULE) + NIL('right') + LINE('insideH', 4, RULE) + NIL('insideV');
      const frow = (k, val) => xtr(xtc(xp(xr(k, { b: 1, sz: 21 })), { w: TW(44), v: 'bottom' }) + xtc(xp(xr(val || '', { sz: 21 })), { w: CW - TW(44), v: 'bottom' }), { h: TW(10) });
      parts.push(xtbl([TW(44), CW - TW(44)], frow('Name', '') + frow('Datum', ex.datum) + (ex.zeit ? frow('Bearbeitungszeit', ex.zeit) : '') + (ex.hilfsmittel ? frow('Hilfsmittel', ex.hilfsmittel) : ''), fbd));
      const matsC = blocksV.filter(b => tagsW[b.id]);
      if (matsC.length) { parts.push(xp(xr('Materialgrundlage', { b: 1, caps: 1, sz: 16, color: A, sp: 14 }), { before: 360, after: 80 })); matsC.forEach(b => parts.push(xp(xr(tagsW[b.id] + '   ', { b: 1, sz: 20, color: A }) + xrInline(matTitle(b) || 'ohne Titel', { sz: 20 }), { after: 40 }))); }
      const tl = []; let tt = 0; blocksV.forEach(b => { if (b.type !== 'tasks') return; if (rst(b)) tt = 0; itemsFor(b, v).forEach(it => { tt++; tl.push([String(tt), it.pts || '']); }); });
      if (tl.length) {
        parts.push(xp(xr('Aufgaben', { b: 1, caps: 1, sz: 16, color: A, sp: 14 }), { before: 360, after: 80 }));
        const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(q => LINE(q, 4, RULE)).join('');
        const cm = `<w:top w:w="${TW(1.4)}" w:type="dxa"/><w:left w:w="${TW(2.5)}" w:type="dxa"/><w:bottom w:w="${TW(1.4)}" w:type="dxa"/><w:right w:w="${TW(2.5)}" w:type="dxa"/>`;
        parts.push(xtbl([TW(30), TW(45)], xtr(xtc(xp(xr('Aufgabe', { b: 1, sz: 19 })), { w: TW(30), shd: AT }) + xtc(xp(xr('Gewichtung', { b: 1, sz: 19 })), { w: TW(45), shd: AT })) + tl.map(([n, p]) => xtr(xtc(xp(xr(n, { sz: 19 })), { w: TW(30) }) + xtc(xp(xr(p, { sz: 19 })), { w: TW(45) }))).join(''), bd, cm));
      }
      parts.push('<w:p><w:pPr><w:suppressLineNumbers/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>');
      parts.push(xp(xr([ex.label || 'Klausur', m.course].filter(Boolean).join(' · ') + '   Name ', { sz: 17, color: GREY }) + '<w:r><w:tab/></w:r>', { tabs: `<w:tabs><w:tab w:val="right" w:leader="underscore" w:pos="${CW}"/></w:tabs>`, bdr: `<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${A}"/></w:pBdr>` }));
    } else {
      parts.push(xp(xr(course, { caps: 1, b: 1, sz: 15, color: GREY, sp: 10 }) + fieldRuns, { tabs, bdr: `<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="${A}"/></w:pBdr>`, after: 0 }));
      parts.push(xp((m.nr ? xr('AB ' + m.nr + '   ', { b: 1, sz: 24, color: A }) : '') + xr(deQuoteStr(m.title || 'Ohne Titel'), { font: SERIF, b: 1, sz: 33 }), { before: 200, after: m.topic ? 40 : 0, keepNext: true }));
      if (m.topic) parts.push(xp(xr(deQuoteStr(m.topic), { sz: 18, color: GREY }), {}));
    }
    if (H_SP.top[m.headGap]) parts.push(xp('', { line: TW(H_SP.top[m.headGap]), rule: 'exact' }));
    if (tagW) parts.push(xp(xr(tagW, { b: 1, sz: 18, color: v.lehrer ? 'B3261E' : A }) + (v.grp !== 'all' && grpAdd(m, v.grp) ? xr('   ' + grpAdd(m, v.grp), { sz: 18, color: GREY }) : ''), { before: 120 }));
    secOpen = true;

    let mNo = 0, tNo = 0; const foot = [];
    for (const b of blocksV) {
      if (b.type === 'tasks' && rst(b)) tNo = 0;
      if (b.type === 'pagebreak') { parts.push('<w:p><w:pPr><w:suppressLineNumbers/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>'); continue; }
      if (b.type === 'material') {
        mNo++;
        const ln = b.lineNumbers !== false; const fm = matFmt(b); const two = fm.cols === 2;
        if ((ln || two) && secOpen) closeSect(false);
        parts.push(spacer());
        const pW = b.post && b.form !== 'gedicht' ? b.post : null;
        parts.push(xp(xr(tagsW[b.id] || 'M' + mNo, { b: 1, sz: 17, color: A }) + xr('   ') + xrInline(b.title || (pW ? `Beitrag von ${String(pW.name || '').trim() || '…'} (${POST_PF[pW.pf] || POST_PF['']}${pW.date ? ', ' + pW.date : ''})` : ''), { b: 1, sz: 20 }), { keepNext: true, after: 100 }));
        if (pW) { const h = String(pW.handle || '').trim(); parts.push(xp(xr(String(pW.name || '').trim() || 'Name', { b: 1, sz: 19 }) + xr('   ' + [h ? (h.startsWith('@') ? h : '@' + h) : '', pW.date || '', POST_PF[pW.pf] || POST_PF['']].filter(Boolean).join(' · '), { sz: 16, color: GREY }), { keepNext: true, after: 60, ind: `<w:ind w:left="${TW(4)}"/>`, bdr: `<w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="8E95A3"/></w:pBdr>` })); }
        if (two) closeSect(false);
        const gmD = glossMarks(b, { gaps: true }); gmD.text = gmD.text.replace(/\ue002([^\ue003]*)\ue003/g, (m0, w) => v.lehrer ? '++' + w + '++' : '___');
        // Läuft das Material über mehrere Seiten, werden die Worterklärungen echte Fußnoten: Word setzt sie unten auf die Seite des Wortes
        const fnMap = new Map(); if (gmD.list.length && SPLIT_MATS.has(b.id)) gmD.list.forEach(x => { const id = foot.length + 1; fnMap.set(String(x.no), id); foot.push({ id, no: String(x.no), term: normTerm(x.g.term), text: x.g.text }); });
        const fn = fnMap.size ? (k => fnMap.get(k)) : null;
        const mInd = (i) => { const a = []; if (fm.margin) a.push(`w:right="${TW(+fm.mrw || 28)}"`); if (i && fm.indent) a.push(`w:firstLine="${TW(4)}"`); return a.length ? `<w:ind ${a.join(' ')}/>` : ''; };
        const mBdr = fm.margin ? '<w:pBdr><w:right w:val="single" w:sz="4" w:space="8" w:color="C8CCD5"/></w:pBdr>' : '';
        if (b.form === 'gedicht') poemVerses(gmD.text).forEach(v => parts.push(xp(xrInline(v.t, { font: FMT_WF[fm.font] || SERIF, sz: FMT_WSZ[fm.size], fn }), { style: 'Materialtext', noLn: false, line: FMT_WLINE[fm.lh], jc: 'left', before: v.st ? 160 : 0, ind: `<w:ind w:left="${TW(6)}" w:hanging="${TW(6)}"${fm.margin ? ` w:right="${TW(28)}"` : ''}/>`, bdr: mBdr })));
        else { let prevH = false; hdGapParas(matParas(gmD.text), b, !!v.lehrer).forEach((p, i) => p.forEach((seg, j) => { if (seg === MAT_BL) { parts.push(xp(xrInline('', { font: FMT_WF[fm.font] || SERIF, sz: FMT_WSZ[fm.size], fn }), { style: 'Materialtext', noLn: true, line: FMT_WLINE[fm.lh] })); prevH = true; return; } const hd = MH_RE.test(seg); let tx = hd ? seg.replace(MH_RE, '') : seg; const hgW = hd && tx === MAT_HG; if (hd && tx.startsWith(MAT_HS)) tx = tx.slice(1); if (hd && !hgW && !tx.trim()) return; parts.push(xp(hgW ? xr('Zwischenüberschrift  ', { sz: 15, color: '8E95A3' }) + xr('\u00a0'.repeat(44), { u: 1, font: FMT_WF[fm.font] || SERIF, sz: 34 }) : xrInline(tx, { ...(hd ? { b: 1 } : {}), font: FMT_WF[fm.font] || SERIF, sz: FMT_WSZ[fm.size], fn }), { style: 'Materialtext', noLn: hd && !b.hdCount, line: FMT_WLINE[fm.lh], jc: hd || fm.align === 'left' ? 'left' : 'both', ...(hd && (i || j) ? { before: 140, keepNext: true } : hd ? { keepNext: true } : {}), ind: mInd(hd || prevH || j ? 0 : i), bdr: mBdr })); prevH = hd; })); }
        if (two) closeSect(ln, true);
        const notes = fn ? [] : gmD.list.map(x => ({ n: String(x.no), term: normTerm(x.g.term), text: x.g.text }));
        if (notes.length) { parts.push(xp('', { line: 120, rule: 'exact', mark: 2 })); notes.forEach((x, i) => parts.push(xp(xr(x.n, { sz: 16, sup: 1 }) + xr(' ' + x.term + ': ', { sz: 16 }) + xrInline(x.text, { sz: 16 }), { bdr: i === 0 ? `<w:pBdr><w:top w:val="single" w:sz="4" w:space="2" w:color="C8CCD5"/></w:pBdr>` : '', ind: `<w:ind w:right="${TW(50)}"/>` }))); }
        if (pW) { const rr = [['re', 'Antworten'], ['rp', 'Geteilt'], ['li', 'Gefällt']].filter(([k]) => String(pW[k] || '').trim()).map(([k, l]) => `${l} ${pW[k]}`).join('   ·   '); parts.push(xp(xr(rr || ' ', { sz: 16, color: GREY }) + (pW.fiktiv !== false ? xr('      fiktiver Beitrag', { sz: 14, color: 'A0A6B2' }) : ''), { before: 60, ind: `<w:ind w:left="${TW(4)}"/>`, bdr: `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="4" w:color="8E95A3"/></w:pBdr>` })); }
        { const hdW = gapHdOn(b) && b.gapHd === 'kasten' ? matHeads(b).sort((x1, x2) => x1.localeCompare(x2, 'de', { sensitivity: 'base' })) : []; if (hdW.length) parts.push(xp(xr('ZWISCHENÜBERSCHRIFTEN   ', { b: 1, sz: 14, color: A, sp: 10 }) + xrInline(hdW.map(h => '☐ ' + h).join('   '), { sz: 19 }), { before: 80, after: 40, bdr: ['top', 'left', 'bottom', 'right'].map(x => `<w:${x} w:val="single" w:sz="4" w:space="4" w:color="8E95A3"/>`).join('').replace(/^/, '<w:pBdr>') + '</w:pBdr>', ind: `<w:ind w:left="${TW(1.5)}" w:right="${TW(30)}"/>` })); }
        { const gsW = gapList(b); if (gsW.length && b.gapBank !== false) parts.push(xp(xr('WORTSPEICHER   ', { b: 1, sz: 14, color: A, sp: 10 }) + xrInline([...new Set(gsW.map(x => normTerm(x.w)))].sort((x1, x2) => x1.localeCompare(x2, 'de', { sensitivity: 'base' })).join('  ·  '), { sz: 19 }), { before: 80, after: 40, bdr: ['top', 'left', 'bottom', 'right'].map(x => `<w:${x} w:val="single" w:sz="4" w:space="4" w:color="8E95A3"/>`).join('').replace(/^/, '<w:pBdr>') + '</w:pBdr>', ind: `<w:ind w:left="${TW(1.5)}" w:right="${TW(30)}"/>` })); }
        if (b.source) parts.push(xp(xrInline(b.source, { sz: 15, color: GREY }), { before: 60 }));
        if (two) secOpen = true; else if (ln) closeSect(true); else secOpen = true;
        continue;
      }
      secOpen = true;
      parts.push(spacer());
      switch (b.type) {
        case 'heading': parts.push(xp(xrInline(b.text || '', { font: SERIF, b: 1, sz: 25, color: A }), { keepNext: true, before: TW(H_SP.top[b.padTop] || 0), after: TW(H_SP.bot[b.padBot] || 0) })); break;
        case 'text': {
          const st = b.stil || '';
          const body = xpRich(b.text, st === 'klein' ? { sz: 18, color: GREY } : { sz: 21 }, { indMm: st === 'einzug' ? 8 : 0 });
          if (st === 'merksatz') {
            const bd = ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 12, A)).join('');
            parts.push(xtbl([CW], xtr(xtc(body || xp(''), { w: CW, borders: bd, mar: `<w:top w:w="${TW(3)}" w:type="dxa"/><w:left w:w="${TW(4)}" w:type="dxa"/><w:bottom w:w="${TW(3)}" w:type="dxa"/><w:right w:w="${TW(4)}" w:type="dxa"/>` }), { cant: 1 }), NOB));
          } else parts.push(body);
          break;
        }
        case 'gsa': {
          // Grundschul-Formate im Word-Export: schlicht, aber vollständig (Kästchen, Gitter, Linien)
          const k = gsaK(b), teach = !!v.lehrer; const SZ = 24; const ln = () => parts.push(xp('', { bdr: `<w:pBdr>${LINE('bottom', 6, RULE)}</w:pBdr>`, line: 560, rule: 'exact' }));
          parts.push(xp(xrInline(gsaTask(b), { b: 1, sz: SZ }), { keepNext: true, before: 160, after: 100 }));
          const box = on => xr(on ? '☒' : '☐', { sz: 30 });
          if (k === 'kreuz') (b.items || []).filter(x => tfStr(x.t).trim()).forEach(x => parts.push(xp(b.mode === 'ja' ? box(teach && x.ok) + xr('  ', {}) + xrInline(x.t, { sz: SZ }) : xrInline(x.t, { sz: SZ }) + xr('\t', {}) + box(teach && x.ok) + xr(' richtig   ', { sz: 18 }) + box(teach && !x.ok) + xr(' falsch', { sz: 18 }), { tabs: `<w:tabs><w:tab w:val="right" w:pos="${TW(170)}"/></w:tabs>`, after: 80 })));
          if (k === 'ordnen') gsShuffle((b.items || []).map((x, i) => ({ t: x.t, n: i + 1 })).filter(x => tfStr(x.t).trim()), b.seed || 3).forEach(x => parts.push(xp(xr(teach ? `[ ${x.n} ]` : '[    ]', { sz: SZ, b: 1 }) + xr('  ', {}) + xrInline(x.t, { sz: SZ }), { after: 100 })));
          if (k === 'suchsel') { const S = suchselBuild(b); const cw = TW(Math.min(10, 170 / S.n)); const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(x => LINE(x, 6, '1C1F27')).join('');
            parts.push(xtbl(Array(S.n).fill(cw), S.G.map(row => xtr(row.map(ch => xtc(xp(xr(ch, { b: 1, sz: 24 }), { jc: 'center' }), { w: cw })).join(''), { h: cw, rule: 'exact' })).join(''), bd));
            if (b.showList !== false) parts.push(xp(xr(S.words.join('   ·   '), { b: 1, sz: SZ }), { jc: 'center', before: 120 })); }
          if (k === 'silben') { const ex = silEx(b.ex); gsWords(b.words).forEach(w => { const S = silSplit(w, ex); parts.push(xp(xr(teach ? S.join(' · ') : w.replace(/-/g, ''), { sz: 32 }) + xr('\t', {}) + xr(Array.from({ length: Math.max(4, S.length + 1) }, (_, j) => teach && j < S.length ? '●' : '○').join(' '), { sz: 32 }), { tabs: `<w:tabs><w:tab w:val="right" w:pos="${TW(170)}"/></w:tabs>`, before: 120, after: 240 })); }); }
          if (k === 'abschreib') String(b.text || '').split('\n').map(x => x.trim()).filter(Boolean).forEach(t => { parts.push(xp(xrInline(t, { sz: 26 }), { before: 120 })); for (let q = 0; q < Math.max(1, +b.per || 1); q++) ln(); });
          if (k === 'bildschreib') { parts.push(xtbl([TW(170)], xtr(xtc(xp(''), { w: TW(170) }), { h: TW(Math.max(30, +b.fh || 80)), rule: 'exact' }), ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 6, '1C1F27')).join(''))); for (let q = 0; q < Math.max(1, +b.rows || 3); q++) ln(); }
          if (k === 'selbst') (b.items || []).filter(x => tfStr(x.t).trim()).forEach(x => parts.push(xp(xrInline(x.t, { sz: SZ }) + xr('\t☺   😐   ☹', { sz: 32 }), { tabs: `<w:tabs><w:tab w:val="right" w:pos="${TW(170)}"/></w:tabs>`, after: 100 })));
          break;
        }
        case 'quote': {
          const lines = lineParas(b.text);
          lines.forEach((p, i) => parts.push(xp((i === 0 ? xr('„ ', { font: SERIF, b: 1, sz: 32, color: A }) : '') + xrLines(p, { font: SERIF, i: 1, sz: 25 }), { ind: `<w:ind w:left="${TW(10)}" w:right="${TW(6)}"/>`, keepNext: true })));
          if (b.author) parts.push(xp(xrInline(b.author, { sz: 17, color: GREY }), { jc: 'right', before: 60 }));
          break;
        }
        case 'tafel': {
          const on = b.onSheet || 'luecke'; if (on === 'aus') break; tfNorm(b); const tpl = tfTpl(b);
          const o = { gaps: !v.lehrer && on === 'luecke', sol: v.lehrer && on === 'luecke', mode: b.gapMode === 'wort' ? 'wort' : 'eintrag' }; const kf = !!b.keepFirst && o.mode === 'eintrag';
          const wE = (x, ex, base = {}) => { const t = tfStr(x); if (!t.trim()) return '';
            if (o.gaps && !ex) return o.mode === 'wort' ? t.split(/(\[[^\[\]]*\])/).map(p => /^\[[^\[\]]*\]$/.test(p) ? xr(' '.repeat(Math.max(8, p.length + 4)), { ...base, u: 1 }) : xrInline(p, base)).join('') : xr(' '.repeat(36), { ...base, u: 1 });
            if (o.sol && !ex) return o.mode === 'wort' ? t.split(/(\[[^\[\]]*\])/).map(p => /^\[[^\[\]]*\]$/.test(p) ? xr(p.slice(1, -1), { ...base, b: 1, color: A }) : xrInline(p, base)).join('') : xrInline(tfStrip(t), { ...base, b: 1, color: A });
            return xrInline(tfStrip(t), base); };
          const wH = (x, base = {}) => (o.mode === 'wort' ? wE(x, false, { ...base, b: 1 }) : xrInline(tfStrip(x), { ...base, b: 1 }));
          const bdAll = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(x => LINE(x, 6, DOCX_MARK)).join('');
          const T = tfStr(b.title).trim(); if (T && !(tpl === 'cluster' && !tfStr(b.center).trim())) parts.push(xp(xr(tfStrip(T), { b: 1, sz: 22, color: A }), { keepNext: true, after: 60, jc: 'center' }));
          if (tfRaster(b)) {
            const C = b.cols.length, w = Math.floor(CW / C); const rows = b.rows.filter(r => r.some(x => tfStr(x).trim()));
            const head = xtr(b.cols.map(c => xtc(xp(wH(c, { sz: 19, color: A }), { jc: 'center' }), { w })).join(''), { cant: 1, header: 1 });
            parts.push(xtbl(Array(C).fill(w), head + rows.map((r, ri) => xtr(b.cols.map((_, ci) => xtc(xp(wE(r[ci], kf && ri === 0, { sz: 19 }), { before: 30, after: 30 }), { w })).join(''), { cant: 1 })).join(''), bdAll));
          } else if (tpl === 'cluster') {
            parts.push(xp(tfStr(b.center).trim() ? wH(b.center, { sz: 22, color: A }) : xr(tfStrip(T) || 'Mitte', { b: 1, sz: 22, color: A }), { jc: 'center', after: 80, keepNext: true }));
            const gs = b.branches.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim()); const w = Math.floor(CW / 2); const rows = [];
            const cell = x => (tfStr(x.h).trim() ? xp(wH(x.h, { sz: 19, color: A }), { after: 20 }) : '') + tfLines(x.t).map((z, j) => xp(xr('–', { sz: 19, color: A }) + '<w:r><w:tab/></w:r>' + wE(z, kf && j === 0, { sz: 19 }), { ind: `<w:ind w:left="${TW(4)}" w:hanging="${TW(4)}"/>`, before: 20 })).join('') || xp('');
            for (let i = 0; i < gs.length; i += 2) rows.push(xtr([gs[i], gs[i + 1]].map(x => xtc(x ? cell(x) : xp(''), { w })).join(''), { cant: 1 }));
            if (rows.length) parts.push(xtbl([w, w], rows.join(''), bdAll));
          } else if (tpl === 'ablauf') {
            const sts = b.steps.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim()); const w0 = TW(9), w1 = CW - w0;
            parts.push(xtbl([w0, w1], sts.map((x, i) => xtr(xtc(xp(xr((i ? '↓ ' : '') + (i + 1), { b: 1, sz: 20, color: A }), { jc: 'center' }), { w: w0 }) + xtc((tfStr(x.h).trim() ? xp(wH(x.h, { sz: 19, color: A })) : '') + (tfStr(x.t).trim() ? xp(wE(x.t, kf && i === 0, { sz: 19 })) : '') || xp(''), { w: w1 }), { cant: 1 })).join(''), bdAll));
          } else if (tpl === 'skala') {
            const w = Math.floor(CW / 5); const its = b.scale.filter(x => tfStr(x.t).trim());
            const cells = [1, 2, 3, 4, 5].map(p => xtc(its.filter(x => Math.min(5, Math.max(1, +x.p || 3)) === p).map(x => xp(wE(x.t, kf && its.indexOf(x) === 0, { sz: 18 }), { jc: 'center', after: 40 })).join('') || xp(''), { w })).join('');
            const poles = xtc(xp(wH(b.poles.l, { sz: 19, color: A })), { w }) + xtc(xp(''), { w }) + xtc(xp(tfStr(b.poles.m).trim() ? wH(b.poles.m, { sz: 19, color: A }) : xr('↔', { b: 1, sz: 22, color: A }), { jc: 'center' }), { w }) + xtc(xp(''), { w }) + xtc(xp(wH(b.poles.r, { sz: 19, color: A }), { jc: 'right' }), { w });
            parts.push(xtbl(Array(5).fill(w), xtr(cells, { cant: 1 }) + xtr(poles, { cant: 1 }), ['top', 'left', 'bottom', 'right', 'insideV'].map(x => LINE(x, 6, DOCX_MARK)).join('') + LINE('insideH', 18, A)));
          } else {
            const ns = b.nodes.filter(x => tfStr(x.n).trim());
            ns.forEach(x => parts.push(xp(wH(x.n, { sz: 19, color: A }) + (tfStr(x.d).trim() ? xr(': ', { sz: 19 }) + wE(x.d, false, { sz: 19 }) : ''), { after: 20 })));
            const rs = b.rels.filter(r => b.nodes[+r.a] && b.nodes[+r.b] && +r.a !== +r.b); const w = Math.floor(CW / 3);
            if (rs.length) parts.push(xtbl([w, w, w], rs.map((r, j) => xtr(xtc(xp(wH(b.nodes[+r.a].n, { sz: 19 })), { w }) + xtc(xp(wE(r.t, kf && j === 0, { sz: 19, i: 1 }), { jc: 'center' }), { w }) + xtc(xp(wH(b.nodes[+r.b].n, { sz: 19 }), { jc: 'right' }), { w }), { cant: 1 })).join(''), bdAll));
          }
          parts.push(xp('', { after: 80 }));
          break;
        }
        case 'phrases': {
          const gs = phrGroups(b); if (!gs.length) break; const cols = (+b.cols || 2) === 1 ? 1 : 2; const w = Math.floor(CW / cols);
          parts.push(xp(xr(plainText(b.title || 'Formulierungshilfen'), { b: 1, caps: 1, sz: 15, color: A, sp: 14 }), { keepNext: true, after: 40 }));
          const cell = g => (g.head ? xp(xrInline(g.head, { b: 1, sz: 19 }), { after: 10, keepNext: true }) : '') + g.lines.map(l => xp(xr('›', { b: 1, sz: 19, color: A }) + '<w:r><w:tab/></w:r>' + xrInline(l, { sz: 19 }), { ind: `<w:ind w:left="${TW(4)}" w:hanging="${TW(4)}"/>`, before: 20 })).join('');
          // zwei Spalten: wie auf dem Blatt der Reihe nach füllen und ausgleichen; kurze Gruppen bleiben zusammen, lange dürfen nach einer Wendung umbrechen
          let rows;
          if (cols === 1) rows = [xtr(xtc(gs.map(cell).join('') || xp(''), { w }), { cant: 1 })];
          else {
            const est = t => Math.max(1, Math.ceil(plainText(t).length / 44)); const U = [];
            gs.forEach(g => { if (g.lines.length <= 3) U.push({ g, head: true, lines: g.lines }); else { U.push({ g, head: true, lines: g.lines.slice(0, 1) }); g.lines.slice(1).forEach(l => U.push({ g, head: false, lines: [l] })); } });
            const wt = u => (u.head && u.g.head ? 1.2 : 0) + u.lines.reduce((a, l) => a + est(l), 0) + 0.3;
            const tot = U.reduce((a, u) => a + wt(u), 0); let best = U.length, bv = Infinity, acc = 0;
            for (let k = 0; k <= U.length; k++) { const v = Math.max(acc, tot - acc); if (v < bv - 1e-9) { bv = v; best = k; } if (k < U.length) acc += wt(U[k]); }
            const side = us => { let h = '', cur = null; us.forEach(u => { if (u.g !== cur && h) h += xp('', { after: 0, line: 120 }); cur = u.g; h += cell({ head: u.head ? u.g.head : '', lines: u.lines }); }); return h || xp(''); };
            rows = [xtr(xtc(side(U.slice(0, best)), { w }) + xtc(side(U.slice(best)), { w }), { cant: 1 })];
          }
          const bd = ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 6, DOCX_MARK)).join('') + NIL('insideH') + NIL('insideV');
          parts.push(xtbl(Array(cols).fill(w), rows.join(''), bd, `<w:top w:w="${TW(1.5)}" w:type="dxa"/><w:left w:w="${TW(3)}" w:type="dxa"/><w:bottom w:w="${TW(2)}" w:type="dxa"/><w:right w:w="${TW(3)}" w:type="dxa"/>`));
          break;
        }
        case 'info': {
          const inner = xp(xr(b.kind || 'Info', { b: 1, caps: 1, sz: 14, color: A, sp: 14 }), { keepNext: true })
            + (b.title ? xp(xrInline(b.title, { b: 1, sz: 21 }), { before: 20, keepNext: true }) : '')
            + xpRich(b.text, { sz: b.stil === 'klein' ? 17 : 20 }, { first: 40, gap: 80 });
          const st = b.stil || '';
          const bd = st === 'rahmen' ? ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 10, A)).join('') : `<w:top w:val="nil"/><w:left w:val="single" w:sz="24" w:space="0" w:color="${A}"/><w:bottom w:val="nil"/><w:right w:val="nil"/>`;
          parts.push(xtbl([CW], xtr(xtc(inner, { w: CW, borders: bd, shd: st === 'rahmen' || st === 'linie' ? '' : AT, mar: `<w:top w:w="${TW(3)}" w:type="dxa"/><w:left w:w="${TW(4)}" w:type="dxa"/><w:bottom w:w="${TW(3)}" w:type="dxa"/><w:right w:w="${TW(4)}" w:type="dxa"/>` }), { cant: String(b.text || '').length <= 3000 ? 1 : 0 }), NOB));
          break;
        }
        case 'tasks': {
          if (b.title) parts.push(xp(xr(b.title, { b: 1, caps: 1, sz: 16, color: A, sp: 14 }), { keepNext: true, after: 60 }));
          const ITW = itemsFor(b, v); const wArb = Math.max(0, ...ITW.map(it => arbOf(it).filter(k => arbRel[k]).length)); const sW = (ITW.some(it => sozRel[it.soz]) ? TW(10) : 0) + (wArb ? TW(1 + wArb * 6.5) : 0);
          const showA = m.showAFB || v.lehrer; const anyPts = isK && ITW.some(it => String(it.pts || '').trim());
          const bmW = itMin(b); const anyMin = ITW.some(it => v.lehrer && itPh(it)) || ((v.lehrer || m.showMin) && bmW && ITW.length);
          const afbW = (showA || anyPts || anyMin) ? TW(20) : 0; const nW = TW(9); const tW = CW - nW - sW - afbW;
          const rows = ITW.map((it, ii) => {
            tNo++;
            const r = opsRange(detectOps(it.text));
            const mnW = ii === 0 && bmW ? bmW + ' Min.' + (ITW.length > 1 ? ` (für ${tNo}–${tNo + ITW.length - 1})` : '') : '', phW = itPh(it);
            const rt = [isK && it.pts ? [it.pts, 1] : null, showA && r ? ['AFB ' + afbLabel(r), 0] : null, v.lehrer && phW ? [PHASEN[phW].label, 0] : null, v.lehrer && mnW ? [mnW, 0] : !v.lehrer && m.showMin && mnW ? ['ca. ' + mnW, 0] : null].filter(Boolean);
            const cells = xtc(xp(xr(String(tNo), { b: 1, sz: 21, color: A })), { w: nW })
              + (sW ? xtc(xp((sozRel[it.soz] ? picXml(sozRel[it.soz], 288000, 216000, SOZ[it.soz].label) : '') + arbOf(it).filter(k => arbRel[k]).map(k => picXml(arbRel[k], 198000, 198000, ARB[k].label)).join('')), { w: sW }) : '')
              + xtc((() => { const tt = taskText(it, m); const tagS = [v.grp === 'all' && m.groupsOn && it.grp ? grpName(m, it.grp) : '', it.tag || ''].filter(Boolean).join(' · '); const tagR = tagS ? xr(tagS.toUpperCase() + '  ', { b: 1, sz: 15, color: A }) : ''; const tp = lvTipOf(it, v, m); const tipP = tp ? xp(xr('Tipp: ', { b: 1, sz: 17, color: A }) + xrInline(tp, { sz: 17, color: GREY }), { before: 40 }) : ''; return (/\n/.test(tt.trim()) ? (tagR ? xp(tagR) : '') + xpRich(tt, { sz: 21 }, { gap: 60 }) : xp(tagR + xrInline(tt, { sz: 21 }))) + tipP + arbHints(it).map(h => xp(xr(h, { i: 1, sz: 18, color: GREY }), { before: 40 })).join(''); })(), { w: tW })
              + (afbW ? xtc(rt.map(([t, bold]) => xp(xr(t, { sz: bold ? 18 : 15, b: bold, color: bold ? '1C1F27' : GREY }), { jc: 'right' })).join('') || xp(''), { w: afbW }) : '');
            let row = xtr(cells, { cant: 1 });
            const eh = v.lehrer ? ehLines(it) : []; const rl = v.lehrer ? rlpOf(it) : [];
            if (eh.length || rl.length) {
              const ehCell = (eh.length ? xp(xr('ERWARTUNG', { b: 1, sz: 13, color: '6A707C', sp: 10 })) + eh.map(q => xp(xr('– ', { sz: 19 }) + xrInline(q, { sz: 19 }), { ind: `<w:ind w:left="${TW(3)}" w:hanging="${TW(3)}"/>` })).join('') : '')
                + (rl.length ? xp(xr('STANDARDS', { b: 1, sz: 13, color: '6A707C', sp: 10 }), { before: eh.length ? 80 : 0 }) + rl.map(id => { const x = rlpInfo(id); return xp((x.own ? '' : xr(x.code + '  ', { b: 1, sz: 16 })) + xr(rlpShort(x.t, 120), { sz: 16, color: '3A3F4A' })); }).join('') : '');
              row += xtr(xtc('', { w: nW }) + (sW ? xtc('', { w: sW }) : '') + xtc(ehCell, { w: tW + afbW, span: afbW ? 2 : 0, shd: 'F1F2F4', mar: `<w:top w:w="${TW(1.2)}" w:type="dxa"/><w:left w:w="${TW(2.4)}" w:type="dxa"/><w:bottom w:w="${TW(1.4)}" w:type="dxa"/><w:right w:w="${TW(2.4)}" w:type="dxa"/>` }), { cant: 1 });
            }
            return row;
          }).join('');
          parts.push(xtbl([nW, ...(sW ? [sW] : []), tW, ...(afbW ? [afbW] : [])], rows, NOB, `<w:top w:w="${TW(.9)}" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="${TW(.9)}" w:type="dxa"/><w:right w:w="0" w:type="dxa"/>`));
          break;
        }
        case 'table': {
          if (b.title) parts.push(xp(xrInline(b.title, { b: 1, sz: 20 }), { keepNext: true, after: 80 }));
          const n = b.cols.length; const widths = tbWidths(b).map(p => Math.round(CW * p / 100)); widths[n - 1] += CW - widths.reduce((a, x) => a + x, 0);
          const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => LINE(s, 4, RULE)).join('');
          const hasHead = b.cols.some(c => c.trim());
          const head = hasHead ? xtr(b.cols.map((c, i) => xtc(xp(xrInline(ckCellWord(c), { b: 1, sz: 19 }), tbCk(b, i) ? { jc: 'center' } : {}), { w: widths[i], shd: tbBg(b, 'h', i) ? tbBg(b, 'h', i).slice(1) : AT, v: 'bottom' })).join(''), { header: 1, cant: 1 }) : '';
          const lineBdr = '<w:pBdr><w:bottom w:val="single" w:sz="2" w:space="0" w:color="C8CCD5"/></w:pBdr>';
          const rows = b.rows.map((r, ri) => {
            const hmm = tbRowMM(b, ri), N = tbLines(hmm);
            return xtr(Array.from({ length: n }, (_, i) => {
              const c = ckCellWord(r[i] || ''); const w = widths[i]; const sh = tbBg(b, ri, i) ? { shd: tbBg(b, ri, i).slice(1) } : {};
              const eh = v.lehrer ? tbEh(b, ri, i) : [];
              if (!eh.length && tbCk(b, i) && !String(c).trim()) return xtc(xp(xr('☐', { sz: 28 }), { jc: 'center' }), { w, v: 'center', ...sh });
              if (eh.length) return xtc((String(c).trim() ? xp(xrInline(c, { sz: 19, b: b.firstBold && i === 0 })) : '') + eh.map(x => xp(xr(eh.length > 1 ? '– ' : '', { sz: 17, color: '2A2D35' }) + xrInline(x, { sz: 17, color: '2A2D35' }), { bdr: '<w:pBdr><w:left w:val="single" w:sz="12" w:space="4" w:color="9AA0AA"/></w:pBdr>', before: 20 })).join(''), { w, ...sh });
              if (b.cellLines && !String(c).trim() && N > 1) return xtc(Array.from({ length: N - 1 }, (_, j) => xp('', { line: TW(j ? hmm / N : Math.max(2, hmm / N - 1.6)), rule: 'exact', bdr: lineBdr, mark: 2 })).join(''), { w, ...sh });
              return xtc(xp(xrInline(c, { sz: 19, b: b.firstBold && i === 0 }), tbCk(b, i) ? { jc: 'center' } : {}), { w, ...sh, ...(tbCk(b, i) ? { v: 'center' } : {}) });
            }).join(''), { h: TW(hmm), cant: 1 });
          }).join('');
          parts.push(xtbl(widths, head + rows, bd, `<w:top w:w="${TW(1.6)}" w:type="dxa"/><w:left w:w="${TW(2)}" w:type="dxa"/><w:bottom w:w="${TW(1.6)}" w:type="dxa"/><w:right w:w="${TW(2)}" w:type="dxa"/>`));
          break;
        }
        case 'lines': {
          const cnt = Math.max(1, Math.min(40, Number(b.count) || 1));
          const emptyP = '<w:p><w:pPr><w:suppressLineNumbers/><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/><w:rPr><w:sz w:val="2"/></w:rPr></w:pPr></w:p>';
          if (b.style === 'rahmen') {
            const bd = ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 4, RULE)).join('') + NIL('insideH') + NIL('insideV');
            parts.push(xtbl([CW], xtr(xtc(emptyP, { w: CW }), { h: TW(Math.min(cnt, 26) * 9), rule: 'exact', cant: 1 }), bd));
          } else if (b.style === 'kaestchen') {
            const cols = Math.floor(174 / 5), rowsN = Math.round(cnt * 9 / 5); const cw = TW(5);
            const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => LINE(s, 2, 'C6CBD5')).join('');
            const row = xtr(Array.from({ length: cols }, () => xtc(emptyP, { w: cw })).join(''), { h: cw, rule: 'exact' });
            parts.push(xtbl(Array(cols).fill(cw), row.repeat(rowsN), bd, '<w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/>'));
          } else {
            const bd = NIL('top') + NIL('left') + LINE('bottom', 4, RULE) + NIL('right') + LINE('insideH', 4, RULE) + NIL('insideV');
            parts.push(xtbl([CW], xtr(xtc(emptyP, { w: CW }), { h: TW(9), rule: 'exact' }).repeat(cnt), bd));
          }
          break;
        }
        case 'match': {
          const M = mtLayout(b); if (!M.rows) break; const lin = b.mode !== 'buchstaben';
          if (b.title) parts.push(xp(xrInline(b.title, { b: 1, sz: 20 }), { keepNext: true, after: 80 }));
          if (M.sort) {
            const BXs = ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 4, RULE)).join(''); const NOs = ['top', 'left', 'bottom', 'right'].map(x => NIL(x)).join('');
            const Ws = (lin ? [0.43, 0.04, 0.06, 0.04, 0.43] : [0.06, 0.37, 0.06, 0.07, 0.44]).map(f => Math.round(CW * f)); Ws[Ws.length - 1] += CW - Ws.reduce((a2, x) => a2 + x, 0);
            const ts = (x, o = {}) => xp(xrInline(x || '', { sz: 19, ...o }));
            const mid = M.span.map(([s0, s1]) => Math.floor((s0 + s1 - 1) / 2)); const rowsS = [];
            for (let k = 0; k < M.rows; k++) {
              const li = mid.indexOf(k), l = li >= 0 ? M.left[li] : null, r = M.right[k], so = M.sol.find(z => z.rk === k);
              const cells = lin
                ? [xtc(l ? ts(l.a, { b: 1 }) : '', { w: Ws[0], borders: l ? BXs : NOs, v: 'center' }), xtc(l ? xp(xr('●', { sz: 18 }), { jc: 'right' }) : '', { w: Ws[1], borders: NOs, v: 'center' }), xtc('', { w: Ws[2], borders: NOs }), xtc(r ? xp(xr('●', { sz: 18 })) : '', { w: Ws[3], borders: NOs, v: 'center' }), xtc(r ? ts(r.b) : '', { w: Ws[4], borders: r ? BXs : NOs, v: 'center' })]
                : [xtc(l ? xp(xr(String(li + 1), { b: 1, sz: 18, color: A })) : '', { w: Ws[0], borders: NOs, v: 'center' }), xtc(l ? ts(l.a, { b: 1 }) : '', { w: Ws[1], borders: l ? BXs : NOs, v: 'center' }), xtc('', { w: Ws[2], borders: NOs }), xtc(r ? xp(xr(v.lehrer && so ? so.L : ' ', { b: 1, sz: 22, color: A }), { jc: 'center' }) : '', { w: Ws[3], borders: r ? BXs : NOs, v: 'center' }), xtc(r ? ts(r.b) : '', { w: Ws[4], borders: r ? BXs : NOs, v: 'center' })];
              rowsS.push(xtr(cells.join(''), { cant: 1, h: TW(8) }));
              if (k < M.rows - 1) rowsS.push(xtr(Ws.map(w => xtc('', { w, borders: NOs })).join(''), { h: TW(2.4), rule: 'exact', cant: 1 }));
            }
            parts.push(xtbl(Ws, rowsS.join(''), NIL('top') + NIL('left') + NIL('bottom') + NIL('right') + NIL('insideH') + NIL('insideV'), `<w:top w:w="${TW(1.2)}" w:type="dxa"/><w:left w:w="${TW(2)}" w:type="dxa"/><w:bottom w:w="${TW(1.2)}" w:type="dxa"/><w:right w:w="${TW(2)}" w:type="dxa"/>`));
            if (v.lehrer && lin && M.sol.length) parts.push(xp(xr('Lösung: ', { b: 1, sz: 17, color: GREY }) + M.left.map((c, li) => xrInline((li ? '; ' : '') + c.a + ': ' + (M.sol.filter(z => z.li === li).map(z => M.right[z.rk].b).join(', ') || '–'), { sz: 17, color: GREY })).join(''), { before: 80 }));
            break;
          }
          const BX = ['top', 'left', 'bottom', 'right'].map(x => LINE(x, 4, RULE)).join(''); const NO = ['top', 'left', 'bottom', 'right'].map(x => NIL(x)).join('');
          const W = lin ? [0.43, 0.04, 0.06, 0.04, 0.43].map(f => Math.round(CW * f)) : [0.06, 0.36, 0.07, 0.04, 0.06, 0.41].map(f => Math.round(CW * f));
          W[W.length - 1] += CW - W.reduce((a, x) => a + x, 0);
          const t = (x, o = {}) => xp(xrInline(x || '', { sz: 19, ...o }));
          const rows = [];
          for (let k = 0; k < M.rows; k++) {
            const l = M.left[k], r = M.right[k]; const so = M.sol[k];
            const cells = lin
              ? [xtc(l ? t(l.a) : '', { w: W[0], borders: l ? BX : NO, v: 'center' }), xtc(l ? xp(xr('●', { sz: 18 }), { jc: 'right' }) : '', { w: W[1], borders: NO, v: 'center' }), xtc('', { w: W[2], borders: NO }), xtc(r ? xp(xr('●', { sz: 18 })) : '', { w: W[3], borders: NO, v: 'center' }), xtc(r ? t(r.b) : '', { w: W[4], borders: r ? BX : NO, v: 'center' })]
              : [xtc(l ? xp(xr(String(k + 1), { b: 1, sz: 18, color: A })) : '', { w: W[0], borders: NO, v: 'center' }), xtc(l ? t(l.a) : '', { w: W[1], borders: l ? BX : NO, v: 'center' }), xtc(l ? xp(xr(v.lehrer && so && so.R ? so.R : ' ', { b: 1, sz: 22, color: A }), { jc: 'center' }) : '', { w: W[2], borders: l ? BX : NO, v: 'center' }), xtc('', { w: W[3], borders: NO }), xtc(r ? xp(xr(M.letter(k), { b: 1, sz: 18, color: A })) : '', { w: W[4], borders: NO, v: 'center' }), xtc(r ? t(r.b) : '', { w: W[5], borders: r ? BX : NO, v: 'center' })];
            rows.push(xtr(cells.join(''), { cant: 1, h: TW(8) }));
            if (k < M.rows - 1) rows.push(xtr(W.map(w => xtc('', { w, borders: NO })).join(''), { h: TW(2.4), rule: 'exact', cant: 1 }));
          }
          parts.push(xtbl(W, rows.join(''), NIL('top') + NIL('left') + NIL('bottom') + NIL('right') + NIL('insideH') + NIL('insideV'), `<w:top w:w="${TW(1.2)}" w:type="dxa"/><w:left w:w="${TW(2)}" w:type="dxa"/><w:bottom w:w="${TW(1.2)}" w:type="dxa"/><w:right w:w="${TW(2)}" w:type="dxa"/>`));
          if (v.lehrer && lin) { const ok = M.sol.filter(x => x.rk >= 0); if (ok.length) parts.push(xp(xr('Lösung: ', { b: 1, sz: 17, color: GREY }) + ok.map((x, j) => xrInline((j ? '; ' : '') + M.left[x.li].a + ' – ' + M.right[x.rk].b, { sz: 17, color: GREY })).join(''), { before: 80 })); }
          break;
        }
        case 'qr': {
          const url = String(b.url || '').trim(); if (!url) break;
          const sz = { S: 22, M: 30, L: 40 }[b.size] || 30; let pic = '';
          try { const u = QR.dataURL(url, 8); if (u) { const n = media.length + 1; media.push({ n, bytes: await imageBytes(u), ext: 'png' }); pic = picXml(n, sz * 36000, sz * 36000, 'QR-Code'); } } catch {}
          const qW = TW(sz + 5);
          const txt = (b.title ? xp(xrInline(b.title, { b: 1, sz: 21 })) : '') + xp(xr(url, { sz: 15, color: GREY })) + (b.note ? xp(xrInline(b.note, { sz: 17 })) : '');
          parts.push(xtbl([qW, CW - qW], xtr(xtc(xp(pic), { w: qW, v: 'center' }) + xtc(txt, { w: CW - qW, v: 'center' }), { cant: 1 }), NOB));
          break;
        }
        case 'image': {
          if (Array.isArray(b.lb)) {
            // Bild mit Beschriftungen: dreispaltige Tabelle, Kästen links und rechts, Bild in der Mitte (ohne Pfeile)
            const mid = Math.max(25, Math.min(70, +b.width || 42)), side = Math.round(CW * (100 - mid) / 200), cen = CW - 2 * side;
            const mode = b.lbMode || '', BOX = LINE('top', 8, A) + LINE('left', 8, A) + LINE('bottom', 8, A) + LINE('right', 8, A);
            const card = (x, cw = side) => { const r = []; if (mode !== 'ganz') r.push(xp(xrInline(x.h || '', { b: 1, color: A }), { after: 40 }));
              if (!mode) String(x.t || '').split('\n').forEach(t => r.push(xp(xrInline(t), { after: 0 })));
              else for (let i = 0; i < Math.max(2, Math.min(6, +(b.lbLines || 3))); i++) r.push(xp('', { line: 440, rule: 'exact', bdr: `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="9AA1AE"/></w:pBdr>` }));
              return xtbl([cw - 170], xtr(xtc(r.join(''), { w: cw - 170, borders: BOX })), NOB, '<w:top w:w="85" w:type="dxa"/><w:left w:w="113" w:type="dxa"/><w:bottom w:w="85" w:type="dxa"/><w:right w:w="113" w:type="dxa"/>') + xp('', { after: 120, line: 120, rule: 'exact' }); };
            const col = L => L.map(card).join('') || xp('');
            let imgX = xp(xr('[Bild]', { i: 1, color: GREY }), { jc: 'center' });
            if (b.src) try { const bytes = await imageBytes(b.src); const n = media.length + 1; media.push({ n, bytes });
              const wEmu = Math.round((cen - 170) / 56.6929 * 36000), hEmu = Math.round(wEmu * ((b.h || 1) / (b.w || 1)));
              imgX = xp(`<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${wEmu}" cy="${hEmu}"/><wp:docPr id="${n}" name="Bild ${n}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="bild${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`, { jc: 'center', line: 240 });
            } catch { }
            if (b.caption || tagsW[b.id]) parts.push(xp((tagsW[b.id] ? xr(tagsW[b.id], { b: 1, sz: 17, color: A }) + xr('   ') : '') + xrInline(b.caption || '', { b: 1, sz: 22 }), { keepNext: true, after: 120 }));
            const sd = x => (['l', 'r', 'o', 'u'].includes(x.s) ? x.s : 'l');
            const rowT = L => { if (!L.length) return; const n = Math.min(L.length, 4), w = Math.floor(CW / n); for (let k = 0; k < L.length; k += n) parts.push(xtbl(Array(n).fill(w), xtr(L.slice(k, k + n).map(x => xtc(card(x, w), { w })).join('') + (L.slice(k, k + n).length < n ? Array(n - L.slice(k, k + n).length).fill(xtc('', { w })).join('') : '')), NOB)); };
            rowT(b.lb.filter(x => sd(x) === 'o'));
            parts.push(xtbl([side, cen, side], xtr(xtc(col(b.lb.filter(x => sd(x) === 'l')), { w: side, v: 'center' }) + xtc(imgX, { w: cen, v: 'center' }) + xtc(col(b.lb.filter(x => sd(x) === 'r')), { w: side, v: 'center' })), NOB));
            rowT(b.lb.filter(x => sd(x) === 'u'));
            if (b.source) parts.push(xp(xrInline(b.source, { sz: 15, color: GREY }), { jc: 'center' }));
            break;
          }
          if (!b.src) break;
          try {
            const bytes = await imageBytes(b.src); const n = media.length + 1; media.push({ n, bytes });
            const wEmu = Math.round((CW === TW(174) ? 174 : CW / 56.6929) * (b.width || 80) / 100 * 36000); const hEmu = Math.round(wEmu * ((b.h || 1) / (b.w || 1)));
            const drawing = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${wEmu}" cy="${hEmu}"/><wp:docPr id="${n}" name="Bild ${n}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="bild${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
            if (tagsW[b.id]) parts.push(xp(xr(tagsW[b.id], { b: 1, sz: 17, color: A }) + xr('   ') + xrInline(b.caption || '', { b: 1, sz: 20 }), { keepNext: true, after: 100 }));
            parts.push(xp(drawing, { jc: 'center', line: 240 }));
          } catch { parts.push(xp(xr('[Bild konnte nicht übernommen werden]', { i: 1, color: GREY }), { jc: 'center' })); }
          if (b.caption && !tagsW[b.id]) parts.push(xp(xrInline(b.caption, { sz: 17 }), { jc: 'center', before: 40 }));
          if (b.source) parts.push(xp(xrInline(b.source, { sz: 15, color: GREY }), { jc: 'center' }));
          break;
        }
      }
    }
    const body = parts.join('') + sect(false);
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
    const XH = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const documentXml = `${XH}<w:document ${NS}><w:body>${body}</w:body></w:document>`;
    const footLeft = [m.school, m.course].filter(Boolean).join(' · ');
    const footerXml = `${XH}<w:ftr ${NS}><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="C8CCD5"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="${CW}"/></w:tabs><w:spacing w:before="0" w:after="0"/></w:pPr>${xr(footLeft, { sz: 15, color: GREY })}<w:r><w:rPr><w:sz w:val="15"/></w:rPr><w:tab/></w:r>${xr((tagW ? tagW + ' · ' : '') + (!isK && m.nr ? 'AB ' + m.nr + ' · ' : '') + 'Seite ', { sz: 15, color: GREY })}<w:fldSimple w:instr=" PAGE "><w:r><w:rPr><w:color w:val="${GREY}"/><w:sz w:val="15"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`;
    const stylesXml = `${XH}<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${SANS}" w:eastAsia="${SANS}" w:hAnsi="${SANS}" w:cs="${SANS}"/><w:color w:val="1C1F27"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="de-DE" w:eastAsia="de-DE" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
      + `<w:style w:type="paragraph" w:default="1" w:styleId="Standard"><w:name w:val="Normal"/><w:qFormat/></w:style>`
      + `<w:style w:type="paragraph" w:customStyle="1" w:styleId="Materialtext"><w:name w:val="Materialtext"/><w:basedOn w:val="Standard"/><w:qFormat/><w:pPr><w:spacing w:after="0" w:line="300" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:rPr><w:rFonts w:ascii="${SERIF}" w:hAnsi="${SERIF}" w:cs="${SERIF}"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:style>`
      + `<w:style w:type="character" w:styleId="Zeilennummer"><w:name w:val="line number"/><w:basedOn w:val="Absatz-Standardschriftart"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/><w:rPr><w:rFonts w:ascii="${SANS}" w:hAnsi="${SANS}"/><w:color w:val="7A808C"/><w:sz w:val="14"/><w:szCs w:val="14"/></w:rPr></w:style>`
      + `<w:style w:type="character" w:default="1" w:styleId="Absatz-Standardschriftart"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style>`
      + `<w:style w:type="table" w:default="1" w:styleId="NormaleTabelle"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
    const settingsXml = `${XH}<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="708"/><w:hyphenationZone w:val="425"/><w:characterSpacingControl w:val="doNotCompress"/>${foot.length ? '<w:footnotePr><w:footnote w:id="-1"/><w:footnote w:id="0"/></w:footnotePr>' : ''}<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
    const rels = `${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rIdFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${foot.length ? '<Relationship Id="rIdFn" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>' : ''}${media.map(x => `<Relationship Id="rIdImg${x.n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/bild${x.n}.${x.ext || 'jpeg'}"/>`).join('')}</Relationships>`;
    const ct = `${XH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>${foot.length ? '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>' : ''}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const core = `${XH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xesc((m.nr ? 'AB ' + m.nr + ' – ' : '') + (m.title || ''))}</dc:title><dc:subject>${xesc(m.topic || '')}</dc:subject><dc:language>de-DE</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
    const rootRels = `${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`;
    const zip = new window.JSZip();
    zip.file('[Content_Types].xml', ct); zip.file('_rels/.rels', rootRels); zip.file('docProps/core.xml', core);
    zip.file('word/document.xml', documentXml); zip.file('word/styles.xml', stylesXml); zip.file('word/settings.xml', settingsXml);
    zip.file('word/footer1.xml', footerXml); zip.file('word/_rels/document.xml.rels', rels);
    if (foot.length) {
      const fp = '<w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>';
      const fnXml = `${XH}<w:footnotes ${NS}><w:footnote w:type="separator" w:id="-1"><w:p>${fp}<w:r><w:separator/></w:r></w:p></w:footnote><w:footnote w:type="continuationSeparator" w:id="0"><w:p>${fp}<w:r><w:continuationSeparator/></w:r></w:p></w:footnote>`
        + foot.map(f => `<w:footnote w:id="${f.id}"><w:p><w:pPr><w:suppressLineNumbers/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="${TW(3)}" w:hanging="${TW(3)}"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteRef/></w:r>${xr(' ' + f.term + ': ', { sz: 16 })}${xrInline(f.text, { sz: 16 })}</w:p></w:footnote>`).join('') + '</w:footnotes>';
      zip.file('word/footnotes.xml', fnXml);
    }
    media.forEach(x => zip.file(`word/media/bild${x.n}.${x.ext || 'jpeg'}`, x.bytes));
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    overlay('');
    await deliver(fileBase() + outSuffix().replace('_A5', '') + '.docx', blob);
  } catch (err) { console.error(err); overlay(''); toast('Word-Datei konnte nicht erstellt werden. Bitte erneut versuchen.'); }
  finally { overlay(''); busy = false; CW = TW(174); }
}

