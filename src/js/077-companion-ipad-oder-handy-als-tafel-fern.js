/* ================= Companion: iPad oder Handy als Tafel, Fernbedienung und Kamera, solange am Rechner präsentiert wird ================= */
// Kein QR-Code nötig: beide Geräte sind mit demselben Konto angemeldet und hören auf denselben privaten Live-Kanal.
// Fester Einstieg ohne Präsentation: …/?tafel (als Symbol „LehrWerk Tafel“ auf dem Home-Bildschirm)
const TAFEL_APP = (() => { try { return new URLSearchParams(location.search).has('tafel'); } catch { return false; } })();
const COMPANION_PAGE = () => !!(CAM_ID || TAFEL_APP);
const LFC_IC = {
  tafel: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M7 21l2-4M17 21l-2-4M7 9.5c1.5-1.5 3-1.5 4 0s2.5 1.5 4 0"/>',
  pk: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M12 8v12M3 8h18M6 13.5h3M7.5 12v3M15 13.5h3"/>',
  fol: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M10 8.5l4 2.5-4 2.5z" fill="currentColor"/><path d="M8 21h8"/>',
  cam: '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.6-2.2h6.4L16.8 7h2.7A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/>',
  pen: '<path d="M4 20l1.2-4.4L16.5 4.3a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8z"/><path d="M14.5 6.3l3.2 3.2"/>',
  hl: '<path d="M9 14l-3 3v3h3l3-3"/><path d="M9 14l7.5-9.5a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L12 17z"/>',
  er: '<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 18H7.5z"/><path d="M9 11l5 5"/>',
  laser: '<circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="12" cy="12" r="7.5" opacity=".45"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', more: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', tv: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', back: '<path d="M15 5l-7 7 7 7"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>', black: '<rect x="3" y="5" width="18" height="12" rx="1.5" fill="currentColor"/><path d="M8 21h8"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6 7-2.5 0-4-1.2-5.3-3.2L4 13.6a1.4 1.4 0 0 1 2.3-1.6L8 14"/>', ref: '<rect x="2.5" y="4" width="12" height="9" rx="1.2"/><path d="M17.5 5h4M17.5 9h4M17.5 13h4M2.5 17h19M2.5 20.5h12"/>',
  tools: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M17 13.5v7M13.5 17h7"/>',
  focus: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>', fs: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', fsx: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>', wait: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/><path d="M9.5 10h.01M12 10h.01M14.5 10h.01" stroke-width="2.6"/>'
};
const lfcIc = (k, n = 24) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LFC_IC[k]}</svg>`;
const lfcKey = () => Math.random().toString(36).slice(2, 9);
function lfcStart(O = {}) {
  if (document.getElementById('lfc-root')) return;
  // Companion: ein Hauptbildschirm. Die Folie füllt den Bildschirm, der Stift schreibt direkt darauf (erscheint am Beamer),
  // der Finger blättert. Tafel, Pro/Contra und Fotos sind Modi oben; Werkzeuge schweben unten; Seltenes liegt im „⋯“.
  const page = !!O.page; let PR = O.pres || null, lastHb = PR ? Date.now() : 0, tab = 'fol', cam = null;
  const wake = keepAwake(); const offs = [];
  const B = { sl: { ink: [], h: 900, sy: 0, i: -1 }, tafel: { ink: [], h: 900, sy: 0, pat: 'kariert' }, pk: { ink: [], h: 900, sy: 0, q: '', lab: ['Pro', 'Contra'], either: false } };
  const T = { tool: 'nav', btool: 'pen', col: { pen: INK_COLS[0], hl: INK_COLS[4] }, w: 'm', pen: false, live: null, las: null, panT: 0, undo: { sl: [], tafel: [], pk: [] } };
  let REF = false; try { REF = localStorage.getItem('abw.lfcref') === '1'; } catch {}
  let OV = false, SHEET = '', idleT = 0;
  const root = el(`<div id="lfc-root" class="lfc2 ${page ? 'lfc-page' : ''}"><nav class="lfc-top"><div class="lfc-tl"></div><div class="lfc-tc"></div><div class="lfc-tr"></div></nav><main class="lfc-m"></main><div class="lfc-ovl" hidden></div><div class="lfc-sh" hidden></div></div>`);
  document.body.appendChild(root); document.body.classList.add('lfc-on');
  const main = root.querySelector('.lfc-m'), tl = root.querySelector('.lfc-tl'), tc = root.querySelector('.lfc-tc'), tr = root.querySelector('.lfc-tr'), ovl = root.querySelector('.lfc-ovl'), shEl = root.querySelector('.lfc-sh');
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fsCan = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && !matchMedia('(display-mode: standalone)').matches && !navigator.standalone;
  const fsGo = on => { try { if (on) { const d = document.documentElement; const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d); if (p && p.catch) p.catch(() => {}); } else (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch {} };
  const onFs = () => { renderTop(); setTimeout(lay, 80); }; ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, onFs));
  root.addEventListener('pointerdown', e => { if (root.classList.contains('idle') && e.clientY < 72 && !(e.target.closest && e.target.closest('.lfc-tk, .lfc-palx, .lfc-ytf, .lfc-modes'))) { e.preventDefault(); e.stopPropagation(); topShow(); } }, { capture: true });
  let fsTried = false; root.addEventListener('pointerdown', () => { if (!fsTried && fsCan() && !fsEl()) { fsTried = true; try { if (localStorage.getItem('abw.camfs') !== '0') fsGo(true); } catch { fsGo(true); } } }, { capture: true });
  let DEV = ''; try { DEV = sessionStorage.getItem('abw.lfcdev') || ''; if (!DEV) { DEV = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('abw.lfcdev', DEV); } } catch { DEV = Math.random().toString(36).slice(2, 10); }
  const PEND = [];
  const send = m => { m.d = DEV; if (m.t === 'bop' && (m.op === 'add' || m.op === 'rm')) { PEND.push({ t: Date.now(), key: m.key, op: m.op, s: m.s, ks: m.ks }); if (PEND.length > 300) PEND.shift(); } fotoSend(m); };
  // Komplettstand vom Rechner mit eigenen, noch unterwegs befindlichen Strichen zusammenführen (zwei schreiben gleichzeitig)
  const merge = (key, ink) => { const now = Date.now(); while (PEND.length && now - PEND[0].t > 5000) PEND.shift(); let L = ink.slice(); PEND.forEach(x => { if (x.key !== key) return; if (x.op === 'add' && x.s && !L.some(y => y.k === x.s.k)) L.push(x.s); else if (x.op === 'rm') { const R = new Set(x.ks || []); L = L.filter(y => !R.has(y.k)); } }); return L; };
  const live = () => !!PR && Date.now() - lastHb < 15000;
  const boardOn = k => !!PR && PR.board === k;
  const kOf = () => (tab === 'fol' ? 'sl' : tab);
  const drawTab = () => tab === 'fol' || tab === 'tafel' || tab === 'pk';
  const modes = () => [['fol', 'Folie'], ['tafel', 'Tafel'], ...(PR && PR.gp ? [['pk', 'Pro/Contra']] : []), ['cam', 'Fotos']];
  // ---------- Kopfzeile: links zurück, Mitte Ort, rechts Modi, Referent, ⋯ ----------
  const renderTop = () => {
    tl.innerHTML = `<button type="button" class="lfc-tb" data-l="exit" aria-label="Zurück zu LehrWerk">${lfcIc('back', 22)}</button><i class="lfc-dotc${live() ? ' ok' : ''}" title="${live() ? 'Verbunden' : 'Nicht verbunden'}"></i>`;
    if (!live()) { tc.innerHTML = '<b>Companion</b>'; tr.innerHTML = ''; return; }
    const lab = tab === 'fol' ? `<b>${PR.i + 1} / ${PR.n}</b><span>${esc(PR.lab || '')}${PR.max ? ` · Schritt ${PR.cur || 0}/${PR.max}` : ''}</span>` : tab === 'tafel' ? `<b>Tafel</b><span>${boardOn('tafel') ? 'am Beamer' : 'nur hier · beim Schreiben am Beamer'}</span>` : tab === 'pk' ? `<b>Pro / Contra</b><span>${boardOn('pk') ? 'am Beamer' : 'nur hier'}</span>` : `<b>Fotos</b><span>${esc(PR.title || '')}</span>`;
    tc.innerHTML = `<button type="button" class="lfc-tcb" data-l="${tab === 'fol' ? 'over' : 'none'}"${tab === 'fol' ? ' aria-label="Alle Folien zeigen"' : ''}>${lab}</button>`;
    tr.innerHTML = `<div class="lfc-seg" role="tablist" aria-label="Modus">${modes().map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === tab}" aria-label="${l}" title="${l}">${lfcIc(k === 'fol' ? 'fol' : k, 20)}<span>${l}</span></button>`).join('')}</div>`
      + (tab === 'fol' ? `<button type="button" class="lfc-tb${REF ? ' on' : ''}" data-l="ref" aria-pressed="${REF}" title="${REF ? 'Nur die Folie zeigen' : 'Referentenansicht: nächste Folie, Notizen, Zeit'}" aria-label="Referentenansicht">${lfcIc('ref', 22)}</button>` : '')
      + `<button type="button" class="lfc-tb" data-l="menu" aria-label="Mehr">${lfcIc('more', 22)}</button>`;
  };
  // ---------- schwebende Werkzeugleiste ----------
  const tools = () => (tab === 'fol' ? ['nav', 'pen', 'hl', 'er', 'laser'] : ['pen', 'hl', 'er', 'laser']);
  const TNAME = { nav: 'Blättern und zeigen', pen: 'Stift', hl: 'Marker', er: 'Radierer', laser: 'Laser' };
  // Werkzeuge als kleiner Knopf oben links; ein Tipp klappt die Leiste darunter auf
  let PALO = false, MODO = false, TFULL = false; try { TFULL = localStorage.getItem('abw.lfctfull') === '1'; } catch {}
  const pal = () => `<div class="lfc-tk"><button type="button" class="lfc-tkm${MODO ? ' on' : ''}" data-l="modes" aria-expanded="${MODO}" aria-label="Modus wechseln" title="Folie, Tafel, Fotos">${lfcIc(tab === 'fol' ? 'fol' : tab, 20)}<span>${(modes().find(m => m[0] === tab) || ['', ''])[1]}</span>${lfcIc('down', 14)}</button>${tab === 'fol' ? '' : '<!--'}<button type="button" class="lfc-tkb${PALO ? ' on' : ''}" data-l="pal" aria-expanded="${PALO}" aria-label="Werkzeuge" title="Werkzeuge">${lfcIc(T.tool === 'nav' ? 'hand' : T.tool, 22)}<i class="lfc-tkc" style="--cc:${T.col[T.tool] || T.col.pen}"></i></button>${tab === 'fol' ? '' : '-->'}${tab === 'fol' && PR.tm ? `<button type="button" class="lfc-tkn lfc-tmb" data-l="tmm" aria-label="Werkzeuge der Tafelansicht" title="Werkzeuge der Tafelansicht: Timer, Ampel, Würfel …">${lfcIc('tools', 20)}</button>` : ''}<button type="button" class="lfc-blk${PR.bl ? ' on' : ''}" data-nav="black" aria-pressed="${!!PR.bl}" title="${PR.bl ? 'Beamer wieder einschalten' : 'Beamer schwarz schalten'}">${lfcIc('black', 20)}<span>${PR.bl ? 'Wieder an' : 'Schwarz'}</span></button>${tab !== 'fol' && tab !== 'cam' ? `<button type="button" class="lfc-tkn${TFULL ? ' pri' : ''}" data-l="tfull" aria-pressed="${TFULL}" aria-label="${TFULL ? 'Vollbild verlassen' : 'Tafel im Vollbild'}" title="${TFULL ? 'Vollbild verlassen' : 'Tafel im Vollbild'}">${lfcIc(TFULL ? 'fsx' : 'fs', 20)}</button>` : ''}${tab === 'fol' ? `<button type="button" class="lfc-tkn" data-nav="prev" aria-label="Zurück"${PR.i <= 0 && !PR.cur ? ' disabled' : ''}>${lfcIc('prev', 22)}</button><button type="button" class="lfc-tkn pri" data-nav="next" aria-label="Weiter">${lfcIc('next', 22)}</button>` : ''}</div>${MODO ? `<div class="lfc-modes" role="menu">${modes().map(([k, l]) => `<button type="button" role="menuitemradio" data-tab="${k}" aria-checked="${k === tab}">${lfcIc(k, 20)}<span>${l}</span></button>`).join('')}</div>` : ''}${tab !== 'fol' ? palBar(true) : PALO ? palBar() : ''}`;
  // Werkzeuge wie in Apple Notizen: Stifte stehen aufrecht in einer hellen Leiste, der gewählte ragt heraus; Farben als Raster
  const toolSvg = t => { const c = T.col[t] || T.col.pen;
    if (t === 'nav') return `<svg viewBox="0 0 44 96" aria-hidden="true"><rect x="7" y="22" width="30" height="80" rx="9" fill="#F2F2F7" stroke="#C7C7CC"/><g transform="translate(10 30)" fill="none" stroke="#0A84FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LFC_IC.hand}</g></svg>`;
    if (t === 'pen') return `<svg viewBox="0 0 44 96" aria-hidden="true"><path d="M13 40 L22 8 L31 40 Z" fill="#E9E9EE" stroke="#C7C7CC"/><path d="M19.4 17.5 L22 8 L24.6 17.5 Z" fill="${c}"/><rect x="13" y="40" width="18" height="62" rx="3" fill="#FDFDFE" stroke="#C7C7CC"/><rect x="13" y="46" width="18" height="5" fill="${c}"/></svg>`;
    if (t === 'hl') return `<svg viewBox="0 0 44 96" aria-hidden="true"><path d="M14 22 L30 14 L30 30 L14 30 Z" fill="${T.col.hl}" stroke="rgba(0,0,0,.15)"/><rect x="11" y="30" width="22" height="72" rx="3" fill="#FDFDFE" stroke="#C7C7CC"/><rect x="11" y="44" width="22" height="7" fill="${T.col.hl}"/></svg>`;
    if (t === 'er') return `<svg viewBox="0 0 44 96" aria-hidden="true"><rect x="11" y="16" width="22" height="22" rx="7" fill="#F4A3AB" stroke="rgba(0,0,0,.12)"/><rect x="11" y="32" width="22" height="70" rx="3" fill="#FDFDFE" stroke="#C7C7CC"/><rect x="11" y="32" width="22" height="4" fill="#E0E0E5"/></svg>`;
    return `<svg viewBox="0 0 44 96" aria-hidden="true"><circle cx="22" cy="17" r="8" fill="#FF453A" opacity=".25"/><circle cx="22" cy="17" r="4.5" fill="#FF453A"/><rect x="14" y="26" width="16" height="76" rx="7" fill="#3A3A3C" stroke="#1C1C1E"/><rect x="18" y="36" width="8" height="4" rx="2" fill="#8E8E93"/></svg>`; };
  const palBar = pin => `<div class="lfc-pal lfc-apl ${pin ? 'lfc-palb' : 'lfc-palx'}" role="toolbar" aria-label="Werkzeuge">
      <div class="lfc-ag"><button type="button" class="lfc-ar" data-l="undo" aria-label="Rückgängig">${lfcIc('undo', 20)}</button></div>
      <div class="lfc-at">${tools().map(t => `<button type="button" class="lfc-tool${T.tool === t ? ' on' : ''}" data-tool="${t}" aria-pressed="${T.tool === t}" aria-label="${TNAME[t]}" title="${TNAME[t]}">${toolSvg(t)}${t === 'pen' || t === 'hl' ? `<i class="lfc-tw">${({ s: 'S', m: 'M', l: 'L' })[T.w]}</i>` : ''}</button>`).join('')}</div>
      <div class="lfc-ac">${INK_COLS.map(c => `<button type="button" class="lfc-col" data-col="${c}" style="--cc:${c}" aria-pressed="${(T.col[T.tool] || T.col.pen) === c}" aria-label="Farbe"></button>`).join('')}</div>
      <div class="lfc-ag">${tab !== 'fol' ? `<button type="button" class="lfc-ar" data-l="more" aria-label="Platz nach unten" title="Platz nach unten">${lfcIc('plus', 20)}</button>` : ''}<button type="button" class="lfc-ar" data-l="${pin ? 'menu' : 'pal'}" aria-label="${pin ? 'Mehr' : 'Leiste schließen'}">${lfcIc(pin ? 'more' : 'fsx', 20)}</button></div></div>`;
  // Leiste sinkt nach unten, solange man sie nicht braucht; ein Tipp holt sie hoch
  let sinkT = 0;
  const sink = on => { const b = main.querySelector('.lfc-palb'); if (!b) return; clearTimeout(sinkT); b.classList.toggle('sunk', !!on); };
  const sinkSoon = (ms = 3500) => { clearTimeout(sinkT); sinkT = setTimeout(() => sink(true), ms); };
  const palRe = () => { const o = main.querySelector('.lfc-pal'); if (!o) return; const pin = o.classList.contains('lfc-palb'); const t = document.createElement('div'); t.innerHTML = palBar(pin); o.replaceWith(t.firstElementChild); };
  const palSync = () => { const b = main.querySelector('.lfc-tkb'); if (b) b.innerHTML = lfcIc(T.tool === 'nav' ? 'hand' : T.tool, 22) + `<i class="lfc-tkc" style="--cc:${T.col[T.tool] || T.col.pen}"></i>`; };
  const ytBtns = () => (!PR.yt ? '' : PR.yt === 'on'
    ? `<div class="lfc-yt on"><span>${lfcIc('fol', 18)} Video läuft am Beamer</span><div><button type="button" class="lfc-pill" data-nav="ytpause">Pause</button><button type="button" class="lfc-pill" data-nav="ytplay">Weiter</button><button type="button" class="lfc-pill${PR.ytbig ? ' on' : ''}" data-nav="ytbig">${PR.ytbig ? 'Vollbild aus' : 'Vollbild'}</button><button type="button" class="lfc-pill" data-nav="ytstop">Schließen</button></div></div>`
    : `<div class="lfc-yt"><button type="button" class="lfc-ytgo" data-nav="ytplay"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><span>Video abspielen</span></button></div>`);
  // ---------- Folien aus der gespeicherten Stunde ----------
  const SL = { id: '', up: 0, S: null, sh: null, busy: false, retry: 0 };
  const withSh = fn => { const keep = state.sheet; try { state.sheet = SL.sh; return fn(); } finally { state.sheet = keep; } };
  const slLoad = async () => {
    if (!PR || SL.busy || (SL.id === PR.sheet && SL.up >= (PR.up || 0))) return; SL.busy = true;
    try { const r = await store.sb.from('ab_arbeitsblaetter').select('data').eq('id', PR.sheet).maybeSingle(); const d = r.data && r.data.data;
      if (d) { SL.sh = normalizeSheet(d); SL.S = withSh(() => presSlides(true)); SL.id = PR.sheet;
        if ((+d.updatedAt || 0) < (PR.up || 0) && SL.retry++ < 4) { SL.up = +d.updatedAt || 0; setTimeout(slLoad, 2500); } else { SL.retry = 0; SL.up = PR.up || 0; } } else { SL.id = PR.sheet; SL.up = PR.up || 0; SL.S = null; } }
    catch (err) { console.error(err); SL.id = PR.sheet; SL.up = PR.up || 0; }
    SL.busy = false; if (tab === 'fol' && live()) renderMain();
  };
  let TF = null, TFhold = 0;
  const slOk = () => !!(PR && SL.S && SL.id === PR.sheet && SL.S.length === PR.n);
  const slPaint = (host, i, w, steps) => withSh(() => {
    const x = SL.S[i]; if (!x) { host.innerHTML = ''; return; } const bar = SL.S.bar || [];
    host.innerHTML = `<div class="lfc-sw" style="width:${w}px;height:${w * 9 / 16}px;--k:${(w / 1600).toFixed(5)}"><div class="pr-slide pr-k-${x.k}${prMin(x) ? ' has-timer' : ''}${bar.length ? ' has-bar' : ''}"><div class="pr-accent"></div>${presSlideHTML(x, bar)}${presBarHTML(bar, x.bi)}<div class="pr-foot"><span></span><span>${i + 1}</span></div></div></div>`;
    const sl = host.querySelector('.pr-slide'); setAccent(host.firstChild, SL.sh.meta);
    try { const f = sl.querySelector('.pr-fit'), body = sl.querySelector('.pr-body'); if (f && body && PR_MAX[x.k]) fitUp(f, body, PR_MAX[x.k]); tfDraw(sl); phbFit(sl); } catch {}
    if (steps != null) sl.querySelectorAll('[data-st]').forEach(e => e.classList.toggle('tf-hid', +e.dataset.st > steps));
  });
  const slPaintTm = (host, i, w, steps) => withSh(() => {
    const x = SL.S[i]; if (!x) { host.innerHTML = ''; return; } const bar = SL.S.bar || [];
    host.innerHTML = `<div class="lfc-sw lfc-tm" style="width:${w}px;height:${w * 9 / 16}px"><div class="pr pr-aud pr-tafel${TF.os ? ' pr-tos' : ''} lfc-prw" style="--tbg:${esc(TF.bg)};transform:scale(${(w / 1600).toFixed(5)})"><div class="pr-stage"><div class="pr-slide pr-k-${x.k}${prMin(x) ? ' has-timer' : ''}${bar.length ? ' has-bar' : ''}" style="transform:translate(calc(-50% + ${TF.ox}px),calc(-50% + ${TF.oy}px)) scale(${TF.sk})"><div class="pr-accent"></div>${presSlideHTML(x, bar)}${presBarHTML(bar, x.bi)}<div class="pr-foot"><span></span><span>${i + 1}</span></div></div><div class="${esc(TF.cls)}">${TF.html}</div></div></div></div>`;
    const sl = host.querySelector('.pr-slide'); setAccent(host.querySelector('.lfc-prw'), SL.sh.meta);
    try { const f = sl.querySelector('.pr-fit'), body = sl.querySelector('.pr-body'); if (f && body && PR_MAX[x.k]) fitUp(f, body, PR_MAX[x.k]); tfDraw(sl); phbFit(sl); } catch {}
    if (steps != null) sl.querySelectorAll('[data-st]').forEach(e => e.classList.toggle('tf-hid', +e.dataset.st > steps));
  });
  const tflUpd = () => { const t = main.querySelector('.lfc-prw .pr-stage > .tfl'); if (!t || !TF) return false; t.className = TF.cls; t.innerHTML = TF.html; main.querySelector('.lfc-prw').style.setProperty('--tbg', TF.bg); return true; };
  // Notizen der aktuellen Folie für die Referentenansicht (nur auf diesem Gerät)
  const notesOf = i => { if (!SL.S || !SL.S[i]) return []; const x = SL.S[i];
    if (x.k === 'tasks') return x.items.flatMap(y => ehLines(y.it).map(t => (x.items.length > 1 && y.no ? y.no + ': ' : '') + t));
    if (x.k === 'step' && x.b) return [tfStr(x.b.note).trim(), ...String(x.b.eh || '').split('\n').map(t => t.trim())].filter(Boolean);
    return []; };
  // ---------- Bühne: Folie bzw. Tafel mit Zeichenfläche ----------
  const slideObj = k => (k === 'pk' ? { k: 'blank', pk: true, pat: 'weiss', id: 'pk', q: B.pk.q, lab: B.pk.lab, either: B.pk.either, h: B.pk.h, sy: B.pk.sy } : { k: 'blank', id: 'bl-tafel', pat: B.tafel.pat, h: B.tafel.h, sy: B.tafel.sy });
  const brd = () => main.querySelector('.lfc-board');
  const renderMain = () => {
    if (!live()) return renderWait();
    if (tab === 'cam') { if (!cam || cam.sheet !== PR.sheet) renderCam(); return; }
    if (tab === 'fol') { slLoad(); if (B.sl.i !== PR.i) { B.sl = { ink: [], h: 900, sy: 0, i: PR.i }; T.undo.sl = []; } }
    const nx = tab === 'fol' && REF;
    const notes = nx ? notesOf(PR.i) : [];
    main.innerHTML = `<div class="lfc-wrap${nx ? ' ref' : ''}"><div class="lfc-stage">${PR.bl ? `<div class="lfc-blon" role="status">${lfcIc('black', 18)}<span>Der Beamer ist schwarz</span><button type="button" data-nav="black">Wieder einschalten</button></div>` : ''}<div class="lfc-board${tab === 'fol' ? ' fol' : ''}"><div class="lfc-sl"></div><canvas class="lfc-cv" width="2400" height="1350"></canvas><i class="lfc-dot" hidden></i><div class="lfc-vs" hidden><i></i></div></div>${pal()}${tab === 'fol' && PR.yt ? `<div class="lfc-ytf">${ytBtns()}</div>` : ''}${tab !== 'fol' && tab !== 'cam' ? fxHTML() : ''}</div>
      ${nx ? `<aside class="lfc-side"><div class="lfc-nx"><small>Als Nächstes</small>${PR.i + 1 < PR.n ? `<div class="lfc-nxs"></div><span>${esc(PR.nx || '')}</span>` : '<span>Das ist die letzte Folie.</span>'}</div>
        <div class="lfc-notes"><small>Notizen</small>${notes.length ? `<ul>${notes.map(t => `<li>${inlineHTML(t)}</li>`).join('')}</ul>` : '<span>Keine Notizen zu dieser Folie.</span>'}</div>
        <div class="lfc-fb"><button type="button" class="lfc-big" data-nav="prev" ${PR.i <= 0 && !PR.cur ? 'disabled' : ''}>${lfcIc('prev', 30)}<span>Zurück</span></button><button type="button" class="lfc-big pri" data-nav="next">${lfcIc('next', 30)}<span>Weiter</span></button></div></aside>` : ''}</div>`;
    lay(); bindBoard(); drawSl(); drawInk(); sinkSoon(4000);
    if (nx) { const n = main.querySelector('.lfc-nxs'); if (n && slOk()) slPaint(n, PR.i + 1, n.clientWidth || 260, 99); }
  };
  const lay = () => { const b = brd(); if (!b) return; const st = main.querySelector('.lfc-stage'); const full = root.classList.contains('tfull'); const W = Math.max(200, full ? Math.min(st.clientWidth, st.clientHeight * 16 / 9) : Math.min(st.clientWidth - 16, (st.clientHeight - (tab === 'fol' ? 16 : 150)) * 16 / 9)); b.style.width = W + 'px'; b.style.height = W * 9 / 16 + 'px'; b.style.setProperty('--k', (W / 1600).toFixed(5)); };
  const drawSl = () => { const s = main.querySelector('.lfc-sl'); if (!s) return; const b = brd();
    if (tab === 'fol') { if (!slOk()) { s.innerHTML = `<div class="lfc-fc"><b>${esc(PR.lab || '')}</b><span>${SL.id === PR.sheet && !SL.busy ? 'Die Folie lässt sich hier gerade nicht anzeigen. Blättern und Schreiben funktionieren trotzdem.' : 'Folie wird geladen …'}</span></div>`; return; }
      const W = b ? b.clientWidth : 800; if (PR.tm && TF) slPaintTm(s, PR.i, W, PR.cur || 0); else slPaint(s, PR.i, W, PR.cur || 0); return; }
    const o = slideObj(tab); s.innerHTML = `<div class="pr-slide pr-k-blank">${presSlideHTML(o, [])}</div>`; const vs = main.querySelector('.lfc-vs'); const H = o.h || 900; vs.hidden = H <= 900; if (!vs.hidden) { vs.firstChild.style.height = (900 / H * 100) + '%'; vs.firstChild.style.top = ((o.sy || 0) / H * 100) + '%'; } };
  const KB = () => B[kOf()];
  const drawInk = () => { const c = main.querySelector('.lfc-cv'); if (!c) return; const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.setTransform(1.5, 0, 0, 1.5, 0, 0); g.translate(0, -(KB().sy || 0)); KB().ink.forEach(s => inkDraw(g, s)); if (T.live) inkDraw(g, T.live);
    const d = main.querySelector('.lfc-dot'); if (d) { d.hidden = !T.las; if (T.las) { const b = brd().getBoundingClientRect(); d.style.transform = `translate(${T.las[0] / 1600 * b.width}px,${(T.las[1] - (KB().sy || 0)) / 900 * b.height}px)`; } } };
  const thr = (fn, ms) => { let t = 0, last = 0, a = null; return (...x) => { a = x; const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } else if (!t) t = setTimeout(() => { t = 0; last = Date.now(); fn(...a); }, ms - (now - last)); }; };
  const sendLive = thr(s => send({ t: 'bop', key: kOf(), op: 'live', s }), 40);
  const sendLas = thr((x, y) => send({ t: 'blas', key: kOf(), x: Math.round(x), y: Math.round(y) }), 25);
  const sendSy = thr(sy => send({ t: 'bsy', key: kOf(), sy: Math.round(sy) }), 50);
  let extT = 0;
  const extend = scroll => { if (tab === 'fol' || Date.now() - extT < 700) return; extT = Date.now(); KB().h = (KB().h || 900) + 900; send({ t: 'bmore', key: kOf() }); if (scroll) { KB().sy = Math.min(KB().h - 900, (KB().sy || 0) + 680); T.panT = Date.now(); setTimeout(() => sendSy(KB().sy), 420); } drawSl(); drawInk(); };
  const fxHTML = () => `<button type="button" class="lfc-fx${boardOn(tab) ? ' on' : ''}" data-l="beam" aria-pressed="${boardOn(tab)}" title="${boardOn(tab) ? 'Die Tafel vom Beamer nehmen (zurück zur Folie)' : 'Die Tafel am Beamer zeigen'}">${lfcIc('tv', 18)}<span>${boardOn(tab) ? 'Am Beamer · wegnehmen' : 'Am Beamer zeigen'}</span></button>`;
  const fxSync = () => { const x = main.querySelector('.lfc-fx'); if (x) x.outerHTML = fxHTML(); };
  const ensureBeam = () => { if (tab === 'fol') return; if (!boardOn(tab)) { send({ t: 'board', kind: tab, on: true }); if (PR) PR.board = tab; renderTop(); fxSync(); } };
  const nav = a => send({ t: 'nav', a });
  const bindBoard = () => {
    // Pencil schreibt, der Finger blättert (Folie) oder verschiebt mit zwei Fingern (Tafel). Ohne Pencil: Werkzeug „Blättern“ oder Zeichnen mit dem Finger.
    const b = brd(); const TP = new Map(); let pan = null, er = null, drawId = null, penDown = false, penUpT = 0, lastTouch = null, sw = null;
    const pt = e => { const r = b.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 1600, (e.clientY - r.top) / r.height * 900 + (KB().sy || 0)]; };
    const r1 = v => Math.round(v * 10) / 10;
    const panStart = () => { const ys = [...TP.values()].map(p => p.y); pan = { y: ys.reduce((a, v) => a + v, 0) / ys.length, sy: KB().sy || 0 }; };
    const cancelLive = () => { if (T.live) { T.live = null; sendLive(null); } T.las = null; er = null; drawId = null; drawInk(); };
    const dropPalm = () => { if (!lastTouch || Date.now() - lastTouch.t > 700) return; const k = lastTouch.k; lastTouch = null;
      const L = KB().ink, n = L.length; KB().ink = L.filter(x => x.k !== k); if (KB().ink.length !== n) { send({ t: 'bop', key: kOf(), op: 'rm', ks: [k] }); const U = T.undo[kOf()]; const i = U.findIndex(h => h.t === 'add' && h.k === k); if (i >= 0) U.splice(i, 1); drawInk(); } };
    const tool = e => (e.pointerType === 'pen' && (e.buttons & 32 || e.button === 5) ? 'er' : e.pointerType === 'pen' && T.tool === 'nav' ? (tab === 'fol' ? 'laser' : T.btool) : T.tool); // Radiererende bzw. Radiertaste des Stifts (z. B. OnePlus Stylo, Surface Pen)
    const startDraw = e => {
      const tl0 = tool(e); drawId = e.pointerId; T.liveType = e.pointerType; T.cur = tl0; const [x, y] = pt(e);
      if (tl0 === 'laser') { T.las = [x, y]; sendLas(x, y); drawInk(); return; }
      if (tl0 === 'er') { er = []; eraseAt(x, y, er); return; }
      const pr = e.pointerType === 'pen' && e.pressure > 0 && tl0 === 'pen';
      T.live = { k: lfcKey(), t: tl0, c: T.col[tl0] || T.col.pen, w: INK_W[T.w], p: pr ? [r1(x), r1(y), Math.round(e.pressure * 100)] : [r1(x), r1(y)], ...(pr ? { pr: 1 } : {}) };
      ensureBeam(); drawInk();
    };
    // Finger auf der Folie: Wischen oder Tippen an den Rand blättert
    const swipeEnd = e => { if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y, r = b.getBoundingClientRect(); const s0 = sw; sw = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { nav(dx < 0 ? 'next' : 'prev'); return; }
      if (dy < -90 && s0.y > r.bottom - 120) { overview(true); return; }
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - s0.t < 450) { const fx = (e.clientX - r.left) / r.width; if (PR && PR.yt === 'ready' && fx > .3 && fx < .7) { nav('ytplay'); return; } if (fx < 1 / 3) nav('prev'); else if (fx > 2 / 3) nav('next'); else topShow(); } };
    // Tafelansicht bedienen: Finger auf einem Werkzeug oder der Ablaufleiste tippt bzw. verschiebt es am Rechner
    let tmd = null;
    const tmHit = e => { if (tab !== 'fol' || !PR || !PR.tm || !TF || e.pointerType === 'pen' || !(T.pen || T.tool === 'nav')) return null; const cv = main.querySelector('.lfc-cv'); if (cv) cv.style.pointerEvents = 'none'; b.classList.add('tmh');
      const el2 = document.elementFromPoint(e.clientX, e.clientY); if (cv) cv.style.pointerEvents = ''; b.classList.remove('tmh'); return el2 && el2.closest && el2.closest('.lfc-prw .tw, .lfc-prw .tfl-it') ? el2 : null; };
    const tmSel = el2 => { const tw = el2.closest('.tw'); const a = el2.closest('[data-ta], [data-tfl-go]'); if (!a) return '';
      if (a.dataset.tflGo != null) return `[data-tfl-go="${a.dataset.tflGo}"]`; return `${tw ? `[data-tw="${tw.dataset.tw}"] ` : ''}[data-ta="${a.dataset.ta}"]${a.dataset.v != null ? `[data-v="${a.dataset.v}"]` : ''}`; };
    const tmField = (el2, sel) => { // Eingabefelder: Auswahl bzw. Eingabe hier, Wert an den Rechner
      if (el2.tagName === 'SELECT') { const L = [...el2.options]; sheetPick(L.map(o => [o.value, o.textContent]), el2.value, v => send({ t: 'tfv', sel, v })); return true; }
      if (el2.tagName === 'INPUT' && el2.type !== 'range') { const v = window.prompt(el2.getAttribute('aria-label') || el2.placeholder || 'Eingabe', el2.value || ''); if (v != null) send({ t: 'tfv', sel, v }); return true; }
      if (el2.classList.contains('tw-tx')) { const v = window.prompt('Notiz', el2.innerText || ''); if (v != null) send({ t: 'tfv', sel, v }); return true; }
      return false; };
    b.addEventListener('pointerdown', e => {
      { const h = tmHit(e); if (h) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {} const tw = h.closest('.tw'); const k = tw ? tw.getBoundingClientRect().width / (parseFloat(tw.style.width) || 1) : 1;
        const mode = tw && h.closest('.tw-rs') ? 'rs' : tw && h.closest('.tw-h') && !h.closest('button') ? 'mv' : '';
        tmd = { id: e.pointerId, el: h, tw, mode, k, sx: e.clientX, sy: e.clientY, x: tw ? parseFloat(tw.style.left) || 0 : 0, y: tw ? parseFloat(tw.style.top) || 0 : 0, w: tw ? parseFloat(tw.style.width) || 0 : 0, h: tw ? parseFloat(tw.style.height) || 0 : 0, moved: false }; return; } }
      e.preventDefault(); topIdle(); sink(true);
      if (e.pointerType === 'pen') {
        if (!T.pen) { T.pen = true; if (tab === 'fol' && T.tool === 'nav') { /* Stift schreibt mit dem zuletzt gewählten Werkzeug */ } toast(tab === 'fol' ? 'Stift erkannt: Auf der Folie ist er der Laserpointer, der Finger blättert. Zum Schreiben oben links den Stift wählen.' : 'Stift erkannt: Der Stift schreibt, der Finger verschiebt.'); }
        penDown = true; TP.clear(); pan = null; sw = null;
        if (drawId !== null && T.liveType === 'touch') cancelLive(); dropPalm();
        try { b.setPointerCapture(e.pointerId); } catch {} startDraw(e); return;
      }
      if (e.pointerType === 'touch' && (penDown || Date.now() - penUpT < 500)) return;
      try { b.setPointerCapture(e.pointerId); } catch {}
      if (e.pointerType === 'touch') TP.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const fingerNav = tab === 'fol' && (T.pen || T.tool === 'nav');
      if (fingerNav) { if (TP.size <= 1) sw = { x: e.clientX, y: e.clientY, t: Date.now() }; else sw = null; return; }
      if (e.pointerType === 'touch') { if (T.pen) { if (TP.size >= 2) panStart(); return; } if (TP.size >= 2) { cancelLive(); panStart(); return; } }
      startDraw(e);
    });
    b.addEventListener('pointermove', e => {
      if (tmd && e.pointerId === tmd.id) { const dx = (e.clientX - tmd.sx) / tmd.k, dy = (e.clientY - tmd.sy) / tmd.k; if (Math.hypot(dx, dy) * tmd.k > 8) tmd.moved = true;
        if (tmd.mode === 'mv' && tmd.moved) { tmd.tw.style.left = (tmd.x + dx) + 'px'; tmd.tw.style.top = Math.max(0, tmd.y + dy) + 'px'; }
        else if (tmd.mode === 'rs' && tmd.moved) { tmd.tw.style.width = Math.max(150, tmd.w + dx) + 'px'; tmd.tw.style.height = Math.max(110, tmd.h + dy) + 'px'; } return; }
      if (TP.has(e.pointerId)) { const q = TP.get(e.pointerId); q.x = e.clientX; q.y = e.clientY;
        if (pan && tab !== 'fol') { const ys = [...TP.values()].map(p => p.y), y = ys.reduce((a, v) => a + v, 0) / ys.length, r = b.getBoundingClientRect(); const raw = pan.sy - (y - pan.y) / r.height * 900; if (raw > (KB().h || 900) - 900 + 90) extend(false); const H = KB().h || 900; const sy = Math.max(0, Math.min(H - 900, raw)); if (sy !== KB().sy) { KB().sy = sy; T.panT = Date.now(); drawSl(); drawInk(); sendSy(sy); } return; } }
      if (e.pointerId !== drawId) return;
      if (T.cur === 'laser' && T.las) { const [x, y] = pt(e); T.las = [x, y]; sendLas(x, y); drawInk(); return; }
      if (er) { const [x, y] = pt(e); eraseAt(x, y, er); return; }
      const s = T.live; if (!s) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      { const [, yy] = pt(e); if (tab !== 'fol' && yy > (KB().h || 900) - 110) extend(false); }
      (evs.length ? evs : [e]).forEach(ev => { const [x, y] = pt(ev); const st2 = s.pr ? 3 : 2; const lx = s.p[s.p.length - st2], ly = s.p[s.p.length - st2 + 1]; if (Math.hypot(x - lx, y - ly) < 1.5) return; s.p.push(r1(x), r1(y)); if (s.pr) s.p.push(Math.round((ev.pressure || 0.5) * 100)); });
      drawInk(); sendLive(s);
    });
    const up = e => {
      if (tmd && e.pointerId === tmd.id) { const d = tmd; tmd = null; if (e.type !== 'pointerup') return;
        if (d.moved && d.mode === 'mv') { send({ t: 'tfd', id: d.tw.dataset.tw, x: Math.round(parseFloat(d.tw.style.left)), y: Math.round(parseFloat(d.tw.style.top)) }); TFhold = Date.now(); return; }
        if (d.moved && d.mode === 'rs') { send({ t: 'tfd', id: d.tw.dataset.tw, w: Math.round(parseFloat(d.tw.style.width)), h: Math.round(parseFloat(d.tw.style.height)) }); TFhold = Date.now(); return; }
        if (d.moved) return; const sel = tmSel(d.el); if (!sel) return; if (d.el.closest('select, input, .tw-tx') && tmField(d.el.closest('select, input, .tw-tx'), sel)) return;
        if (/\[data-ta="list"\]/.test(sel)) { toast('Die Namensliste trägst du am Rechner ein – sie bleibt nur dort.'); return; }
        const fb = d.el.closest('[data-ta], [data-tfl-go]'); if (fb) { fb.classList.add('tm-tap'); setTimeout(() => fb.classList.remove('tm-tap'), 260); }
        send({ t: 'tfc', sel }); return; }
      if (e.pointerType === 'pen') { penDown = false; penUpT = Date.now(); }
      if (sw && e.type === 'pointerup') swipeEnd(e); else if (e.type === 'pointercancel') sw = null;
      if (TP.has(e.pointerId)) { TP.delete(e.pointerId); if (pan) { if (TP.size >= (T.pen ? 2 : 1)) panStart(); else pan = null; return; } }
      if (e.pointerId !== drawId) return; drawId = null;
      if (T.las) { T.las = null; drawInk(); }
      if (er) { if (er.length) { T.undo[kOf()].push({ t: 'rm', L: er }); send({ t: 'bop', key: kOf(), op: 'rm', ks: er.map(x => x.k) }); } er = null; return; }
      const s = T.live; if (!s) return; T.live = null; KB().ink.push(s); T.undo[kOf()].push({ t: 'add', k: s.k }); send({ t: 'bop', key: kOf(), op: 'add', s }); drawInk();
      if (e.pointerType === 'touch') lastTouch = { k: s.k, t: Date.now() };
    };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
  };
  const eraseAt = (x, y, out) => { const L = KB().ink; for (let i = L.length - 1; i >= 0; i--) if (inkHit(L[i], x, y, 14)) { if (!L[i].k) L[i].k = lfcKey(); out.push(L[i]); L.splice(i, 1); } drawInk(); };
  const undo = () => { const k = kOf(); const h = T.undo[k].pop(); if (!h) return; const L = B[k].ink;
    if (h.t === 'add') { B[k].ink = L.filter(x => x.k !== h.k); send({ t: 'bop', key: k, op: 'rm', ks: [h.k] }); }
    else (h.L || []).forEach(s => { L.push(s); send({ t: 'bop', key: k, op: 'add', s }); });
    drawInk(); };
  // ---------- Übersicht aller Folien (von unten) ----------
  const overview = on => {
    OV = on; ovl.hidden = !on; if (!on) { ovl.innerHTML = ''; return; }
    const S = slOk() ? SL.S : null; const n = PR ? PR.n : 0;
    ovl.innerHTML = `<div class="lfc-ovb"><div class="lfc-ovh"><b>Alle Folien</b><button type="button" class="lfc-tb" data-l="overx" aria-label="Schließen">${lfcIc('fsx', 20)}</button></div><div class="lfc-ovg">${Array.from({ length: n }, (_, i) => `<button type="button" class="lfc-ovi${PR && i === PR.i ? ' on' : ''}" data-go="${i}"><div class="lfc-ovt"></div><span>${i + 1}${S && S[i] ? ' · ' + esc(withSh(() => tbStripLab(S[i]))) : ''}</span></button>`).join('')}</div></div>`;
    if (S) ovl.querySelectorAll('.lfc-ovt').forEach((h, i) => slPaint(h, i, h.clientWidth || 220, 99));
    const on0 = ovl.querySelector('.lfc-ovi.on'); if (on0) on0.scrollIntoView({ block: 'center' });
  };
  // ---------- Menü „⋯“ (Blatt von unten) ----------
  // Auswahlliste (z. B. Arbeitsform) als Blatt
  let PICK = null;
  const sheetPick = (opts, cur, cb) => { PICK = cb; SHEET = 'pick'; shEl.hidden = false; shEl.innerHTML = `<div class="lfc-shs" role="menu">${opts.map(([v, l]) => `<button type="button" data-pick="${esc(v)}" role="menuitemradio" aria-checked="${v === cur}"${v === cur ? ' class="strong"' : ''}><span>${esc(l)}</span></button>`).join('')}</div>`; };
  shEl.addEventListener('click', e => { const p = e.target.closest('[data-pick]'); if (!p || !PICK) return; e.stopPropagation(); const cb = PICK; PICK = null; sheet(''); cb(p.dataset.pick); }, true);
  const sheet = kind => {
    SHEET = kind || ''; shEl.hidden = !kind; if (!kind) { shEl.innerHTML = ''; return; }
    const it = (attr, label, cls) => `<button type="button" ${attr}${cls ? ` class="${cls}"` : ''} role="menuitem"><span>${label}</span></button>`;
    let g1 = '';
    if (kind === 'tmm') g1 = (PR.tm ? `<div class="lfc-shh">Werkzeug dazunehmen</div><div class="lfc-tmg">${Object.entries(TW_KINDS).map(([k, x]) => `<button type="button" data-tmc='[data-tadd="${k}"]'><i>${x.ic}</i><span>${esc(x.t)}</span></button>`).join('')}</div>
        <div class="lfc-shh">Hintergrund</div><div class="lfc-tmg bg">${Object.entries(TB_BG).map(([k, x]) => `<button type="button" data-tmc='[data-tbg="${k}"]'><i style="background:${esc(x.c)}"></i><span>${esc(x.l)}</span></button>`).join('')}</div>`
        + it(`data-tmc='[data-tdef]'`, 'Standard-Werkzeuge') + it(`data-tmc='[data-tclear]'`, 'Alle Werkzeuge entfernen', 'red') : '') + it('data-nav="mode"', PR.tm ? 'Zur Folienansicht wechseln' : 'Tafelansicht einschalten');
    else if (kind === 'tpls') g1 = it('data-l="menu"', '‹ Zurück') + Object.entries(INK_TPLS).map(([p, t]) => it(`data-pat="${p}"`, t.l, B.tafel.pat === p ? 'strong' : '')).join('');
    else {
      g1 = (tab === 'fol' ? it('data-nav="black"', PR.bl ? 'Beamer wieder an' : 'Beamer schwarz schalten') + it('data-nav="mode"', PR.tm ? 'Am Beamer: Folienansicht' : 'Am Beamer: Tafelansicht') + (PR.tm ? it('data-l="tmm"', 'Werkzeuge der Tafelansicht …') : '') + it('data-l="over"', 'Alle Folien') : '')
        + (PR.board ? it('data-l="boardoff"', PR.board === 'pk' ? 'Pro/Contra am Beamer schließen' : 'Tafel am Beamer schließen') : '')
        + (tab === 'tafel' ? Object.entries(INK_PATS).map(([p, l]) => `<button type="button" data-pat="${p}" role="menuitem"><span class="lfc-patv pat-${p}"></span><span>Hintergrund: ${l}</span></button>`).join('') + it('data-l="tpls"', 'Vorlagen …') : '')
        + (drawTab() ? `<div class="lfc-shw"><span>Strichstärke</span>${Object.entries(INK_W).map(([k, w]) => `<button type="button" data-w="${k}" aria-pressed="${T.w === k}" aria-label="Stärke"><i style="width:${w + 4}px;height:${w + 4}px"></i></button>`).join('')}</div>` : '')
        + (drawTab() ? it('data-l="clr"', tab === 'fol' ? 'Alles auf dieser Folie löschen' : (tab === 'pk' ? 'Pro/Contra-Tafel' : 'Tafel') + ' leeren', 'red') : '')
        + (fsCan() ? it('data-l="fs"', fsEl() ? 'Vollbild beenden' : 'Vollbild') : '');
    }
    shEl.innerHTML = `<div class="lfc-scrim" data-l="nomenu"></div><div class="cam-sheet lfc-shs" role="menu"><div class="cam-sg">${g1}</div><div class="cam-sg">${it('data-l="nomenu"', 'Fertig', 'strong')}</div></div>`;
  };
  // ---------- Kopfzeile im Fokus kurz zeigen, dann ausblenden ----------
  const topShow = () => { root.classList.remove('idle'); topIdle(); };
  const topIdle = () => { clearTimeout(idleT); if (tab !== 'fol' || REF || !live()) { root.classList.remove('idle'); return; } idleT = setTimeout(() => { if (!SHEET && !OV) root.classList.add('idle'); }, 3200); };
  const renderCam = () => { main.innerHTML = '<div class="lfc-camh"></div>'; if (cam) cam.destroy(); cam = camInit(PR.sheet, { host: main.querySelector('.lfc-camh') }); cam.sheet = PR.sheet; };
  const renderWait = () => { main.innerHTML = `<div class="cam-empty lfc-wait">${lfcIc('wait', 64)}<b>Warte auf die Präsentation</b><span>Starte am Rechner „Präsentieren“. Dieses Gerät verbindet sich dann von selbst – mit deinem Konto, ohne QR-Code.</span></div>`; };
  const render = () => {
    if (cam && (tab !== 'cam' || !live())) { cam.destroy(); cam = null; }
    if (!modes().some(t => t[0] === tab)) tab = 'fol';
    if (tab !== 'fol' && T.tool === 'nav') T.tool = T.btool;
    root.dataset.mode = tab; root.classList.toggle('ref-on', REF && tab === 'fol'); root.classList.toggle('tfull', TFULL && (tab === 'tafel' || tab === 'pk')); renderTop(); renderMain(); topIdle();
  };
  root.addEventListener('pointerdown', e => { const pb = e.target.closest && e.target.closest('.lfc-palb'); if (pb && pb.classList.contains('sunk')) { e.preventDefault(); e.stopPropagation(); sink(false); sinkSoon(5000); pb.dataset.eat = '1'; } }, { capture: true });
  root.addEventListener('click', e => {
    { const pb = e.target.closest && e.target.closest('.lfc-palb'); if (pb && pb.dataset.eat) { delete pb.dataset.eat; e.stopPropagation(); return; } if (pb) sinkSoon(5000); }
    topIdle();
    const t = e.target.closest('[data-tab]'); if (t) { MODO = false; if (tab !== t.dataset.tab) { tab = t.dataset.tab; if (tab === 'fol') T.tool = 'nav'; render(); } else { const md = main.querySelector('.lfc-modes'); if (md) md.remove(); const mb = main.querySelector('.lfc-tkm'); if (mb) mb.classList.remove('on'); } return; }
    const tmc = e.target.closest('[data-tmc]'); if (tmc) { send({ t: 'tfc', sel: tmc.dataset.tmc }); if (tmc.closest('.lfc-sh')) sheet(''); return; }
    const go = e.target.closest('[data-go]'); if (go) { overview(false); send({ t: 'nav', a: 'goto', i: +go.dataset.go }); return; }
    const tl0 = e.target.closest('[data-tool]'); if (tl0) { if (T.tool === tl0.dataset.tool && (T.tool === 'pen' || T.tool === 'hl')) { T.w = T.w === 's' ? 'm' : T.w === 'm' ? 'l' : 's'; } T.tool = tl0.dataset.tool; if (T.tool !== 'nav') T.btool = T.tool; palSync(); palRe(); sinkSoon(); main.querySelectorAll('[data-tool]').forEach(x => x.setAttribute('aria-pressed', String(x === tl0))); main.querySelectorAll('[data-col]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.col === (T.col[T.tool] || T.col.pen)))); return; }
    const cl = e.target.closest('[data-col]'); if (cl) { if (T.tool !== 'hl') T.tool = 'pen'; T.btool = T.tool; T.col[T.tool] = cl.dataset.col; palSync(); palRe(); sinkSoon(); main.querySelectorAll('[data-tool]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tool === T.tool))); main.querySelectorAll('[data-col]').forEach(x => x.setAttribute('aria-pressed', String(x === cl))); return; }
    const w = e.target.closest('[data-w]'); if (w) { T.w = w.dataset.w; shEl.querySelectorAll('[data-w]').forEach(x => x.setAttribute('aria-pressed', String(x === w))); return; }
    const pt = e.target.closest('[data-pat]'); if (pt) { sheet(''); B.tafel.pat = pt.dataset.pat; send({ t: 'bpat', pat: pt.dataset.pat }); drawSl(); return; }
    const nv = e.target.closest('[data-nav]'); if (nv) { if (SHEET) sheet(''); nav(nv.dataset.nav); return; }
    const b = e.target.closest('[data-l]'); if (!b) return; const a = b.dataset.l;
    if (a === 'exit') close(true);
    else if (a === 'fs') { sheet(''); const on = !fsEl(); try { localStorage.setItem('abw.camfs', on ? '1' : '0'); } catch {} fsGo(on); }
    else if (a === 'beam') { const on = !boardOn(tab); send({ t: 'board', kind: tab, on }); if (PR) PR.board = on ? tab : ''; renderTop(); fxSync(); }
    else if (a === 'boardoff') { sheet(''); send({ t: 'board', kind: PR.board, on: false }); }
    else if (a === 'undo') undo();
    else if (a === 'modes') { MODO = !MODO; PALO = false; const st = main.querySelector('.lfc-stage'); if (st) { st.querySelectorAll('.lfc-palx, .lfc-palb, .lfc-modes').forEach(x => x.remove()); const old = st.querySelector('.lfc-tk'); if (old) old.outerHTML = pal(); } }
    else if (a === 'pal') { PALO = !PALO; MODO = false; { const md = main.querySelector('.lfc-modes'); if (md) md.remove(); const mb = main.querySelector('.lfc-tkm'); if (mb) { mb.classList.remove('on'); mb.setAttribute('aria-expanded', 'false'); } } const st = main.querySelector('.lfc-stage'); if (st) { const old = st.querySelector('.lfc-tk'), ob = st.querySelector('.lfc-palx'); if (ob) ob.remove(); if (old) old.outerHTML = pal(); } }
    else if (a === 'ref') { REF = !REF; try { localStorage.setItem('abw.lfcref', REF ? '1' : '0'); } catch {} render(); }
    else if (a === 'over') { sheet(''); overview(true); }
    else if (a === 'overx') overview(false);
    else if (a === 'tfull') { TFULL = !TFULL; try { localStorage.setItem('abw.lfctfull', TFULL ? '1' : '0'); } catch {} if (TFULL && fsCan() && !fsEl()) fsGo(true); render(); }
    else if (a === 'more') { KB().h = (KB().h || 900) + 900; KB().sy = Math.min(KB().h - 900, (KB().sy || 0) + 680); T.panT = Date.now(); send({ t: 'bmore', key: kOf() }); setTimeout(() => sendSy(KB().sy), 420); drawSl(); drawInk(); }
    else if (a === 'menu') sheet('menu');
    else if (a === 'tpls') sheet('tpls');
    else if (a === 'tmm') sheet(SHEET === 'tmm' ? '' : 'tmm');
    else if (a === 'nomenu') sheet('');
    else if (a === 'clr') { sheet(''); const k = kOf(); if (!B[k].ink.length || !confirm(tab === 'fol' ? 'Alles löschen, was auf dieser Folie geschrieben wurde? Das sieht man sofort auch am Beamer.' : 'Alles auf dieser Tafel löschen? Das sieht man sofort auch am Beamer.')) return; T.undo[k].push({ t: 'rm', L: B[k].ink.slice() }); send({ t: 'bop', key: k, op: 'clr' }); B[k].ink = []; drawInk(); }
  });
  let rsT = 0; const onRs = () => { clearTimeout(rsT); rsT = setTimeout(() => { if (live() && tab !== 'cam') renderMain(); }, 150); };
  window.addEventListener('resize', onRs);
  // ---------- Live-Kanal ----------
  const takePres = m => {
    const old = PR || {}; const was = live(); PR = m; lastHb = Date.now();
    const panning = Date.now() - T.panT < 900;
    if (m.tafel) { B.tafel.h = m.tafel.h || 900; B.tafel.pat = m.tafel.pat || 'kariert'; if (!panning) B.tafel.sy = m.tafel.sy || 0; }
    if (m.pk) { Object.assign(B.pk, { q: m.pk.q || '', lab: m.pk.lab || ['Pro', 'Contra'], either: !!m.pk.either, h: m.pk.h || 900 }); if (!panning) B.pk.sy = m.pk.sy || 0; }
    if (!was || old.sheet !== m.sheet || old.gp !== m.gp) { if (old.sheet !== m.sheet) { B.tafel.ink = []; B.pk.ink = []; B.sl = { ink: [], h: 900, sy: 0, i: -1 }; T.undo = { sl: [], tafel: [], pk: [] }; send({ t: 'hi' }); } render(); return; }
    renderTop();
    if (tab === 'fol' && (old.i !== m.i || old.board !== m.board || old.bl !== m.bl || old.cur !== m.cur || old.up !== m.up || old.tm !== m.tm || old.yt !== m.yt)) { if (!T.live) renderMain(); if (OV) overview(true); }
    if ((tab === 'tafel' || tab === 'pk') && !T.live) { drawSl(); drawInk(); }
    if (tab !== 'fol' && tab !== 'cam' && old.bl !== m.bl && !T.live) renderMain(); else if (tab !== 'fol' && tab !== 'cam' && old.board !== m.board) fxSync();
    if (tab === 'fol' && old.ytbig !== m.ytbig && !T.live) renderMain();
  };
  offs.push(fotoListen(m => {
    if (m.t === 'pres') takePres(m);
    else if (m.t === 'presend') { lastHb = 0; if (!page) { close(false); toast('Die Präsentation wurde beendet.'); } else render(); }
    else if (m.t === 'tfl') { const had = !!TF; const wasTm = PR && PR.tm; TF = m.off ? null : m; if (tab === 'fol' && live()) { if (!TF || !had || !tflUpd()) drawSl(); } if (!!TF !== !!had) renderTop(); }
    else if (m.t === 'bfull' && m.key === 'sl' && Array.isArray(m.ink)) { if (PR && (m.i == null || m.i === PR.i)) { B.sl = { ink: merge('sl', m.ink), h: 900, sy: 0, i: PR.i }; if (tab === 'fol' && !T.live) drawInk(); } }
    else if (m.t === 'bfull' && B[m.key] && Array.isArray(m.ink)) { B[m.key].ink = merge(m.key, m.ink); if (tab === m.key && !T.live) drawInk(); }
  }));
  const hbChk = setInterval(() => { if (PR && !live() && main.querySelector('.lfc-stage, .lfc-camh')) render(); }, 3000);
  const hello = setInterval(() => { if (!live()) send({ t: 'hi' }); }, 6000);
  const ping = setInterval(() => { if (live()) send({ t: 'ping' }); }, 20000);
  send({ t: 'hi' }); render();
  function close(manual) { clearInterval(hbChk); clearInterval(hello); clearInterval(ping); clearTimeout(idleT); offs.forEach(f => f()); if (cam) cam.destroy(); wake(); ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.removeEventListener(ev, onFs)); window.removeEventListener('resize', onRs);
    if (page) { location.href = location.pathname; return; }
    root.remove(); document.body.classList.remove('lfc-on'); if (fsEl()) fsGo(false); if (manual && PR) lfcBan.skip = PR.sid; }
  return { close };
}
// Hinweis im normalen LehrWerk: „Präsentation läuft – als Tafel verbinden“
const lfcBan = { el: null, skip: '', last: null, t: 0 };
// Seite „LehrWerk Tafel“ (…/?tafel): ohne Manifest, damit „Zum Home-Bildschirm“ genau diese Adresse speichert
function lfcPage() {
  document.body.classList.add('cam-mode');
  const add = (tag, at) => { const n = document.createElement(tag); Object.entries(at).forEach(([k, v]) => n.setAttribute(k, v)); document.head.appendChild(n); };
  try { const vp = document.querySelector('meta[name="viewport"]'); if (vp) vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'; } catch {}
  add('link', { rel: 'apple-touch-icon', href: 'icons/apple-touch-icon.png' }); add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }); add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-title', content: 'LehrWerk Tafel' }); add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }); add('meta', { name: 'theme-color', content: '#1c1c1e' }); document.title = 'LehrWerk Tafel';
  const go = setInterval(() => { if (store.user && fotoOK()) { clearInterval(go); lfcStart({ page: true }); } else if (store.sb && !store.user && !state.dlg) openDlg('login'); }, 500);
}
function lfcWatch() {
  let on = false;
  const hide = () => { if (lfcBan.el) { lfcBan.el.remove(); lfcBan.el = null; } };
  const show = m => {
    if (lfcBan.el) { lfcBan.el.querySelector('b').textContent = m.title || 'Präsentation'; return; }
    lfcBan.el = el(`<div id="lfc-ban" role="status"><span class="lfc-bi">${lfcIc('tafel', 22)}</span><span class="lfc-bt"><small>Präsentation läuft</small><b></b></span><button type="button" class="lfc-bgo">Als Tafel verbinden</button><button type="button" class="lfc-bx" aria-label="Ausblenden">×</button></div>`);
    lfcBan.el.querySelector('b').textContent = m.title || 'Präsentation'; document.body.appendChild(lfcBan.el);
    lfcBan.el.querySelector('.lfc-bgo').onclick = () => { const p = lfcBan.last; hide(); lfcStart({ pres: p }); };
    lfcBan.el.querySelector('.lfc-bx').onclick = () => { lfcBan.skip = (lfcBan.last || {}).sid || ''; hide(); };
  };
  const tick = setInterval(() => {
    if (on || !fotoOK()) return; on = true; clearInterval(tick);
    fotoListen(m => {
      if (m.t === 'pres') { lfcBan.last = m; clearTimeout(lfcBan.t); lfcBan.t = setTimeout(hide, 15000);
        if (document.querySelector('.pr') || document.getElementById('lfc-root') || m.sid === lfcBan.skip) { hide(); return; } show(m); }
      else if (m.t === 'presend') { clearTimeout(lfcBan.t); hide(); }
    });
    fotoSend({ t: 'hi' });
  }, 1500);
}

