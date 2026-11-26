/* ---------- Formulierungshilfen: Vorlagen ---------- */
const PHRASE_SETS_FR = [
  { head: 'Présenter un texte', lines: ['Le texte … de … (publié en …) traite de …', 'L’auteur / l’autrice montre que …', 'Dans cet extrait, il s’agit de …'] },
  { head: 'Décrire et analyser', lines: ['Le texte se compose de … parties.', 'L’auteur utilise … pour …', 'Cela montre / souligne que …', 'Il faut noter que …'] },
  { head: 'Comparer', lines: ['Comme …, …', 'Contrairement à …, …', 'Alors que …, …', 'De la même manière, …'] },
  { head: 'Donner son avis', lines: ['À mon avis, …', 'Je pense que …, parce que …', 'D’un côté …, de l’autre …', 'En conclusion, …'] },
  { head: 'Relier les idées', lines: ['D’abord, …', 'De plus, …', 'Cependant, …', 'C’est pourquoi …', 'Pour conclure, …'] }
];
const PHRASE_SETS_MA = [
  { head: 'Aufgabe verstehen', lines: ['Gegeben ist …, gesucht ist …', 'Ich vermute, dass …', 'Ich gehe so vor: Zuerst …, dann …'] },
  { head: 'Rechnen und begründen', lines: ['Daraus folgt …', 'Das gilt, weil …', 'Wenn …, dann …', 'Nach dem Satz des … gilt …'] },
  { head: 'Ergebnis deuten', lines: ['Das Ergebnis bedeutet, dass …', 'Im Sachzusammenhang heißt das …', 'Das Ergebnis ist (nicht) sinnvoll, weil …'] },
  { head: 'Prüfen', lines: ['Ich überprüfe mein Ergebnis, indem …', 'Die Probe ergibt …', 'Ein Gegenbeispiel ist …'] }
];
const PHRASE_SETS_GP = [
  { head: 'Quelle einleiten', lines: ['Bei der Quelle handelt es sich um … (Quellengattung) von … aus dem Jahr …', 'Der Verfasser … war zu dieser Zeit …', 'Die Quelle richtet sich an …', 'Anlass war …', 'Thema der Quelle ist …'] },
  { head: 'Aussagen wiedergeben', lines: ['Der Verfasser vertritt die Auffassung, dass …', 'Er begründet dies damit, dass … (Z. …).', 'Er fordert, dass …', 'Seine Absicht ist es, …', 'Das zeigt sich in der Formulierung „…“ (Z. …).'] },
  { head: 'Historisch einordnen', lines: ['Die Quelle entstand zur Zeit …', 'Vorausgegangen war …', 'Vor diesem Hintergrund wird verständlich, warum …', 'Die Quelle steht im Zusammenhang mit …', 'In der Folge kam es zu …'] },
  { head: 'Darstellung wiedergeben', lines: ['Die Autorin oder der Autor vertritt die These, dass …', 'Als Begründung wird angeführt, dass …', 'Belegt wird dies mit …', 'Im Unterschied zu Q1 betont D1, dass …'] },
  { head: 'Karikatur beschreiben', lines: ['Die Karikatur von … erschien … in …', 'Im Vordergrund ist … zu sehen.', 'Die Person links ist dargestellt als …', 'Die Bildunterschrift lautet: „…“'] },
  { head: 'Karikatur deuten', lines: ['Das Symbol … steht für …', 'Die Darstellung von … als … soll zeigen, dass …', 'Der Zeichner kritisiert …', 'Die Aussage der Karikatur lautet: …'] },
  { head: 'Statistik auswerten', lines: ['Die Statistik von … zeigt …', 'Dargestellt ist der Zeitraum von … bis …', 'Die Angaben sind in … (Prozent, absolute Zahlen).', 'Auffällig ist, dass …', 'Von … bis … stieg der Anteil von … auf …'] },
  { head: 'Sach- und Werturteil', lines: ['Aus der Sicht der damaligen Zeit war …, weil …', 'Gemessen an … (Kriterium) ist … als … einzuschätzen.', 'Aus heutiger Sicht ist …, da …', 'Abschließend komme ich zu dem Urteil, dass …'] }
];
const PHRASE_SETS_BIO = [
  { head: 'Hypothese formulieren', lines: ['Ich vermute, dass …, weil …', 'Wenn …, dann …', 'Je mehr …, desto …'] },
  { head: 'Beobachtung beschreiben', lines: ['Zu beobachten ist, dass …', 'Nach … Minuten zeigt sich …', 'Im Vergleich zum Kontrollansatz …', 'Es fällt auf, dass …'] },
  { head: 'Diagramm beschreiben', lines: ['Das Diagramm zeigt … in Abhängigkeit von …', 'Auf der x-Achse ist … in … aufgetragen, auf der y-Achse …', 'Die Kurve steigt von … bis … an.', 'Das Maximum liegt bei …', 'Ab … bleibt der Wert annähernd gleich.'] },
  { head: 'Erklären (Ursache und Wirkung)', lines: ['Das liegt daran, dass …', 'Dadurch kommt es zu …', 'Die Ursache dafür ist …', 'Daraus folgt, dass …'] },
  { head: 'Ergebnis und Fehlerbetrachtung', lines: ['Die Hypothese wird bestätigt, weil …', 'Die Hypothese wird verworfen, weil …', 'Mögliche Fehlerquellen sind …', 'Um das Ergebnis abzusichern, müsste man …'] },
  { head: 'Bewerten', lines: ['Für … spricht, dass …', 'Dagegen spricht, dass …', 'Betroffen ist dabei der Wert …', 'Ich halte … für vertretbar, weil …'] }
];
const PHRASE_SETS_EN = [
  { head: 'Introducing a text', lines: ['The text … by … (published in …) deals with …', 'The author focuses on …', 'In the excerpt, the reader learns that …'] },
  { head: 'Describing and analysing', lines: ['The text is structured into … parts.', 'The author uses … in order to …', 'This shows / suggests that …', 'The use of … emphasises …'] },
  { head: 'Comparing', lines: ['Both … and … ', 'In contrast to …, …', 'Whereas …, …', 'Similarly, …'] },
  { head: 'Giving your opinion', lines: ['In my opinion, …', 'I am convinced that …, because …', 'On the one hand …, on the other hand …', 'All in all, …'] },
  { head: 'Linking ideas', lines: ['First of all, …', 'Furthermore, …', 'However, …', 'As a result, …', 'To conclude, …'] }
];
const PHRASE_SETS_ES = [
  { head: 'Presentar un texto', lines: ['El texto … de … (publicado en …) trata de …', 'El autor / la autora se centra en …', 'En el fragmento se describe …'] },
  { head: 'Describir y analizar', lines: ['El texto se divide en … partes.', 'El autor utiliza … para …', 'Esto muestra / sugiere que …', 'El uso de … subraya …'] },
  { head: 'Comparar', lines: ['Tanto … como …', 'A diferencia de …, …', 'Mientras que …, …', 'De la misma manera, …'] },
  { head: 'Dar tu opinión', lines: ['En mi opinión, …', 'Estoy convencido/-a de que …, porque …', 'Por un lado …, por otro lado …', 'En resumen, …'] },
  { head: 'Conectar ideas', lines: ['En primer lugar, …', 'Además, …', 'Sin embargo, …', 'Por eso, …', 'Para concluir, …'] }
];
const phraseSets = () => fachKey() === 'en' ? PHRASE_SETS_EN : fachKey() === 'es' ? PHRASE_SETS_ES : fachKey() === 'fr' ? PHRASE_SETS_FR : fachBase() === 'ma' ? [...PHRASE_SETS_MA, ...PHRASE_SETS.filter(p => p.head === 'Vergleichen')] : fachBase() === 'gp' ? [...PHRASE_SETS_GP, ...PHRASE_SETS.filter(p => p.head === 'Argumentieren' || p.head === 'Vergleichen')]
  : fachBase() === 'bio' ? [...PHRASE_SETS_BIO, ...PHRASE_SETS.filter(p => p.head === 'Vergleichen')] : PHRASE_SETS;
const PHRASE_SETS = [
  { head: 'Einleitung', lines: ['In dem Text „…“ von … (…) geht es um …', 'Der Text „…“ wurde … veröffentlicht und thematisiert …', 'Im Mittelpunkt steht …', 'Die Kernaussage lautet, dass …'] },
  { head: 'Sprachliche Mittel deuten', lines: ['Auffällig ist die Verwendung von …', 'Durch die Metapher „…“ (Z. …) wird verdeutlicht, dass …', 'Die Wiederholung von … unterstreicht …', 'Der Satzbau wirkt …, weil …', 'Dies lässt sich so deuten, dass …'] },
  { head: 'Zitieren und Belegen', lines: ['Das zeigt sich in Zeile …: „…“', 'Wie es in Z. … heißt, …', 'Der Erzähler betont, dass … (vgl. Z. …).', 'Dafür spricht die Formulierung „…“ (Z. …).'] },
  { head: 'Argumentieren', lines: ['Ein wichtiges Argument für … ist, dass …', 'Hinzu kommt, dass …', 'Dagegen lässt sich einwenden, dass …', 'Zwar …, aber …', 'Ein Beispiel dafür ist …'] },
  { head: 'Vergleichen', lines: ['Im Unterschied zu … zeigt …', 'Während in M1 …, wird in M2 …', 'Gemeinsam ist beiden Texten, dass …', 'Ähnlich wie … stellt auch …'] },
  { head: 'Urteilen und Schluss', lines: ['Abschließend lässt sich festhalten, dass …', 'Insgesamt überzeugt mich …, weil …', 'Meiner Meinung nach …, da …', 'Zusammenfassend zeigt sich, dass …'] }
];
const PHR_ICON = '<svg class="phr-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v10.5H10.5L6 19v-3.5H4z"/><path d="M8 9h8M8 12h5"/></svg>';
const phrGroups = b => (Array.isArray(b.groups) ? b.groups : []).map(g => ({ head: String(g.head || '').trim(), lines: String(g.text || '').split('\n').map(x => x.trim()).filter(Boolean) })).filter(g => g.head || g.lines.length);

const stilTiles = (b, S) => `<div class="f"><span>Stil</span><div class="km-grid km-sm" role="group" aria-label="Stil">${Object.entries(S).map(([k, x]) => `<button type="button" class="km" data-act="blk-stil" data-v="${k}" aria-pressed="${(b.stil || '') === k}" title="${esc(x.d)}"><svg viewBox="0 0 64 40" aria-hidden="true">${x.pic}</svg><b>${x.label}</b></button>`).join('')}</div></div>`;

function lbEdHTML(b) {
  const seg = (act, i, cur, opts, lab) => `<div class="seg sm" role="group" aria-label="${lab}">${opts.map(([v, t, ti]) => `<button type="button" data-act="${act}" data-i="${i}" data-v="${v}" aria-pressed="${cur === v}"${ti ? ` title="${ti}"` : ''}>${t}</button>`).join('')}</div>`;
  const L = b.lb || [], free = x => x.tx != null && x.ty != null;
  const dots = L.map((x, i) => free(x) ? `<span class="lb-dot" data-lbdot="${i}" style="left:${+x.tx}%;top:${+x.ty}%" title="Pfeilziel von Kasten ${i + 1} – ziehen">${i + 1}</span>` : '').join('');
  return `${b.src ? `<div class="lb-pick" data-lbpick>${`<img src="${esc(b.src)}" alt="Bild – hier die Pfeilziele hinziehen" draggable="false">`}${dots}</div>${L.some(free) ? '<small class="hint">Ziehe die Nummern auf die Stelle im Bild, auf die der Pfeil zeigen soll.</small>' : ''}` : ''}
    <label class="f"><span>${b.src ? 'Bild ersetzen' : 'Bild wählen'}</span><input type="file" accept="image/*" data-act="img"></label>
    <label class="f"><span>Bildbreite in der Mitte: ${Math.round(+b.width || 42)} %</span><input type="range" min="25" max="70" step="1" value="${+b.width || 42}" data-k="width" data-num="1"></label>
    ${fText('caption', 'Überschrift über dem Bild (optional)', b.caption, 'z. B. Wie gestalte ich meine Lesekiste?')}
    <div class="f"><span>Für die Kinder</span>${seg('lb-mode', 0, b.lbMode || '', [['', 'Ausgefüllt'], ['text', 'Text leer', 'Überschriften stehen, darunter Linien zum Schreiben'], ['ganz', 'Alles leer', 'Nur Kästen mit Linien und Pfeilen – zum Beschriften']], 'Für die Kinder')}</div>
    <div class="f"><span>Pfeile</span>${seg('lb-arr', 0, ['gerade', 'strich', 'kraeftig', 'punkt'].includes(b.lbArr) ? b.lbArr : '', [['', '⤻ Bogen', 'Geschwungener Pfeil'], ['gerade', '→ Gerade', 'Gerader Pfeil'], ['strich', '⇢ Gestrichelt', 'Gestrichelter Pfeil'], ['kraeftig', '➜ Kräftig', 'Dicker Pfeil'], ['punkt', '●— Linie mit Punkt', 'Linie, die mit einem Punkt endet – wie bei einer Beschriftung']], 'Pfeilstil')}<small class="hint">Tipp: Die Pfeilspitze kannst du auch direkt im Blatt mit der Maus verschieben.</small></div>
    <div class="lb-ed">${L.map((x, i) => { const sd = ['l', 'r', 'o', 'u'].includes(x.s) ? x.s : 'l'; return `<div class="lb-row-e">
      <div class="lb-row-h"><b>Kasten ${i + 1}</b>${seg('lb-side', i, sd, [['l', 'links'], ['o', 'oben'], ['u', 'unten'], ['r', 'rechts']], 'Lage des Kastens')}<button class="ib" type="button" data-act="lb-del" data-i="${i}" title="Kasten entfernen" aria-label="Kasten ${i + 1} entfernen">${I.x}</button></div>
      <div class="lb-row-h">${free(x) ? `<span class="hint">Pfeil zeigt auf die Stelle ${i + 1} im Bild</span><button class="link" type="button" data-act="lb-auto" data-i="${i}">Pfeil wieder automatisch</button>` : `${sd === 'l' || sd === 'r' ? seg('lb-at', i, x.at || 'm', [['o', sd === 'l' ? '↗' : '↖', 'Pfeil nach oben'], ['m', sd === 'l' ? '→' : '←', 'Pfeil zur Mitte'], ['u', sd === 'l' ? '↘' : '↙', 'Pfeil nach unten']], 'Pfeil') : ''}${b.src ? `<button class="link" type="button" data-act="lb-free" data-i="${i}">Pfeilziel im Bild wählen</button>` : ''}`}</div>
      ${fText(`lb.${i}.h`, 'Überschrift', x.h, 'z. B. Klappentext')}${fArea(`lb.${i}.t`, 'Text', x.t, 2, 'z. B. Suche eine passende Stelle für den Klappentext.')}</div>`; }).join('')}</div>
    ${L.length < 10 ? '<button class="link" type="button" data-act="lb-add">+ Kasten</button>' : ''}
    ${fText('source', 'Quelle des Bildes', b.source, '')}`;
}
const fArea = (k, label, v, rows = 3, ph = '', cls = '', hint = '') => `<label class="f"><span>${label}</span><textarea data-k="${k}" rows="${rows}" placeholder="${esc(ph)}" class="${cls}">${esc(v)}</textarea>${hint ? `<small>${hint}</small>` : ''}</label>`;
const fCheck = (k, label, v) => `<label class="chk"><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}>${label}</label>`;
const fSelect = (k, label, v, opts) => `<label class="f"><span>${label}</span><select data-k="${k}">${opts.map(([val, t]) => `<option value="${esc(val)}"${String(val) === String(v) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;

function opSelect(i) {
  const grp = (title, list) => `<optgroup label="${title}">${list.map(o => `<option value="${esc(o.op)}">${esc(o.op)}${o.gs ? ' · ' + esc(o.tplDu) : ' · AFB ' + afbLabel(o.afb)}</option>`).join('')}</optgroup>`;
  const L = curOps(); const F = L === OPS_GS ? { ops: 'Handlungsverben Grundschule' } : fachInfo();
  return `<select data-act="op" data-i="${i}" aria-label="Operator einsetzen"><option value="">Operator einsetzen …</option>${grp(F.ops, L.filter(o => o.iqb))}${grp('Ergänzend (Einstufung je nach Liste)', L.filter(o => !o.iqb))}</select>`;
}
function chipsHTML(text) {
  if (!String(text || '').trim()) return '';
  const ops = detectOps(text);
  if (!ops.length) return '<span class="chip warn">Kein Operator erkannt</span>';
  return ops.map(o => { const top = o.afb[1]; return `<span class="chip a${top}${o.iqb ? '' : ' extra'}" title="${o.iqb ? fachInfo().opsShort : 'ergänzender Operator'}">${esc(o.op)} · AFB ${afbLabel(o.afb)}</span>`; }).join('');
}
function progressionHTML() {
  const labels = [];
  for (const b of state.sheet.blocks) if (b.type === 'tasks') for (const it of b.items) { const r = opsRange(detectOps(it.text)); labels.push(r ? afbLabel(r) : '?'); }
  if (!labels.length) return '';
  return `Progression auf dem Blatt: <b>${labels.join(' → ')}</b>`;
}
// Kurzinfo für zugeklappte Karten
function sumDetail(b) {
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const wc = t => { const x = plainText(t || '').trim(); return x ? x.split(/\s+/).length : 0; };
  try {
    switch (b.type) {
      case 'material': { const w = wc(b.text), g = (b.glossary || []).length; return [w ? pl(w, 'Wort', 'Wörter') : 'noch kein Text', g ? pl(g, 'Worterklärung', 'Worterklärungen') : '', String(b.source || '').trim() ? '' : 'ohne Quelle'].filter(Boolean).join(' · '); }
      case 'tasks': { const L = b.items || []; const noEh = L.filter(it => String(it.text || '').trim() && !ehLines(it).length).length; return [pl(L.length, 'Aufgabe', 'Aufgaben'), noEh ? (noEh === L.length ? 'ohne Erwartung' : `${noEh} ohne Erwartung`) : 'Erwartung ✓'].join(' · '); }
      case 'chat': { const n = (b.msgs || []).filter(m => !m.sys).length, e = (b.msgs || []).filter(m => !m.sys && !String(m.t || '').trim()).length; return [pl(n, 'Nachricht', 'Nachrichten'), e ? e + ' zum Ausfüllen' : '', CHAT_ST[chatSt(b)].l].filter(Boolean).join(' · '); }
      case 'info': case 'text': case 'quote': { const w = wc(b.text); return w ? plainText(b.text).trim().slice(0, 70) : 'noch leer'; }
      case 'image': if (Array.isArray(b.lb)) return `${b.lb.length} Kästen${b.lbMode ? ' · zum Beschriften' : ''}${b.src ? '' : ' · noch kein Bild'}`; return b.src ? (b.caption ? plainText(b.caption).slice(0, 60) : 'Bild vorhanden') : 'noch kein Bild';
      default: { const ph = itPh(b), mn = itMin(b); return [ph ? PHASEN[ph].label : '', mn ? mn + ' Min.' : ''].filter(Boolean).join(' · '); }
    }
  } catch { return ''; }
}
// Kurzname für die Gliederung
function olShort(b, num) {
  const r = num[b.id];
  if (b.type === 'material') return r ? r.tag || 'M' + r.m : 'M';
  if (b.type === 'tasks') return !r || r.to < r.from ? 'Aufgaben' : r.from === r.to ? 'Aufgabe ' + r.from : `Aufgaben ${r.from}–${r.to}`;
  if (b.type === 'info') return b.kind || 'Infokasten';
  if (b.type === 'image') return r && r.tag ? r.tag : typeLabel(b);
  if (b.type === 'heading') return plainText(b.text || '').slice(0, 18) || 'Überschrift';
  return typeLabel(b);
}
// Offene Punkte auf dem Blatt (springen per Klick an die Stelle)
function pruefList() {
  const sh = state.sheet, m = sh.meta, num = numbering(sh), L = [];
  const add = (bid, t, k = 'w') => L.push({ bid, t, k });
  if (!String(m.title || '').trim() || m.title === 'Neues Arbeitsblatt') add('meta', 'Das Blatt hat noch keinen Titel.');
  let tno = 0;
  sh.blocks.forEach(b => {
    if (blockArea(b) !== 'blatt') return;
    if (b.type === 'tasks' && rst(b)) tno = 0;
    if (b.type === 'material') { const lab = num[b.id] ? num[b.id].tag || 'M' + num[b.id].m : 'M';
      if (String(b.memo || '').trim()) add(b.id, `${lab}: ${String(b.memo).trim().slice(0, 80)}`);
      if (!String(b.text || '').trim()) add(b.id, `${lab} hat noch keinen Text.`);
      if (!String(b.source || '').trim()) add(b.id, `${lab} hat keine Quellenangabe.`, 'n'); }
    if (b.type === 'tasks') (b.items || []).forEach(it => { if (itFo(it)) return; tno++; if (!String(it.text || '').trim()) add(b.id, `Aufgabe ${tno} ist leer.`); else if (!ehLines(it).length) add(b.id, `Aufgabe ${tno} hat noch keine Erwartung.`, 'n'); });
    if ((b.type === 'info' || b.type === 'text') && !plainText(b.text || '').trim()) add(b.id, `${typeLabel(b)} ist noch leer.`);
    if (b.type === 'heading' && !String(b.text || '').trim()) add(b.id, 'Eine Überschrift ist leer.', 'n');
    if (b.type === 'image' && !b.src) add(b.id, 'Ein Bild-Baustein hat noch kein Bild.');
    if (b.type === 'qr' && !String(b.url || '').trim()) add(b.id, 'Ein QR-Code hat noch keinen Link.');
  });
  return L;
}
function pruefHTML() {
  if (!state.sheet.blocks.length) return '';
  const L = pruefList(); const nW = L.filter(x => x.k === 'w').length;
  if (!L.length) return '<div class="pfx"><div class="pfx-ok">✓ Alles da: Titel, Texte, Quellen und Erwartungen.</div></div>';
  return `<div class="pfx" aria-label="Noch offen"><h4>Noch offen <em>${L.length}</em></h4><ul>${L.slice(0, 12).map(x => `<li class="${x.k}"><button type="button" data-act="ol-go" data-ob="${x.bid}"><i></i><span>${esc(x.t)}</span><small>hin</small></button></li>`).join('')}</ul>${L.length > 12 ? `<small class="hint">… und ${L.length - 12} weitere</small>` : ''}${nW ? '' : ''}</div>`;
}
function olHTML() {
  const sh = state.sheet, num = numbering(sh); const warn = new Set(pruefList().filter(x => x.k === 'w').map(x => x.bid));
  const open = id => state.sel === id || (!state.closed.has(id) && oneCard() && !state.allOpen);
  const chip = (id, ic, t, drag) => `<button type="button" class="ol-c${open(id) ? ' on' : ''}${warn.has(id) ? ' ol-warn' : ''}" data-act="ol-go" data-ob="${id}"${drag ? ' draggable="true"' : ''} title="${esc(t)}${drag ? ' · ziehen zum Umsortieren' : ''}"><i>${typeIcon(ic)}</i><span>${esc(t)}</span></button>`;
  const bl = sh.blocks.filter(b => blockArea(b) === 'blatt');
  return `<div class="olz" role="toolbar" aria-label="Gliederung des Arbeitsblatts">${chip('meta', 'meta', 'Kopf', false)}${bl.map(b => b.type === 'pagebreak' ? '<span class="ol-k" title="Neue Seite">⤓</span>' : chip(b.id, iconKey(b), olShort(b, num), true)).join('')}</div>`;
}
function olSync() {
  document.querySelectorAll('#editor .ol-c').forEach(c => { const id = c.dataset.ob; const card = document.querySelector(`#editor .card[data-bid="${id}"]`); c.classList.toggle('on', state.sel === id || !!(card && !card.classList.contains('closed') && oneCard() && !state.allOpen)); });
  const on = document.querySelector('#editor .ol-c.on'); if (on) { const o = on.parentElement, r = on.getBoundingClientRect(), orr = o.getBoundingClientRect(); if (r.left < orr.left || r.right > orr.right) o.scrollLeft += r.left - orr.left - 30; }
}
function olGo(bid) {
  if (!bid) return; if (state.area !== 'blatt' && bid !== 'meta') { const bb = state.sheet.blocks.find(x => x.id === bid); if (bb) { areaGo(blockArea(bb), bid); return; } }
  state.sel = bid; if (state.allOpen) state.closed.delete(bid); else openOnly(bid); saveClosed();
  renderEditor(); markSel(); clearTimeout(renderTimer); renderPreview();
  const c = $(`#editor .card[data-bid="${bid}"]`); if (c) c.scrollIntoView({ block: 'start', behavior: 'smooth' });
  setTimeout(() => { const n = document.querySelector(`#pages [data-bid="${bid}"]`); if (n) n.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 120);
}
function summary(b, num) {
  switch (b.type) {
    case 'material': return `${num[b.id].tag || 'M' + num[b.id].m} · ${b.title || 'ohne Titel'}`;
    case 'tasks': { const r = num[b.id]; const fo = r.nFo ? (r.nFo === 1 ? '1 Auftrag nur auf der Folie' : r.nFo + ' Aufträge nur auf der Folie') : ''; return (r.to < r.from ? (fo || 'keine Aufgaben') : (r.from === r.to ? `Aufgabe ${r.from}` : `Aufgaben ${r.from}–${r.to}`) + (fo ? ' · ' + fo : '')) + (b.title ? ' · ' + b.title : '') + (itMin(b) ? ` · ${itMin(b)} Min.` : '') + (itMin(b) && b.timer ? ' · Timer' : ''); }
    case 'chat': return (num[b.id] && num[b.id].tag ? num[b.id].tag + ' · ' : '') + (b.title || (b.head && b.head.name) || 'Chat') + ` · ${(b.msgs || []).length} Nachrichten`;
    case 'info': return `${b.kind}${b.title ? ' · ' + b.title : ''}`;
    case 'table': return `${b.cols.length} Spalten × ${b.rows.length} Zeilen${b.title ? ' · ' + b.title : ''}`;
    case 'step': return `${itPh(b) ? PHASEN[itPh(b)].label + ' · ' : ''}${stepLabel(b)}${itMin(b) ? ' · ' + itMin(b) + ' Min.' : ''} · nicht auf dem Blatt`;
    case 'a3': return `${A3_TPL[a3Tpl(b)].label}${tfStr(b.title).trim() ? ' · ' + plainText(b.title) : ''} · ${A3_TPL[a3Tpl(b)].o === 'q' && !(a3Tpl(b) === 'procon' && b.pcHoch) ? 'A3 quer' : 'A3 hoch'}`;
    case 'tafel': return `${TF_TPL[tfTpl(b)].label}${tfStr(b.title).trim() ? ' · ' + tfStrip(b.title) : ''}${(b.onSheet || 'luecke') === 'aus' ? ' · nur Tafel' : (b.onSheet || 'luecke') === 'luecke' ? ' · Lücken' : ''}`;
    case 'phrases': { const n = phrGroups(b).reduce((a, g) => a + g.lines.length, 0); return `${plainText(b.title || 'Formulierungshilfen')} · ${n} ${n === 1 ? 'Wendung' : 'Wendungen'}`; }
    case 'gsa': return gsaSummary(b);
    case 'lines': if (LIN[b.style]) return `${b.count} Zeilen ${LIN[b.style].label.split(' (')[0]}`; return b.style === 'rahmen' ? `freie Fläche · ${Math.min(+b.count || 1, 26) * 9} mm` : `${b.count} ${b.style === 'kaestchen' ? 'Zeilen Kästchen' : 'Linien'}`;
    case 'heading': return b.text || 'leer';
    case 'text': return (plainText(b.text) || 'leer').slice(0, 60);
    case 'quote': return (plainText(b.text) || 'leer').slice(0, 60);
    case 'image': return (num[b.id] && num[b.id].tag ? num[b.id].tag + ' · ' : '') + (Array.isArray(b.lb) ? (b.caption || 'Bild mit Beschriftungen') + ` · ${b.lb.length} Kästen` : '') + (Array.isArray(b.lb) ? '' : b.src ? (b.caption || 'Bild') : 'noch kein Bild');
    case 'qr': return b.title || b.url || 'noch kein Link';
    case 'match': { const L = mtLayout(b); if (L.sort) { const nd = L.right.length - L.sol.length; return L.left.length ? `Sortieren · ${L.left.length} ${L.left.length === 1 ? 'Oberbegriff' : 'Oberbegriffe'} · ${L.right.length} ${L.right.length === 1 ? 'Wort' : 'Wörter'}${nd ? ` (${nd} Ablenker)` : ''} · ${b.mode === 'buchstaben' ? 'Nummern' : 'Linien'}` : 'noch keine Oberbegriffe'; } return L.sol.length ? `${L.sol.length} ${L.sol.length === 1 ? 'Paar' : 'Paare'}${L.right.length > L.sol.length ? ` · ${L.right.length - L.sol.filter(x => x.rk >= 0).length} Ablenker` : ''} · ${b.mode === 'buchstaben' ? 'Buchstaben' : 'Linien'}` : 'noch keine Paare'; }
    default: return 'Rest beginnt auf neuer Seite';
  }
}
function qrWarn(b) {
  const url = String(b.url || '').trim(); if (!url) return '';
  if (!QR.encode(url)) return '<small class="gl-warn">Der Link ist zu lang für einen QR-Code. Bitte kürzen.</small>';
  if (!/^(https?:\/\/|www\.)/i.test(url)) return '<small class="gl-warn">Links beginnen meist mit https://</small>';
  return '';
}
function bodyFor(b, num) {
  switch (b.type) {
    case 'heading': return `${fText('text', 'Überschrift', b.text, 'z. B. Vertiefung')}
      <div class="row">${[['padTop', 'Abstand davor'], ['padBot', 'Abstand danach']].map(([f, l]) => `<div class="f"><span>${l}</span><div class="seg sm" role="group" aria-label="${l}">${[['', 'normal'], ['m', 'mehr'], ['l', 'viel']].map(([v, t]) => `<button type="button" data-act="blk-set" data-f="${f}" data-v="${v}" aria-pressed="${(b[f] || '') === v}">${t}</button>`).join('')}</div></div>`).join('')}</div>`;
    case 'text': return `${fRich('text', 'Text', b.text, { rows: 4, ph: 'Einleitung oder Hinweis', hint: RT_HINT })}`;
    case 'material': { const poem = b.form === 'gedicht'; const bm = moreOn('b:' + b.id);
      const mSum = [fachBase() === 'gp' && b.mk ? ({ q: 'Quelle', d: 'Darstellung' })[b.mk] : '', matFmt(b).cols === 2 ? 'zwei Spalten' : ''].filter(Boolean).join(' · ');
      const moreTop = `${fachBase() === 'gp' || b.mk ? `<div class="f"><span>Art</span><div class="seg sm" role="group" aria-label="Art des Materials">${[['', 'Material (M)'], ['q', 'Quelle (Q)'], ['d', 'Darstellung (D)']].map(([v, l]) => `<button type="button" data-act="mat-kind" data-v="${v}" aria-pressed="${(b.mk || '') === v}">${l}</button>`).join('')}</div></div>` : ''}
      <div class="row" style="gap:8px 18px">${['deutsch', 'en', 'es'].includes(fachKey()) || poem ? `<div class="f"><span>Textform</span><div class="seg sm" role="group" aria-label="Textform"><button type="button" data-act="mat-form" data-v="" aria-pressed="${!poem}">Prosa</button><button type="button" data-act="mat-form" data-v="gedicht" aria-pressed="${poem}">Gedicht</button></div></div>` : ''}
        <div class="f"><span>Spalten</span><div class="seg sm cols-seg" role="group" aria-label="Spalten">${[['', 'eine', '<path d="M5.5 2.5h12.5M5.5 6h12.5M5.5 9.5h12.5M5.5 13h9"/><path d="M1.6 6h1.4" stroke-width="1.3"/>'], ['2', 'zwei', '<path d="M4 2.5h5.5M4 6h5.5M4 9.5h5.5M4 13h4M13 2.5h5.5M13 6h5.5M13 9.5h5.5M13 13h3.5"/><path d="M1 6h1.4M10 6h1.4" stroke-width="1.3"/>']].map(([v, l, d]) => `<button type="button" data-act="fmt" data-f="cols" data-v="${v}" aria-pressed="${(matFmt(b).cols === 2 ? '2' : '') === v}"><svg viewBox="0 0 20 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${d}</svg>${l}</button>`).join('')}</div></div></div>`;
      return `${b.memo ? `<div class="memo-flag">${esc(b.memo)}</div>` : ''}${srcFormSeg(b)}
      ${fText('title', fachBase() === 'gp' ? 'Titel / Verfasser' : 'Titel / Autor', b.title, fachBase() === 'gp' ? (b.mk === 'd' ? 'z. B. Heinrich August Winkler: Der lange Weg nach Westen (2000), Auszug' : 'z. B. Otto von Bismarck: Rede vor dem Reichstag (1888), Auszug') : fachBase() === 'bio' ? 'z. B. Wie Pflanzen Licht nutzen (nach: Natura 2, S. 84)' : poem ? 'z. B. Gottfried Benn: Kleine Aster (1912)' : 'z. B. Caroline Wahl: 22 Bahnen (2023), Auszug')}
      ${poem ? fWord('text', 'Gedicht', b.text, { bid: b.id, gl: true, head: `${num[b.id] && num[b.id].tag || 'Material'} · Gedicht`, mode: 'inline', rows: 12, ph: 'Gedicht einfügen oder abtippen', cls: 'serif', hint: 'Jede Zeile ist ein Vers, eine Leerzeile beginnt eine neue Strophe. Gezählt werden Verse. Text markieren zum Hervorheben.' })
        : fWord('text', 'Text', b.text, { bid: b.id, gl: true, head: `${num[b.id] && num[b.id].tag || 'Material'} · Text`, mode: 'inline', rows: 9, ph: 'Originaltext einfügen', cls: 'serif', hd: true, hint: 'Enter = neue Zeile, Leerzeile = neuer Absatz, jede weitere Leerzeile bleibt auf dem Blatt sichtbar. „## “ am Zeilenanfang macht eine Zwischenüberschrift. Text aus PDFs wird beim Einfügen zu Fließtext zusammengezogen; Strg+Umschalt+V behält die Zeilen. Text markieren zum Hervorheben.' })}
      <div class="ocr-link"><button class="link" type="button" data-act="ocr-open">${CAM_SVG}Text aus Foto oder PDF übernehmen</button>${poem ? '' : '<button class="link" type="button" data-act="mat-h" title="Neue Zwischenüberschrift an der Schreibmarke (sonst am Ende)">+ Zwischenüberschrift</button>'}</div>
      ${!poem && matHasH(b.text) ? `<div class="chks">${fCheck('hdCount', 'Zwischenüberschriften bei den Zeilennummern mitzählen', b.hdCount)}</div>` : ''}
      ${glossRows(b)}
      ${fText('source', 'Quelle', b.source, 'Autor: Titel. Ort: Verlag Jahr, S. …')}
      ${b.post ? postEditor(b) : ''}
      <div class="more-card">${moreBtn('b:' + b.id, mSum, 'Mehr: Lücken, Lesehilfe, Notiz')}${bm ? `<div class="more-in">${moreTop}<small class="hint dz-hint">Schrift, Größe, Zeilenabstand, Einzug und Rand: in der Vorschau über das Material fahren und den Pinsel „Gestaltung“ wählen (am Tablet: Material antippen).</small>${gapEditor(b)}${readEditor(b)}
      ${fText('memo', 'Notiz für mich (wird nicht gedruckt)', b.memo, '')}</div>` : ''}</div>`; }
    case 'tasks': {
      const start = num[b.id].from; const nos = itNos(b, start); const bm = moreOn('b:' + b.id);
      const bSum = [tfStr(b.title).trim() ? '„' + plainText(b.title).trim().slice(0, 24) + '“' : '', itMin(b) ? itMin(b) + ' Min.' : '', b.timer ? 'Timer' : '', b.restart ? 'neu bei 1' : ''].filter(Boolean).join(' · ');
      return `${b.items.map((it, i) => `<div class="task-ed${itFo(it) ? ' fo' : ''}">
          <div class="task-ed-h">${itFo(it) ? `<span class="no fo" title="Nur auf der Folie: steht in Präsentation und PowerPoint, nicht auf dem Arbeitsblatt"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AREA_IC.pres}</svg></span>` : `<span class="no">${nos[i]}</span>`}${opSelect(i)}
            <button class="ib" type="button" data-act="task-up" data-i="${i}" title="Nach oben"${i === 0 ? ' disabled' : ''}>${I.up}</button>
            <button class="ib" type="button" data-act="task-del" data-i="${i}" title="Aufgabe entfernen">${I.x}</button></div>
          ${rtField(`items.${i}.text`, it.text, { rows: 2, ph: state.sheet.meta.anrede === 'du' ? 'Analysiere …' : 'Analysieren Sie …', aria: nos[i] ? `Aufgabe ${nos[i]}` : 'Auftrag nur auf der Folie' })}
          <div class="chips" data-chips="${i}">${chipsHTML(it.text)}</div>
          <div class="soz-row"><div class="soz" role="group" aria-label="Sozialform">${Object.entries(SOZ).map(([k, sz]) => `<button type="button" data-act="soz" data-i="${i}" data-v="${k}" aria-pressed="${it.soz === k}" title="${sz.label}">${sozSVG(k, 'currentColor', 'var(--soz-bg)')}<span>${sz.short}</span></button>`).join('')}</div>${moreOn(`t:${b.id}:${i}`) ? grpCtl(i, it) + phCtl(i, it) : ''}</div>
          <div class="soz arb" role="group" aria-label="Arbeitsform"><small class="arb-l">Arbeitsform</small>${Object.entries(ARB).filter(([k, x]) => !x.gs || isGS() || arbOf(it).includes(k)).map(([k, x]) => `<button type="button" data-act="arb" data-i="${i}" data-v="${k}" aria-pressed="${arbOf(it).includes(k)}" title="${x.label}">${arbSVG(k, 'currentColor')}<span>${x.label}</span></button>`).join('')}</div>
          ${taskExtras(b, i, it)}
        </div>`).join('')}
        <button class="link" type="button" data-act="task-add">+ Aufgabe</button>
        ${b.items.some(it => it.rk) ? `<div class="rk-set"><span>${RK_SVG}Raketenaufgaben</span><div class="seg sm" role="group" aria-label="Darstellung der Raketenaufgaben"><button type="button" data-act="rk-style" data-v="nr" aria-pressed="${rkStyle(state.sheet.meta) === 'nr'}">Rakete an der Nummer</button><button type="button" data-act="rk-style" data-v="abschnitt" aria-pressed="${rkStyle(state.sheet.meta) === 'abschnitt'}">Eigener Abschnitt am Ende</button></div>${rkStyle(state.sheet.meta) === 'abschnitt' ? `<input type="text" class="rk-hd" data-rkh value="${esc(state.sheet.meta.rkHead || '')}" placeholder="Für alle, die schon fertig sind" aria-label="Überschrift des Raketen-Abschnitts">` : ''}<small class="hint">Gilt für das ganze Blatt.</small></div>` : ''}
        <div class="more-card">${moreBtn('b:' + b.id, bSum, 'Mehr zum Baustein: Überschrift, Zeit, Timer')}${bm ? `<div class="more-in">${fText('title', 'Überschrift (optional)', b.title, 'Arbeitsaufträge')}
        ${timeCtl(b, 'Zeit (Min.)')}
        <div class="chks">${fCheck('restart', 'Nummerierung neu bei 1 beginnen', b.restart)}</div></div>` : ''}</div>
        <div class="prog" data-prog>${progressionHTML()}</div>`;
    }
    case 'chat': return chatEdHTML(b);
    case 'info': return `<div class="row">${fSelect('kind', 'Art', b.kind, [...new Set([...(INFO_KINDS_BY[fachKey()] || INFO_KINDS_BY[fachBase()] || INFO_KINDS), b.kind].filter(Boolean))].map(k => [k, k]))}${fText('title', 'Titel (optional)', b.title, '')}</div>
      ${fRich('text', 'Text', b.text, { rows: 4, hint: RT_HINT })}
      ${stilTiles(b, ST_INFO)}`;
    case 'phrases': {
      if (!Array.isArray(b.groups) || !b.groups.length) b.groups = [{ head: '', text: '' }];
      return `${fText('title', 'Überschrift', b.title, 'Formulierungshilfen')}
        <div class="row"><div class="f"><span>Spalten</span><div class="seg sm" role="group" aria-label="Spalten">${[[1, 'eine'], [2, 'zwei']].map(([n, l]) => `<button type="button" data-act="phr-cols" data-v="${n}" aria-pressed="${((+b.cols || 2) === 1 ? 1 : 2) === n}">${l}</button>`).join('')}</div></div>
          <label class="f"><span>Vorlage hinzufügen</span><select data-act="phr-set"><option value="">Vorlage wählen …</option>${phraseSets().map((p, i) => `<option value="${i}">${esc(p.head)}</option>`).join('')}</select></label></div>
        ${b.groups.map((g, i) => `<div class="phr-ed"><div class="phr-ed-h">${fText(`groups.${i}.head`, `Gruppe ${i + 1}`, g.head, 'Überschrift, z. B. Einleitung (optional)')}
            <button class="ib" type="button" data-act="phr-up" data-i="${i}" title="Nach oben"${i === 0 ? ' disabled' : ''}>${I.up}</button>
            <button class="ib" type="button" data-act="phr-del" data-i="${i}" title="Gruppe entfernen">${I.x}</button></div>
          ${rtField(`groups.${i}.text`, g.text || '', { mode: 'inline', rows: 3, ph: 'Eine Formulierung pro Zeile, z. B. Der Text handelt von …', aria: `Formulierungen Gruppe ${i + 1}` })}</div>`).join('')}
        <button class="link" type="button" data-act="phr-add">+ Gruppe</button>
        <small class="hint">Eine Formulierung pro Zeile. „…“ zeigt, wo weitergeschrieben wird.</small>`;
    }
    case 'quote': return `${fRich('text', 'Zitat', b.text, { rows: 3, ph: '„…“' })}${fText('author', 'Quelle / Urheber', b.author, 'z. B. Victor Klemperer: LTI (1947)')}`;
    case 'table': {
      const cols = b.cols.length; if (!Array.isArray(b.rowH)) b.rowH = []; const each = !!b.rowEach;
      b.eh = b.rows.map((r, ri) => Array.from({ length: cols }, (_, ci) => String((b.eh && b.eh[ri] && b.eh[ri][ci]) || '')));
      const paint = state.tbPaint && state.tbPaint[b.id]; const ehMode = !paint && state.tbEh.has(b.id); const nEh = tbEhCount(b);
      if (paint) { const nBg = Object.keys(b.bg || {}).length, sw = k => (TBL_BG[k] ? TBL_BG[k].c : '#fff');
        const cell = (key, txt, lab) => `<td><button type="button" class="tbp-c" data-act="tb-paint" data-c="${key}" style="background:${tbBg(b, ...key.split('.')) || '#fff'}" aria-label="${lab} färben">${txt ? esc(String(txt).replace(/[*_~]/g, '').slice(0, 40)) : '&nbsp;'}</button></td>`;
        return `${fText('title', 'Titel (optional)', b.title, '')}
        <div class="f"><span>Eintragen</span><div class="seg sm" role="group" aria-label="Eintragen"><button type="button" data-act="tb-mode" data-v="" aria-pressed="false">Inhalt</button><button type="button" data-act="tb-mode" data-v="eh" aria-pressed="false">Erwartung${nEh ? ` · ${nEh}` : ''}</button><button type="button" data-act="tb-mode" data-v="farbe" aria-pressed="true">Farbe${nBg ? ` · ${nBg}` : ''}</button></div></div>
        <div class="f"><span>Farbe wählen, dann Felder antippen</span><div class="tbp-pal" role="group" aria-label="Farbe">${[...Object.keys(TBL_BG), 'weg'].map(k => `<button type="button" class="tbp-sw${k === 'weg' ? ' weg' : ''}" data-act="tb-brush" data-v="${k}" aria-pressed="${paint === k}" title="${k === 'weg' ? 'Farbe entfernen' : TBL_BG[k].l}" style="background:${k === 'weg' ? '#fff' : sw(k)}">${k === 'weg' ? '✕' : ''}</button>`).join('')}</div></div>
        <div class="tbl-ed tbp"><table><tr><td class="tbp-x"></td>${b.cols.map((_, ci) => `<td><button type="button" class="tbp-rc" data-act="tb-paint-col" data-ci="${ci}" title="Ganze Spalte ${ci + 1} färben">Spalte ↓</button></td>`).join('')}</tr>
          ${b.cols.some(c => String(c).trim()) ? `<tr><td class="tbp-x"><small>Kopf</small></td>${b.cols.map((c, ci) => cell('h.' + ci, c, `Spaltenkopf ${ci + 1}`)).join('')}</tr>` : ''}
          ${b.rows.map((r, ri) => `<tr><td class="tbp-x"><button type="button" class="tbp-rc" data-act="tb-paint-row" data-ri="${ri}" title="Ganze Zeile ${ri + 1} färben">Zeile →</button></td>${b.cols.map((_, ci) => cell(ri + '.' + ci, r[ci], `Zeile ${ri + 1}, Spalte ${ci + 1}`)).join('')}</tr>`).join('')}
        </table></div>
        <div class="row" style="gap:16px">${nBg ? '<button class="link" type="button" data-act="tb-bg-clear">Alle Farben entfernen</button>' : ''}<button class="link" type="button" data-act="tb-mode" data-v="">Fertig</button></div>
        <p class="hint" style="margin:0">Die Farben erscheinen auf dem Blatt, auf der Folie und in Word. Tipp: Eine Zeile in Farbe als Zwischenüberschrift trennt Abschnitte deutlich.</p>`; }
      return `<button type="button" class="tbm-open" data-act="tbm-open"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>Groß bearbeiten</button>${fText('title', 'Titel (optional)', b.title, '')}
        <div class="f"><span>Eintragen</span><div class="seg sm" role="group" aria-label="Eintragen"><button type="button" data-act="tb-mode" data-v="" aria-pressed="${!ehMode}">Inhalt</button><button type="button" data-act="tb-mode" data-v="eh" aria-pressed="${ehMode}">Erwartung${nEh ? ` · ${nEh}` : ''}</button><button type="button" data-act="tb-mode" data-v="farbe" aria-pressed="false">Farbe${Object.keys(b.bg || {}).length ? ` · ${Object.keys(b.bg).length}` : ''}</button></div>${ehMode ? '<small>Die Erwartungen stehen nur in der Lehrerfassung in den Zellen. Eine Zeile = ein Punkt.</small>' : ''}</div>
        ${cols > 1 ? cwBarHTML(b) : ''}
        <div class="tbl-ed"><table style="min-width:${tbEdMin(b, each)}px"><colgroup>${tbWidths(b).map((p, ci) => `<col data-ci="${ci}" style="width:${p}%">`).join('')}${each ? '<col style="width:72px">' : ''}</colgroup>
          <tr>${b.cols.map((c, ci) => `<td>${rtField(`cols.${ci}`, c, { mode: 'line', ph: `Kopf ${ci + 1}`, aria: `Spaltenkopf ${ci + 1}` })}</td>`).join('')}${each ? '<td class="rh-c rh-h">Höhe<br>in mm</td>' : ''}</tr>
          ${b.rows.map((r, ri) => `<tr>${Array.from({ length: cols }, (_, ci) => ehMode
            ? `<td class="eh-td">${String(r[ci] || '').trim() ? `<div class="tb-ehv">${inlineHTML(r[ci])}</div>` : ''}${rtField(`eh.${ri}.${ci}`, b.eh[ri][ci], { mode: 'inline', rows: 1, ph: 'Erwartung', aria: `Erwartung Zeile ${ri + 1}, Spalte ${ci + 1}` })}</td>`
            : `<td${tbCk(b, ci) ? ' class="ck-td"' : ''}>${rtField(`rows.${ri}.${ci}`, r[ci] || '', { mode: 'line', ph: tbCk(b, ci) ? '☐ Kästchen' : 'leer', aria: `Zeile ${ri + 1}, Spalte ${ci + 1}` })}</td>`).join('')}${each ? `<td class="rh-c"><input type="number" min="5" max="250" step="1" data-k="rowH.${ri}" value="${esc(b.rowH[ri] || '')}" placeholder="${tbBaseMM(b)}" aria-label="Höhe von Zeile ${ri + 1} in mm" title="leer = wie unten eingestellt"></td>` : ''}</tr>`).join('')}
        </table></div>
        <div class="row" style="gap:16px">
          <button class="link" type="button" data-act="row-add">+ Zeile</button>
          <button class="link" type="button" data-act="row-del"${b.rows.length < 2 ? ' disabled' : ''}>− Zeile</button>
          <button class="link" type="button" data-act="col-add"${cols >= 6 ? ' disabled' : ''}>+ Spalte</button>
          <button class="link" type="button" data-act="col-del"${cols < 2 ? ' disabled' : ''}>− Spalte</button>
        </div>
        <div class="f"><span>Schreibplatz je Zeile</span><div class="seg sm" role="group" aria-label="Schreibplatz je Zeile">${[['normal', '8 mm'], ['hoch', '16 mm'], ['sehrhoch', '28 mm'], ['gross', '40 mm'], ['eigen', 'eigene Höhe']].map(([v, l]) => `<button type="button" data-act="tb-h" data-v="${v}" aria-pressed="${(b.rowHeight || 'normal') === v}">${l}</button>`).join('')}</div></div>
        ${b.rowHeight === 'eigen' ? `<label class="f narrow"><span>Höhe in mm</span><input type="number" min="5" max="250" step="1" data-k="rowMM" value="${esc(b.rowMM || 50)}"></label>` : ''}
        ${ckRowHTML(b)}
        <div class="chks">${fCheck('cellLines', 'Schreiblinien in leeren Zellen', b.cellLines)}${fCheck('rowEach', 'Höhe je Zeile einzeln', each)}${fCheck('firstBold', 'Erste Spalte fett', b.firstBold)}</div>
        <p class="hint" style="margin:0">Leere Zellen bleiben zum Ausfüllen frei.${each ? ' Ein leeres Höhenfeld übernimmt den Schreibplatz von oben.' : ''} Sehr hohe Zeilen beginnen auf der nächsten Seite.</p>`;
    }
    case 'gsa': return gsaEditor(b);
    case 'lines': return `<div class="row">${fSelect('style', 'Art', b.style, [['rahmen', 'Freie Fläche (Rahmen)'], ['linien', 'Linien (9 mm)'], ['kaestchen', 'Kästchen (5 mm)'], ...Object.entries(LIN).map(([v, x]) => [v, x.label])])}${LIN[b.style] && !LIN[b.style].x ? fCheck('mb', 'Mittelband farbig', b.mb) + linOpts(b) : ''}
      <label class="f narrow"><span>Zeilen</span><input type="number" min="1" max="40" data-k="count" value="${esc(b.count)}"></label></div>`;
    case 'match': {
      if (!Array.isArray(b.pairs) || !b.pairs.length) b.pairs = [{ a: '', b: '' }];
      const du = state.sheet.meta.anrede === 'du';
      const head = `${fText('title', 'Arbeitsanweisung (optional)', b.title, MT_DEF(!!b.sort, b.mode, du))}
        <div class="f"><span>Art</span><div class="seg sm" role="group" aria-label="Art der Zuordnung"><button type="button" data-act="mt-sort" data-v="0" aria-pressed="${!b.sort}" title="Jeder Begriff hat genau einen Partner">Paare</button><button type="button" data-act="mt-sort" data-v="1" aria-pressed="${!!b.sort}" title="Mehrere Wörter gehören zum selben Oberbegriff">Sortieren</button></div><small>${b.sort ? 'Wenige Oberbegriffe links, beliebig viele Wörter rechts.' : 'Jeder Begriff links hat genau einen Partner rechts.'}</small></div>
        <div class="f"><span>Bearbeitung</span><div class="seg sm" role="group" aria-label="Bearbeitung">${[['linien', 'Linien ziehen'], ['buchstaben', b.sort ? 'Nummern eintragen' : 'Buchstaben eintragen']].map(([v, l]) => `<button type="button" data-act="mt-mode" data-v="${v}" aria-pressed="${(b.mode || 'linien') === v}">${l}</button>`).join('')}</div></div>`;
      if (b.sort) {
        if (!Array.isArray(b.cats) || !b.cats.length) mtToSort(b);
        const cats = b.cats, words = b.words || (b.words = []); const bulk = state.fmtOpen.has('mtbulk:' + b.id);
        const catOpts = sel => cats.map((c, j) => `<option value="${esc(c.id)}"${sel === c.id ? ' selected' : ''}>${j + 1} · ${esc(plainText(c.t || '').trim() || 'Oberbegriff ' + (j + 1))}</option>`).join('');
        return head + `<div class="mt-ed">
          <div class="mt-ed-h2">Oberbegriffe (links)</div>
          ${cats.map((c, i) => `<div class="mt-ed-c"><span class="mt-ed-n">${i + 1}</span>${rtField(`cats.${i}.t`, c.t || '', { mode: 'line', ph: i ? 'z. B. Verben' : 'z. B. Nomen', aria: `Oberbegriff ${i + 1}` })}<button class="ib" type="button" data-act="mt-cdel" data-i="${i}" title="Oberbegriff entfernen"${cats.length < 2 ? ' disabled' : ''}>${I.x}</button></div>`).join('')}
          <div class="row"><button class="link" type="button" data-act="mt-cadd">+ Oberbegriff</button></div>
          <div class="mt-ed-h2">Wörter (rechts, werden gemischt) und wohin sie gehören</div>
          ${words.map((w, i) => `<div class="mt-ed-w${w.c ? '' : ' dist'}">${rtField(`words.${i}.t`, w.t || '', { mode: 'line', ph: 'Wort oder Ausdruck', aria: `Wort ${i + 1}` })}<select class="inp" data-k="words.${i}.c" aria-label="Wort ${i + 1} gehört zu">${catOpts(w.c)}<option value=""${w.c ? '' : ' selected'}>Ablenker: passt nirgends</option></select><button class="ib" type="button" data-act="mt-wdel" data-i="${i}" title="Wort entfernen"${words.length < 2 ? ' disabled' : ''}>${I.x}</button></div>`).join('')}
          ${bulk ? `<div class="mt-bulk"><textarea class="inp" data-mtbulk="1" placeholder="Mehrere Wörter: eins pro Zeile oder durch Komma getrennt" aria-label="Mehrere Wörter"></textarea><div class="row"><label class="f" style="flex-direction:row;align-items:center;gap:8px"><span>gehören zu</span><select class="inp" data-mtbulkc="1">${catOpts((words[words.length - 1] || {}).c || (cats[0] || {}).id)}<option value="">Ablenker</option></select></label><button class="btn sm primary" type="button" data-act="mt-bulkgo">Hinzufügen</button><button class="link" type="button" data-act="mt-bulk">Schließen</button></div></div>` : ''}
        </div>
        <div class="row" style="gap:16px"><button class="link" type="button" data-act="mt-wadd">+ Wort</button>${bulk ? '' : '<button class="link" type="button" data-act="mt-bulk">Mehrere Wörter auf einmal</button>'}<button class="link" type="button" data-act="mt-shuffle">Rechts neu mischen</button></div>
        <p class="hint" style="margin:0">Links stehen die Oberbegriffe, rechts beliebig viele Wörter in gemischter Reihenfolge. Jedes Wort gehört zu einem Oberbegriff oder ist ein Ablenker. Die Lösung steht in der Lehrerfassung${b.mode === 'buchstaben' ? ' (Nummern in den Kästchen)' : ' (eingezeichnete Linien)'} und im Erwartungshorizont.</p>`;
      }
      return head + `
        <div class="mt-ed"><div class="mt-ed-h"><span>Links</span><span></span><span>Passt zu (rechts, wird gemischt)</span><span></span></div>
        ${b.pairs.map((p, i) => `<div class="mt-ed-r">${rtField(`pairs.${i}.a`, p.a || '', { mode: 'line', ph: p.b && !p.a ? 'leer = Ablenker rechts' : 'Begriff oder Satzanfang', aria: `Links ${i + 1}` })}<span class="mt-ed-x" aria-hidden="true">↔</span>${rtField(`pairs.${i}.b`, p.b || '', { mode: 'line', ph: 'passende Ergänzung', aria: `Rechts ${i + 1}` })}<button class="ib" type="button" data-act="mt-del" data-i="${i}" title="Zeile entfernen"${b.pairs.length < 2 ? ' disabled' : ''}>${I.x}</button></div>`).join('')}</div>
        <div class="row" style="gap:16px"><button class="link" type="button" data-act="mt-add">+ Paar</button><button class="link" type="button" data-act="mt-extra">+ Ablenker rechts</button><button class="link" type="button" data-act="mt-shuffle">Rechts neu mischen</button></div>
        <p class="hint" style="margin:0">Rechts wird automatisch gemischt. Ein Ablenker hat links nichts und passt zu keinem Begriff. Die Lösung steht in der Lehrerfassung${b.mode === 'buchstaben' ? ' (Buchstaben in den Kästchen)' : ' (eingezeichnete Linien)'} und im Erwartungshorizont.</p>`;
    }
    case 'qr': return `${fText('url', 'Link', b.url, 'https://…')}<div data-qrw>${qrWarn(b)}</div>
      ${fText('title', 'Titel', b.title, 'z. B. CORRECTIV: Desinformation erkennen (Video)')}
      ${fText('note', 'Quelle / Hinweis', b.note, 'z. B. abgerufen am 28.10.2026')}
      <div class="row">${fSelect('size', 'Größe', b.size || 'M', [['S', 'klein (22 mm)'], ['M', 'mittel (30 mm)'], ['L', 'groß (40 mm)']])}</div>`;
    case 'tafel': return tafelEditor(b);
    case 'a3': return a3Editor(b);
    case 'step': return stepEditor(b);
    case 'image': if (Array.isArray(b.lb)) return lbEdHTML(b); return `${srcFormSeg(b)}${b.src ? `<img class="thumb" src="${esc(b.src)}" alt="Vorschau des Bildes">` : ''}
      <label class="f"><span>${b.src ? 'Bild ersetzen' : 'Bild wählen'}</span><input type="file" accept="image/*" data-act="img"></label>
      <div class="f"><span>Beschriftung</span><div class="seg sm" role="group" aria-label="Beschriftung">${[['', 'ohne'], ['m', 'M'], ...(fachBase() === 'gp' || b.mk === 'q' || b.mk === 'd' ? [['q', 'Q'], ['d', 'D']] : []), ...(fachBase() === 'bio' || b.mk === 'a' ? [['a', 'Abb.']] : [])].map(([v, l]) => `<button type="button" data-act="img-kind" data-v="${v}" aria-pressed="${(b.mk || '') === v}" title="${{ '': 'ohne Nummer', m: 'Material (M1, M2 …)', q: 'Quelle (Q1, Q2 …)', d: 'Darstellung (D1, D2 …)', a: 'Abbildung (Abb. 1, Abb. 2 …)' }[v]}">${l}</button>`).join('')}</div></div>
      ${fText('caption', b.mk ? 'Titel (steht neben der Nummer)' : 'Bildunterschrift', b.caption, b.mk ? 'z. B. Karikatur von Thomas Theodor Heine (1923)' : '')}${fText('source', 'Quelle', b.source, '')}
      <div class="row">${fSelect('width', 'Breite', b.width, [[40, '40 %'], [60, '60 %'], [80, '80 %'], [100, 'volle Breite']])}</div>`;
    default: return '<p class="hint" style="margin:0">Alles danach beginnt auf einer neuen Seite.</p>';
  }
}
function metaCard() {
  const m = state.sheet.meta; const closed = state.closed.has('meta'); const ex = m.exam || {}; const isK = m.mode === 'klausur'; const more = state.fmtOpen.has('meta-more');
  const moreSum = [isK ? 'Klausur' : '', m.course, KL(state.sheet.klasse).label, m.anrede === 'du' ? 'du' : 'Sie'].filter(Boolean).join(' · ');
  const colors = DESIGNS[designOf(m)].mono ? '<div class="f"><span>Farbe</span><small>Dieses Design ist einfarbig.</small></div>'
    : `<div class="f"><span>Farbe</span><div class="swatches">${Object.entries(ACCENTS).map(([k, a]) => `<button type="button" class="sw" data-act="accent" data-v="${k}" aria-pressed="${m.accent === k}"><i style="background:${a.c}"></i>${a.name}</button>`).join('')}</div><small>Graphit eignet sich für Schwarz-Weiß-Drucker.</small></div>`;
  return `<div class="card${closed ? ' closed' : ''}${state.sel === 'meta' ? ' sel' : ''}" data-bid="meta">
    <div class="card-h" data-act="toggle"><button type="button" class="chev" data-act="toggle" aria-expanded="${!closed}" title="${closed ? 'Aufklappen' : 'Zuklappen'}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button><span class="kind-i">${typeIcon('meta')}</span><span class="ch-t"><span class="ch-k"><span class="kind">Kopf</span></span><span class="sum">${isK ? esc(ex.label || 'Klausur') + ' · ' : (m.nr ? 'AB ' + esc(m.nr) + ' · ' : '')}${esc(m.title || 'Ohne Titel')}</span><span class="sum2">${esc([m.subtitle ? plainText(m.subtitle) : '', KL(state.sheet.klasse).label].filter(Boolean).join(' · '))}</span></span></div>
    <div class="card-b">${gNote('meta')}
      <div class="row"><label class="f narrow"><span>${isK ? 'Nr.' : 'AB-Nr.'}</span><input type="text" data-k="nr" value="${esc(m.nr)}" placeholder="7"></label>${fText('title', isK ? 'Titel (für die Ablage)' : 'Titel', m.title, 'Titel des Arbeitsblatts')}</div>
      ${isK ? '' : fText('topic', 'Thema / Unterzeile', m.topic, 'optional')}
      ${isK ? `<div class="row">${fText('exam.label', 'Bezeichnung', ex.label, 'Klausur')}${fText('exam.halbjahr', 'Kurshalbjahr', ex.halbjahr, 'z. B. 1. Kurshalbjahr')}</div>
        <div class="row">${fText('exam.datum', 'Datum', ex.datum, 'leer = zum Ausfüllen')}${fText('exam.zeit', 'Bearbeitungszeit', ex.zeit, 'z. B. 135 Minuten')}</div>
        ${fText('exam.hilfsmittel', 'Hilfsmittel', ex.hilfsmittel, '')}
        <small class="hint">Die erste Seite wird zum Deckblatt. Die Gewichtung trägst du bei den Aufgaben ein. Thema-Feld und Hinweiskasten entfallen wie im Abitur.</small>` : ''}
      ${(() => { const ids = rlpSheetIds(state.sheet); return ids.length ? `<div class="f rlp-sum x-pro"><span>Standards auf diesem Blatt</span><div class="rlp-codes">${ids.slice(0, 14).map(id => { const x = rlpInfo(id); return `<code title="${esc(x.t)}">${esc(x.own ? rlpShort(x.t, 22) : x.code)}</code>`; }).join('')}${ids.length > 14 ? `<small>+${ids.length - 14}</small>` : ''}<button class="link" type="button" data-act="rlp-sheet">Übersicht</button></div></div>` : ''; })()}
      <button type="button" class="set-link" data-act="settings" data-tab="kurs"><i>${areaIc('einst')}</i><span><b>Einstellungen</b><small>${esc([isK ? 'Klausur' : '', m.course, m.anrede === 'du' ? 'du' : 'Sie', DESIGNS[designOf(m)].label, DESIGNS[designOf(m)].mono ? '' : (ACCENTS[m.accent] || {}).name, { a4: 'A4', a4q: 'A4 quer', buch: 'A5 als Buch', a5x2: 'A5 doppelt' }[m.paper || 'a4']].filter(Boolean).join(' · '))}</small></span><em>›</em></button>
    </div></div>`;
}
// Eigene Karte für alles, was das Aussehen der Seite bestimmt
function seiteCard() {
  const m = state.sheet.meta; const closed = state.closed.has('seite');
  const colors = DESIGNS[designOf(m)].mono ? '<div class="f"><span>Farbe</span><small>Dieses Design ist einfarbig.</small></div>'
    : `<div class="f"><span>Farbe</span><div class="swatches">${Object.entries(ACCENTS).map(([k, a]) => `<button type="button" class="sw" data-act="accent" data-v="${k}" aria-pressed="${m.accent === k}"><i style="background:${a.c}"></i>${a.name}</button>`).join('')}</div><small>Graphit eignet sich für Schwarz-Weiß-Drucker.</small></div>`;
  const paper = m.paper || 'a4'; const gl = { n: 'normal', m: 'mehr', l: 'viel' };
  const sum = [DESIGNS[designOf(m)].label, DESIGNS[designOf(m)].mono ? '' : (ACCENTS[m.accent] || {}).name, { a4: 'A4', a4q: 'A4 quer', buch: 'A5 als Buch', a5x2: 'A5 doppelt' }[paper], 'Abstände ' + (m.headGap === m.botGap ? gl[m.headGap || 'n'] : gl[m.headGap || 'n'] + '/' + gl[m.botGap || 'n'])].filter(Boolean).join(' · ');
  return `<div class="card${closed ? ' closed' : ''}${state.sel === 'seite' ? ' sel' : ''}" data-bid="seite">
    <div class="card-h" data-act="toggle"><button type="button" class="chev" data-act="toggle" aria-expanded="${!closed}" title="${closed ? 'Aufklappen' : 'Zuklappen'}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button><span class="kind-i">${typeIcon('seite')}</span><span class="kind">Seite</span><span class="sum">${esc(sum)}</span></div>
    <div class="card-b">
      ${designEditor(m)}
      ${colors}
      <div class="f"><span>Papier</span><div class="seg sm" role="group" aria-label="Papier">${[['a4', 'A4'], ['a4q', 'A4 quer'], ['buch', 'A5 als Buch'], ['a5x2', 'A5 doppelt']].map(([v, t]) => `<button type="button" data-act="paper" data-v="${v}" aria-pressed="${paper === v}">${t}</button>`).join('')}</div><small>${paper === 'buch' ? 'Zwei A5-Seiten nebeneinander auf A4 quer, wie ein aufgeschlagenes Buch.' : paper === 'a5x2' ? 'Dieselbe A5-Seite zweimal auf A4 quer, zum Schneiden.' : 'Normales A4 hoch.'}</small></div>
      <div class="row">${[['headGap', 'Abstand nach dem Kopf'], ['botGap', 'Rand unten']].map(([f, l]) => `<div class="f"><span>${l}</span><div class="seg sm" role="group" aria-label="${l}">${[['n', 'normal'], ['m', 'mehr'], ['l', 'viel']].map(([v, t]) => `<button type="button" data-act="meta-set" data-f="${f}" data-v="${v}" aria-pressed="${((m[f] || 'n') === 'n' ? 'n' : m[f]) === v}">${t}</button>`).join('')}</div></div>`).join('')}</div>

    </div></div>`;
}
// Handy: Kopf beim Herunterscrollen ausblenden, beim Hochscrollen zeigen
(() => {
  const mq = window.matchMedia('(max-width: 640px)'); let last = {}, hidden = false;
  const set = on => { if (on === hidden) return; hidden = on; if (on) { const b = document.querySelector('header.bar'); if (b) document.body.style.setProperty('--hdh', b.offsetHeight + 'px'); } document.body.classList.toggle('hd-hide', on); };
  const onScroll = e => { const t = e.target; if (!mq.matches || !t || (t.id !== 'editor' && t.id !== 'preview-scroll')) return; const y = t.scrollTop, p = last[t.id] || 0; last[t.id] = y;
    if (y < 30) set(false); else if (y - p > 6) set(true); else if (p - y > 10) set(false); };
  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  mq.addEventListener('change', () => set(false));
  window.__hdShow = () => set(false);
})();
function renderEditor(focusSel) {
  try { crumbsRender(); } catch {}
  const ed = $('#editor'); const st = ed.scrollTop;
  const fa = document.activeElement; let focus = focusSel || null;
  if (!focus && fa && ed.contains(fa) && fa.dataset.k) { const c = fa.closest('[data-bid]'); if (c) focus = `[data-bid="${c.dataset.bid}"] [data-k="${fa.dataset.k}"]`; }
  state.area = areaNorm(state.area); if (state.out === 'vp') state.out = 'pres'; if (OUT_AREA[state.out] && state.area !== 'einst' && OUT_AREA[state.out] !== state.area) state.out = areaOutFor(state.area);
  basisClamp(); const A = state.area || 'blatt';
  if (state.out === 'karten') ed.innerHTML = areaBarHTML() + kartenEditor();
  else {
    enforceOne();
    const num = numbering(state.sheet); const blocks = state.sheet.blocks;
    const intro = state.out === 'exit' ? '<div class="memo-flag">Exit-Tickets entstehen aus Unterrichtsschritten mit „Exit-Ticket zum Ausdrucken“. Jede Seite enthält dasselbe Ticket mehrmals zum Ausschneiden.</div>' : state.out === 'tipps' ? '<div class="memo-flag">Tippkarten entstehen aus den gestuften Hilfen. Öffne dazu unter einer Aufgabe „Tipps“.</div>' : state.out === 'a3' ? '<div class="memo-flag">A3-Vorlagen und Exit-Tickets gehören zur Stunde, nicht aufs Arbeitsblatt. A3 siehst du rechts in A3; „2 × A4 zum Kleben“ verteilt jede Seite auf zwei A4-Blätter mit Schnittlinie.</div>' : state.out === 'tafel' ? '<div class="memo-flag">Tafelbilder der Stunde. Rechts stehen sie auf A4 quer, vollständig oder als Lückenfassung; „Am Beamer zeigen“ deckt sie Schritt für Schritt auf. Die Tafelkarten wählst du rechts oben.</div>' : '';
    const fold = `<div class="fold-bar"><div class="hist-b"><button type="button" class="ib" data-act="undo" title="Rückgängig (Strg+Z)" aria-label="Rückgängig"${hist.past.length || hist.timer ? '' : ' disabled'}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.5 2.5 6.5l3 3"/><path d="M2.8 6.5H10a3.5 3.5 0 0 1 0 7H7"/></svg></button><button type="button" class="ib" data-act="redo" title="Wiederholen (Strg+Y)" aria-label="Wiederholen"${hist.future.length ? '' : ' disabled'}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 3.5 3 3-3 3"/><path d="M13.2 6.5H6a3.5 3.5 0 0 0 0 7h3"/></svg></button></div><button type="button" class="link" data-act="fold-all">Alle zuklappen</button><span aria-hidden="true">·</span><button type="button" class="link" data-act="unfold-all">Alle aufklappen</button></div>`;
    let body;
    if (A === 'start') body = startHTML();
    else if (A === 'einst') body = settingsHTML();
    else if (A === 'pres') body = ppOn() ? ppStripHTML() : presEditorHTML() + (state.ppList && !isNarrow() ? '<div class="pp-foot"><button type="button" class="btn sm" data-act="pp-list">← Zurück zur Folienansicht</button></div>' : '');
    else if (A === 'extras') body = fold + (state.sheet.abs ? abBarHTML() : '') + extrasHTML(num) + bkHTML();
    else if (A === 'stunde') body = fold + stundeCard() + flowHTML(num) + bkHTML();
    else {
      const cards = blocks.map((b, i) => (inArea(b, A) ? (A === 'blatt' ? insRow(i) : '') + cardHTML(b, i, num) : A === 'blatt' && b.type !== 'pagebreak' ? phRowHTML(b, num) : '')).join('');
      const none = A !== 'blatt' && !blocks.some(b => inArea(b, A));
      body = fold + (state.sheet.abs && state.sheet.abs.length > 1 ? abBarHTML() : '') + intro + (A === 'blatt' ? metaCard() : '') + cards + (A === 'blatt' && state.out === 'blatt' ? pruefHTML() : '') + (none ? `<div class="flow-empty">${A === 'tafel' ? 'Noch kein Tafelbild in diesem Arbeitsblatt.' : 'Noch keine A3-Vorlage und kein Exit-Ticket in diesem Arbeitsblatt.'}</div>` : '') + bkHTML();
    }
    ed.innerHTML = areaBarHTML() + body;
    { const ab = ed.querySelector('.area-bar'); if (ab && getComputedStyle(ab).position === 'sticky') ed.style.setProperty('--sm', ab.offsetHeight + 10 + 'px'); }
    document.body.classList.toggle('pp-on', ppOn()); if (ppOn()) { ppAfterStrip(); ppPanelRender(); } else ppPanelRender();
  }
  ed.scrollTop = st;
  { const L = fachLang(); if (L !== 'de') ed.querySelectorAll('.rtx, textarea, input[type="text"]').forEach(x => { x.lang = L; }); }
  if (state.dz) { if (state.dz.k === 'block' && !state.sheet.blocks.some(x => x.id === state.dz.bid) || state.out !== 'blatt') state.dz = null; dzRender(); }
  ed.style.setProperty('--ed-mark', markColor(state.sheet.meta)); if (TBM) tbmRender();
  if (focus) { const f = ed.querySelector(focus); if (f && f.classList.contains('rtx')) { f.focus({ preventScroll: true }); rtCaretEnd(f); } else if (f) { f.focus({ preventScroll: true }); if (f.setSelectionRange && typeof f.value === 'string' && f.type !== 'number') { const l = f.value.length; try { f.setSelectionRange(l, l); } catch {} } } }
}
function refreshSummaries() {
  const num = numbering(state.sheet);
  state.sheet.blocks.forEach(b => { const s = document.querySelector(`#editor [data-bid="${b.id}"] [data-sum]`); if (s) s.textContent = summary(b, num); const s2 = document.querySelector(`#editor [data-bid="${b.id}"] [data-sum2]`); if (s2) s2.textContent = sumDetail(b); const oc = document.querySelector(`#editor .ol-c[data-ob="${b.id}"] span`); if (oc) oc.textContent = olShort(b, num); });
  clearTimeout(refreshSummaries.t); refreshSummaries.t = setTimeout(() => { const pf = document.querySelector('#editor .pfx'); if (pf && state.area === 'blatt') { const n = el(pruefHTML()); if (n) pf.replaceWith(n); else pf.remove(); } const warn = new Set(pruefList().filter(x => x.k === 'w').map(x => x.bid)); document.querySelectorAll('#editor .ol-c').forEach(c => c.classList.toggle('ol-warn', warn.has(c.dataset.ob))); }, 600);
  const ms = document.querySelector('#editor [data-bid="meta"] .sum'); const m = state.sheet.meta;
  if (ms) ms.textContent = (m.nr ? 'AB ' + m.nr + ' · ' : '') + (m.title || 'Ohne Titel');
  const tb = document.querySelector('#editor .ab-tab[aria-selected="true"] span'); if (tb) tb.textContent = plainText(m.title || '') || 'ohne Titel';
  const tn = document.querySelector('#editor .ab-tab[aria-selected="true"] b'); if (tn) tn.textContent = abLabel(m, state.sheet.abActive || 0);
  document.querySelectorAll('#editor [data-prog]').forEach(p => p.innerHTML = progressionHTML());
}


/* ================= Tabelle groß bearbeiten (Popup) ================= */
const TBM_IC = { insL: '<path d="M10 5v14M3 12h4M5 10v4"/><rect x="13" y="5" width="8" height="14" rx="1.5"/>', insR: '<path d="M14 5v14M21 12h-4M19 10v4"/><rect x="3" y="5" width="8" height="14" rx="1.5"/>',
  insU: '<path d="M5 10h14M12 3v4M10 5h4"/><rect x="5" y="13" width="14" height="8" rx="1.5"/>', insD: '<path d="M5 14h14M12 21v-4M10 19h4"/><rect x="5" y="3" width="14" height="8" rx="1.5"/>',
  mvL: '<path d="M15 6l-6 6 6 6"/>', mvR: '<path d="M9 6l6 6-6 6"/>', mvU: '<path d="M6 15l6-6 6 6"/>', mvD: '<path d="M6 9l6 6 6-6"/>', del: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>' };
const tbmI = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${TBM_IC[k]}</svg>`;
let TBM = null;
function tbmOpen(bid) { const b = state.sheet.blocks.find(x => x.id === bid && x.type === 'table'); if (!b) return; TBM = { bid }; state.sel = bid; if (typeof markSel === 'function') markSel(); tbmRender(); setTimeout(() => { const f = document.querySelector('#tbm .tbm-grid .rtx'); if (f) f.focus({ preventScroll: true }); }, 30); }
function tbmClose() { TBM = null; const x = document.getElementById('tbm'); if (x) x.remove(); document.body.classList.remove('tbm-on'); }
function tbmRender() {
  if (!TBM) return; const b = state.sheet && state.sheet.blocks.find(x => x.id === TBM.bid && x.type === 'table'); if (!b) return tbmClose();
  let box = document.getElementById('tbm');
  if (!box) { box = document.createElement('div'); box.id = 'tbm'; box.className = 'tbm-back'; document.body.appendChild(box); document.body.classList.add('tbm-on');
    box.addEventListener('input', onInput); box.addEventListener('change', onChange);
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('[data-tbm-x]')) { tbmClose(); return; } onClick(e); });
    box.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('#rt-bar:not([hidden]) .open')) { e.preventDefault(); tbmClose(); } });
    // Spaltenbreite im Popup ziehen
    let dr = null;
    box.addEventListener('pointerdown', e => { const h = e.target.closest && e.target.closest('.cw-h'); if (!h) return; const card = h.closest('[data-bid]'), bb = card && target(card.dataset.bid); if (!bb) return; e.preventDefault(); dr = { h, card, b: bb, i: +h.dataset.i, bar: h.parentElement }; snapshot(); try { h.setPointerCapture(e.pointerId); } catch { } h.classList.add('drag'); });
    box.addEventListener('pointermove', e => { if (!dr) return; const r = dr.bar.getBoundingClientRect(); if (!r.width) return; cwSet(dr.b, dr.i, (e.clientX - r.left) / r.width * 100); cwPaint(dr.card, dr.b); box.querySelectorAll('.tbm-grid col[data-ci]').forEach(c => { c.style.width = tbWidths(dr.b)[+c.dataset.ci] + '%'; }); changed(false); });
    const end = () => { if (dr) { dr.h.classList.remove('drag'); dr = null; renderEditor(); } }; box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  }
  const gw = box.querySelector('.tbm-gw'), sx = gw ? gw.scrollLeft : 0, sy = gw ? gw.scrollTop : 0;
  const cols = b.cols.length, paint = state.tbPaint && state.tbPaint[b.id], ehMode = !paint && state.tbEh.has(b.id), nEh = tbEhCount(b), nBg = Object.keys(b.bg || {}).length;
  b.eh = b.rows.map((r, ri) => Array.from({ length: cols }, (_, ci) => String((b.eh && b.eh[ri] && b.eh[ri][ci]) || '')));
  const ib = (act, ic, title, attrs, dis) => `<button type="button" class="tbm-ib${ic === 'del' ? ' del' : ''}" data-act="${act}" ${attrs} title="${title}" aria-label="${title}"${dis ? ' disabled' : ''}>${tbmI(ic)}</button>`;
  const bgS = (r, c) => tbBg(b, r, c) ? ` style="background:${tbBg(b, r, c)}"` : '';
  const pcell = (key, txt, lab) => `<button type="button" class="tbp-c" data-act="tb-paint" data-c="${key}" style="background:${tbBg(b, ...key.split('.')) || '#fff'}" aria-label="${lab} färben">${txt ? esc(plainText(String(txt)).slice(0, 80)) : '&nbsp;'}</button>`;
  const hasHead = b.cols.some(c => String(c).trim()) || !paint;
  const colTools = b.cols.map((_, ci) => `<th class="tbm-ct"><div>${ib('tbx-col-ins', 'insL', 'Spalte links einfügen', `data-ci="${ci}" data-pos="0"`, cols >= 6)}${ib('tbx-col-mv', 'mvL', 'Spalte nach links', `data-ci="${ci}" data-d="-1"`, ci === 0)}${ib('tbx-col-mv', 'mvR', 'Spalte nach rechts', `data-ci="${ci}" data-d="1"`, ci === cols - 1)}${ib('tbx-col-ins', 'insR', 'Spalte rechts einfügen', `data-ci="${ci}" data-pos="1"`, cols >= 6)}${ib('tbx-col-del', 'del', `Spalte ${ci + 1} löschen`, `data-ci="${ci}"`, cols < 2)}</div>${paint ? `<button type="button" class="tbp-rc" data-act="tb-paint-col" data-ci="${ci}">Spalte färben ↓</button>` : ''}</th>`).join('');
  const head = hasHead ? `<tr class="tbm-hr"><td class="tbm-rt"><small>Kopf</small></td>${b.cols.map((c, ci) => `<td${bgS('h', ci)}>${paint ? pcell('h.' + ci, c, `Spaltenkopf ${ci + 1}`) : rtField(`cols.${ci}`, c, { mode: 'line', ph: `Kopf ${ci + 1}`, aria: `Spaltenkopf ${ci + 1}` })}</td>`).join('')}</tr>` : '';
  const rows = b.rows.map((r, ri) => `<tr><td class="tbm-rt"><b>${ri + 1}</b><div>${ib('tbx-row-ins', 'insU', 'Zeile darüber einfügen', `data-ri="${ri}" data-pos="0"`)}${ib('tbx-row-mv', 'mvU', 'Zeile nach oben', `data-ri="${ri}" data-d="-1"`, ri === 0)}${ib('tbx-row-mv', 'mvD', 'Zeile nach unten', `data-ri="${ri}" data-d="1"`, ri === b.rows.length - 1)}${ib('tbx-row-ins', 'insD', 'Zeile darunter einfügen', `data-ri="${ri}" data-pos="1"`)}${ib('tbx-row-del', 'del', `Zeile ${ri + 1} löschen`, `data-ri="${ri}"`, b.rows.length < 2)}</div>${paint ? `<button type="button" class="tbp-rc" data-act="tb-paint-row" data-ri="${ri}">Zeile färben →</button>` : ''}</td>${Array.from({ length: cols }, (_, ci) => paint ? `<td>${pcell(ri + '.' + ci, r[ci], `Zeile ${ri + 1}, Spalte ${ci + 1}`)}</td>`
    : ehMode ? `<td class="eh-td"${bgS(ri, ci)}>${String(r[ci] || '').trim() ? `<div class="tb-ehv">${inlineHTML(r[ci])}</div>` : ''}${rtField(`eh.${ri}.${ci}`, b.eh[ri][ci], { mode: 'inline', rows: 2, ph: 'Erwartung', aria: `Erwartung Zeile ${ri + 1}, Spalte ${ci + 1}` })}</td>`
    : `<td${tbCk(b, ci) ? ' class="ck-td"' : ''}${bgS(ri, ci)}>${rtField(`rows.${ri}.${ci}`, r[ci] || '', { mode: 'line', ph: tbCk(b, ci) ? '☐ Kästchen' : 'leer', aria: `Zeile ${ri + 1}, Spalte ${ci + 1}` })}</td>`).join('')}</tr>`).join('');
  const seg = (lab, opts) => `<div class="seg sm" role="group" aria-label="${lab}">${opts}</div>`;
  box.innerHTML = `<div class="tbm" role="dialog" aria-modal="true" aria-label="Tabelle bearbeiten"><div class="card tbm-card" data-bid="${b.id}">
    <div class="tbm-h"><b>Tabelle bearbeiten</b><span class="tbm-sub">${cols} ${cols === 1 ? 'Spalte' : 'Spalten'} × ${b.rows.length} ${b.rows.length === 1 ? 'Zeile' : 'Zeilen'}</span><span class="tbm-sp"></span><button type="button" class="ib" data-act="undo" title="Rückgängig (Strg+Z)" aria-label="Rückgängig"${hist.past.length || hist.timer ? '' : ' disabled'}>${I.undo || '↶'}</button><button type="button" class="ib" data-act="redo" title="Wiederholen" aria-label="Wiederholen"${hist.future.length ? '' : ' disabled'}>${I.redo || '↷'}</button><button type="button" class="tbm-done" data-tbm-x>Fertig</button></div>
    <div class="tbm-tools">
      ${fText('title', 'Titel (optional)', b.title, '')}
      <div class="f"><span>Eintragen</span>${seg('Eintragen', `<button type="button" data-act="tb-mode" data-v="" aria-pressed="${!paint && !ehMode}">Inhalt</button><button type="button" data-act="tb-mode" data-v="eh" aria-pressed="${ehMode}">Erwartung${nEh ? ` · ${nEh}` : ''}</button><button type="button" data-act="tb-mode" data-v="farbe" aria-pressed="${!!paint}">Farbe${nBg ? ` · ${nBg}` : ''}</button>`)}</div>
      ${paint ? `<div class="f"><span>Farbe wählen, dann Felder antippen</span><div class="tbp-pal" role="group" aria-label="Farbe">${[...Object.keys(TBL_BG), 'weg'].map(k => `<button type="button" class="tbp-sw${k === 'weg' ? ' weg' : ''}" data-act="tb-brush" data-v="${k}" aria-pressed="${paint === k}" title="${k === 'weg' ? 'Farbe entfernen' : TBL_BG[k].l}" style="background:${k === 'weg' ? '#fff' : TBL_BG[k].c}">${k === 'weg' ? '✕' : ''}</button>`).join('')}${nBg ? '<button class="link" type="button" data-act="tb-bg-clear">Alle Farben entfernen</button>' : ''}</div></div>`
      : `<div class="f"><span>Schreibplatz je Zeile</span>${seg('Schreibplatz je Zeile', [['normal', '8 mm'], ['hoch', '16 mm'], ['sehrhoch', '28 mm'], ['gross', '40 mm']].map(([v, l]) => `<button type="button" data-act="tb-h" data-v="${v}" aria-pressed="${(b.rowHeight || 'normal') === v}">${l}</button>`).join(''))}</div>
      <div class="chks">${fCheck('cellLines', 'Schreiblinien in leeren Zellen', b.cellLines)}${fCheck('firstBold', 'Erste Spalte fett', b.firstBold)}</div>`}
    </div>
    ${cols > 1 && !paint ? `<div class="tbm-cw">${cwBarHTML(b)}</div>` : ''}
    <div class="tbm-gw"><table class="tbm-grid"><colgroup><col style="width:150px">${tbWidths(b).map((pc, ci) => `<col data-ci="${ci}" style="width:${pc}%">`).join('')}</colgroup>
      <tr class="tbm-ctr"><td class="tbm-rt"></td>${colTools}</tr>${head}${rows}
    </table></div>
    <div class="tbm-f"><button type="button" class="link" data-act="tbx-row-ins" data-ri="${b.rows.length - 1}" data-pos="1">+ Zeile am Ende</button>${cols < 6 ? `<button type="button" class="link" data-act="tbx-col-ins" data-ci="${cols - 1}" data-pos="1">+ Spalte rechts</button>` : ''}<span class="tbm-sp"></span><small class="hint">Esc oder „Fertig“ schließt. Änderungen erscheinen sofort im Blatt.</small></div>
  </div></div>`;
  const g2 = box.querySelector('.tbm-gw'); if (g2) { g2.scrollLeft = sx; g2.scrollTop = sy; }
}

/* Chat-Editor */
function chatEdHTML(b) {
  const P = chatPeople(b), M = Array.isArray(b.msgs) ? b.msgs : [], o = b.opt || {}, st = chatSt(b);
  const sw = { gruen: ['#075E54', '#D9FDD3', '#fff'], blau: ['#F6F6F6', '#0A84FF', '#E9E9EB'], verlauf: ['#fff', '#7B3FE4', '#EFEFEF'], hell: ['#517DA2', '#EFFDDE', '#fff'], snap: ['#FFFC00', '#F23C57', '#0EADFF'], dunkel: ['#2B2D31', '#5865F2', '#313338'], sms: ['#fff', '#EDEDED', '#fff'], ki: ['#fff', '#F0F0F0', '#10A37F'] };
  const pc = i => (i === 0 ? '#9CA3AF' : CHAT_PC[(i - 1) % CHAT_PC.length]);
  const pseg = (i, cur) => `<div class="seg sm" role="group" aria-label="Wer schreibt?">${P.map((x, k) => `<button type="button" data-act="chat-p" data-i="${i}" data-v="${k}" aria-pressed="${cur === k}"><span class="ch-dot" style="background:${pc(k)};display:inline-block;margin-right:4px;vertical-align:-1px"></span>${esc(String(x.n || '').trim() || 'Person ' + k)}${k === 0 ? ' (rechts)' : ''}</button>`).join('')}</div>`;
  return `${fText('title', 'Überschrift (optional)', b.title, 'z. B. Chatverlauf der Klassengruppe')}
    <div class="f"><span>Aussehen</span><div class="ch-sts">${Object.entries(CHAT_ST).map(([k, x]) => `<button type="button" class="ch-stb" data-act="chat-st" data-v="${k}" aria-pressed="${st === k}"><i>${sw[k].map(c => `<span style="background:${c};border:1px solid rgba(0,0,0,.15)"></span>`).join('')}</i><b>${x.l}</b><small>${x.hint}</small></button>`).join('')}</div></div>
    <div class="row">${fText('head.name', 'Name oben', b.head && b.head.name, P.length > 2 ? 'z. B. Klasse 10b 📚' : 'z. B. Lea')}${fText('head.sub', 'Zeile darunter', b.head && b.head.sub, 'z. B. online')}</div>
    <div class="f"><span>Personen im Chat</span><div class="ch-ppl">${P.map((x, k) => `<div class="ch-pr"><span class="ch-dot" style="background:${pc(k)}"></span>${fText(`people.${k}.n`, k === 0 ? 'Ich – erscheint rechts' : 'Person ' + k, x.n, k === 0 ? 'Ich' : 'Name')}${k > 1 ? `<button class="ib" type="button" data-act="chat-pdel" data-i="${k}" title="Person entfernen" aria-label="Person ${k} entfernen">${I.x}</button>` : ''}</div>`).join('')}</div>${P.length < 8 ? '<button class="link" type="button" data-act="chat-padd">+ Person</button>' : ''}</div>
    <div class="f"><span>Nachrichten <small class="hint">Leeres Textfeld = Schreiblinien in der Blase, zum Ausfüllen</small></span><div class="ch-msgs">${M.map((m, i) => `<div class="ch-mr${m.sys ? ' sys' : ''}">
      <div class="ch-mr-h">${m.sys ? '<b style="font-size:12.5px">Hinweis in der Mitte</b>' : pseg(i, Math.max(0, Math.min(P.length - 1, +m.p || 0)))}<span class="sp"></span>${m.sys ? '' : `<input class="ch-zi" data-k="msgs.${i}.z" value="${esc(m.z || '')}" placeholder="Zeit" aria-label="Uhrzeit Nachricht ${i + 1}">`}<button class="ib" type="button" data-act="chat-mv" data-i="${i}" data-d="-1" title="nach oben" aria-label="Nachricht nach oben"${i === 0 ? ' disabled' : ''}>↑</button><button class="ib" type="button" data-act="chat-mv" data-i="${i}" data-d="1" title="nach unten" aria-label="Nachricht nach unten"${i === M.length - 1 ? ' disabled' : ''}>↓</button><button class="ib" type="button" data-act="chat-del" data-i="${i}" title="Nachricht löschen" aria-label="Nachricht ${i + 1} löschen">${I.x}</button></div>
      ${rtField(`msgs.${i}.t`, m.t || '', { mode: 'inline', rows: 2, ph: m.sys ? 'z. B. Heute · Tom wurde hinzugefügt' : 'Nachricht … (leer = Linien zum Ausfüllen)', aria: `Nachricht ${i + 1}` })}</div>`).join('')}</div>
      <div class="row" style="gap:14px"><button class="link" type="button" data-act="chat-add">+ Nachricht</button><button class="link" type="button" data-act="chat-sys">+ Hinweis in der Mitte</button></div></div>
    <div class="f"><span>Format</span><div class="seg sm" role="group" aria-label="Format"><button type="button" data-act="chat-dev" data-v="" aria-pressed="${o.dev !== 'iphone'}">Frei – Höhe nach Inhalt</button><button type="button" data-act="chat-dev" data-v="iphone" aria-pressed="${o.dev === 'iphone'}">iPhone</button></div>${o.dev === 'iphone' ? '<small class="hint">Wie ein echter Bildschirm: Passen nicht alle Nachrichten hinein, werden oben die älteren abgeschnitten – wie beim Scrollen.</small>' : ''}</div>
    <label class="f"><span>${o.dev === 'iphone' ? 'Größe' : 'Breite'}: ${Math.round(+b.width || 72)} %</span><input type="range" min="40" max="100" step="2" value="${+b.width || 72}" data-k="width" data-num="1"></label>
    <div class="chks">${fCheck('opt.ln', 'Zeilenangaben (für Textbelege)', !!o.ln)}${o.dev === 'iphone' ? '' : fCheck('opt.frame', 'Handyrahmen', o.frame !== false)}${fCheck('opt.time', 'Uhrzeiten', o.time !== false)}${fCheck('opt.read', 'Lesehäkchen', o.read !== false)}${P.length > 2 ? fCheck('opt.names', 'Namen in der Gruppe', o.names !== false) : ''}${fCheck('opt.bar', 'Eingabezeile unten', o.bar !== false)}${fCheck('fiktiv', 'Hinweis „Fiktiver Chatverlauf“', b.fiktiv !== false)}</div>`;
}
