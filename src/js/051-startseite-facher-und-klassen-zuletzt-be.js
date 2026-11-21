/* ================= Startseite: Fächer und Klassen, zuletzt bearbeitet, neu geteilt ================= */
const LS_HOME = 'abw.homeStart', LS_SHSEEN = 'abw.sharedSeen';
// Wann die Startseite von selbst kommt: 'pause' (Standard) beim ersten Mal und nach mindestens drei Stunden ohne die App, 'always' bei jedem Laden, '0' nie
const LS_LASTSEEN = 'abw.lastSeen', HOME_PAUSE = 3 * 36e5;
const homeMode = () => { const v = lsGet(LS_HOME); return v === '0' ? 'never' : v === 'always' ? 'always' : 'pause'; };
const homeOn = () => homeMode() !== 'never';
const HOME_MODES = [['pause', 'nach einer Pause'], ['always', 'immer'], ['never', 'nie']];
const homeModeSet = v => lsSet(LS_HOME, v === 'never' ? '0' : v === 'always' ? 'always' : 'pause');
function homeAutoDue() {
  const m = homeMode(); if (m === 'never') return false; if (m === 'always') return true;
  const t = +(lsGet(LS_LASTSEEN) || 0); return !t || Date.now() - t > HOME_PAUSE;
}
const homeTouch = () => lsSet(LS_LASTSEEN, Date.now());
const hmS = { open: false, seen: 0, busy: '', hold: false, pend: false, raf: 0, html: '' };
// Vorschau, die hinter der Startseite liegt, nachholen: im Leerlauf oder spätestens beim Schließen
function homeFlushPreview() { hmS.hold = false; if (hmS.pend) { hmS.pend = false; renderPreview(); } }
function relTime(t) {
  t = +t || 0; if (!t) return ''; const d = Date.now() - t, m = 6e4, h = 36e5, D = 864e5;
  if (d < 2 * m) return 'gerade eben'; if (d < h) return `vor ${Math.round(d / m)} Min.`; if (d < D) return `vor ${Math.round(d / h)} Std.`;
  const days = Math.floor(d / D); if (days === 1) return 'gestern'; if (days < 7) return `vor ${days} Tagen`;
  return new Date(t).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}
const HM_IC = {
  plus: '<path d="M8 3v10M3 8h10"/>', go: '<path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"/>', list: '<path d="M2.5 3.5h4l1.2 1.5h5.8v7.5h-11z"/>',
  share: '<circle cx="4" cy="8" r="1.8"/><circle cx="12" cy="4" r="1.8"/><circle cx="12" cy="12" r="1.8"/><path d="M5.6 7.2l4.8-2.4M5.6 8.8l4.8 2.4"/>',
  take: '<path d="M8 2.5v8M4.5 7 8 10.5 11.5 7"/><path d="M3 13.5h10"/>', doc: '<path d="M4 1.8h5.5l2.5 2.5v9.9H4z"/><path d="M9.5 1.8v2.5H12M6 8h4M6 10.5h4"/>'
};
const hmI = k => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HM_IC[k]}</svg>`;
function homeOpen(auto) {
  if (DG_VIEW || MAPPE_LOCK) return;
  closeGloss(); closeZl(); closeMenu(); const was = hmS.open; hmS.open = true; hmS.seen = +(lsGet(LS_SHSEEN) || 0); hmS.auto = !!auto; hmS.html = '';
  if (auto) { hmS.hold = true; const go = () => setTimeout(homeFlushPreview, 0); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200); }
  if (canShare()) shareLoad().then(homeRender).catch(() => {});
  homeRenderNow(); if (!was) { const r = $('#home-root'); r.classList.remove('out'); r.classList.add('in'); setTimeout(() => r.classList.remove('in'), 260); } document.body.classList.add('home-on');
  setTimeout(() => { const f = document.querySelector('#home-root .hm-cta'); if (f && !auto) f.focus({ preventScroll: true }); }, 40);
}
function homeClose() {
  if (!hmS.open) return; hmS.open = false; document.body.classList.remove('home-on');
  if (state.shared && state.shared.length) lsSet(LS_SHSEEN, Math.max(...state.shared.map(x => +new Date(x.updatedAt) || 0)));
  cancelAnimationFrame(hmS.raf); hmS.raf = 0; homeFlushPreview();
  const r = $('#home-root'); r.classList.add('out'); setTimeout(() => { if (!hmS.open) { r.innerHTML = ''; r.classList.remove('out'); hmS.html = ''; } }, 180);
}
// Neu zeichnen gebündelt: mehrere Anlässe kurz hintereinander (Liste geladen, geteilte Stunden da) ergeben ein Zeichnen, gleicher Inhalt keines
function homeRender() { if (!hmS.open || hmS.raf) return; hmS.raf = requestAnimationFrame(() => { hmS.raf = 0; homeRenderNow(); }); }
function homeRenderNow() {
  const root = $('#home-root'); if (!root || !hmS.open) return;
  const now = new Date(), hr = now.getHours();
  const greet = hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Guten Tag' : 'Guten Abend';
  const autor = String((state.prefs && state.prefs.autor) || '').trim();
  const lib = [...(state.lib || [])].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const byKl = {}; lib.forEach(d => { (byKl[d.klasse] = byKl[d.klasse] || []).push(d); });
  const fachs = [...new Set(KLASSEN.map(k => k.fach || 'deutsch'))];
  const acc = k => (ACCENTS[k.accent] || ACCENTS.tinte);
  const cur = state.sheet; const curT = cur ? stTitle(cur) : '';
  const klCard = k => { const L = byKl[k.id] || []; const a = acc(k); const last = L[0];
    return `<article class="hm-kl${state.klasse === k.id ? ' cur' : ''}" style="--ka:${a.c};--kt:${a.t}">
      <button type="button" class="hm-kl-main" data-hm="kl" data-k="${esc(k.id)}" title="${esc(k.label)} öffnen">
        <span class="hm-kl-badge">${esc((k.label.match(/\d+(?:\/\d+)?/) || [k.label.slice(0, 2)])[0])}</span>
        <span class="hm-kl-t"><b>${esc(k.label)}</b><small>${esc([k.course, k.school].filter(Boolean).join(' · '))}</small></span>
        <span class="hm-kl-n"><b>${L.length}</b><small>${L.length === 1 ? 'Stunde' : 'Stunden'}</small></span>
      </button>
      <div class="hm-kl-last">${last ? `<button type="button" class="link" data-hm="open" data-id="${esc(last.id)}">${hmI('doc')}<span>${esc(last.title || 'Ohne Titel')}</span></button><small>${esc(relTime(last.updatedAt))}</small>` : '<small>Noch keine Stunde</small>'}</div>
      <div class="hm-kl-acts"><button type="button" class="link" data-hm="new" data-k="${esc(k.id)}">${hmI('plus')}Neue Stunde</button><button type="button" class="link" data-hm="all" data-k="${esc(k.id)}">${hmI('list')}Alle Stunden</button></div>
    </article>`; };
  const recent = lib.slice(0, 8);
  const recentH = recent.length ? `<ol class="hm-rec">${recent.map(d => { const k = KL(d.klasse), a = acc(k); return `<li><button type="button" data-hm="open" data-id="${esc(d.id)}" style="--ka:${a.c}">
      <span class="hm-rec-t">${d.nr && d.nr !== '0' ? `<em>AB ${esc(d.nr)}</em>` : ''}<b>${esc(d.title || 'Ohne Titel')}</b></span>
      <span class="hm-rec-m"><i></i>${esc(k.label)}${d.abs > 1 ? ` · ${d.abs} Arbeitsblätter` : ''}</span><time>${esc(relTime(d.updatedAt))}</time></button></li>`; }).join('')}</ol>`
    : `<div class="hm-empty"><p>Noch keine gespeicherten Stunden.</p><button type="button" class="btn primary" data-hm="new" data-k="${esc(state.klasse)}">${hmI('plus')}Erste Stunde anlegen</button></div>`;
  let shareH;
  if (!canShare()) shareH = `<div class="hm-empty"><p>Geteilte Stunden von Kolleginnen und Kollegen siehst du, wenn du angemeldet bist.</p>${store.sb ? `<button type="button" class="btn" data-hm="login">Anmelden</button>` : ''}</div>`;
  else if (!state.shared) { if (!state.shareLoading) { state.shareLoading = true; setTimeout(() => shareLoad(true).finally(() => { state.shareLoading = false; homeRender(); }), 0); } shareH = '<div class="hm-empty"><p>Wird geladen …</p></div>'; }
  else {
    const L = sharedVis().filter(x => !x.mine).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6);
    shareH = L.length ? `<ul class="hm-sh">${L.map(x => { const nu = +new Date(x.updatedAt) > hmS.seen; return `<li class="${nu ? 'nu' : ''}">
        <div class="hm-sh-h"><b>${esc(x.title)}</b>${nu ? '<span class="hm-new">neu</span>' : ''}</div>
        ${shareTags(x, 4)}<div class="hm-sh-m">${autorBadge(x)}${esc([(FAECHER[x.fach] || {}).label, x.klasse, x.autor ? 'von ' + x.autor : '', relTime(+new Date(x.updatedAt))].filter(Boolean).join(' · '))}</div>
        ${x.text ? `<p>${esc(x.text.length > 140 ? x.text.slice(0, 138) + ' …' : x.text)}</p>` : ''}
        <div class="hm-sh-a">${hmS.busy === x.id ? '<small>Wird übernommen …</small>' : `<button type="button" class="link" data-hm="take" data-sid="${esc(x.id)}">${hmI('take')}In „${esc(KL(state.klasse).label)}“ übernehmen</button>`}</div></li>`; }).join('')}</ul>`
      : `<div class="hm-empty"><p>${state.sharedErr ? esc(state.sharedErr) : (state.shared.length ? 'In deinen Fächern hat noch niemand eine Stunde geteilt.' : 'Noch keine geteilten Stunden von anderen.')}</p></div>`;
  }
  const nMine = canShare() && state.shared ? state.shared.filter(x => x.mine).length : 0;
  const giveH = cls => `<div class="hm-give ${cls}"><svg class="hm-give-ic" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="9" width="17" height="22" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"/><rect x="18" y="5" width="17" height="22" rx="3" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="2"/><path d="M9 16h9M9 20.5h7M9 25h8M22 12h9M22 16.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M26 30.5c-1.8-1.3-4-3-4-5a2 2 0 0 1 4-.6 2 2 0 0 1 4 .6c0 2-2.2 3.7-4 5z" fill="#E0565B"/></svg>
    <div class="hm-give-t"><b>Spar deinen Kolleg*innen einen Abend Arbeit!</b><p>Eine Stunde, die bei dir gut lief, hilft anderen beim Vorbereiten, und beim nächsten Mal profitierst du selbst. Geteilt wird nur, was du auswählst; dein Original bleibt bei dir.</p>
    ${canShare() && state.shared ? rankLine(nMine, true) : ''}</div>
    <div class="hm-give-bs"><button type="button" class="btn hm-give-b" data-hm="${canShare() ? 'give' : 'login'}">${hmI('share')}${canShare() ? 'Eine Stunde teilen' : 'Anmelden und teilen'}</button>${canShare() ? `<button type="button" class="link hm-fame" data-fame-open="1">${trophyI}Wall of Fame</button>` : ''}</div></div>`;
  const nNew = canShare() && state.shared ? sharedVis().filter(x => !x.mine && +new Date(x.updatedAt) > hmS.seen).length : 0;
  const html = `<div class="hm-top"><div class="hm-brand"><b class="logo" aria-label="LehrWerk"><svg class="logo-i" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor"/><path d="M7.2 16.8 13.9 10.1M13.9 10.1l2.6-2.6a1.3 1.3 0 0 1 1.8 0l.0 0a1.3 1.3 0 0 1 0 1.8l-2.6 2.6M7.2 16.8l-.6 1.9 1.9-.6" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.6" cy="6.4" r="1.6" fill="#F5B400"/></svg><span class="logo-l">Lehr</span><span class="logo-w">Werk</span></b><small>Startseite</small></div>
      <div class="hm-top-a">${cur ? `<button type="button" class="btn" data-hm="x">${hmI('go')}<span>Weiter${curT ? `<i>: ${esc(curT.length > 34 ? curT.slice(0, 32) + ' …' : curT)}</i>` : ''}</span></button>` : ''}
      <label class="hm-auto"><span>Von selbst zeigen</span><select data-hm="auto" aria-label="Startseite von selbst zeigen">${HOME_MODES.map(([v, l]) => `<option value="${v}"${homeMode() === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div></div>
    <div class="hm-wrap">
      <section class="hm-hero">
        <svg class="hm-art" viewBox="0 0 400 200" aria-hidden="true"><g fill="none" stroke="#fff" stroke-linecap="round">
          <path d="M40 60h150M40 84h190M40 108h120M40 132h170" stroke-opacity=".16" stroke-width="6"/>
          <rect x="250" y="34" width="110" height="140" rx="10" stroke-opacity=".55" stroke-width="3" fill="#fff" fill-opacity=".08"/>
          <path d="M270 64h70M270 84h56M270 104h66M270 124h44" stroke-opacity=".5" stroke-width="4"/>
          <path d="M226 150c18-30 40-44 66-46" stroke="#FDE68A" stroke-width="5" stroke-opacity=".9"/><circle cx="296" cy="104" r="6" fill="#FDE68A" stroke="none"/></g></svg>
        <div class="hm-hero-in"><p class="hm-date">${esc(now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
          <h1 id="hm-t">${greet}${autor ? `, ${esc(autor)}` : ''}</h1>
          <p class="hm-lead">${lib.length ? `${lib.length} ${lib.length === 1 ? 'Stunde' : 'Stunden'} in ${KLASSEN.length} ${KLASSEN.length === 1 ? 'Klasse' : 'Klassen'}${nNew ? ` · <b>${nNew} neu geteilt</b>` : ''}` : `Leg deine erste Stunde an${nNew ? ` · <b>${nNew} neu geteilt</b>` : '.'}`}</p>
          <div class="hm-hero-a"><button type="button" class="btn hm-cta" data-hm="new" data-k="${esc(state.klasse)}">${hmI('plus')}Neue Stunde in ${esc(KL(state.klasse).label)}</button>${cur ? `<button type="button" class="btn hm-ghost" data-hm="x">${hmI('go')}Weiterarbeiten</button>` : ''}</div></div>
        ${giveH('hm-give-hero')}
      </section>
      <section class="hm-sec" aria-labelledby="hm-kt"><div class="hm-sec-h"><h2 id="hm-kt">Fächer und Klassen</h2><button type="button" class="link" data-hm="klassen">Klassen bearbeiten</button></div>
        ${fachs.map(f => `<div class="hm-fach"><h3>${esc((FAECHER[f] || FAECHER.deutsch).label)}</h3><div class="hm-kls">${KLASSEN.filter(k => (k.fach || 'deutsch') === f).map(klCard).join('')}</div></div>`).join('')}
      </section>
      <div class="hm-cols">
        <section class="hm-sec hm-card" aria-labelledby="hm-rt"><div class="hm-sec-h"><h2 id="hm-rt">Zuletzt bearbeitet</h2>${lib.length > 8 ? `<button type="button" class="link" data-hm="all" data-k="${esc(state.klasse)}">Alle Stunden</button>` : ''}</div>${recentH}</section>
        <section class="hm-sec hm-card" aria-labelledby="hm-st"><div class="hm-sec-h"><h2 id="hm-st">${hmI('share')}Neu geteilt${nNew ? ` <span class="hm-new">${nNew}</span>` : ''}</h2>${canShare() ? '<button type="button" class="link" data-hm="shared">Alle geteilten</button>' : ''}</div>${giveH('hm-give-card')}${shareH}</section>
      </div>
      ${canShare() ? (() => { const F = myFaecher(); const L = (FO.threads || []).filter(t => !t.fach || F.has(t.fach)).slice(0, 4); const nU = (FO.threads || []).filter(foUnread).length;
        return `<section class="hm-sec hm-card hm-fo" aria-labelledby="hm-fo"><div class="hm-sec-h"><h2 id="hm-fo">${FOI_SVG}Lehrerzimmer${nU ? ` <span class="hm-new">${nU}</span>` : ''}</h2><button type="button" class="link" data-hm="forum">Alle Themen</button></div>
          ${!FO.threads ? '<p class="hm-empty">Lädt …</p>' : L.length ? `<ul class="hm-fol">${L.map(t => `<li${foUnread(t) ? ' class="new"' : ''}><button type="button" data-hm="forum-t" data-id="${t.id}"><b>${foUnread(t) ? '<i class="fo-dot"></i>' : ''}${esc(t.title)}</b><small>${t.kategorie ? esc(t.kategorie) + ' · ' : ''}${esc(t.autor || '')} · ${t.n_replies ? t.n_replies + (t.n_replies === 1 ? ' Antwort' : ' Antworten') : 'neu'} · ${foWhen(t.last_at)}</small></button></li>`).join('')}</ul>` : '<p class="hm-empty">Noch ist es still. Stell die erste Frage oder teile einen Tipp.</p>'}
          <button type="button" class="btn hm-fo-b" data-hm="forum-new">+ Neues Thema</button></section>`; })() : ''}
      ${donateHTML()}
    </div>`;
  if (html === hmS.html) return; hmS.html = html;
  let box = root.querySelector('.hm'); if (!box) { root.innerHTML = '<div class="hm" role="dialog" aria-modal="true" aria-labelledby="hm-t"></div>'; box = root.firstChild; }
  const st = box.scrollTop; box.innerHTML = html; box.scrollTop = st;
}
async function homeClick(e) {
  const a = e.target.closest('[data-hm]'); if (!a) return; const k = a.dataset.hm;
  const toKl = async kl => { if (kl && kl !== state.klasse) { if (savePending) saveNow(); state.klasse = kl; lsSet(LS.klasse, kl); state.libQuery = ''; renderTabs(); } };
  if (k === 'auto') { if (e.type === 'change') homeModeSet(a.value); return; }
  if (k === 'x') return homeClose();
  if (k === 'kl') { const kl = a.dataset.k; homeClose(); if (kl === state.klasse) return; await switchKlasse(kl); return; }
  if (k === 'open') { const d = (state.lib || []).find(x => x.id === a.dataset.id); if (!d) return; homeClose(); await toKl(d.klasse); if (!state.sheet || state.sheet.id !== d.id) await openById(d.id); if (isNarrow()) setView('preview'); return; }
  if (k === 'new') { const kl = a.dataset.k; homeClose(); if (kl !== state.klasse) await switchKlasse(kl); openNew(); return; }
  if (k === 'all') { const kl = a.dataset.k; homeClose(); if (kl !== state.klasse) await switchKlasse(kl); state.libTab = 'mine'; state.libOpen = true; renderLib(); return; }
  if (k === 'shared') { homeClose(); state.libTab = 'shared'; state.libOpen = true; renderLib(); return; }
  if (k === 'give') { homeClose(); openSharePick(); return; }
  if (k === 'forum') { homeClose(); forumOpen(); return; }
  if (k === 'forum-t') { homeClose(); forumOpen('thread', a.dataset.id); return; }
  if (k === 'forum-new') { homeClose(); forumOpen().then(() => { FO.view = 'new'; FO.draft = {}; foRender(); }); return; }
  if (k === 'klassen') { homeClose(); openKlassen(false); return; }
  if (k === 'login') { homeClose(); const b = $('#btn-login'); if (b) b.click(); return; }
  if (k === 'take') { hmS.busy = a.dataset.sid; homeRender(); await shareTake(a.dataset.sid); hmS.busy = ''; homeClose(); return; }
}

