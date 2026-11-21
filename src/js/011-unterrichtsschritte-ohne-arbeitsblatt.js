/* ================= Unterrichtsschritte ohne Arbeitsblatt =================
   Baustein „Unterrichtsschritt“: steht nicht auf dem Blatt, zählt aber im Stundenablauf, steht im Verlaufsplan und wird zur Folie.
   Folie: text (Impuls oder Auftrag), frage (Stundenfrage aus meta.frage), zitat, bild oder aus. Exit-Tickets aus qs (eine Frage je Zeile). */
const STEP_TPL = {
  impuls: { g: 'ein', label: 'Stummer Impuls', ph: 'ein', soz: 'pl', min: 5, fol: 'bild', head: '', text: '', note: 'Bild oder Zitat kommentarlos zeigen, Äußerungen sammeln.', eh: 'beschreiben erste Eindrücke\nformulieren Vermutungen und Fragen' },
  frage: { g: 'ein', label: 'Stundenfrage', ph: 'ein', soz: 'pl', min: 5, fol: 'frage', head: 'Stundenfrage', text: '', note: 'Stundenfrage aus den Äußerungen entwickeln und an der Tafel festhalten.', eh: 'formulieren erste Antworten auf die Stundenfrage' },
  hypo: { g: 'ein', label: 'Vermutungen sammeln', ph: 'ein', soz: 'pa', min: 5, fol: 'text', head: '{Deine|Ihre} Vermutung', text: '{Stelle|Stellen Sie} eine Vermutung zur Stundenfrage auf.\n{Notiere|Notieren Sie} sie in einem Satz.', note: 'Vermutungen an der Tafel sammeln und am Ende der Stunde überprüfen.', eh: 'stellen begründete Vermutungen auf' },
  linie: { g: 'ein', label: 'Meinungslinie', ph: 'ein', soz: 'pl', min: 7, fol: 'text', head: '{Positioniere dich|Positionieren Sie sich}', text: '{Stelle dich|Stellen Sie sich} auf der Linie zwischen „stimme zu“ und „stimme nicht zu“ auf: …\n{Begründe|Begründen Sie} {deine|Ihre} Position in einem Satz.', note: 'These nennen, Linie im Raum markieren, einzelne Positionen begründen lassen.', eh: 'beziehen Position und begründen sie' },
  wdh: { g: 'ein', label: 'Wiederholung', ph: 'ein', soz: 'pl', min: 5, fol: 'text', head: 'Was wissen wir schon?', text: '{Fasse|Fassen Sie} die Ergebnisse der letzten Stunde in drei Sätzen zusammen.', note: 'Ergebnisse der letzten Stunde reaktivieren, Hausaufgabe aufgreifen.', eh: 'fassen die Ergebnisse der letzten Stunde zusammen' },
  equiz: { g: 'ein', label: 'Quiz zum Einstieg', ph: 'ein', soz: 'ea', min: 5, fol: 'quiz', head: 'Was {weißt du|wissen Sie} schon?', text: '{Beantworte|Beantworten Sie} die Fragen, ohne nachzuschlagen:\n1. …\n2. …\n3. …', note: 'Vorwissen oder die letzte Stunde abfragen, Antworten kurz vergleichen, Lücken als Anlass für die Stundenfrage nutzen. Für ein digitales Quiz (z. B. Kahoot, Oncoo, Mentimeter) den Link eintragen: er erscheint als QR-Code auf der Folie.', eh: 'aktivieren Vorwissen und beantworten die Fragen\nbenennen offene Fragen' },
  video: { g: 'ein', label: 'Kurzvideo', ph: 'ein', soz: 'pl', min: 8, fol: 'video', cap: 'Kurzvideo', text: '{Achte|Achten Sie} beim Ansehen darauf, wie …', note: 'YouTube-Link eintragen; das Video läuft direkt auf der Folie.', eh: '' },
  vergl: { g: 'sich', label: 'Ergebnisse vergleichen', ph: 'sich', soz: 'pa', min: 7, fol: 'text', head: 'Ergebnisse vergleichen', text: '{Vergleiche|Vergleichen Sie} {deine|Ihre} Ergebnisse mit {deinem Partner oder deiner Partnerin|Ihrem Partner oder Ihrer Partnerin}.\n{Ergänze|Ergänzen Sie} Fehlendes in einer anderen Farbe.', note: 'Partnervergleich vor der Besprechung im Plenum; offene Fragen sammeln.', eh: 'vergleichen ihre Ergebnisse\nergänzen und korrigieren sie' },
  praes: { g: 'sich', label: 'Ergebnisse vorstellen', ph: 'sich', soz: 'pl', min: 10, fol: 'text', head: 'Ergebnisse vorstellen', text: '{Stelle|Stellen Sie} {deine|Ihre} Ergebnisse vor.\nDie Zuhörenden achten darauf, ob …', note: 'Zwei bis drei Gruppen stellen vor, die anderen ergänzen und geben Rückmeldung nach dem Beobachtungsauftrag.', eh: 'präsentieren ihre Ergebnisse\nergänzen und geben begründet Rückmeldung' },
  galerie: { g: 'sich', label: 'Galeriegang', ph: 'sich', soz: 'gr', min: 10, fol: 'text', head: 'Galeriegang', text: '{Gehe|Gehen Sie} herum und {lies|lesen Sie} die Ergebnisse der anderen Gruppen.\n{Notiere|Notieren Sie} auf Klebezetteln eine Frage oder Ergänzung.', note: 'Plakate aushängen; danach Rückfragen und Gemeinsamkeiten im Plenum klären.', eh: 'nehmen die Ergebnisse anderer Gruppen wahr\nformulieren Rückfragen und Ergänzungen' },
  kugel: { g: 'sich', label: 'Kugellager', ph: 'sich', soz: 'pa', min: 8, fol: 'text', head: 'Kugellager', text: '{Erkläre|Erklären Sie} {deinem|Ihrem} Gegenüber in einer Minute {dein|Ihr} Ergebnis.\nNach dem Signal rückt der Außenkreis einen Platz weiter.', note: 'Innen- und Außenkreis bilden, zwei bis drei Wechsel; danach kurz im Plenum.', eh: 'erläutern ihre Ergebnisse mündlich\nhören zu und fragen nach' },
  tafel: { g: 'sich', label: 'Tafelbild entwickeln', ph: 'sich', soz: 'pl', min: 10, fol: 'text', head: 'Ergebnisse sichern', text: 'Wir halten die Ergebnisse gemeinsam an der Tafel fest.\n{Übertrage|Übertragen Sie} das Tafelbild in {dein|Ihr} Heft.', note: 'Tafelbild im Unterrichtsgespräch aus den Ergebnissen entwickeln.', eh: 'nennen die zentralen Ergebnisse\nübertragen das Tafelbild' },
  merk: { g: 'sich', label: 'Merksatz', ph: 'sich', soz: 'pa', min: 7, fol: 'text', head: 'Merksatz', text: '{Formuliere|Formulieren Sie} in einem Satz, was {du dir|Sie sich} aus der heutigen Stunde merken {solltest|sollten}.', note: 'Einige Merksätze vorlesen lassen, einen gemeinsam auswählen und ins Heft übernehmen.', eh: 'formulieren das zentrale Ergebnis als Merksatz' },
  ordnen: { g: 'sich', label: 'Begriffe ordnen', ph: 'sich', soz: 'pa', min: 8, fol: 'text', head: 'Begriffe ordnen', text: '{Ordne|Ordnen Sie} die Begriffe der Stunde in einer Mindmap und {verbinde|verbinden Sie} zusammengehörende mit Pfeilen: …', note: 'Begriffe vorgeben oder sammeln; eine Mindmap unter der Dokumentenkamera besprechen.', eh: 'ordnen die zentralen Begriffe\nstellen Zusammenhänge dar' },
  quiz: { g: 'sich', label: 'Kurzes Quiz', ph: 'sich', soz: 'ea', min: 5, fol: 'quiz', head: 'Quiz', text: '{Beantworte|Beantworten Sie} die Fragen:\n1. …\n2. …\n3. …', note: 'Direkt auswerten, z. B. mit Handzeichen, Antwortkarten oder digital.', eh: 'beantworten Fragen zu den Ergebnissen der Stunde' },
  rueck: { g: 'sich', label: 'Zurück zur Stundenfrage', ph: 'sich', soz: 'pl', min: 7, fol: 'frage', head: 'Zurück zur Stundenfrage', text: '{Beantworte|Beantworten Sie} die Stundenfrage mithilfe {deiner|Ihrer} Ergebnisse.', note: 'Vermutungen vom Stundenbeginn überprüfen, Antwort festhalten.', eh: 'beantworten die Stundenfrage begründet' },
  transfer: { g: 'end', label: 'Transferfrage', ph: 'trans', soz: 'pa', min: 8, fol: 'text', head: 'Arbeitsauftrag', text: '{Übertrage|Übertragen Sie} {deine|Ihre} Ergebnisse auf …', note: '', eh: '' },
  blitz: { g: 'end', label: 'Blitzlicht', ph: 'refl', soz: 'pl', min: 5, fol: 'text', head: 'Blitzlicht', text: 'Was {nimmst du|nehmen Sie} aus der heutigen Stunde mit? {Antworte|Antworten Sie} in einem Satz.', note: 'Reihum, ohne Kommentar.', eh: 'benennen einen Lerngewinn' },
  exit: { g: 'end', label: 'Exit-Ticket', ph: 'refl', soz: 'ea', min: 5, fol: 'text', head: 'Exit-Ticket', text: '{Beantworte|Beantworten Sie} die Fragen auf {deinem|Ihrem} Exit-Ticket und {gib|geben Sie} es beim Hinausgehen ab.', note: 'Exit-Tickets austeilen und einsammeln; Auswertung für die nächste Stunde.', eh: '', exit: true, qs: 'Was habe ich heute gelernt?\nWas ist mir noch unklar?\nWelche Frage nehme ich mit in die nächste Stunde?' },
  sichs: { g: 'sich', label: 'Sicherung', ph: 'sich', soz: 'pl', min: 5, fol: 'titel', head: 'Sicherung', text: '', note: 'Ergebnisse besprechen und festhalten.', eh: '' },
  kapitel: { g: '', label: 'Zwischentitel', ph: '', soz: '', min: '', fol: 'titel', head: 'Neuer Abschnitt', text: '', note: '', eh: '' },
  reserve: { g: 'end', label: 'Reserve', res: true, ph: '', soz: 'ea', min: 10, fol: 'text', head: 'Zusatzaufgabe', text: '{Bearbeite|Bearbeiten Sie} …', note: 'Nur, wenn Zeit bleibt. Zählt nicht zur Stundenzeit und steht nicht in der Phasenleiste.', eh: '' },
  ausblick: { g: 'end', label: 'Ausblick', ph: 'refl', soz: 'pl', min: 3, fol: 'text', head: 'Ausblick', text: 'In der nächsten Stunde …', note: '', eh: '' },
  frei: { g: '', label: 'Eigener Schritt', ph: '', soz: '', min: '', fol: 'text', head: '', text: '', note: '', eh: '' }
};
const STEP_FOL = [['titel', 'Großer Titel (schlicht)'], ['text', 'Impuls oder Auftrag'], ['frage', 'Stundenfrage'], ['quiz', 'Quiz'], ['zitat', 'Zitat'], ['bild', 'Bild'], ['video', 'Video (YouTube)'], ['aus', 'keine Folie']];
const QZ_L = 'ABCD';
const qzNew = (t = 'mc') => ({ t, q: '', o: ['', '', '', ''], ok: 0, a: '' });
function qzNorm(b) { if (!Array.isArray(b.qz) || !b.qz.length) b.qz = [qzNew(), qzNew(), qzNew()]; b.qz = b.qz.map(x => ({ ...qzNew(), ...(x && typeof x === 'object' ? x : {}), o: [0, 1, 2, 3].map(i => String(((x && x.o) || [])[i] || '')) })); return b.qz; }
const qzList = b => qzNorm(b).filter(x => tfStr(x.q).trim());
// Lösung einer Frage als Text (Verlaufsplan, Notizen)
const qzSol = x => (x.t === 'open' ? plainText(x.a || '').trim() : tfStr(x.o[x.ok]).trim() ? QZ_L[x.ok] + ') ' + plainText(x.o[x.ok]).trim() : '');
const stepFol = b => (STEP_FOL.some(([k]) => k === b.fol) ? b.fol : 'text');
const stepLabel = b => tfStr(b.title).trim() || (STEP_TPL[b.tpl] && b.tpl !== 'frei' ? STEP_TPL[b.tpl].label : '') || 'Unterrichtsschritt';
const stepHeadDef = b => (stepFol(b) === 'frage' ? 'Stundenfrage' : itPh(b) === 'ein' ? 'Impuls' : 'Arbeitsauftrag');
const stepQs = b => tfLines(b.qs);
const exitSteps = () => stBlocks().filter(b => b.type === 'step' && b.exit && stepQs(b).length);
const linkShort = u => { const x = tfStr(u).trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''); return x.length > 42 ? x.slice(0, 40) + '…' : x; };
// Welche Folie entsteht? Ohne Bild oder Zitat fällt die Folie auf den Text zurück; ohne Inhalt gibt es keine.
function qzEditor(b) {
  const Q = qzNorm(b);
  return `<div class="f"><span>Fragen <small>· je Frage eine Folie; ein Klick deckt die Lösung auf</small></span><div class="qz-ed">${Q.map((x, i) => `<div class="qz-ed-q">
      <div class="qz-ed-h"><b>${i + 1}</b><div class="seg sm" role="group" aria-label="Art der Frage"><button type="button" data-act="qz-t" data-i="${i}" data-v="mc" aria-pressed="${x.t !== 'open'}">4 Optionen</button><button type="button" data-act="qz-t" data-i="${i}" data-v="open" aria-pressed="${x.t === 'open'}">Frage + Lösung</button></div>
        <button class="ib" type="button" data-act="qz-up" data-i="${i}" title="Nach oben"${i ? '' : ' disabled'}>${I.up}</button><button class="ib" type="button" data-act="qz-del" data-i="${i}" title="Frage entfernen"${Q.length > 1 ? '' : ' disabled'}>${I.x}</button></div>
      <input type="text" data-k="qz.${i}.q" value="${esc(tfStr(x.q))}" placeholder="Frage" aria-label="Frage ${i + 1}">
      ${x.t === 'open' ? `<textarea data-k="qz.${i}.a" rows="2" placeholder="Lösung (wird auf Klick aufgedeckt)" aria-label="Lösung">${esc(tfStr(x.a))}</textarea>`
        : `<div class="qz-ed-o">${x.o.map((o, j) => `<div class="qz-ed-r"><button type="button" class="qz-ok-b" data-act="qz-ok" data-i="${i}" data-v="${j}" aria-pressed="${x.ok === j}" title="${x.ok === j ? 'Richtige Antwort' : 'Als richtige Antwort markieren'}">${QZ_L[j]}</button><input type="text" data-k="qz.${i}.o.${j}" value="${esc(tfStr(o))}" placeholder="Antwort ${QZ_L[j]}${j > 1 ? ' (optional)' : ''}"></div>`).join('')}</div><small class="hint">Buchstaben anklicken, um die richtige Antwort zu markieren.</small>`}
    </div>`).join('')}</div><div class="tf-ed-acts"><button class="link" type="button" data-act="qz-add"${Q.length >= 15 ? ' disabled' : ''}>+ Frage</button></div></div>`;
}
/* YouTube-Video auf einer Folie: Link erkennen, Start/Ende, Einbettung über youtube.com erst beim Klick (so gilt eine Anmeldung im Browser, z. B. Premium) */
function ytId(u) {
  const t = String(u || '').trim(); if (!t) return '';
  const m = t.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/) || (/^[A-Za-z0-9_-]{11}$/.test(t) ? [0, t] : null);
  return m ? m[1] : '';
}
function ytSec(v) {
  const t = String(v || '').trim().toLowerCase(); if (!t) return 0;
  if (/^\d+(:\d{1,2}){1,2}$/.test(t)) return t.split(':').reduce((a, x) => a * 60 + +x, 0);
  const h = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/); if (h && (h[1] || h[2] || h[3])) return (+h[1] || 0) * 3600 + (+h[2] || 0) * 60 + (+h[3] || 0);
  return 0;
}
const ytFmt = n => { n = Math.max(0, n | 0); const h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), x = n % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
function ytInfo(b) {
  const id = ytId(b.yt); if (!id) return null;
  const urlT = (String(b.yt).match(/[?&#](?:t|start)=([0-9hms:]+)/) || [])[1];
  const st = ytSec(b.ytS) || ytSec(urlT), en = ytSec(b.ytE);
  return { id, st, en: en > st ? en : 0, watch: `https://www.youtube.com/watch?v=${id}${st ? '&t=' + st + 's' : ''}` };
}
const ytEmbed = (v, auto) => `https://www.youtube.com/embed/${v.id}?rel=0&playsinline=1&enablejsapi=1${auto ? '&autoplay=1' : ''}${v.st ? '&start=' + v.st : ''}${v.en ? '&end=' + v.en : ''}`;
function stepSlideFol(b) {
  const f = stepFol(b); const t = tfStr(b.text).trim();
  if (f === 'aus') return '';
  if (f === 'titel') return 'titel';
  if (f === 'bild' && !b.src) return t ? 'text' : '';
  if (f === 'zitat' && !tfStr(b.quote).trim()) return t ? 'text' : '';
  if (f === 'text' && !t && !tfStr(b.head).trim() && !tfStr(b.link).trim()) return '';
  if (f === 'quiz' && !qzList(b).length) return t ? 'text' : '';
  if (f === 'video' && !ytId(b.yt)) return t ? 'text' : '';
  return f;
}
function stepEditor(b, pp) {
  const m = state.sheet.meta; const fol = stepFol(b);
  const tiles = g => Object.entries(STEP_TPL).filter(([, x]) => x.g === g).map(([k, x]) => `<button type="button" class="st-tp" data-act="st-tpl" data-v="${k}" aria-pressed="${b.tpl === k}">${x.label}</button>`).join('');
  const ta = (k, label, rows, ph, hint) => `<label class="f"><span>${label}</span><textarea data-k="${k}" rows="${rows}" placeholder="${esc(ph || '')}">${esc(tfStr(b[k]))}</textarea>${hint ? `<small class="hint">${hint}</small>` : ''}</label>`;
  const pA = `  <div class="memo-flag">Zwischenfolie: steht nicht auf dem Arbeitsblatt, nur in der Präsentation, und zählt im Stundenablauf.</div>
    <div class="f"><span>Vorlage</span><div class="st-tpls"><div class="st-g"><small>Einstieg</small><div class="st-ts">${tiles('ein')}</div></div><div class="st-g"><small>Sicherung</small><div class="st-ts">${tiles('sich')}</div></div><div class="st-g"><small>Schluss</small><div class="st-ts">${tiles('end')}</div></div><div class="st-g"><small>Frei</small><div class="st-ts"><button type="button" class="st-tp" data-act="st-tpl" data-v="frei" aria-pressed="${b.tpl === 'frei'}">Eigener Schritt</button></div></div></div></div>`;
  const pB = `    ${fText('title', 'Bezeichnung', b.title, 'z. B. Stummer Impuls')}
    <div class="row st-row"><label class="f"><span>Phase</span><select data-k="ph"><option value="">–</option>${Object.entries(PHASEN).map(([k, x]) => `<option value="${k}"${itPh(b) === k ? ' selected' : ''}>${x.label}</option>`).join('')}</select></label><label class="f"><span>Sozialform</span><select data-k="soz"><option value="">–</option>${Object.entries(SOZ).map(([k, x]) => `<option value="${k}"${b.soz === k ? ' selected' : ''}>${x.label}</option>`).join('')}</select></label></div>
    ${timeCtl(b, 'Zeit (Min.)')}`;
  const pC = `    <div class="f"><span>Folie</span><div class="seg sm" role="group" aria-label="Folie">${STEP_FOL.map(([v, l]) => `<button type="button" data-act="st-fol" data-v="${v}" aria-pressed="${fol === v}">${l}</button>`).join('')}</div></div>
    ${fol === 'text' || fol === 'frage' ? fText('head', 'Überschrift auf der Folie', b.head, stepHeadDef(b)) : ''}
    ${fol === 'frage' ? `<label class="f"><span>Stundenfrage (gilt für die ganze Stunde)</span><textarea data-sf rows="2" placeholder="z. B. Wie erzeugen Politikerinnen und Politiker in sozialen Medien Nähe?">${esc(tfStr(m.frage))}</textarea><small class="hint">Dieselbe Frage steht im Kopf und im Verlaufsplan. Ein Schritt am Ende mit der Folie „Stundenfrage“ zeigt sie wieder.</small></label>` : ''}
    ${fol === 'text' ? ta('text', 'Impuls oder Auftrag (auf der Folie)', 3, m.anrede === 'du' ? 'z. B. Was fällt dir auf?' : 'z. B. Was fällt Ihnen auf?', 'Eine Zeile oder ein Satz wird auf der Folie zu einem Schritt; **fett** geht auch.') : ''}
    ${fol === 'frage' ? ta('text', 'Auftrag unter der Frage (optional)', 2, '') : ''}
    ${fol === 'quiz' ? fText('head', 'Überschrift auf der Folie', b.head, 'Quiz') + qzEditor(b) : ''}
    ${fol === 'zitat' ? ta('quote', 'Zitat', 3, '') + fText('author', 'Quelle oder Autor', b.author, '') : ''}
    ${fol === 'bild' ? `<div class="f"><span>Bild</span>${b.src ? `<div class="st-img"><img src="${esc(b.src)}" alt=""><button class="link" type="button" data-act="st-img-del">Bild entfernen</button></div>` : ''}<input type="file" accept="image/*" data-act="img" aria-label="${b.src ? 'Bild ersetzen' : 'Bild wählen'}"></div>${fText('cap', 'Bildunterschrift (optional)', b.cap, '')}` : ''}
    ${fol === 'video' ? (() => { const v = ytInfo(b); return `${fText('yt', 'YouTube-Link', b.yt, 'https://www.youtube.com/watch?v=…')}${tfStr(b.yt).trim() && !v ? '<small class="hint warn">Das sieht nicht nach einem YouTube-Link aus. Kopiere die Adresse aus der Adresszeile oder über „Teilen“.</small>' : ''}
      <div class="row2">${fText('ytS', 'Start (optional, z. B. 1:30)', b.ytS, '0:00')}${fText('ytE', 'Ende (optional)', b.ytE, '')}</div>
      ${fText('cap', 'Überschrift auf der Folie (optional)', b.cap, 'z. B. Erklärvideo: Die Weimarer Verfassung')}
      ${ta('text', 'Beobachtungsauftrag (optional, steht über dem Video)', 2, m.anrede === 'du' ? 'z. B. Achte darauf, wie …' : 'z. B. Achten Sie darauf, wie …')}
      <small class="hint">${v ? `Erkannt: Video ${esc(v.id)}${v.st ? ', ab ' + ytFmt(v.st) : ''}${v.en ? ' bis ' + ytFmt(v.en) : ''}. ` : ''}Das Video läuft in der Präsentation direkt auf der Folie, sobald du auf den Play-Knopf klickst. Es braucht Internet und lädt erst beim Klick. Bist du im selben Browser bei YouTube angemeldet, erkennt der Player das meist (in Chrome und Edge, in Safari kaum), etwa für Premium ohne Werbung.</small>`; })() : ''}
    ${fol === 'aus' || fol === 'video' ? '' : fText('link', 'Link, z. B. zu einem Video (erscheint als QR-Code auf der Folie)', b.link, 'https://…')}`;
  const pD = `    ${ta('note', 'Was ich tue (Notiz, auch in den PowerPoint-Notizen)', 2, 'z. B. Bild kommentarlos zeigen, Äußerungen sammeln')}
    ${ta('eh', 'Erwartetes Schülerverhalten', 2, 'eine Zeile je Punkt')}
    ${fText('media', 'Medien', b.media, 'z. B. Beamer, Tafel, Karten')}
    <div class="chks">${fCheck('exit', 'Exit-Ticket zum Ausdrucken', b.exit)}</div>
    ${b.exit ? ta('qs', 'Fragen auf dem Exit-Ticket (eine pro Zeile)', 3, 'Was habe ich heute gelernt?') + `<div class="tf-ed-acts"><button class="btn sm" type="button" data-act="st-exit-show">Exit-Tickets ansehen</button><small class="hint">Vier Tickets pro A4-Seite, ab fünf Fragen zwei (A4 quer). Auch im Bereich „Druck-Extras“.</small></div>` : ''}`;
  if (!pp) return pA + pB + pC + pD;
  const ko = moreOn('ppx:' + b.id);
  return pC.replace('<span>Folie</span>', '<span>Layout der Folie</span>') + `<button type="button" class="more-b pp-more${ko ? ' on' : ''}" data-act="more" data-key="ppx:${b.id}" aria-expanded="${ko}"><span>${ko ? 'Weniger' : 'Ablauf und Notizen'}</span>${ko ? '' : '<small>Bezeichnung, Phase, Zeit, Timer, Notiz, Erwartung</small>'}</button>` + (ko ? pB + pD : '');
}
function stepTpl(b, k, idx, noSnap) {
  const x = STEP_TPL[k]; if (!x || !b) return; const blocks = state.sheet.blocks;
  if (!noSnap) snapshot(); const du = state.sheet.meta.anrede === 'du'; const first = !b.tpl; const had = !first && (tfStr(b.text).trim() || tfStr(b.note).trim());
  Object.assign(b, { tpl: k, title: k === 'frei' ? '' : x.label, ph: x.ph, soz: x.soz, min: x.min ? String(x.min) : '', fol: x.fol, head: duSie(x.head, du), text: x.fol === 'quiz' ? '' : duSie(x.text, du), note: x.note, eh: x.eh, exit: !!x.exit, ...(x.qs && !tfStr(b.qs).trim() ? { qs: x.qs } : {}), ...(x.res ? { res: true } : {}) });
  if (x.fol === 'quiz') qzNorm(b);
  if (x.cap && !tfStr(b.cap).trim()) b.cap = x.cap;
  // Frisch unten angefügt und als Einstieg gewählt: an den Anfang des Blatts
  let moved = ''; const fc = blocks.findIndex(z => z.type === 'material' || z.type === 'tasks'); let lt = -1; blocks.forEach((z, i) => { if (z.type === 'tasks') lt = i; });
  if (first && x.g === 'ein' && fc >= 0 && idx > fc) { let j = 0; while (j < fc && blocks[j].type === 'step') j++; blocks.splice(idx, 1); blocks.splice(j, 0, b); moved = 'Als Einstieg vor das Material verschoben'; }
  else if (first && x.g === 'end' && lt >= 0 && idx < lt) { blocks.splice(idx, 1); blocks.push(b); moved = 'Als Abschluss ans Ende der Stunde verschoben'; }
  changed(true);
  if (moved) toast(moved, 'Rückgängig', histUndo);
  else if (had) toast(`Vorlage „${x.label}“ eingesetzt`, 'Rückgängig', histUndo);
}
// Exit-Tickets: vier je A4 (A6), ab fünf Fragen zwei je A4 quer (A5)
function layoutExit() {
  const P = state.sheet; const a = pageAcc(P.meta); const out = []; const ttl = plainText(P.abs ? stTitle(P) : (P.meta.title || ''));
  exitSteps().forEach(b => {
    const Q = stepQs(b); const two = Q.length > 4; const H = (two ? 210 : 148.5) - 16 - 12 - 10 - 9; const per = H / Q.length;
    const n = Math.max(1, Math.floor((per - 10) / 7.5));
    const card = `<div class="xt-card"><div class="xt-h"><b>${esc(tfStr(b.head).trim() && stepFol(b) === 'text' ? plainText(b.head) : 'Exit-Ticket')}</b><span>${esc(ttl)}</span></div><div class="xt-name"><span>Name</span><i></i></div>${Q.map((q, i) => `<div class="xt-q"><div class="xt-qt"><b>${i + 1}</b><span>${inlineHTML(q)}</span></div><div class="xt-ln">${'<i></i>'.repeat(n)}</div></div>`).join('')}</div>`;
    const pg = el(`<div class="page xt-page${two ? ' two' : ''}" data-w="${two ? 297 : 210}" data-h="${two ? 210 : 297}"><div class="xt-grid">${card.repeat(two ? 2 : 4)}</div></div>`);
    pg.style.setProperty('--acc', a.c); pg.style.setProperty('--acc-tint', a.t);
    out.push({ pg, over: false });
  });
  return out;
}
// Zeile im Verlaufsplan
function stepRow(b, tafel) {
  const m = state.sheet.meta; const fol = stepFol(b); const ph = itPh(b); const sent = x => (/[.!?…“"]$/.test(x) ? x : x + '.');
  const imp = fol === 'quiz' ? (qzList(b).length ? `Quiz mit ${qzList(b).length} ${qzList(b).length === 1 ? 'Frage' : 'Fragen'}: ${qzList(b).map(x => plainText(x.q).trim()).join(' / ')}` : 'Quiz') : fol === 'frage' ? (tfStr(m.frage).trim() ? `Stundenfrage: „${plainText(m.frage).trim()}“` : 'Stundenfrage') : fol === 'zitat' && tfStr(b.quote).trim() ? `Impuls: Zitat „${plainText(b.quote).replace(/\s+/g, ' ').trim().slice(0, 140)}“${b.author ? ' (' + plainText(b.author) + ')' : ''}` : fol === 'bild' && b.src ? 'Impuls: Bild' + (b.cap ? ' (' + plainText(b.cap) + ')' : '') : '';
  const txt = (fol === 'text' || fol === 'frage') && tfStr(b.text).trim() ? plainText(b.text).replace(/\s*\n\s*/g, ' ').trim() : '';
  const task = [tfStr(b.note).trim() ? sent(tfStr(b.note).trim()) : '', imp ? sent(imp) : '', txt ? (fol === 'text' && !imp ? 'Impuls: ' : '') + txt : ''].filter(Boolean).join(' ');
  const media = tfStr(b.media).split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
  if (stepSlideFol(b) && !media.some(x => /beamer|folie|präsentation/i.test(x))) media.push('Folie (Beamer)');
  if (tfStr(b.link).trim()) media.push('Video oder Link (QR-Code)');
  if (b.exit && stepQs(b).length) media.push('Exit-Tickets');
  if (ph === 'sich') tafel.forEach(x => media.push('Tafelbild' + (tfStr(x.title).trim() ? ': ' + tfStrip(x.title) : '')));
  return { step: true, label: stepLabel(b), it: b, ph, min: itMin(b), soz: SOZ[b.soz] ? SOZ[b.soz].label : '', task: task || stepLabel(b), eh: ehLines(b), media, tag: '', g: '' };
}

