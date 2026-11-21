/* ================= Tafelkarten (A4 quer) ================= */
const TK_COLORS = ['#1F4FA0', '#0D6767', '#8A2A3E', '#B45309', '#5B3F99', '#2F6B2F', '#383C44'];
const KK_DEF = { format: 'a4', termHalf: '', font: 'max', pt: 60, split: 'points', per: 3, words: 8, warn: 0 };
const kkOf = meta => ({ ...KK_DEF, per: Number(meta.cardsPer) || 3, ...(meta.kk || {}) });
const wordCount = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const kkLines = c => String(c.points || '').split('\n').map(s => s.trim().replace(/^[-–•*]\s*/, '')).filter(Boolean);
// Stichpunkte auf Karten verteilen: nach Anzahl Stichpunkte oder nach Wortzahl; Leerzeile = neue Karte
function karteChunks(c, kk) {
  const groups = String(c.points || '').replace(/\r/g, '').split(/\n\s*\n/)
    .map(g => g.split('\n').map(s => s.trim().replace(/^[-–•*]\s*/, '')).filter(Boolean)).filter(g => g.length);
  const out = [];
  groups.forEach(g => {
    if (kk.split === 'words') {
      let cur = [], n = 0;
      g.forEach(x => { const w = wordCount(x); if (cur.length && n + w > kk.words) { out.push(cur); cur = []; n = 0; } cur.push(x); n += w; });
      if (cur.length) out.push(cur);
    } else for (let i = 0; i < g.length; i += kk.per) out.push(g.slice(i, i + kk.per));
  });
  return out;
}
const SCISSORS = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#4A505C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="6.5" r="3"/><circle cx="5.5" cy="17.5" r="3"/><path d="M8.1 8.1 21 17.6"/><path d="M8.1 15.9 21 6.4"/></svg>');
const cutEl = () => el(`<img class="cut" src="${SCISSORS}" alt="">`);
const KM_SHEET = 'fill="#FFFFFF" stroke="#B9BFCB"';
const KK_MUSTER = {
  full: { label: 'Ganze Seite', d: 'Jede Karte füllt ein A4-Blatt quer. Am größten, braucht aber am meisten Papier.',
    pic: `<rect x="13.5" y="5.5" width="53" height="37.5" rx="1.5" ${KM_SHEET}/><rect x="17" y="9" width="46" height="30.5" rx="3.5" fill="none" stroke="#1F4FA0" stroke-width="2"/><rect x="25" y="21.75" width="30" height="5" rx="2" fill="#1F4FA0"/>` },
  half: { label: 'Halbe Seite', d: 'Zwei Karten übereinander auf A4 hoch, mit Scherenlinie. Spart Papier, gut für kurze Wörter.',
    pic: `<rect x="25.5" y="3.5" width="29" height="41" rx="1.5" ${KM_SHEET}/><rect x="27.5" y="5.5" width="25" height="16.5" rx="2.5" fill="none" stroke="#1F4FA0" stroke-width="1.8"/><rect x="27.5" y="26" width="25" height="16.5" rx="2.5" fill="none" stroke="#0D6767" stroke-width="1.8"/><path d="M25.5 24h29" stroke="#7D8598" stroke-width=".9" stroke-dasharray="2 1.6"/><rect x="32" y="12" width="16" height="3.5" rx="1.5" fill="#1F4FA0"/><rect x="32" y="32.5" width="16" height="3.5" rx="1.5" fill="#0D6767"/>` },
  strip: { label: 'Streifen', d: 'Zwei lange Karten übereinander auf A4 quer, mit Scherenlinie. Lange Wörter bleiben so groß wie auf der ganzen Seite.',
    pic: `<rect x="13.5" y="5.5" width="53" height="37.5" rx="1.5" ${KM_SHEET}/><rect x="16" y="8" width="48" height="14" rx="2.5" fill="none" stroke="#1F4FA0" stroke-width="1.8"/><rect x="16" y="26.5" width="48" height="14" rx="2.5" fill="none" stroke="#0D6767" stroke-width="1.8"/><path d="M13.5 24.25h53" stroke="#7D8598" stroke-width=".9" stroke-dasharray="2 1.6"/><rect x="21" y="13.3" width="38" height="3.4" rx="1.5" fill="#1F4FA0"/><rect x="21" y="31.8" width="38" height="3.4" rx="1.5" fill="#0D6767"/>` },
  mix: { label: 'Kombi', d: 'Begriffe als Streifen, zwei pro Blatt. Die Stichpunkte bekommen ganze Seiten.',
    pic: `<rect x="3" y="12.5" width="35" height="24.75" rx="1.2" ${KM_SHEET}/><rect x="4.8" y="14.3" width="31.4" height="9.6" rx="1.8" fill="none" stroke="#1F4FA0" stroke-width="1.5"/><rect x="4.8" y="25.9" width="31.4" height="9.6" rx="1.8" fill="none" stroke="#0D6767" stroke-width="1.5"/><path d="M3 24.9h35" stroke="#7D8598" stroke-width=".8" stroke-dasharray="1.8 1.4"/><rect x="9" y="17.8" width="23" height="2.6" rx="1.1" fill="#1F4FA0"/><rect x="9" y="29.4" width="23" height="2.6" rx="1.1" fill="#0D6767"/><rect x="42" y="12.5" width="35" height="24.75" rx="1.2" ${KM_SHEET}/><rect x="44.5" y="15" width="30" height="19.75" rx="2.2" fill="none" stroke="#1F4FA0" stroke-width="1.5"/><circle cx="49" cy="20" r="1.3" fill="#1F4FA0"/><circle cx="49" cy="24.9" r="1.3" fill="#1F4FA0"/><circle cx="49" cy="29.8" r="1.3" fill="#1F4FA0"/><rect x="52" y="19" width="17" height="2" rx="1" fill="#3A3F4A"/><rect x="52" y="23.9" width="13" height="2" rx="1" fill="#3A3F4A"/><rect x="52" y="28.8" width="15" height="2" rx="1" fill="#3A3F4A"/>` }
};
const KM_ICON = {
  full: '<rect x="1" y="1.5" width="14" height="9" rx="1"/>',
  half: '<rect x="4.5" y=".75" width="7" height="10.5" rx="1"/><path d="M4.5 6h7"/>',
  strip: '<rect x="1" y="1.5" width="14" height="9" rx="1"/><path d="M1 6h14"/>'
};
const kmIcon = k => `<svg class="km-i" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${KM_ICON[k]}</svg>`;
const KK_SIZE = { full: { w: 297, h: 210, cls: '', term: 340, list: 150 }, half: { w: 210, h: 148.5, cls: ' a5', term: 240, list: 110 }, strip: { w: 297, h: 105, cls: ' strip', term: 280, list: 90 } };
// Vier Muster. Ältere Blätter ohne Muster: aus den früheren Einzelschaltern ableiten.
const kkMuster = kk => KK_MUSTER[kk.muster] ? kk.muster : kk.format === 'a5' ? 'half' : kk.format === 'strip' ? 'strip' : kk.termHalf ? 'mix' : 'full';
const kkGlobal = kk => { const m = kkMuster(kk); return m === 'half' || m === 'strip' ? m : 'full'; };
const kkSizeB = (c, kk) => KK_SIZE[c.size] ? c.size : kkGlobal(kk);
const kkSizeT = (c, kk) => KK_SIZE[c.size] ? c.size : kkMuster(kk) === 'mix' ? 'strip' : kkGlobal(kk);
const kkHalf = (c, kk) => kkSizeB(c, kk) !== 'full' || kkSizeT(c, kk) !== 'full';
const longestWord = t => Math.max(0, ...String(t || '').split(/\s+/).map(w => w.length));
function layoutKarten() {
  const sh = state.sheet; const kk = kkOf(sh.meta); const host = $('#fit-host'); const PT = 96 / 72;
  const cards = [];
  (sh.cards || []).forEach((c, ci) => {
    const col = c.color || TK_COLORS[ci % TK_COLORS.length]; const bSize = kkSizeB(c, kk); const tSize = kkSizeT(c, kk);
    const mk = (inner, term, z = KK_SIZE[term ? tSize : bSize]) => el(`<div class="page kk-page${z.cls}" data-w="${z.w}" data-h="${z.h}" style="--kc:${col}"><div class="kk-frame"><div class="kk-in${term ? ' term' : ''}">${inner}</div></div></div>`);
    cards.push({ el: mk(`<div class="kk-term">${esc(deQuoteStr(c.term || 'Begriff'))}</div>`, true), term: true, size: tSize, cid: c.id });
    karteChunks(c, kk).forEach(ch => cards.push({ el: mk(`<ul class="kk-list">${ch.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</ul>`, false), term: false, size: bSize, cid: c.id }));
  });
  cards.forEach(k => {
    host.appendChild(k.el); k.inner = k.el.querySelector('.kk-in');
    k.fit = fitUp(k.inner, k.el.querySelector('.kk-frame'), k.term ? KK_SIZE[k.size].term : kk.font === 'fixed' ? Math.max(20, (Number(kk.pt) || 60) * PT) : KK_SIZE[k.size].list);
  });
  if (kk.font !== 'max') {
    // Einheitlich: je Gruppe (Begriff/Stichpunkte × ganze/halbe Seite) die kleinste passende Größe
    const minFit = {}; cards.forEach(k => { const g = (k.term ? 't' : 'b') + k.size; minFit[g] = Math.min(minFit[g] == null ? Infinity : minFit[g], k.fit); });
    cards.forEach(k => {
      const g = (k.term ? 't' : 'b') + k.size;
      let px = k.term ? minFit[g] : (kk.font === 'fixed' ? (Number(kk.pt) || 60) * PT : minFit[g]);
      if (!k.term && kk.font === 'fixed' && px > k.fit + .5) { k.over = true; px = k.fit; }
      k.inner.style.fontSize = Math.floor(px) + 'px';
    });
  }
  cards.forEach(k => host.removeChild(k.el));
  state.kkOver = cards.filter(k => k.over).length;
  state.kkCount = cards.length;
  state.kkHalf = cards.some(k => k.size !== 'full');
  // Ganze Karten: eigene Seite A4 quer. Halbe Karten: paarweise auf A4 hoch. Streifen: paarweise auf A4 quer. Jeweils mit Scherenlinie.
  const pages = []; const pend = { half: null, strip: null };
  cards.forEach(k => {
    if (k.size === 'full') { pages.push({ pg: k.el, over: false }); return; }
    const p = pend[k.size];
    if (p) { p.insertBefore(k.el, p.lastChild); pend[k.size] = null; return; }
    const sht = el(k.size === 'strip' ? '<div class="kk-sheet quer" data-w="297" data-h="210"></div>' : '<div class="kk-sheet" data-w="210" data-h="297"></div>');
    sht.append(k.el, cutEl()); pend[k.size] = sht;
    pages.push({ pg: sht, over: false });
  });
  return pages;
}
function kartenEditor() {
  const sh = state.sheet; if (!Array.isArray(sh.cards)) sh.cards = [];
  const cards = sh.cards; const kk = kkOf(sh.meta);
  const nOf = c => 1 + karteChunks(c, kk).length;
  const total = cards.reduce((n, c) => n + nOf(c), 0);
  const seg = (f, opts, label) => `<div class="seg" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" data-act="kk-set" data-f="${f}" data-v="${v}" aria-pressed="${String(kk[f]) === String(v)}">${l}</button>`).join('')}</div>`;
  const mu = kkMuster(kk); const fine = state.fmtOpen.has('kk-fine');
  const fineSum = [{ max: 'Schrift größtmöglich', uniform: 'Schrift einheitlich', fixed: `Schrift ${kk.pt} pt` }[kk.font],
    kk.split === 'words' ? `bis ${kk.words} Wörter pro Karte` : `${kk.per} ${kk.per === 1 ? 'Stichpunkt' : 'Stichpunkte'} pro Karte`,
    kk.warn ? `Hinweis über ${kk.warn} Wörter` : ''].filter(Boolean).join(' · ');
  const fontHint = { max: 'Jede Karte so groß, wie der Platz erlaubt.', uniform: 'Alle Stichpunkt-Karten gleich groß, bestimmt von der vollsten Karte. Begriffskarten ebenso.', fixed: 'Feste Größe für die Stichpunkte. Zu volle Karten werden verkleinert.' }[kk.font];
  return `<div class="card" data-bid="karten"><div class="card-h"><span class="kind">Tafelkarten</span><span class="sum">${cards.length} ${cards.length === 1 ? 'Begriff' : 'Begriffe'} · ${total} ${total === 1 ? 'Karte' : 'Karten'}</span></div>
    <div class="card-b">${gNote('karten')}
      <div class="kk-set">
        <div class="f"><span>Muster</span><div class="km-grid" role="group" aria-label="Muster für die Tafelkarten">${Object.entries(KK_MUSTER).map(([k, x]) => `<button type="button" class="km" data-act="kk-set" data-f="muster" data-v="${k}" aria-pressed="${mu === k}" title="${esc(x.d)}"><svg viewBox="0 0 80 50" aria-hidden="true">${x.pic}</svg><b>${x.label}</b></button>`).join('')}</div><small class="km-d">${KK_MUSTER[mu].d}</small></div>
        <div data-kkover></div>
        <div class="sub kk-fine${fine ? ' open' : ''}"><button type="button" class="sub-h" data-act="sub-toggle" data-key="kk-fine" aria-expanded="${fine}"><span class="sub-t">Feinheiten</span><span class="sub-s">${esc(fineSum)}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6l4 4 4-4"/></svg></button>
          ${fine ? `<div class="sub-b">
            <div class="f"><span>Schriftgröße</span>${seg('font', [['max', 'Größtmöglich'], ['uniform', 'Einheitlich'], ['fixed', 'Fest']], 'Schriftgröße')}<small>${fontHint}</small></div>
            ${kk.font === 'fixed' ? `<label class="f kk-pt"><span>Stichpunkte in pt</span><input type="number" min="20" max="140" step="2" data-k="meta.kk.pt" value="${esc(kk.pt)}"></label>` : ''}
            <div class="f"><span>Karten aufteilen</span>${seg('split', [['points', 'Nach Stichpunkten'], ['words', 'Nach Wörtern']], 'Aufteilung')}</div>
            ${kk.split === 'words'
              ? `<div class="f"><span>Höchstens Wörter pro Karte</span>${seg('words', [4, 6, 8, 10, 12, 15].map(n => [n, n]), 'Wörter pro Karte')}<small>Ein Stichpunkt wird nie zerteilt. Ist er allein schon länger, bekommt er eine eigene Karte.</small></div>`
              : `<div class="f"><span>Stichpunkte pro Karte</span>${seg('per', [1, 2, 3, 4, 5, 6].map(n => [n, n]), 'Stichpunkte pro Karte')}</div>`}
            <div class="f"><span>Hinweis bei langen Stichpunkten</span>${seg('warn', [[0, 'aus'], [3, 'mehr als 3 Wörter'], [5, 'mehr als 5'], [8, 'mehr als 8']], 'Hinweis bei langen Stichpunkten')}</div>
          </div>` : ''}</div>
      </div>
      <small class="hint">Der Begriff steht allein auf der ersten Karte, die Stichpunkte folgen auf eigenen Karten. Eine Leerzeile zwischen Stichpunkten beginnt immer eine neue Karte.</small>
    </div></div>
    ${cards.map((c, i) => { const col = c.color || TK_COLORS[i % TK_COLORS.length]; const n = nOf(c); return `<div class="card kk-card" data-bid="karten">
      <div class="card-h"><span class="kk-dot" style="background:${col}"></span><span class="kind">Begriff ${i + 1}</span><span class="sum">${esc(c.term || 'ohne Begriff')} · ${n} ${n === 1 ? 'Karte' : 'Karten'}${(() => { const t = kkSizeT(c, kk), b = kkSizeB(c, kk); const L = { half: 'halbe Seite', strip: 'Streifen', full: 'ganze Seite' }; return t === b || n === 1 ? (t === 'full' ? '' : ' · ' + L[t]) : ` · Begriff ${L[t]}`; })()}</span>
        <button class="ib" type="button" data-act="kk-up" data-i="${i}" title="Nach oben"${i === 0 ? ' disabled' : ''}>${I.up}</button>
        <button class="ib" type="button" data-act="kk-down" data-i="${i}" title="Nach unten"${i === cards.length - 1 ? ' disabled' : ''}>${I.down}</button>
        <button class="ib" type="button" data-act="kk-del" data-i="${i}" title="Begriff löschen">${I.del}</button></div>
      <div class="card-b">
        ${fText(`cards.${i}.term`, 'Begriff', c.term, 'z. B. Dogwhistling')}
        <div class="f"><span>Farbe</span><div class="kk-sw">${TK_COLORS.map(x => `<button type="button" data-act="kk-color" data-i="${i}" data-v="${x}" aria-pressed="${col === x}" style="background:${x}" aria-label="Farbe ${x}"></button>`).join('')}</div></div>
        <div class="f"><span>Größe</span><div class="seg sm" role="group" aria-label="Kartengröße für diesen Begriff">${[['', 'wie Muster'], ['full', 'ganz'], ['half', 'halb'], ['strip', 'Streifen']].map(([v, l]) => `<button type="button" data-act="kk-size" data-i="${i}" data-v="${v}" aria-pressed="${(c.size || '') === v}" title="${v ? { full: 'Ganze Seite', half: 'Halbe Seite', strip: 'Streifen' }[v] : 'Wie das gewählte Muster'}">${v ? kmIcon(v) : ''}${l}</button>`).join('')}</div></div>
        ${fArea(`cards.${i}.points`, 'Stichpunkte', c.points, 5, 'Ein Stichpunkt pro Zeile')}
        <div data-kw="${i}">${kkWarn(c, kk, i)}</div>
      </div></div>`; }).join('')}
    <div class="adder"><button type="button" class="btn primary" data-act="kk-add">+ Begriff</button></div>`;
}
function kkWarn(c, kk, i) {
  const lines = kkLines(c); const out = [];
  const tS = kkSizeT(c, kk);
  const tip = longestWord(c.term) >= 12 && tS !== 'strip'
    ? `<div class="kk-tip"><span>${tS === 'half' ? 'Langes Wort: Als Streifen wird es deutlich größer.' : 'Langes Wort: Als Streifen bleibt es so groß wie auf der ganzen Seite und braucht nur ein halbes Blatt.'}</span><button type="button" class="link" data-act="kk-size" data-i="${i}" data-v="strip">Als Streifen setzen</button></div>` : '';
  const colon = lines.filter(x => x.includes(':')).length;
  if (colon) out.push(`${colon} ${colon === 1 ? 'Stichpunkt enthält' : 'Stichpunkte enthalten'} einen Doppelpunkt. Kürzer und ohne Doppelpunkt wirkt an der Tafel klarer.`);
  if (kk.warn) { const long = lines.filter(x => wordCount(x) > kk.warn); if (long.length) out.push(`Mehr als ${kk.warn} Wörter: ${long.map(x => `„${esc(x.length > 42 ? x.slice(0, 42) + '…' : x)}“ (${wordCount(x)})`).join(', ')}`); }
  return tip + out.map(x => `<small class="gl-warn">${x}</small>`).join('');
}

