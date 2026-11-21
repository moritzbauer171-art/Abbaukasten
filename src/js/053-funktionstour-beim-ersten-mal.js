/* ================= Funktionstour beim ersten Mal ================= */
const LS_TOUR = 'abw.tour';
// Unterstützung: freiwilliger Kaffee über PayPal
const DONATE_URL = 'https://www.paypal.me/mehrbier';
const CUP_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.8c-.6.8-.6 1.6 0 2.4M11.5 2.8c-.6.8-.6 1.6 0 2.4"/></svg>';
// Vor PayPal ein kurzes Fenster: wofür das Geld gedacht ist
function donateOpen() {
  if (document.getElementById('don-ov')) return;
  const box = document.createElement('div'); box.id = 'don-ov'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'don-t');
  box.innerHTML = `<div class="don-scrim" data-don="x"></div><div class="don-card">
    <div class="don-art" aria-hidden="true">${CUP_SVG.replace('width="18" height="18"', 'width="44" height="44"')}</div>
    <h2 id="don-t">Danke, dass du das LehrWerk unterstützen möchtest!</h2>
    <p>Das LehrWerk ist kostenlos und ohne Werbung. Ich entwickle es neben meinem Unterricht in meiner freien Zeit. Dein Beitrag fließt in zwei Dinge:</p>
    <ul class="don-l">
      <li><b>Arbeitszeit</b><span>für neue Bausteine und Vorlagen, Fehlerbehebungen und die Wünsche, die aus dem Kollegium kommen.</span></li>
      <li><b>Einen eigenen Server</b><span>in meinem Heimnetzwerk. Damit sollen deine Stunden und Materialien künftig nicht bei großen Cloud-Anbietern liegen, sondern geschützt auf eigener Hardware, die ich selbst betreue.</span></li>
    </ul>
    <p class="don-s">Jeder Betrag hilft, und alles ist freiwillig: Die App bleibt für alle kostenlos.<br>Moritz Bauer</p>
    <div class="don-acts"><a class="btn donate-b don-go" href="${DONATE_URL}" target="_blank" rel="noopener noreferrer" data-don="go">${CUP_SVG}Weiter zu PayPal</a><button type="button" class="btn" data-don="x">Bruder, lass ma’</button></div></div>`;
  document.body.append(box); const prev = document.activeElement;
  const close = () => { box.remove(); document.removeEventListener('keydown', key, true); if (prev && prev.focus) prev.focus(); };
  const key = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
  document.addEventListener('keydown', key, true);
  box.addEventListener('click', e => { const a = e.target.closest('[data-don]'); if (!a) return; if (a.dataset.don === 'go') { lsSet(LS_CUPGO, Date.now()); setTimeout(close, 50); } else close(); });
  const f = box.querySelector('.don-go'); if (f) f.focus();
}
// Das Tassen-Symbol wackelt alle paar Tage einmal kurz (nicht nach einem Klick auf „Weiter zu PayPal“, nicht bei reduzierter Bewegung)
const LS_CUPW = 'abw.cupWiggle', LS_CUPGO = 'abw.cupGo';
function cupWiggleMaybe(tries = 0) {
  const now = Date.now(), last = +(lsGet(LS_CUPW) || 0), go = +(lsGet(LS_CUPGO) || 0);
  if (now - last < 3 * 864e5 || now - go < 30 * 864e5 || matchMedia('(prefers-reduced-motion: reduce)').matches || DG_VIEW || MAPPE_LOCK) return;
  const c = document.getElementById('btn-coffee'); if (!c || !c.getClientRects().length) return;
  if (state.dlg || hmS.open || (typeof tour !== 'undefined' && tour.i >= 0) || document.getElementById('don-ov') || state.needSetup) { if (tries < 40) setTimeout(() => cupWiggleMaybe(tries + 1), 15000); return; }
  lsSet(LS_CUPW, now); c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle'); setTimeout(() => c.classList.remove('wiggle'), 2600);
}
setTimeout(() => cupWiggleMaybe(), 25000);
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('.hd-coffee, .donate .donate-b'); if (!a) return; e.preventDefault(); e.stopPropagation(); donateOpen(); }, true);
const donateHTML = (lead = 'Gefällt dir das LehrWerk?') => `<div class="donate"><span>${lead} Mit einem Kaffee unterstützt du die Weiterentwicklung.</span><a class="btn donate-b" href="${DONATE_URL}" target="_blank" rel="noopener noreferrer">${CUP_SVG}Einen Kaffee spendieren</a></div>`;
const TOUR = [
  { t: 'Willkommen beim LehrWerk', d: 'In gut einer Minute siehst du das Wichtigste. Links baust du die Stunde aus Bausteinen, rechts entsteht das fertige Arbeitsblatt.' },
  { sel: '#btn-fach', t: 'Fach wechseln', d: 'Hier wechselst du das Fach. Angezeigt werden nur Fächer, in denen du Klassen hast; darunter kannst du ein Fach hinzufügen.' },
  { sel: '#cr-kl', t: 'Deine Klassen', d: 'Oben links siehst du, wo du bist: Klasse › Stunde › Arbeitsblatt. Ein Klick auf die Klasse wechselt sie; jede Klasse hat eigene Stunden, Farbe, Anrede (du oder Sie) und Schulform. Dort legst du auch neue Klassen an.' },
  { sel: '#editor .area-bar', prep: () => { if ((state.area || 'blatt') !== 'blatt') setArea('blatt'); }, t: 'Arbeitsblatt und Präsentation', d: 'Oben schaltest du zwischen Arbeitsblatt und Präsentation. Unter „Mehr“ liegen Tafelkarten und Druckvorlagen wie Placemat, Pro und Contra oder der Fotobogen.' },
  { sel: '#editor .qbar', t: 'Bausteine einfügen', d: 'Die meistgebrauchten Bausteine liegen hier griffbereit: Material, Aufgaben, Infokasten und mehr. „Weitere“ (oder Strg+K) zeigt alle, mit Suche.' },
  { sel: '#editor .card[data-bid]:not([data-bid="meta"])', t: 'Karten bearbeiten', d: 'Jeder Baustein ist eine Karte. Aufklappen, Text eingeben, Phase und Zeit festlegen. Aufgaben prüfen die Operatoren und bekommen auf Wunsch Sozialform und Arbeitsform.' },
  { sel: '#preview-scroll', t: 'Die Vorschau zum Anfassen', d: 'Ein Klick auf ein Wort im Material legt eine Worterklärung an, ein Klick auf eine Zeilennummer eine Zeilenangabe. Mit der Maus über einem Baustein erscheint eine kleine Leiste: verschieben, gestalten (Pinsel), darüber oder darunter einfügen, verdoppeln, löschen.' },
  { sel: () => getComputedStyle(document.getElementById('mbar')).display !== 'none' ? '#mbar [data-mb="out"]' : '#btn-out', t: 'Ausgeben', d: 'PDF, Word oder Drucken, als Schüler- oder Lehrerfassung, auf A4 oder A5. Die Präsentation startest du im Bereich Präsentation, mit zwei Bildschirmen auch mit Referentenansicht.' },
  { sel: '#btn-stunden', t: 'Meine Stunden', d: 'Alles wird von selbst gespeichert. Hier findest du deine Stunden je Klasse und in Ordnern, dazu die Stunden, die Kolleginnen und Kollegen geteilt haben, mit Filter nach Klassenstufe und Kategorie, etwa „Vertretungsstunde“.' },
  { t: 'Teilen spart Abende', d: 'Über „Teilen“ gibst du eine Stunde ans Kollegium weiter: erst Stunde wählen, dann Klassenstufe und Kategorien. Wer teilt, steigt auf, vom „Abendspender“ bis zur „Absoluten Lehrlegende“. Ab 50 geteilten Stunden darfst du ein Bild an die Wall of Fame hängen.' },
  { sel: '#btn-mmore', t: 'Lehrerzimmer', d: 'Das Forum fürs Kollegium: Fragen stellen, Material suchen, Tipps teilen, nach Fach und Art sortiert. Ein roter Zähler zeigt neue Beiträge. Auf dem Handy liegt es unter den drei Punkten.' },
  { sel: '#btn-stunden', t: 'Startseite', d: 'Unter „Stunden“ findest du auch die Startseite: deine Klassen, zuletzt bearbeitete und neu geteilte Stunden, dein Rang und die neuesten Themen aus dem Lehrerzimmer.' },
  { sel: '#btn-mmore', t: 'Rahmenlehrplan', d: '„RLP“ öffnet den Berliner Rahmenlehrplan für das Fach der Klasse, in der du gerade bist, mit Suche. Auf dem Handy liegt er unter den drei Punkten.' },
  { sel: '#btn-mmore', t: 'Fertig!', d: 'Unter „?“ (auf dem Handy unter den drei Punkten) findest du alle Kniffe und kannst diese Tour jederzeit noch einmal starten. Viel Freude beim Bauen!' }
];
const tour = { i: -1 };
const tourDue = () => !lsGet(LS_TOUR) && !lsGet(LS_TIPS);
function tourMaybe(tries = 0) {
  if (!tourDue() || tour.i >= 0 || DG_VIEW || MAPPE_LOCK) return;
  const uiReady = state.klReady && !!document.querySelector('#reiter .rt') && !document.querySelector('#dlg-root .dlg, #dlg-root [role="dialog"]');
  if (!uiReady || hmS.open || state.dlg || state.needSetup || state.libOpen || [...document.querySelectorAll('.nw-ov, .rlpv')].some(x => x.offsetParent || x.getClientRects().length)) { if (tries < 400) setTimeout(() => tourMaybe(tries + 1), 1500); return; }
  tourStart();
}
function tourStart() { showTip(-1); lsSet(LS_TIPS, 1); if (hmS.open) homeClose(); if (isNarrow()) setView('edit'); tour.i = 0; tourShow(); }
function tourEnd() { tour.i = -1; lsSet(LS_TOUR, 1); const r = $('#tour-root'); if (r) r.innerHTML = ''; document.body.classList.remove('tour-on'); }
function tourShow() {
  const r = $('#tour-root'); const st = TOUR[tour.i]; if (!st) return tourEnd();
  if (st.prep) try { st.prep(); } catch {}
  const sel = typeof st.sel === 'function' ? st.sel() : st.sel; const el = sel ? [...document.querySelectorAll(sel)].find(x => { const b = x.getBoundingClientRect(); return b.width > 4 && b.height > 4; }) : null;
  if (el && el.scrollIntoView) { const b0 = el.getBoundingClientRect(); if (b0.top < 0 || b0.bottom > innerHeight) el.scrollIntoView({ block: 'center' }); }
  const b = el ? el.getBoundingClientRect() : null; const pad = 6;
  const spot = b ? `<div class="tour-spot" style="left:${b.left - pad}px;top:${b.top - pad}px;width:${b.width + 2 * pad}px;height:${Math.min(b.height, innerHeight - 20) + 2 * pad}px"></div>` : '<div class="tour-dim"></div>';
  const n = TOUR.length; const last = tour.i === n - 1;
  r.innerHTML = `${spot}<div class="tour-card${b ? '' : ' mid'}" role="dialog" aria-modal="true" aria-labelledby="tour-t"><div class="tour-top"><span>${tour.i + 1} / ${n}</span><button type="button" class="link" data-tour="end">${last ? 'Schließen' : 'Tour beenden'}</button></div>
    <h3 id="tour-t">${esc(st.t)}</h3><p>${esc(st.d)}</p>
    <div class="tour-dots">${TOUR.map((_, k) => `<i class="${k === tour.i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="tour-acts">${tour.i > 0 ? '<button type="button" class="btn" data-tour="prev">Zurück</button>' : '<span></span>'}<button type="button" class="btn primary" data-tour="${last ? 'end' : 'next'}">${last ? 'Los geht’s' : tour.i === 0 ? 'Tour starten' : 'Weiter'}</button></div></div>`;
  document.body.classList.add('tour-on');
  const c = r.querySelector('.tour-card');
  if (b) { const cw = c.offsetWidth, ch = c.offsetHeight; let left = Math.min(Math.max(12, b.left), innerWidth - cw - 12); let top = b.bottom + 14;
    if (top + ch > innerHeight - 12) top = b.top - ch - 14; if (top < 12) { top = Math.min(innerHeight - ch - 12, Math.max(12, b.top + 20)); left = b.right + 14 + cw < innerWidth ? b.right + 14 : Math.max(12, b.left - cw - 14); }
    c.style.left = left + 'px'; c.style.top = top + 'px'; }
  const f = c.querySelector('.btn.primary'); if (f) f.focus({ preventScroll: true });
}
function tourInit() {
  const r = document.createElement('div'); r.id = 'tour-root'; document.body.append(r);
  r.addEventListener('click', e => { const a = e.target.closest('[data-tour]'); if (!a) return; const k = a.dataset.tour; if (k === 'end') tourEnd(); else { tour.i += k === 'next' ? 1 : -1; tourShow(); } });
  document.addEventListener('keydown', e => { if (tour.i < 0) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); tourEnd(); } else if (e.key === 'ArrowRight') { tour.i = Math.min(TOUR.length - 1, tour.i + 1); tourShow(); } else if (e.key === 'ArrowLeft' && tour.i > 0) { tour.i--; tourShow(); } }, true);
  window.addEventListener('resize', () => { if (tour.i >= 0) tourShow(); });
  setTimeout(() => tourMaybe(), 1200);
}

