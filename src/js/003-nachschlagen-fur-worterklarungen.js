// ================= Nachschlagen für Worterklärungen =================
// Wiktionary: Bedeutungen und Synonyme (frei, im Browser abrufbar). OpenThesaurus: Synonyme. DWDS: Häufigkeit (0–6).
// Duden und DWDS nur als Links: Bedeutungen geben beide nicht über eine freie Schnittstelle heraus.
// In der Windows-App holt das Hauptprogramm die Daten (keine Browser-Sperren für fremde Seiten).
const WB = { cache: new Map(), off: {} };
async function netJSON(url) {
  let host = ''; try { host = new URL(url).hostname; } catch { return null; }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  const off = WB.off[host]; if (off && Date.now() - off < 300000) return null;
  try {
    let j = null;
    if (window.abDesktop && window.abDesktop.json) j = await window.abDesktop.json(url);
    else {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 8000);
      try { const r = await fetch(url, { signal: ctl.signal, credentials: 'omit' }); j = r.ok ? await r.json() : null; } finally { clearTimeout(tm); }
    }
    if (j == null || typeof j !== 'object') throw new Error('keine Daten');
    delete WB.off[host]; return j;
  } catch { WB.off[host] = Date.now(); return null; }
}
const WB_LAB = { 'ugs.': 'umgangssprachlich', 'übertr.': 'übertragen', 'abw.': 'abwertend', 'scherzh.': 'scherzhaft', 'landsch.': 'landschaftlich', 'reg.': 'regional', 'österr.': 'österreichisch', 'schweiz.': 'schweizerisch', 'süddt.': 'süddeutsch', 'norddt.': 'norddeutsch', 'fachspr.': 'fachsprachlich', 'bildungsspr.': 'bildungssprachlich', 'Pl.': 'Plural', 'Sg.': 'Singular', 'trans.': 'transitiv', 'intrans.': 'intransitiv', 'refl.': 'reflexiv', 'kPl.': 'kein Plural', 'va.': 'veraltet', 'veraltet': 'veraltet', 'veraltend': 'veraltend', 'gehoben': 'gehoben', 'poet.': 'poetisch', 'selten': 'selten', 'derb': 'derb', 'vulg.': 'vulgär', 'Jugendsprache': 'Jugendsprache', 'umgangssprachlich': 'umgangssprachlich', 'übertragen': 'übertragen' };
function wikiClean(x) {
  const lab = []; let t = String(x || '');
  t = t.replace(/<ref[^>]*\/>/g, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  for (let i = 0; i < 6 && /\{\{[^{}]*\}\}/.test(t); i++) t = t.replace(/\{\{([^{}]*)\}\}/g, (all, inner) => {
    const ps = inner.split('|').map(v => v.trim()); const name = ps.shift();
    if (name === 'K') { const L = ps.filter(v => v && !/^[A-Za-z0-9]+=/.test(v)).map(v => WB_LAB[v] || v); if (L.length) lab.push(L.join(', ')); return ''; }
    if (WB_LAB[name]) lab.push(WB_LAB[name]);
    return '';
  });
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').replace(/^[\s:;,.]+|[\s:;,]+$/g, '').trim();
  return { lab: lab.join(', '), t };
}
const wikiDe = txt => { const m = /^==[^=].*\(\{\{Sprache\|Deutsch\}\}\)\s*==\s*$/m.exec(txt || ''); if (!m) return ''; const rest = txt.slice(m.index + m[0].length); const n = rest.search(/^==[^=]/m); return n < 0 ? rest : rest.slice(0, n); };
function wikiSec(de, name) {
  const out = []; const re = new RegExp('^\\{\\{' + name + '\\}\\}[ \\t]*$', 'gm'); let m;
  while ((m = re.exec(de))) { for (const l of de.slice(m.index + m[0].length).split('\n').slice(1)) { if (!/^:/.test(l)) break; out.push(l); } }
  return out;
}
async function wikiLookup(term, depth = 0) {
  const cands = [...new Set([term, term.charAt(0).toLowerCase() + term.slice(1), term.charAt(0).toUpperCase() + term.slice(1)])];
  const j = await netJSON('https://de.wiktionary.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1&origin=*&titles=' + encodeURIComponent(cands.join('|')));
  if (!j) return null;
  const q = j.query || {}; const map = {}; [...(q.normalized || []), ...(q.redirects || [])].forEach(n => { map[n.from] = n.to; });
  const pages = (q.pages || []).filter(pg => !pg.missing && pg.revisions && pg.revisions[0]);
  for (const c of cands) {
    let t = c; for (let i = 0; i < 3 && map[t]; i++) t = map[t];
    const pg = pages.find(x => x.title === t); if (!pg) continue;
    const rv = pg.revisions[0]; const de = wikiDe(rv.slots && rv.slots.main ? rv.slots.main.content : rv.content); if (!de) continue;
    const defs = wikiSec(de, 'Bedeutungen').map(l => wikiClean(l.replace(/^:+\s*(\[[^\]]*\])?/, ''))).filter(d => d.t).slice(0, 5);
    const syn = wikiSec(de, 'Synonyme').flatMap(l => [...l.matchAll(/\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g)].map(x => x[1].trim()));
    if (!defs.length && depth < 1) { const g = de.match(/\{\{Grundformverweis[^|}]*\|([^|}]+)/); if (g && g[1].trim() !== pg.title) { const r = await wikiLookup(g[1].trim(), depth + 1); if (r && r.defs && r.defs.length) return r; } }
    if (!defs.length && !syn.length) continue;
    return { lemma: pg.title, url: 'https://de.wiktionary.org/wiki/' + encodeURIComponent(pg.title.replace(/ /g, '_')), defs, syn };
  }
  return {};
}
async function otLookup(term) {
  const j = await netJSON('https://www.openthesaurus.de/synonyme/search?q=' + encodeURIComponent(term) + '&format=application/json');
  if (!j) return null;
  return (j.synsets || []).slice(0, 4).flatMap(x => (x.terms || []).filter(v => !/derb|vulgär/i.test(v.level || '')).map(v => String(v.term || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim())).filter(Boolean);
}
function wbLookup(term) {
  if (WB.cache.has(term)) return WB.cache.get(term);
  const pr = (async () => {
    const w = await wikiLookup(term); const lemma = (w && w.lemma) || term;
    let ot = await otLookup(lemma); if ((!ot || !ot.length) && lemma !== term) ot = (await otLookup(term)) || ot;
    const low = new Set([term.toLowerCase(), lemma.toLowerCase()]); const seen = new Set();
    const syn = [...(ot || []), ...((w && w.syn) || [])].filter(x => { const k = x.toLowerCase(); if (low.has(k) || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
    const r = { lemma, wk: w && w.url, defs: (w && w.defs) || [], syn, off: w === null && ot === null };
    if (r.off) WB.cache.delete(term); return r;
  })();
  WB.cache.set(term, pr); return pr;
}
// DWDS-Häufigkeit (0 = sehr selten … 6 = sehr häufig) für die Vorschläge im Lesbarkeits-Feld; im Browser gemerkt
const LS_FQ = 'abw.dwdsfreq'; let WB_FQ = null; let fqBusy = false;
const fqMap = () => { if (!WB_FQ) { WB_FQ = {}; try { WB_FQ = JSON.parse(localStorage.getItem(LS_FQ) || '{}') || {}; } catch { WB_FQ = {}; } } return WB_FQ; };
const fqSave = () => { try { const k = Object.keys(WB_FQ); if (k.length > 3000) k.slice(0, k.length - 3000).forEach(x => delete WB_FQ[x]); localStorage.setItem(LS_FQ, JSON.stringify(WB_FQ)); } catch {} };
async function fqWarm(words, done) {
  if (fachLang() !== 'de') return;
  const F = fqMap(); const todo = [...new Set(words)].filter(w => !(w in F)).slice(0, 30); if (!todo.length || fqBusy) return;
  fqBusy = true; let got = 0;
  try {
    for (let i = 0; i < todo.length; i += 4) {
      const part = await Promise.all(todo.slice(i, i + 4).map(w => netJSON('https://www.dwds.de/api/frequency/?q=' + encodeURIComponent(w))));
      if (part.every(x => !x)) break;
      part.forEach((j, k) => { if (j && typeof j.frequency === 'number') { F[todo[i + k]] = j.frequency; got++; } });
    }
  } finally { fqBusy = false; }
  if (got) { fqSave(); if (done) done(); }
}
const FQ_WORD = ['sehr selten', 'sehr selten', 'selten', 'mittel', 'häufig', 'sehr häufig', 'sehr häufig'];
function rdSuggHTML(b, r) {
  const F = fqMap();
  return r.sugg.map(o => `<button type="button" class="ck-chip" data-act="rd-gl" data-t="${esc(o.w)}" title="Worterklärung anlegen${o.w in F ? ' · im DWDS ' + FQ_WORD[F[o.w]] + ' (' + F[o.w] + ' von 6)' : ''}">+ ${esc(o.w)}</button>`).join('');
}
function rdSuggRefresh(bid) {
  const box = document.querySelector(`#editor [data-rds="${bid}"]`); const b = target(bid); if (!box || !b) return;
  const r = readStats(b); if (r) box.innerHTML = rdSuggHTML(b, r);
}
// Im Fenster „Worterklärung“: Vorschläge zum Übernehmen und Links zum Nachschlagen
let glWbSeq = 0, glWbT = 0;
const glWbLinks = (term, wk) => `<div class="gl-wb-h"><span>Nachschlagen</span><a href="https://www.duden.de/suchen/dudenonline/${encodeURIComponent(term)}" target="_blank" rel="noopener">Duden ↗</a><a href="https://www.dwds.de/wb/${encodeURIComponent(term)}" target="_blank" rel="noopener">DWDS ↗</a>${wk ? `<a href="${esc(wk)}" target="_blank" rel="noopener">Wiktionary ↗</a>` : ''}</div>`;
function glWbHTML(term, r) {
  const L = r.lemma || term; let h = glWbLinks(L, r.wk);
  if (r.off) return h + '<p class="gl-wb-s">Ohne Internetverbindung gibt es keine Vorschläge.</p>';
  if (L.toLowerCase() !== term.toLowerCase()) h += `<p class="gl-wb-s">Grundform: <b>${esc(L)}</b></p>`;
  if (r.defs.length) h += `<div class="gl-wb-l"><span>Bedeutungen</span>${r.defs.map(d => `<button type="button" class="gl-sg" data-act="gl-sg" data-m="set" data-v="${esc(d.t)}" title="Als Erklärung übernehmen">${d.lab ? `<i>${esc(d.lab)}:</i> ` : ''}${esc(d.t)}</button>`).join('')}</div>`;
  if (r.syn.length) h += `<div class="gl-wb-l"><span>Synonyme</span><div class="gl-wb-c">${r.syn.map(x => `<button type="button" class="ck-chip" data-act="gl-sg" data-m="add" data-v="${esc(x)}" title="Zur Erklärung hinzufügen">${esc(x)}</button>`).join('')}</div></div>`;
  h += r.defs.length || r.syn.length ? '<small class="gl-wb-q">Vorschläge aus Wiktionary und OpenThesaurus: übernehmen, dann kürzen und an die Klasse anpassen.</small>' : '<p class="gl-wb-s">Keine Vorschläge gefunden. Oben nachschlagen.</p>';
  return h;
}
async function glWbRun(raw) {
  const box = $('#gl-wb'); const term = normTerm(raw || '').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''); const seq = ++glWbSeq;
  if (!box) return;
  if (term.length < 2) { box.innerHTML = ''; placeGloss(); return; }
  box.innerHTML = glWbLinks(term) + '<p class="gl-wb-s">Suche Vorschläge …</p>'; placeGloss();
  let r; try { r = await wbLookup(term); } catch { r = { lemma: term, defs: [], syn: [], off: true }; }
  if (seq !== glWbSeq || !$('#gl-wb')) return;
  $('#gl-wb').innerHTML = glWbHTML(term, r); placeGloss();
}

function renderGloss() {
  const root = $('#gl-root'); const o = gl.open;
  if (!o) { root.innerHTML = ''; return; }
  const b = target(o.bid); const g = b && o.idx >= 0 ? b.glossary[o.idx] : null;
  const termPart = o.free
    ? `<label class="f"><span>Wort aus dem Text</span><input class="inp" id="gl-term" type="text" autocomplete="off" placeholder="z. B. kundgeworden" value="${esc(o.term)}"></label><div id="gl-occ"></div>`
    : `<div class="gl-term">${esc(o.term)}${o.count > 1 ? `<span>${o.n + 1}. von ${o.count} Stellen</span>` : ''}</div>`;
  root.innerHTML = `<div class="gl-scrim" data-act="gl-close"></div>
    <div class="gpop" id="gpop" role="dialog" aria-labelledby="gl-h">
      <div class="gpop-h"><span id="gl-h">${g ? 'Worterklärung bearbeiten' : 'Worterklärung'}</span><button class="ib" type="button" data-act="gl-close" title="Schließen">${I.x}</button></div>
      <form id="gl-form" novalidate>${termPart}
        <label class="f"><span>Erklärung</span><textarea class="inp gl-ta" id="gl-text" rows="1" autocomplete="off" placeholder="z. B. bekannt geworden">${esc(g ? g.text : '')}</textarea></label>
        <div class="gl-wb" id="gl-wb" aria-live="polite"></div>
        <div class="err" id="gl-err" role="alert"></div>
        <div class="gpop-a"><button class="btn primary" type="submit">${g ? 'Speichern' : 'Hinzufügen'}</button>${g ? '<button class="link danger" type="button" data-act="gl-del">Entfernen</button>' : '<small>Enter = übernehmen</small>'}</div>
      </form></div>`;
  glFit(); glWbRun(o.term);
  const f = o.free ? $('#gl-term') : $('#gl-text');
  if (f) { f.focus({ preventScroll: true }); try { f.setSelectionRange(f.value.length, f.value.length); } catch {} }
}
// Erklärungsfeld so hoch wie sein Text, dann das Fenster neu ausrichten
function glFit() {
  const f = $('#gl-text'); if (f) { f.style.height = 'auto'; f.style.height = (f.scrollHeight + 2) + 'px'; }
  placeGloss();
}
function placeGloss() {
  const p = $('#gpop'); const o = gl.open; if (!p || !o) return;
  if (narrowGloss()) { p.style.left = ''; p.style.top = ''; return; }
  const r = o.rect, w = p.offsetWidth, h = p.offsetHeight;
  const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), window.innerWidth - w - 16);
  let top = r.bottom + 10; if (top + h > window.innerHeight - 16) top = Math.max(16, r.top - h - 10);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
function updOcc() {
  const o = gl.open; const b = o && target(o.bid); const box = $('#gl-occ'); if (!b || !box) return;
  const t = normTerm($('#gl-term').value); const c = t ? occurrences(b.text, t).length : 0;
  box.innerHTML = !t ? '' : !c ? '<small class="gl-warn">Steht so nicht im Text. Groß- und Kleinschreibung beachten.</small>'
    : c > 1 ? `<label class="f"><span>Welche Stelle?</span><select class="inp" id="gl-n">${Array.from({ length: c }, (_, i) => `<option value="${i}">${i + 1}. Vorkommen</option>`).join('')}</select></label>` : '';
  placeGloss();
}
function removeGloss(b, idx) {
  if (!b.glossary || !b.glossary[idx]) return;
  snapshot(); const g = b.glossary.splice(idx, 1)[0]; changed(true);
  toast(`Worterklärung „${normTerm(g.term)}“ entfernt`, 'Rückgängig', histUndo);
}
function onGlossSubmit(e) {
  e.preventDefault(); const o = gl.open; if (!o) return;
  const b = target(o.bid); if (!b) return closeGloss();
  if (!Array.isArray(b.glossary)) b.glossary = [];
  const fail = m => { $('#gl-err').textContent = m; };
  const text = $('#gl-text').value.replace(/\s*\n+\s*/g, ' ').trim();
  let term = o.term, n = o.n, idx = o.idx;
  if (o.free) {
    term = normTerm($('#gl-term').value);
    if (!term) return fail('Bitte das Wort aus dem Text eintragen.');
    if (!occurrences(b.text, term).length) return fail('Dieses Wort steht so nicht im Text.');
    n = $('#gl-n') ? +$('#gl-n').value : 0;
    idx = b.glossary.findIndex(g => normTerm(g.term) === term && (g.n || 0) === n);
  }
  if (!text) { if (idx >= 0) { closeGloss(); removeGloss(b, idx); return; } return fail('Bitte eine Erklärung eintragen.'); }
  if (idx >= 0) b.glossary[idx].text = text; else b.glossary.push({ term, n, text });
  closeGloss(); changed(true);
}

/* ---------- Formatierung der Materialien ---------- */
const MAT_FMT = {
  align: { label: 'Ausrichtung', opts: [['justify', 'Blocksatz'], ['left', 'Linksbündig']] },
  font: { label: 'Schrift', opts: [['serif', 'Literata (mit Serifen)'], ['sans', 'Atkinson (ohne Serifen)'], ['mono', 'Schreibmaschine'], ['hand', 'Handschrift'], ['frak', 'Fraktur']] },
  size: { label: 'Schriftgröße', opts: [['XS', '9 pt'], ['S', '9,5 pt'], ['M10', '10 pt'], ['M', '10,5 pt'], ['M11', '11 pt'], ['L', '12 pt'], ['XL', '13 pt'], ['XXL', '14 pt'], ['G16', '16 pt'], ['G18', '18 pt'], ['G20', '20 pt'], ['G24', '24 pt']] },
  silben: { label: 'Silben', opts: [['', 'aus'], ['boegen', 'Silbenbögen'], ['farbe', 'farbig (blau/rot)']] },
  lh: { label: 'Zeilenabstand', opts: [['eng', 'eng'], ['normal', 'normal'], ['weit', 'weit']] },
  mrw: { label: 'Breite des Rands', opts: [['20', 'schmal'], ['28', 'mittel'], ['40', 'breit'], ['55', 'sehr breit']] }
};
const FMT_MRW = { 20: 1, 28: 1, 40: 1, 55: 1 };
const FMT_SIZE = { XS: 9, S: 9.5, M10: 10, M: 10.5, M11: 11, L: 12, XL: 13, XXL: 14, G16: 16, G18: 18, G20: 20, G24: 24 }, FMT_LH = { eng: 1.35, normal: 1.52, weit: 2 }, FMT_WLINE = { eng: 276, normal: 300, weit: 400 }, FMT_WSZ = { XS: 18, S: 19, M10: 20, M: 21, M11: 22, L: 24, XL: 26, XXL: 28, G16: 32, G18: 36, G20: 40, G24: 48 };
const FMT_FF = { serif: 'var(--f-text)', sans: 'var(--f-sans)', mono: "'Courier Prime','Courier New',Courier,monospace", hand: "'Caveat','Segoe Print',cursive", frak: "'UnifrakturMaguntia','Old English Text MT',serif" };
const FMT_WF = { serif: 'Georgia', sans: 'Arial', mono: 'Courier New', hand: 'Segoe Print', frak: 'Old English Text MT' };
const fmtFF = f => FMT_FF[f] || FMT_FF.serif;
function matFmt(b) {
  const f = b.fmt || {};
  return { align: f.align === 'left' ? 'left' : 'justify', font: FMT_FF[f.font] ? f.font : 'serif', size: FMT_SIZE[f.size] ? f.size : 'M', lh: FMT_LH[f.lh] ? f.lh : 'normal', indent: f.indent === true, margin: !!f.margin && f.cols !== '2', cols: f.cols === '2' ? 2 : 1, mrw: FMT_MRW[f.mrw] ? String(f.mrw) : '28', mrh: typeof f.mrh === 'string' ? f.mrh : '', silben: ['boegen', 'farbe'].includes(f.silben) ? f.silben : '', silx: typeof f.silx === 'string' ? f.silx : '' };
}
function fmtSummary(b) {
  const f = matFmt(b);
  const poem = b.form === 'gedicht';
  return [poem ? 'Verse' : f.align === 'left' ? 'Linksbündig' : 'Blocksatz', ({ serif: 'mit Serifen', sans: 'ohne Serifen', mono: 'Schreibmaschine', hand: 'Handschrift', frak: 'Fraktur' })[f.font],
    String(FMT_SIZE[f.size]).replace('.', ',') + ' pt', 'Zeilenabstand ' + f.lh,
    f.cols === 2 ? 'zweispaltig' : '', f.margin ? 'Notizrand' : '', b.lineNumbers === false ? (poem ? 'ohne Verszählung' : 'ohne Zeilennummern') : ''].filter(Boolean).join(' · ');
}
/* ---------- Lesbarkeit: LIX, lange Sätze, Vorschläge für Worterklärungen ---------- */
// Häufige Wörter (Grundwortschatz, gekürzt). Was nicht darin steht und lang ist, wird als Worterklärung vorgeschlagen.
const CORE_DE = new Set('der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner keines ich du er sie es wir ihr mich dich sich uns euch mir dir ihm ihn ihnen mein meine meinen meinem meiner meines dein deine deinen deinem deiner sein seine seinen seinem seiner seines ihr ihre ihren ihrem ihrer ihres unser unsere unseren unserem unserer euer eure euren dieser diese dieses diesen diesem jener jene jenes jenen jedem jeder jede jedes jeden alle allen aller alles manche manchen mancher viele vielen vieler wenige wenigen einige einigen beide beiden andere anderen anderer anderes anderem selbst selber man jemand niemand nichts etwas welche welcher welches welchen welchem und oder aber denn sondern doch als wie wenn weil dass daß ob obwohl obgleich damit während bevor nachdem seit seitdem sobald solange indem ohne um statt sowie also deshalb deswegen daher darum trotzdem dennoch zwar sowohl weder noch entweder in im ins an am ans auf aus bei beim mit nach von vom zu zum zur für gegen durch über unter vor hinter neben zwischen bis ab außer innerhalb außerhalb wegen trotz laut gegenüber entlang samt seit nicht auch nur noch schon sehr so ja nein mal dann da dort hier jetzt nun heute gestern morgen immer nie oft manchmal wieder bald gleich gern gerne mehr weniger viel wenig ganz fast kaum etwa genau eben einfach wirklich vielleicht sicher bereits erst später früher zuerst endlich plötzlich sofort lange dabei dafür dagegen dazu davon darauf darin daran damals deshalb allein zusammen weiter wohl schließlich überhaupt außerdem jedoch besonders ebenfalls natürlich eigentlich trotzdem sogar irgendwie überall nirgends hin her heraus herein hinaus voran zurück weg los sein bin bist ist sind seid war warst waren wart gewesen wäre wären haben habe hast hat habt hatte hattest hatten gehabt hätte hätten werden werde wirst wird werdet wurde wurden geworden würde würden worden können kann kannst könnt konnte konnten gekonnt könnte könnten müssen muss musst müsst musste mussten müsste muß mußte sollen soll sollst sollt sollte sollten wollen will willst wollt wollte wollten dürfen darf darfst durfte durften dürfte mögen mag magst mochte möchte möchten machen macht machte gemacht gehen geht ging gingen gegangen kommen kommt kam kamen gekommen sehen sieht sah sahen gesehen sagen sagt sagte sagten gesagt geben gibt gab gaben gegeben nehmen nimmt nahm genommen stehen steht stand standen gestanden liegen liegt lag lagen gelegen finden findet fand fanden gefunden bleiben bleibt blieb blieben geblieben heißen heißt hieß lassen lässt ließ gelassen stellen stellt stellte gestellt bringen bringt brachte gebracht denken denkt dachte gedacht wissen weiß wusste wußte gewusst glauben glaubt glaubte halten hält hielt gehalten nennen nennt nannte genannt zeigen zeigt zeigte gezeigt führen führt führte geführt sprechen spricht sprach gesprochen fragen fragt fragte gefragt spielen spielt spielte leben lebt lebte gelebt arbeiten arbeitet arbeitete schreiben schreibt schrieb geschrieben lesen liest las gelesen hören hört hörte gehört laufen läuft lief fahren fährt fuhr gefahren essen isst aß trinken trinkt trank schlafen schläft schlief wohnen wohnt kaufen kauft kaufte brauchen braucht brauchte suchen sucht suchte versuchen versucht versuchte beginnen beginnt begann begonnen erklären erklärt erzählen erzählt erzählte verstehen versteht verstand verstanden bekommen bekommt bekam fühlen fühlt fühlte lernen lernt lernte setzen setzt setzte sitzen sitzt saß tragen trägt trug ziehen zieht zog fallen fällt fiel helfen hilft half warten wartet wartete öffnen öffnet schließen schließt schloss verlieren verliert verlor gewinnen gewinnt gewann zahlen zahlt bezahlen erreichen erreicht entstehen entsteht entstand entwickeln entwickelt erinnern erinnert erinnerte folgen folgt folgte gehören gehört handeln handelt bedeuten bedeutet beschreiben beschreibt bilden bildet entscheiden entscheidet erhalten erhält erkennen erkennt ändern ändert verändern verändert nutzen nutzt benutzen leiten treffen trifft traf gelten gilt galt scheinen scheint schien sterben stirbt starb wachsen wächst wuchs werfen wirft warf rufen ruft rief schauen schaut lachen lacht lachte weinen weint freuen freut fehlen fehlt passieren passiert passierte vergessen vergisst vergaß verbinden zählen zählt meinen meint meinte hoffen hofft hoffte lieben liebt liebte mögen danken dankt kennen kennt kannte gekannt mensch menschen mann männer frau frauen kind kinder leute person personen junge mädchen eltern vater mutter sohn tochter bruder schwester familie freund freunde freundin lehrer lehrerin schüler schülerin schülerinnen zeit jahr jahre jahren tag tage tagen woche monat stunde minute uhr abend morgen nacht leben welt land länder stadt dorf haus häuser schule klasse raum zimmer tür fenster tisch stuhl buch bücher text texte seite wort wörter satz sätze frage fragen antwort sprache geschichte arbeit beispiel teil art weise sache ding dinge problem grund recht ende anfang mitte weg wege ort orte platz straße wasser feuer erde luft licht sonne baum bäume tier tiere hand hände kopf auge augen herz körper name namen zahl geld bild bilder gesellschaft staat politik krieg frieden macht volk regierung partei gesetz kultur natur thema idee meinung gefühl liebe angst glück wahrheit möglichkeit entwicklung bedeutung beziehung rolle gruppe form ergebnis ziel wirkung ursache folge situation information system prozess unterschied fall ende kraft gut gute guten guter gutes besser beste schlecht groß große großen großer kleine klein kleinen alt alte alten neu neue neuen neuer jung junge lang lange langen kurz kurze hoch hohe hohen tief schön schöne schnell langsam leicht schwer einfach wichtig wichtige richtig falsch klar möglich unmöglich nötig gleich gleiche ähnlich anders verschieden ganze ganzen ganzer erste ersten erster zweite dritte letzte letzten nächste nächsten eigene eigenen weitere weiteren bestimmte bestimmten allgemein besonders bekannt bekannte frei freie offen sicher stark starke schwach warm kalt heiß hell dunkel rot blau grün weiß schwarz deutsch deutsche deutschen politisch politische sozial soziale wirtschaftlich öffentlich persönlich menschlich historisch genau typisch wahr real echt voll leer reich arm froh traurig müde krank gesund ruhig laut leise eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf zwanzig hundert tausend jahrhundert jahrhunderts jahrhunderte beschäftigen beschäftigt beschäftigte erinnerung minuten sekunde'.split(' '));
const isCore = w => { const x = w.toLowerCase(); if (CORE_DE.has(x)) return true; for (const e of ['en', 'em', 'er', 'es', 'e', 'n', 's', 'st', 't', 'te', 'ten', 'et', 'est']) if (x.length > e.length + 2 && x.endsWith(e) && CORE_DE.has(x.slice(0, -e.length))) return true; return false; };
const FOREIGN_RE = /(ismus|ität|tion|sion|ieren|iert|ologie|ik|iv|ell|anz|enz|ös|abel|ibel|ur|ie)(en|e|s|n)?$/i;
function readStats(b) {
  const t = plainText(String(b.text || '')).replace(/\u00AD/g, ''); const words = t.match(/[\p{L}][\p{L}'’-]*/gu) || [];
  if (words.length < 20) return null;
  const sents = t.split(/(?<=[.!?…])\s+(?=[„"»(]?[\p{Lu}0-9])|\n\s*\n/u).map(x => x.trim()).filter(x => /\p{L}/u.test(x));
  const S = Math.max(1, sents.length); const W = words.length; const L = words.filter(w => w.replace(/[^\p{L}]/gu, '').length > 6).length;
  const lix = Math.round(W / S + 100 * L / W);
  const cat = lix < 30 ? 'sehr leicht' : lix < 40 ? 'leicht' : lix < 50 ? 'mittel' : lix < 60 ? 'schwer' : 'sehr schwer';
  const long = sents.map(x => ({ x, n: (x.match(/[\p{L}][\p{L}'’-]*/gu) || []).length })).filter(o => o.n > 25).sort((a, c) => c.n - a.n);
  const glossed = new Set((b.glossary || []).map(g => normTerm(g.term).toLowerCase())); const seen = new Map();
  words.forEach(w => { const k = w.replace(/[’']s?$/, ''); const lk = k.toLowerCase(); if (k.length < 6 || isCore(k) || glossed.has(lk)) return; const o = seen.get(lk) || { w: k, c: 0, sc: 0 }; o.c++; o.sc = k.length + (FOREIGN_RE.test(k) ? 4 : 0) + (/[A-ZÄÖÜ]/.test(k[0]) ? 0 : 1); seen.set(lk, o); });
  const pool = [...seen.values()].sort((a, c) => c.sc - a.sc || a.w.localeCompare(c.w, 'de')).slice(0, 24);
  const F = fqMap(); const fq = o => (o.w in F ? F[o.w] : 3.5);
  const sugg = pool.slice().sort((a, c) => fq(a) - fq(c) || c.sc - a.sc || a.w.localeCompare(c.w, 'de')).slice(0, 10);
  return { W, S, L, lix, cat, avg: Math.round(W / S * 10) / 10, pL: Math.round(100 * L / W), long, sugg, pool };
}
function readEditor(b) {
  if (b.form === 'gedicht') return '';
  const r = readStats(b); const key = 'read:' + b.id; const open = state.fmtOpen.has(key);
  if (open && r && r.pool.length) setTimeout(() => fqWarm(r.pool.map(o => o.w), () => rdSuggRefresh(b.id)), 0);
  const sumT = r ? `LIX ${r.lix} · ${r.cat}${r.long.length ? ` · ${r.long.length} lange ${r.long.length === 1 ? 'Satz' : 'Sätze'}` : ''}` : 'ab 20 Wörtern';
  const lvlC = r ? (r.lix < 40 ? 'ok' : r.lix < 50 ? 'mid' : 'hard') : '';
  return `<div class="sub${open ? ' open' : ''}" data-rd>
    <button type="button" class="sub-h" data-act="sub-toggle" data-key="${key}" aria-expanded="${open}"><span class="sub-t">Lesbarkeit</span><span class="sub-s rd-${lvlC}">${esc(sumT)}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6l4 4 4-4"/></svg></button>
    ${open && r ? `<div class="sub-b rd">
      <div class="rd-scale" aria-hidden="true">${[['sehr leicht', 0, 30], ['leicht', 30, 40], ['mittel', 40, 50], ['schwer', 50, 60], ['sehr schwer', 60, 80]].map(([l, a, z]) => `<span class="${r.lix >= a && (r.lix < z || z === 80) ? 'on' : ''}">${l}</span>`).join('')}<i style="left:${Math.max(0, Math.min(100, (r.lix - 15) / 60 * 100))}%"></i></div>
      <p class="rd-k">${r.W} Wörter · ${r.S} ${r.S === 1 ? 'Satz' : 'Sätze'} · im Schnitt ${String(r.avg).replace('.', ',')} Wörter je Satz · ${r.pL} % lange Wörter (über 6 Buchstaben)</p>
      <small class="hint">LIX = Wörter je Satz + Anteil langer Wörter. Unter 40 eher leicht (Jugendbuch), 40–50 mittel (Sachtext), ab 50 schwer (Fachtext), ab 60 sehr schwer.</small>
      ${r.long.length ? `<div class="f"><span>Lange Sätze (über 25 Wörter)</span><ul class="rd-long">${r.long.slice(0, 6).map((o, i) => `<li><button type="button" class="link" data-act="rd-show" data-i="${i}" title="Im Text markieren">„${esc(o.x.split(/\s+/).slice(0, 7).join(' '))} …“</button><span>${o.n} Wörter</span></li>`).join('')}</ul></div>` : '<p class="rd-k">Keine Sätze über 25 Wörter.</p>'}
      ${r.sugg.length ? `<div class="f"><span>Vorschläge für Worterklärungen</span><div class="rd-sugg" data-rds="${b.id}">${rdSuggHTML(b, r)}</div><small class="hint">Seltene oder lange Wörter aus dem Text, die seltensten zuerst (Häufigkeit laut DWDS, wenn online). Klicken legt eine Worterklärung an, mit Vorschlägen zum Übernehmen.</small><label class="chk" style="margin-top:6px"><input type="checkbox" data-glsug${GLS.on ? ' checked' : ''}> In der Vorschau markieren</label></div>` : ''}
    </div>` : open ? '<div class="sub-b"><p class="rd-k">Die Werte erscheinen ab 20 Wörtern.</p></div>' : ''}
  </div>`;
}
// Markiert eine Stelle im Textfeld, auch über Formatierungen hinweg
function rtSelectPlain(el, str) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = []; let n, all = '';
  while ((n = w.nextNode())) { nodes.push([n, all.length]); all += n.nodeValue; }
  const norm = x => x.replace(/\s+/g, ' '); const i = norm(all).indexOf(norm(str).slice(0, 80)); if (i < 0) return false;
  // Position im unnormalisierten Text wiederfinden
  let pos = 0, k = 0; while (k < all.length && pos < i) { if (/\s/.test(all[k])) { while (k + 1 < all.length && /\s/.test(all[k + 1])) k++; } pos++; k++; }
  const at = off => { for (let j = nodes.length - 1; j >= 0; j--) if (nodes[j][1] <= off) return [nodes[j][0], Math.min(off - nodes[j][1], nodes[j][0].nodeValue.length)]; return [nodes[0][0], 0]; };
  const [sn, so] = at(k), [en, eo] = at(Math.min(all.length, k + str.length));
  const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo); const s = getSelection(); s.removeAllRanges(); s.addRange(rg);
  (sn.parentElement || el).scrollIntoView({ block: 'center', behavior: 'smooth' }); return true;
}
function postEditor(b) {
  const p = b.post;
  return `<div class="post-ed"><div class="row">${fSelect('post.pf', 'Plattform', p.pf || '', Object.entries(POST_PF).map(([k, l]) => [k, l]))}${fText('post.date', 'Datum', p.date, 'z. B. 12.03.2026')}</div>
    <div class="row">${fText('post.name', 'Name', p.name, 'z. B. Max Muster')}${fText('post.handle', 'Handle', p.handle, '@konto')}</div>
    <div class="row">${fText('post.re', 'Antworten', p.re, '12')}${fText('post.rp', 'Geteilt', p.rp, '48')}${fText('post.li', 'Gefällt', p.li, '1.204')}</div>
    <div class="chks">${fCheck('post.fiktiv', 'Fiktiver Beitrag (wird klein vermerkt)', p.fiktiv !== false)}</div>
    <small class="hint">Bei echten Beiträgen unten die Quelle angeben (Konto, Datum, Link, abgerufen am). Erfundene Beiträge nicht echten Personen zuschreiben.</small>
    <button class="link" type="button" data-act="post-off">Als normales Material darstellen</button></div>`;
}
function gapEditor(b) {
  if (b.form === 'gedicht' && !(b.gaps || []).length) { /* Gedichte gehen auch */ }
  const key = 'gap:' + b.id; const open = state.fmtOpen.has(key) || state.gapEdit === b.id; const gs = gapList(b); const on = state.gapEdit === b.id;
  const hdS = gapHdOn(b) ? 'Überschriften ' + (GAP_HD.find(x => x[0] === b.gapHd) || ['', ''])[1] : '';
  const sumT = [gs.length ? `${gs.length} ${gs.length === 1 ? 'Lücke' : 'Lücken'}${b.gapBank !== false ? ' · Wortspeicher' : ''}` : '', hdS].filter(Boolean).join(' · ') || 'aus';
  return `<div class="sub${open ? ' open' : ''}">
    <button type="button" class="sub-h" data-act="sub-toggle" data-key="${key}" aria-expanded="${open}"><span class="sub-t">Lückentext</span><span class="sub-s">${esc(sumT)}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6l4 4 4-4"/></svg></button>
    ${open ? `<div class="sub-b">
      <button type="button" class="btn${on ? ' primary' : ''}" data-act="gap-edit" aria-pressed="${on}">${on ? 'Fertig mit Lücken setzen' : 'Lücken setzen'}</button>
      <small class="hint">${on ? 'Jetzt Wörter in der Vorschau anklicken: Das Wort wird zur Lücke. Noch einmal anklicken nimmt die Lücke zurück. Worterklärungen sind solange aus.' : 'Wörter in der Vorschau anklicken, um sie zu Lücken zu machen. In der Lehrerfassung stehen die Wörter in den Lücken.'}</small>
      ${gs.length ? `<div class="rd-sugg">${gs.map((x, i) => `<button type="button" class="ck-chip" data-act="gap-del" data-i="${b.gaps.indexOf(x.g)}" title="Lücke entfernen">${esc(normTerm(x.w))} ×</button>`).join('')}</div>` : ''}
      <div class="row" style="gap:8px 18px"><div class="f"><span>Lückenbreite</span><div class="seg sm" role="group" aria-label="Lückenbreite">${[['', 'alle gleich lang'], ['wort', 'wie das Wort']].map(([v, l]) => `<button type="button" data-act="gap-w" data-v="${v}" aria-pressed="${(b.gapW || '') === v}">${l}</button>`).join('')}</div></div></div>
      <div class="chks">${fCheck('gapBank', 'Wortspeicher unter dem Text', b.gapBank !== false)}</div>
      ${b.form !== 'gedicht' && matHasH(b.text) ? `<div class="f"><span>Zwischenüberschriften (5-Schritt-Lesemethode)</span><div class="seg sm" role="group" aria-label="Zwischenüberschriften">${GAP_HD.map(([v, l]) => `<button type="button" data-act="gap-hd" data-v="${v}" aria-pressed="${(b.gapHd || '') === v}">${l}</button>`).join('')}</div><small class="fh">Im Schülerblatt fehlen die fett gesetzten Zwischenüberschriften: ganz weg, als Schreiblinie zum Selbst-Formulieren oder als Schreiblinie mit den Überschriften gemischt in einem Kasten zum Zuordnen. Die Lehrerfassung zeigt sie farbig.</small></div>` : ''}
      ${gs.length ? '<button class="link danger" type="button" data-act="gap-clear">Alle Lücken entfernen</button>' : ''}
    </div>` : ''}
  </div>`;
}
function fmtEditor(b) {
  const f = matFmt(b); const open = state.fmtOpen.has(b.id);
  const isDef = JSON.stringify(f) === JSON.stringify(matFmt({})) && b.lineNumbers !== false;
  const nMat = state.sheet.blocks.filter(x => x.type === 'material').length;
  const seg = key => { const d = MAT_FMT[key]; return `<div class="f"><span>${d.label}</span><div class="seg" role="group" aria-label="${d.label}">${d.opts.map(([v, t]) => `<button type="button" data-act="fmt" data-f="${key}" data-v="${v}" aria-pressed="${f[key] === v}">${t}</button>`).join('')}</div></div>`; };
  return `<div class="sub${open ? ' open' : ''}">
    <button type="button" class="sub-h" data-act="fmt-toggle" aria-expanded="${open}"><span class="sub-t">Formatierung</span><span class="sub-s">${esc(fmtSummary(b))}</span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6l4 4 4-4"/></svg></button>
    ${open ? `<div class="sub-b">${b.form === 'gedicht' ? '' : seg('align')}${seg('font')}<div class="row">${seg('size')}${seg('lh')}</div>
      <div class="chks">${fCheck('lineNumbers', b.form === 'gedicht' ? 'Verszählung' : 'Zeilennummern', b.lineNumbers !== false)}${b.form === 'gedicht' ? '' : fCheck('fmt.indent', 'Einzug bei neuem Absatz', f.indent)}${f.cols === 2 ? '' : fCheck('fmt.margin', 'Rand für Notizen', f.margin)}</div>${f.cols === 2 && (b.fmt || {}).margin ? '<small class="hint">Der Rand für Notizen entfällt bei zwei Spalten.</small>' : ''}
      ${isDef && nMat < 2 ? '' : `<div class="row" style="gap:6px 18px">${isDef ? '' : '<button class="link" type="button" data-act="fmt-reset">Standard wiederherstellen</button>'}${nMat > 1 ? '<button class="link" type="button" data-act="fmt-all">Für alle Materialien übernehmen</button>' : ''}</div>`}</div>` : ''}
  </div>`;
}

