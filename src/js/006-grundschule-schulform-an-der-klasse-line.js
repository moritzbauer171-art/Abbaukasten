/* ================= Grundschule: Schulform an der Klasse, Lineaturen, Silben, einfache Handlungsverben, eigene Aufgabenformate ================= */
const isGS = kl => KL(kl || (state.sheet ? state.sheet.klasse : state.klasse)).stufe === 'gs';
const gsJg = kl => { const k = KL(kl || (state.sheet ? state.sheet.klasse : state.klasse)); return k.stufe === 'gs' ? (+k.jg || 3) : 0; };
// Anrede beim Anlegen: Grundschule und bis Klasse 10 „du“, Oberstufe „Sie“
function anredeGuess(label, stufe) {
  if (stufe === 'gs') return 'du'; const L = String(label || '');
  if (/\b(Q\s?[1-4]|E-?Phase|Q-?Phase|LK|GK|Grundkurs|Leistungskurs|Oberstufe|Abitur|Sek\.?\s?II|Kursstufe)\b/i.test(L)) return 'sie';
  const m = L.match(/(?:^|\D)(\d{1,2})(?!\d)/); if (m) return +m[1] >= 11 ? 'sie' : 'du';
  return 'du';
}
const jgGuess = label => { const m = String(label || '').match(/(?:^|\D)([1-6])(?!\d)/); return m ? +m[1] : 0; };
// Lineaturen: Ober-, Mittel- und Unterband in mm, Abstand zur nächsten Zeile
const LIN = {
  lin1: { label: 'Lineatur 1 (Klasse 1)', o: 5, m: 5, u: 5, g: 6 },
  lin2: { label: 'Lineatur 2 (Klasse 2)', o: 4, m: 4, u: 4, g: 5 },
  lin3: { label: 'Lineatur 3 (Klasse 3)', o: 3, m: 4, u: 3, g: 4 },
  lin4: { label: 'Lineatur 4 (Klasse 4)', x: 9, hl: 3.6 }
};
const linForJg = jg => jg === 1 ? 'lin1' : jg === 2 ? 'lin2' : jg === 3 ? 'lin3' : jg === 4 ? 'lin4' : 'linien';
const linAuto = s => (s && (LIN[s] || s === 'linien') ? s : (gsJg() ? linForJg(gsJg()) : 'linien'));
// Haus am Zeilenanfang und -ende: Dach im Oberband, Erdgeschoss im Mittelband, Keller im Unterband
function linHaus(L, hw, side) {
  const H = L.o + L.m + L.u, w = hw, x0 = .25, x1 = w - .25, dw = w * .26, dx = (w - dw) / 2, y1 = L.o, y2 = L.o + L.m, n = 3, sw = (x1 - x0 - .6) / n, sh = (L.u - .5) / n;
  let st = `M${(x0 + .3).toFixed(2)} ${(H - .25).toFixed(2)}`; for (let i = 0; i < n; i++) st += ` v-${sh.toFixed(2)} h${sw.toFixed(2)}`;
  return `<svg class="gl-haus ${side}" viewBox="0 0 ${w.toFixed(2)} ${H}" style="width:${w.toFixed(2)}mm;height:${H}mm" aria-hidden="true"><path class="hd" d="M${x0} ${y1} L${(w / 2).toFixed(2)} .3 L${x1.toFixed(2)} ${y1} Z"/><rect class="eg" x="${x0}" y="${y1}" width="${(x1 - x0).toFixed(2)}" height="${L.m}"/><rect class="tr" x="${dx.toFixed(2)}" y="${(y1 + L.m * .4).toFixed(2)}" width="${dw.toFixed(2)}" height="${(L.m * .6).toFixed(2)}"/><rect class="kl" x="${x0}" y="${y2}" width="${(x1 - x0).toFixed(2)}" height="${(L.u - .25).toFixed(2)}"/><path class="kl" d="${st}"/></svg>`;
}
function linRow(st, mb, o) {
  if (st === 'linien' || !LIN[st]) return '<div class="wl"></div>';
  const L = LIN[st]; o = o || {};
  if (L.x) return `<div class="gl gl4" style="height:${L.x}mm"><i class="hl" style="bottom:${L.hl}mm"></i><i class="bl" style="bottom:0"></i></div>`;
  const H = L.o + L.m + L.u, heft = o.heft !== false, hw = o.haus ? H * .45 : 0;
  return `<div class="gl${heft ? ' gl-heft' : ''}${hw ? ' gl-h' : ''}" style="height:${H}mm;margin-bottom:${L.g}mm${heft ? `;margin-top:${L.g}mm;--gg:${(L.g / 2).toFixed(2)}mm` : ''}${hw ? `;--hw:${hw.toFixed(2)}mm` : ''}">${mb ? `<b class="mb" style="top:${L.o}mm;height:${L.m}mm"></b>` : ''}<i style="top:0"></i><i class="mi" style="top:${L.o}mm"></i><i class="bl" style="top:${L.o + L.m}mm"></i><i style="top:${H}mm"></i>${hw ? linHaus(L, hw, 'l') + linHaus(L, hw, 'r') : ''}</div>`;
}
/* Zuletzt gewählte Lineatur merken, nur innerhalb der jeweiligen Klasse */
const LS_LIN = 'abw.lineatur';
const linMemAll = () => { try { return JSON.parse(localStorage.getItem(LS_LIN) || '{}') || {}; } catch { return {}; } };
const linMem = () => { const A = linMemAll(), k = state.sheet ? state.sheet.klasse : state.klasse; return A['k:' + k] || null; };
function linRemember(b, k) {
  if (!b) return; let m = null;
  if (b.type === 'lines' && ['style', 'mb', 'heft', 'haus'].includes(k) && LIN[b.style]) m = { style: b.style, mb: !!b.mb, heft: b.heft !== false, haus: !!b.haus };
  if (b.type === 'gsa' && ['lin', 'mb', 'heft', 'haus'].includes(k)) m = { style: b.lin || '', mb: !!b.mb, heft: b.heft !== false, haus: !!b.haus };
  if (!m) return; const A = linMemAll(), kk = state.sheet ? state.sheet.klasse : state.klasse; A['k:' + kk] = m; delete A._; try { localStorage.setItem(LS_LIN, JSON.stringify(A)); } catch {}
}
const linOpts = b => { const L = LIN[b.type === 'gsa' ? linAuto(b.lin) : b.style]; if (!L || L.x) return ''; return fCheck('heft', 'wie im Heft (grüner Grund)', b.heft !== false) + fCheck('haus', 'mit Häusern (Dach, Erdgeschoss, Keller)', b.haus); };
const linRowMM = st => { const L = LIN[st]; return !L ? 9 : L.x ? L.x : L.o + L.m + L.u + L.g; };

/* ---------- Silben: regelbasiert (deutsche Silbentrennung, vereinfacht); eigene Trennungen mit „-“ ---------- */
const SIL_VG = ['äu', 'eu', 'ei', 'ai', 'au', 'ey', 'ay', 'ie', 'aa', 'ee', 'oo'];
const SIL_CU = ['sch', 'ch', 'ck', 'ph', 'th', 'qu'];
const SIL_ON = new Set(['bl', 'br', 'pl', 'pr', 'kl', 'kr', 'gl', 'gr', 'fl', 'fr', 'dr', 'tr', 'schl', 'schr', 'schm', 'schn', 'schw', 'pfl', 'zw', 'kn', 'gn', 'wr', 'chr']);
const silIsV = c => /[aeiouyäöü]/i.test(c);
function silSplit(word, ex) {
  const w = String(word || ''); if (w.includes('-') && /\p{L}-\p{L}/u.test(w)) return w.split('-').filter(Boolean);
  const lw = w.toLowerCase(); if (ex && ex.has(lw)) return ex.get(lw);
  const U = []; let i = 0;
  while (i < lw.length) {
    const c = lw[i];
    if (!/\p{L}/u.test(c)) { U.push({ s: i, e: i + 1, v: false }); i++; continue; }
    const cu = SIL_CU.find(x => lw.startsWith(x, i)); if (cu) { U.push({ s: i, e: i + cu.length, v: false, t: cu }); i += cu.length; continue; }
    if (silIsV(c)) { const vg = SIL_VG.find(x => lw.startsWith(x, i)); const n = vg ? vg.length : 1; U.push({ s: i, e: i + n, v: true }); i += n; continue; }
    U.push({ s: i, e: i + 1, v: false, t: c }); i++;
  }
  const nuc = U.map((u, k) => u.v ? k : -1).filter(k => k >= 0); if (nuc.length < 2) return [w];
  const cuts = [];
  for (let q = 0; q < nuc.length - 1; q++) {
    const a = nuc[q], b = nuc[q + 1]; const C = U.slice(a + 1, b);
    if (!C.length) { cuts.push(U[b].s); continue; }
    if (C.length === 1) { cuts.push(C[0].s); continue; }
    let on = 1; for (let k = Math.min(3, C.length); k >= 2; k--) { if (SIL_ON.has(C.slice(C.length - k).map(x => x.t || '').join(''))) { on = k; break; } }
    cuts.push(C[C.length - on].s);
  }
  const out = []; let p = 0; cuts.forEach(c => { out.push(w.slice(p, c)); p = c; }); out.push(w.slice(p)); return out.filter(Boolean);
}
const silEx = txt => { const m = new Map(); String(txt || '').split(/[,;\n]+/).map(x => x.trim()).filter(x => x.includes('-')).forEach(x => m.set(x.replace(/-/g, '').toLowerCase(), x.split('-').filter(Boolean))); return m; };
// Wörter in einem HTML-Stück in Silben zerlegen (Tags bleiben unberührt)
function silHTML(h, ex) { return String(h).replace(/(<[^>]*>)|(&[a-z#0-9]+;)|([\p{L}][\p{L}\-]*[\p{L}]|[\p{L}])/gu, (m, tag, ent, word) => { if (tag || ent) return m; const S = silSplit(word.replace(/-/g, '') === word ? word : word, ex); return S.length < 2 ? `<span class="sb s0">${word}</span>` : S.map((x, k) => `<span class="sb s${k % 2}">${x}</span>`).join(''); }); }

/* ---------- Handlungsverben für die Grundschule (du-Form) ---------- */
const opG = (op, imp, tpl, part, imp2) => ({ op, afb: [1, 1], iqb: 1, fl: 1, gs: 1, imp, imp2, part, end: !!part, tpl, tplDu: tpl });
const OPS_GS = [
  opG('lesen', 'lies', 'Lies …'), opG('vorlesen', 'lies', 'Lies … vor.', 'vor'), opG('schreiben', 'schreibe', 'Schreibe …', null, 'schreib'), opG('abschreiben', 'schreibe', 'Schreibe … ab.', 'ab', 'schreib'),
  opG('aufschreiben', 'schreibe', 'Schreibe … auf.', 'auf', 'schreib'), opG('malen', 'male', 'Male …', null, 'mal'), opG('anmalen', 'male', 'Male … an.', 'an', 'mal'), opG('ausmalen', 'male', 'Male … aus.', 'aus', 'mal'),
  opG('zeichnen', 'zeichne', 'Zeichne …'), opG('einkreisen', 'kreise', 'Kreise … ein.', 'ein', 'kreis'), opG('unterstreichen', 'unterstreiche', 'Unterstreiche …'), opG('markieren', 'markiere', 'Markiere …'),
  opG('ankreuzen', 'kreuze', 'Kreuze … an.', 'an', 'kreuz'), opG('verbinden', 'verbinde', 'Verbinde …'), opG('ausschneiden', 'schneide', 'Schneide … aus.', 'aus', 'schneid'), opG('aufkleben', 'klebe', 'Klebe … auf.', 'auf', 'kleb'),
  opG('einsetzen', 'setze', 'Setze … ein.', 'ein', 'setz'), opG('ergänzen', 'ergänze', 'Ergänze …'), opG('ordnen', 'ordne', 'Ordne …'), opG('sortieren', 'sortiere', 'Sortiere …'), opG('nummerieren', 'nummeriere', 'Nummeriere …'),
  opG('finden', 'finde', 'Finde …', null, 'find'), opG('suchen', 'suche', 'Suche …', null, 'such'), opG('zählen', 'zähle', 'Zähle …', null, 'zähl'), opG('vergleichen', 'vergleiche', 'Vergleiche …'),
  opG('erzählen', 'erzähle', 'Erzähle …', null, 'erzähl'), opG('sprechen', 'sprich', 'Sprich …'), opG('besprechen', 'besprich', 'Besprich … mit deinem Partner.'), opG('beschreiben', 'beschreibe', 'Beschreibe …'),
  opG('erklären', 'erkläre', 'Erkläre …', null, 'erklär'), opG('begründen', 'begründe', 'Begründe …'), opG('überlegen', 'überlege', 'Überlege …', null, 'überleg'), opG('prüfen', 'prüfe', 'Prüfe …'),
  opG('korrigieren', 'korrigiere', 'Korrigiere …'), opG('notieren', 'notiere', 'Notiere …'), opG('Silben schwingen', 'schwinge', 'Schwinge … in Silben.', null, 'schwing'), opG('Silben klatschen', 'klatsche', 'Klatsche … in Silben.', null, 'klatsch')
];

/* ---------- Eigene Aufgabenformate ---------- */
const GSA = {
  kreuz: { label: 'Ankreuzen', desc: 'Richtig oder falsch, oder: Kreuze an, was stimmt', task: 'Kreuze an: Richtig oder falsch?', task2: 'Kreuze an, was stimmt.', arb: 'kreuz', ic: '<rect x="3.5" y="4" width="7" height="7" rx="1"/><path d="m5 7.5 1.6 1.6L9.2 6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M13.5 7.5h7M13.5 17h7"/>' },
  ordnen: { label: 'Reihenfolge', desc: 'Sätze oder Bilder in die richtige Reihenfolge bringen', task: 'Bringe die Sätze in die richtige Reihenfolge. Schreibe die Zahlen in die Kästchen.', arb: 'schreiben', ic: '<rect x="3.5" y="4" width="5" height="5" rx=".8"/><rect x="3.5" y="10" width="5" height="5" rx=".8"/><rect x="3.5" y="16" width="5" height="5" rx=".8"/><path d="M11.5 6.5h9M11.5 12.5h9M11.5 18.5h9"/>' },
  suchsel: { label: 'Suchsel', desc: 'Wörter im Buchstabengitter finden und einkreisen', task: 'Finde die Wörter und kreise sie ein.', arb: 'einkreisen', ic: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/><rect x="4.6" y="10.2" width="14.8" height="3.6" rx="1.8"/>' },
  silben: { label: 'Silben', desc: 'Wörter in Silben sprechen, Bögen zeichnen, Silben zählen', task: 'Sprich die Wörter in Silben. Zeichne die Silbenbögen. Male so viele Kreise an, wie das Wort Silben hat.', arb: 'sprechen', ic: '<path d="M3 15c1.5 3 5 3 6.5 0M10.5 15c1.5 3 5 3 6.5 0"/><path d="M4 11h12"/><circle cx="19.5" cy="7" r="1.5"/><circle cx="19.5" cy="12" r="1.5"/>' },
  abschreib: { label: 'Abschreiben', desc: 'Text mit Lineatur darunter, passend zur Klassenstufe', task: 'Schreibe den Text sauber ab.', arb: 'schreiben', ic: '<path d="M4 5h16"/><path d="M4 9.5h16M4 12h16" stroke-dasharray="1.5 1.3"/><path d="M4 17h16M4 19.5h16" stroke-dasharray="1.5 1.3"/>' },
  bildschreib: { label: 'Bild und Schreiben', desc: 'Bildfeld zum Malen oder ein Bild, darunter Lineatur', task: 'Male ein Bild. Schreibe dazu.', task2: 'Schau dir das Bild an. Schreibe dazu.', arb: 'zeichnen', ic: '<rect x="3.5" y="3.5" width="17" height="10" rx="1.2"/><path d="m5 12 4-3.5 3 2.5 2.5-2 4 3"/><path d="M4 17h16M4 20.5h16"/>' },
  selbst: { label: 'Selbsteinschätzung', desc: '„Das kann ich“ mit drei Gesichtern zum Anmalen', task: 'Wie gut kannst du das? Male ein Gesicht an.', arb: 'ausmalen', ic: '<circle cx="6" cy="12" r="3.3"/><circle cx="12" cy="12" r="3.3"/><circle cx="18" cy="12" r="3.3"/><path d="M4.7 12.8c.8 1 1.8 1 2.6 0M10.6 13h2.8M16.7 13.6c.8-1 1.8-1 2.6 0"/>' }
};
const gsaK = b => (GSA[b.gk] ? b.gk : 'kreuz');
const gsaTask = b => { const k = gsaK(b), d = GSA[k]; const t = tfStr(b.title).trim(); if (t) return b.title; if (k === 'kreuz' && b.mode === 'ja') return d.task2; if (k === 'bildschreib' && b.src) return d.task2; return d.task; };
function gsRng(seed) { let a = (+seed || 1) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gsShuffle = (arr, seed) => { const r = gsRng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gsWords = t => String(t || '').split(/[\n,;]+/).map(x => x.trim()).filter(Boolean);
const gsUp = w => w.replace(/ß/g, 'ẞ').toLocaleUpperCase('de-DE').replace(/\s+/g, '');
// Suchsel bauen: waagerecht, senkrecht, auf Wunsch schräg; Rest mit häufigen Buchstaben
function suchselBuild(b) {
  const n = Math.max(6, Math.min(16, +b.size || 10)); const dirs = [[0, 1], [1, 0], ...(b.dirs === 'hvd' ? [[1, 1]] : [])].filter((d, i) => b.dirs !== 'h' || i === 0);
  const W = gsWords(b.words).map(gsUp).filter(w => w.length && w.length <= n).sort((a, c) => c.length - a.length);
  const r = gsRng(b.seed || 7); const G = Array.from({ length: n }, () => Array(n).fill('')); const pos = []; const miss = [];
  W.forEach(w => { let ok = false;
    for (let t = 0; t < 300 && !ok; t++) { const [dy, dx] = dirs[Math.floor(r() * dirs.length)]; const y0 = Math.floor(r() * (n - dy * (w.length - 1))), x0 = Math.floor(r() * (n - dx * (w.length - 1)));
      if ([...w].every((ch, k) => { const g = G[y0 + dy * k][x0 + dx * k]; return !g || g === ch; })) { [...w].forEach((ch, k) => { G[y0 + dy * k][x0 + dx * k] = ch; }); pos.push({ w, y0, x0, dy, dx }); ok = true; } }
    if (!ok) miss.push(w); });
  const F = 'EEEEENNNNIIIIRRRSSSAAATTTDDHHUULLCGMOBWFKZPVÄÖÜ'; for (const row of G) for (let x = 0; x < n; x++) if (!row[x]) row[x] = F[Math.floor(r() * F.length)];
  return { n, G, pos, miss, words: gsWords(b.words) };
}
const FACES = ['<circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10" r="1.1" fill="currentColor"/><circle cx="15.5" cy="10" r="1.1" fill="currentColor"/><path d="M7.5 14.2c2.4 3 6.6 3 9 0"/>',
  '<circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10" r="1.1" fill="currentColor"/><circle cx="15.5" cy="10" r="1.1" fill="currentColor"/><path d="M8 15.5h8"/>',
  '<circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10" r="1.1" fill="currentColor"/><circle cx="15.5" cy="10" r="1.1" fill="currentColor"/><path d="M7.5 17c2.4-3 6.6-3 9 0"/>'];
const faceSVG = i => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true">${FACES[i]}</svg>`;
const GS_CHK = '<svg viewBox="0 0 10 10" class="gs-x" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6"/></svg>';
function gsaHTML(b, ctx) {
  const k = gsaK(b), d = GSA[k], teach = !!(ctx.view && ctx.view.lehrer); const lin = linAuto(b.lin); const acc = ctx.acc || '#2741B5';
  const ic = ARB[d.arb] ? `<img class="gsa-ic" src="${arbURI(d.arb, acc)}" alt="">` : '';
  const head = `<div class="gsa-h">${ic}<div class="gsa-t">${inlineHTML(gsaTask(b))}</div></div>`;
  const rows = [];
  if (k === 'kreuz') {
    const It = (b.items || []).filter(x => tfStr(x.t).trim()); const rf = b.mode !== 'ja';
    if (rf) rows.push(`<div class="gsa-kr gsa-krh"><span></span><b>richtig</b><b>falsch</b></div>`);
    (It.length ? It : [{ t: 'Aussage', ok: true }]).forEach(x => rows.push(rf
      ? `<div class="gsa-kr"><span>${inlineHTML(x.t)}</span><i class="gs-box">${teach && x.ok ? GS_CHK : ''}</i><i class="gs-box">${teach && !x.ok ? GS_CHK : ''}</i></div>`
      : `<div class="gsa-kr ja"><i class="gs-box">${teach && x.ok ? GS_CHK : ''}</i><span>${inlineHTML(x.t)}</span></div>`));
  } else if (k === 'ordnen') {
    const It = (b.items || []).map((x, i) => ({ t: x.t, n: i + 1 })).filter(x => tfStr(x.t).trim()); const S = gsShuffle(It, b.seed || 3);
    (S.length ? S : [{ t: 'Satz', n: 1 }]).forEach(x => rows.push(`<div class="gsa-or"><i class="gs-box big">${teach ? `<em>${x.n}</em>` : ''}</i><span>${inlineHTML(x.t)}</span></div>`));
  } else if (k === 'suchsel') {
    const S = suchselBuild(b); const hit = new Set(); if (teach) S.pos.forEach(p => { for (let q = 0; q < p.w.length; q++) hit.add((p.y0 + p.dy * q) * S.n + p.x0 + p.dx * q); });
    const cell = Math.min(10, Math.floor(170 / S.n * 10) / 10);
    rows.push(`<div class="gsa-ss" style="grid-template-columns:repeat(${S.n},${cell}mm);font-size:${Math.max(10, Math.min(18, cell * 1.5))}pt">${S.G.map((row, y) => row.map((ch, x) => `<span style="height:${cell}mm" class="${hit.has(y * S.n + x) ? 'on' : ''}">${esc(ch)}</span>`).join('')).join('')}</div>`);
    if (b.showList !== false && S.words.length) rows.push(`<div class="gsa-ssl">${S.words.map(w => `<span>${esc(w)}</span>`).join('')}</div>`);
  } else if (k === 'silben') {
    const ex = silEx(b.ex); const W = gsWords(b.words);
    (W.length ? W : ['Wort']).forEach(w => { const S = silSplit(w, ex); const nC = Math.max(4, S.length + 1); const shown = w.replace(/-/g, '');
      rows.push(`<div class="gsa-sb"><span class="gsa-sbw${teach ? ' sil-b' : ''}">${teach ? S.map((x, j) => `<span class="sb s${j % 2}">${esc(x)}</span>`).join('') : esc(shown)}</span>${b.count !== false ? `<span class="gsa-sbc">${Array.from({ length: nC }, (_, j) => `<i class="${teach && j < S.length ? 'on' : ''}"></i>`).join('')}</span>` : ''}</div>`); });
  } else if (k === 'abschreib') {
    const L = String(b.text || '').split('\n').map(x => x.trim()).filter(Boolean); const per = Math.max(1, Math.min(3, +b.per || 1));
    (L.length ? L : ['Text zum Abschreiben']).forEach(t => { rows.push(`<div class="gsa-ab">${inlineHTML(t)}</div>`); for (let q = 0; q < per; q++) rows.push(`<div class="gsa-ln">${linRow(lin, b.mb, b)}</div>`); });
  } else if (k === 'bildschreib') {
    const hmm = Math.max(30, Math.min(150, +b.fh || 80));
    rows.push(b.src ? `<div class="gsa-img"><img src="${esc(b.src)}" alt="" style="max-height:${hmm}mm"></div>` : `<div class="gsa-frame" style="height:${hmm}mm"></div>`);
    for (let q = 0; q < Math.max(1, Math.min(12, +b.rows || 3)); q++) rows.push(`<div class="gsa-ln">${linRow(lin, b.mb, b)}</div>`);
  } else if (k === 'selbst') {
    const It = (b.items || []).filter(x => tfStr(x.t).trim());
    rows.push(`<div class="gsa-se gsa-seh"><span></span><b>${faceSVG(0)}</b><b>${faceSVG(1)}</b><b>${faceSVG(2)}</b></div>`.replace(/<b>/g, '<b class="hd">'));
    (It.length ? It : [{ t: 'Ich kann …' }]).forEach(x => rows.push(`<div class="gsa-se"><span>${inlineHTML(x.t)}</span><i>${faceSVG(0)}</i><i>${faceSVG(1)}</i><i>${faceSVG(2)}</i></div>`));
    rows.splice(0, 1);
  }
  return `<div class="blk blk-gsa gsa-${k}">${head}${rows.join('')}</div>`;
}

function gsaEditor(b) {
  const k = gsaK(b), d = GSA[k]; const seg = (key, label, opts) => `<div class="f"><span>${label}</span><div class="seg sm" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" data-act="gs-set" data-k="${key}" data-v="${v}" aria-pressed="${String(b[key] == null ? '' : b[key]) === v}">${l}</button>`).join('')}</div></div>`;
  const linSel = () => fSelect('lin', 'Lineatur', b.lin || '', [['', `passend zur Klasse (${linAuto('') === 'linien' ? 'Linien' : LIN[linAuto('')].label.split(' (')[0]})`], ...Object.entries(LIN).map(([v, x]) => [v, x.label]), ['linien', 'einfache Linien (9 mm)']]) + (LIN[linAuto(b.lin)] && !LIN[linAuto(b.lin)].x ? fCheck('mb', 'Mittelband farbig', b.mb) + linOpts(b) : '');
  const items = (ph, extra) => `<div class="f"><span>${k === 'ordnen' ? 'Sätze in der richtigen Reihenfolge' : k === 'selbst' ? 'Was die Kinder einschätzen' : 'Aussagen'}</span><div class="gs-items">${(b.items || []).map((it, i) => `<div class="gs-it">${k === 'ordnen' ? `<span class="gs-no">${i + 1}</span>` : ''}<input class="inp" type="text" data-k="items.${i}.t" value="${esc(it.t || '')}" placeholder="${esc(ph)}">${extra ? extra(it, i) : ''}<button class="ib" type="button" data-act="gs-del" data-i="${i}" title="Entfernen"${(b.items || []).length < 2 ? ' disabled' : ''}>${I.x}</button></div>`).join('')}</div><button class="link" type="button" data-act="gs-add">+ ${k === 'ordnen' ? 'Satz' : k === 'selbst' ? 'Zeile' : 'Aussage'}</button></div>`;
  let h = `<div class="f gs-kind"><span>Format</span><div class="seg sm" role="group" aria-label="Format">${Object.entries(GSA).map(([v, x]) => `<button type="button" data-act="gs-set" data-k="gk" data-v="${v}" aria-pressed="${k === v}">${x.label}</button>`).join('')}</div></div>`
    + fText('title', 'Arbeitsauftrag', b.title, gsaTask({ ...b, title: '' }));
  if (k === 'kreuz') h += seg('mode', 'Art', [['', 'richtig oder falsch'], ['ja', 'ankreuzen, was stimmt']]) + items('z. B. Der Igel schläft im Winter.', (it, i) => `<label class="chk gs-ok"><input type="checkbox" data-k="items.${i}.ok"${it.ok ? ' checked' : ''}>stimmt</label>`) + '<small class="hint">In der Lehrerfassung sind die richtigen Kreuze eingetragen.</small>';
  if (k === 'ordnen') h += items('z. B. Am Morgen wacht Lina auf.') + `<div class="row"><button class="link" type="button" data-act="gs-seed">Neu mischen</button><small class="hint">Auf dem Blatt erscheinen die Sätze gemischt, in der Lehrerfassung mit den richtigen Zahlen.</small></div>`;
  if (k === 'suchsel') { const S = suchselBuild(b); h += fArea('words', 'Wörter', b.words || '', 4, 'Igel\nFuchs\nEule', '', 'Ein Wort pro Zeile oder mit Komma getrennt.') + seg('size', 'Größe', [['8', '8 × 8'], ['10', '10 × 10'], ['12', '12 × 12'], ['14', '14 × 14']]) + seg('dirs', 'Richtungen', [['h', 'nur waagerecht'], ['hv', 'waagerecht und senkrecht'], ['hvd', 'auch schräg']]) + `<div class="chks">${fCheck('showList', 'Wörter unter dem Gitter zeigen', b.showList !== false)}</div><div class="row"><button class="link" type="button" data-act="gs-seed">Neu mischen</button>${S.miss.length ? `<small class="hint warn">Passt nicht ins Gitter: ${esc(S.miss.join(', '))}. Gitter größer machen oder neu mischen.</small>` : ''}</div>`; }
  if (k === 'silben') { const ex = silEx(b.ex); const W = gsWords(b.words); h += fArea('words', 'Wörter', b.words || '', 4, 'Tomate\nBanane\nApfel', '', 'Ein Wort pro Zeile. Eigene Trennung mit Bindestrich, z. B. The-a-ter.') + (W.length ? `<small class="hint gs-prev">So trennt die App: ${W.slice(0, 12).map(w => esc(silSplit(w, ex).join('·'))).join(', ')}</small>` : '') + `<div class="chks">${fCheck('count', 'Kreise zum Silbenzählen', b.count !== false)}</div><small class="hint">In der Lehrerfassung stehen die Silbenbögen und die angemalten Kreise.</small>`; }
  if (k === 'abschreib') h += fArea('text', 'Text', b.text || '', 4, 'Der Hund spielt im Garten.', '', 'Jede Zeile bekommt darunter eine Lineatur.') + `<div class="row">${linSel()}</div>` + seg('per', 'Zeilen zum Schreiben je Textzeile', [['1', '1'], ['2', '2'], ['3', '3']]);
  if (k === 'bildschreib') h += `<div class="f"><span>Bild (optional)</span>${b.src ? `<div class="st-img"><img src="${esc(b.src)}" alt=""><button class="link" type="button" data-act="st-img-del">Bild entfernen, Feld zum Malen</button></div>` : '<small class="hint">Ohne Bild bleibt ein Rahmen zum Malen.</small>'}<input type="file" accept="image/*" data-act="img"></div>` + seg('fh', b.src ? 'Höchstens so hoch' : 'Höhe des Malfelds', [['50', '5 cm'], ['80', '8 cm'], ['110', '11 cm']]) + `<div class="row">${linSel()}<label class="f narrow"><span>Zeilen</span><input type="number" min="1" max="12" data-k="rows" value="${esc(b.rows || 3)}"></label></div>`;
  if (k === 'selbst') h += items('z. B. Ich kann Silben schwingen.');
  return h;
}
const gsaSummary = b => { const k = gsaK(b); const n = k === 'suchsel' || k === 'silben' ? gsWords(b.words).length : k === 'abschreib' ? String(b.text || '').split('\n').filter(x => x.trim()).length : (b.items || []).filter(x => tfStr(x.t).trim()).length; return `${GSA[k].label}${n ? ' · ' + n + (k === 'suchsel' || k === 'silben' ? ' Wörter' : k === 'abschreib' ? ' Zeilen' : k === 'selbst' ? ' Zeilen' : k === 'ordnen' ? ' Sätze' : ' Aussagen') : ''}`; };


