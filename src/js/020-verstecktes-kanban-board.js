/* ================= Verstecktes Kanban-Board (Doppelklick aufs Logo): Karten und Spalten per Drag & Drop, im Konto gespeichert ================= */
const KB_COLS = { grau: '#9AA1AE', blau: '#2F6FDB', gruen: '#1E9E5A', gelb: '#F5B400', orange: '#F08C00', rot: '#E5484D', lila: '#8E4EC6' };
const KB_EMO = ['💡', '📝', '🔨', '✅', '📚', '🗓️', '🧪', '✉️', '🎯', '⏳', '🔥', '🧭'];
const KB_DEF = () => ({ cols: [{ id: 'c' + uid(), t: 'Ideen', e: '💡', cards: [] }, { id: 'c' + uid(), t: 'To do', e: '📝', cards: [] }, { id: 'c' + uid(), t: 'In Arbeit', e: '🔨', cards: [] }, { id: 'c' + uid(), t: 'Erledigt', e: '✅', done: true, cards: [] }] });
const kbIsDone = c => !!c.done || /^(erledigt|fertig|done|geschafft)\b/i.test(c.t || '');
function kbNorm(k) {
  if (!k || !Array.isArray(k.cols)) return null;
  const okD = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
  const cols = k.cols.filter(c => c && typeof c === 'object').slice(0, 12).map(c => ({ id: String(c.id || 'c' + uid()).slice(0, 40), t: String(c.t || '').slice(0, 60), ...(KB_EMO.includes(c.e) ? { e: c.e } : {}), ...(c.done ? { done: true } : {}), ...(+c.lim > 0 ? { lim: Math.min(50, Math.round(+c.lim)) } : {}),
    cards: (Array.isArray(c.cards) ? c.cards : []).filter(x => x && typeof x === 'object').slice(0, 300).map(x => ({ id: String(x.id || 'k' + uid()).slice(0, 40), t: String(x.t || '').slice(0, 2000),
      ...(KB_COLS[x.c] && x.c !== 'grau' ? { c: x.c } : {}), ...(okD(x.d) ? { d: x.d } : {}), ...(x.lk ? { lk: String(x.lk).slice(0, 60) } : {}), ...(+x.fin > 0 ? { fin: +x.fin } : {}),
      ...(Array.isArray(x.cm) && x.cm.length ? { cm: x.cm.filter(m => m && m.t).slice(-200).map(m => ({ id: String(m.id || 'm' + uid()).slice(0, 40), t: String(m.t).slice(0, 2000), ts: +m.ts || Date.now() })) } : {}),
      ...(Array.isArray(x.ln) && x.ln.length ? { ln: x.ln.filter(l => l && /^https?:\/\//i.test(l.u || '')).slice(0, 30).map(l => ({ u: String(l.u).slice(0, 1000), ...(l.t ? { t: String(l.t).slice(0, 120) } : {}) })) } : {}) })) }));
  return cols.length ? { cols } : null;
}
// Datum aus Freitext: heute, morgen, übermorgen, Mo–So / Montag–Sonntag, „nächste Woche“, 24.11. oder 24.11.2026
const KB_WD = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];
const kbIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function kbParse(raw) {
  let t = ' ' + raw + ' ', d = null, c = null; const now = new Date(); now.setHours(12, 0, 0, 0);
  const add = n => { const x = new Date(now); x.setDate(x.getDate() + n); return x; };
  const take = (re, fn) => { const m = t.match(re); if (m) { const r = fn(m); if (r) { d = r; t = t.replace(m[0], ' '); } } };
  take(/\s(übermorgen)\s/i, () => add(2)); if (!d) take(/\s(morgen)\s/i, () => add(1)); if (!d) take(/\s(heute)\s/i, () => add(0));
  if (!d) take(/\s(nächste|kommende)\s+woche\s/i, () => { const x = add(1); while (x.getDay() !== 1) x.setDate(x.getDate() + 1); return x; });
  if (!d) take(/\s(?:bis\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?\s/, m => { let y = m[3] ? +m[3] : now.getFullYear(); if (y < 100) y += 2000; const x = new Date(y, +m[2] - 1, +m[1], 12); if (isNaN(x)) return null; if (!m[3] && x < add(-30)) x.setFullYear(y + 1); return x; });
  if (!d) take(/\s(?:bis\s+|am\s+|nächsten\s+|kommenden\s+)?(mo|di|mi|do|fr|sa|so)(?:ntag|nstag|ttwoch|nnerstag|eitag|mstag|nnabend)?\.?\s/i, m => { const w = KB_WD.indexOf(m[1].toLowerCase()); const x = add(1); while (x.getDay() !== w) x.setDate(x.getDate() + 1); return x; });
  const pm = t.match(/\s(!{1,3})\s/); if (pm) { c = pm[1].length >= 2 ? 'rot' : 'orange'; t = t.replace(pm[0], ' '); }
  return { t: t.replace(/\s+/g, ' ').trim(), d: d ? kbIso(d) : null, c };
}
// Links im Text klickbar machen (nach esc(), daher ohne < > " im Link)
const kbLinkify = s => s.replace(/(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/gi, u => `<a class="kb-url" href="${u}" target="_blank" rel="noopener noreferrer" title="${u}">${u.replace(/^https?:\/\/(www\.)?/i, '').slice(0, 42)}${u.replace(/^https?:\/\/(www\.)?/i, '').length > 42 ? '…' : ''}</a>`);
const kbHost = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const kbWhen = ts => { const d = new Date(ts), n = new Date(); const t = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); return d.toDateString() === n.toDateString() ? 'heute, ' + t : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }) + ', ' + t; };
const kbTagCol = s => { let h = 0; for (const ch of s.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
function kbDue(d, done) {
  if (!d) return ''; const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d + 'T00:00:00'); const n = Math.round((x - t) / 864e5);
  const dm = `${x.getDate()}.${x.getMonth() + 1}.`; const wd = x.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
  const [cls, txt] = done ? ['ok', dm] : n < 0 ? ['late', n === -1 ? 'gestern' : 'überfällig · ' + dm] : n === 0 ? ['today', 'heute'] : n === 1 ? ['soon', 'morgen'] : n < 7 ? ['soon', wd + ' ' + dm] : ['', dm];
  return `<span class="kb-due ${cls}" title="Fällig am ${x.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}">🗓 ${txt}</span>`;
}
function kbConfetti(x, y) {
  const cv = document.createElement('canvas'); cv.className = 'kb-conf'; const W = cv.width = innerWidth, H = cv.height = innerHeight; document.body.appendChild(cv); const g = cv.getContext('2d');
  const cols = ['#2F6FDB', '#1E9E5A', '#F5B400', '#E5484D', '#8E4EC6', '#F08C00']; const P = Array.from({ length: 90 }, () => ({ x, y, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 11 - 3, r: Math.random() * 6.28, s: 4 + Math.random() * 5, c: cols[Math.floor(Math.random() * cols.length)] }));
  const t0 = performance.now(); const step = t => { const dt = t - t0; g.clearRect(0, 0, W, H); P.forEach(p => { p.vy += 0.35; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += 0.2; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - dt / 1400); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); }); if (dt < 1400) requestAnimationFrame(step); else cv.remove(); };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(step); else cv.remove();
}
function openKanban() {
  if (document.querySelector('.kb-ov')) return;
  if (!state.prefs.kanban) state.prefs.kanban = KB_DEF();
  const K = state.prefs.kanban; let edit = null, undoT = 0, q = '', flash = null;
  K.cols.forEach((c, i) => { if (!c.e) c.e = KB_EMO[[0, 1, 2, 3][i] ?? 4]; if (kbIsDone(c) && !c.done) c.done = true; });
  const ov = el(`<div class="kb-ov" role="dialog" aria-modal="true" aria-label="Kanban-Board" tabindex="-1">
    <div class="kb-top"><b class="kb-logo">Kanban</b><span class="kb-stats"></span>
      <label class="kb-quick"><span aria-hidden="true">＋</span><input type="text" placeholder="Neue Aufgabe … z. B. „Klausur 10b korrigieren #korrektur Freitag !“" aria-label="Neue Aufgabe" maxlength="400"></label>
      <label class="kb-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Suchen oder #Tag" aria-label="Karten durchsuchen"></label>
      <button type="button" class="kb-sbtn" data-kb="srch" aria-label="Suchen" title="Suchen">⌕</button><button type="button" class="kb-x" data-kb="close" aria-label="Schließen" title="Schließen (Esc)">×</button></div>
    <div class="kb-tabs" role="tablist" aria-label="Spalten"></div><div class="kb-tags"></div><div class="kb-board"></div><div class="kb-undo" hidden></div>
    <div class="kb-help">Ziehen zum Verschieben · Klick öffnet die Karte mit Links und Kommentaren · <b>#tag</b>, <b>morgen</b>, <b>Fr</b>, <b>24.11.</b>, <b>!</b> beim Anlegen · <b>[ ]</b> am Zeilenanfang wird zur Checkliste · N neue Karte · / suchen</div></div>`);
  document.body.appendChild(ov); const board = ov.querySelector('.kb-board'), qIn = ov.querySelector('.kb-quick input'), sIn = ov.querySelector('.kb-search input');
  if (matchMedia('(max-width:700px)').matches) qIn.placeholder = 'Neue Aufgabe … #tag morgen !';
  const save = () => { state.prefs.kanban = K; savePrefs(); };
  const colOf = id => K.cols.find(c => c.id === id);
  const findCard = id => { for (const c of K.cols) { const i = c.cards.findIndex(x => x.id === id); if (i >= 0) return { c, i, x: c.cards[i] }; } return null; };
  const lessonOf = id => state.lib.find(d => d.id === id);
  const textHTML = x => esc(x.t).split('\n').map((ln, i) => {
    const m = ln.match(/^\s*(?:[-*]\s*)?\[( |x|X)\]\s?(.*)$/);
    const tagd = s => kbLinkify(s).replace(/(^|\s)#([\p{L}\d][\p{L}\d_-]{0,30})/gu, (a, sp, tg) => `${sp}<span class="kb-tag" data-tag="${tg.toLowerCase()}" style="--th:${kbTagCol(tg)}">#${tg}</span>`);
    return m ? `<label class="kb-chk${m[1] !== ' ' ? ' on' : ''}" data-li="${i}"><i aria-hidden="true"></i><span>${tagd(m[2])}</span></label>` : `<span class="kb-ln">${tagd(ln) || '&nbsp;'}</span>`;
  }).join('');
  const cardHTML = (x, col) => {
    const lines = x.t.split('\n'); const ch = lines.filter(l => /^\s*(?:[-*]\s*)?\[( |x|X)\]/.test(l)); const chd = ch.filter(l => /\[(x|X)\]/.test(l)).length; const L = x.lk && lessonOf(x.lk);
    const meta = [kbDue(x.d, kbIsDone(col)), x.ln && x.ln.length ? `<span class="kb-cnt" title="Links">🔗 ${x.ln.length}</span>` : '', x.cm && x.cm.length ? `<span class="kb-cnt" title="Kommentare">💬 ${x.cm.length}</span>` : '', ch.length ? `<span class="kb-cl${chd === ch.length ? ' full' : ''}" title="Checkliste">☑ ${chd}/${ch.length}</span>` : '', L ? `<button type="button" class="kb-lk" data-kb="lesson" title="Stunde öffnen: ${esc(L.title || '')}">📄 ${esc((L.title || 'Stunde').slice(0, 34))}</button>` : '', x.fin && kbIsDone(col) ? `<span class="kb-fin">✓ ${new Date(x.fin).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })}</span>` : ''].filter(Boolean).join('');
    return `<div class="kb-card${flash === x.id ? ' kb-pop' : ''}${kbIsDone(col) ? ' kb-dn' : ''}" data-card="${x.id}" style="--kc:${KB_COLS[x.c] || 'transparent'}" tabindex="0"><div class="kb-ct">${x.t ? textHTML(x) : '<i class="kb-empty">Leer</i>'}</div>${meta ? `<div class="kb-meta">${meta}</div>` : ''}<button type="button" class="kb-del" data-kb="del" aria-label="Karte löschen" title="Löschen">×</button></div>`;
  };
  const match = x => { if (!q) return true; const L = x.lk && lessonOf(x.lk); const hay = (x.t + ' ' + (L ? L.title : '')).toLowerCase(); return q.split(/\s+/).every(w => (w.startsWith('#') ? new RegExp('(^|\\s)' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\b|$)', 'iu').test(x.t) : hay.includes(w))); };
  const stats = () => { const all = K.cols.flatMap(c => c.cards.map(x => ({ x, done: kbIsDone(c) }))); const open = all.filter(a => !a.done); const t = kbIso(new Date());
    const late = open.filter(a => a.x.d && a.x.d < t).length, today = open.filter(a => a.x.d === t).length; const wk = all.filter(a => a.done && a.x.fin && Date.now() - a.x.fin < 7 * 864e5).length;
    ov.querySelector('.kb-stats').innerHTML = `<span>${open.length} offen</span>${today ? `<span class="today">${today} heute</span>` : ''}${late ? `<span class="late">${late} überfällig</span>` : ''}${wk ? `<span class="ok">${wk} diese Woche erledigt 🎉</span>` : ''}`;
    const tags = {}; all.forEach(a => (a.x.t.match(/(^|\s)#([\p{L}\d][\p{L}\d_-]{0,30})/gu) || []).forEach(m => { const tg = m.trim().slice(1).toLowerCase(); tags[tg] = (tags[tg] || 0) + 1; }));
    const tb = ov.querySelector('.kb-tags'); const ks = Object.keys(tags).sort(); tb.hidden = !ks.length;
    tb.innerHTML = ks.map(tg => `<button type="button" class="kb-tag${q.split(/\s+/).includes('#' + tg) ? ' on' : ''}" data-tag="${esc(tg)}" style="--th:${kbTagCol(tg)}">#${esc(tg)} <small>${tags[tg]}</small></button>`).join('') + (q ? '<button type="button" class="kb-clr" data-kb="clrq">Filter aufheben</button>' : '');
  };
  const render = () => {
    const sl = board.scrollLeft; const sc = {}; board.querySelectorAll('.kb-col').forEach(c => { sc[c.dataset.col] = c.querySelector('.kb-list').scrollTop; });
    board.innerHTML = K.cols.map((c, ci) => { const vis = c.cards.filter(match); const wip = c.lim && c.cards.length > c.lim;
      return `<section class="kb-col${c.done ? ' kb-donecol' : ''}" data-col="${c.id}" style="--cc:${['#2F6FDB', '#F08C00', '#8E4EC6', '#1E9E5A', '#E5484D', '#0D9488', '#B45309', '#475569'][ci % 8]}"><header class="kb-ch" title="Ziehen zum Verschieben · Doppelklick zum Umbenennen"><span class="kb-emo">${c.e || '📌'}</span><h3>${esc(c.t) || 'Ohne Titel'}</h3><span class="kb-n${wip ? ' wip' : ''}">${q ? vis.length + '/' : ''}${c.cards.length}</span><button type="button" class="kb-cm" data-kb="cmenu" aria-label="Spalte: Menü">⋯</button></header>
      <div class="kb-list">${vis.map(x => cardHTML(x, c)).join('')}${!c.cards.length ? `<div class="kb-hint">${c.done ? 'Hierher ziehen, was fertig ist 🎉' : (matchMedia('(pointer:coarse)').matches ? 'Noch leer · unten auf „+ Karte“ tippen' : 'Noch leer · Doppelklick für eine Karte')}</div>` : ''}</div><button type="button" class="kb-add" data-kb="add">+ Karte</button></section>`; }).join('') + `<button type="button" class="kb-addcol" data-kb="addcol">+ Spalte</button>`;
    board.scrollLeft = sl; board.querySelectorAll('.kb-col').forEach(c => { if (sc[c.dataset.col]) c.querySelector('.kb-list').scrollTop = sc[c.dataset.col]; });
    flash = null; stats(); tabsR();
  };
  const tabs = ov.querySelector('.kb-tabs'); let tabI = 0;
  const colW = () => { const c = board.querySelector('.kb-col'); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(board).columnGap || 10) : 300; };
  const tabsR = () => { tabs.innerHTML = K.cols.map((c, i) => `<button type="button" role="tab" data-kt="${i}" aria-selected="${i === tabI}" style="--cc:${['#2F6FDB', '#F08C00', '#8E4EC6', '#1E9E5A', '#E5484D', '#0D9488', '#B45309', '#475569'][i % 8]}">${c.e || ''} ${esc(c.t)} <small>${c.cards.length}</small></button>`).join(''); };
  let tabRaf = 0; board.addEventListener('scroll', () => { if (tabRaf) return; tabRaf = requestAnimationFrame(() => { tabRaf = 0; const i = Math.max(0, Math.min(K.cols.length - 1, Math.round(board.scrollLeft / colW()))); if (i !== tabI) { tabI = i; tabs.querySelectorAll('[data-kt]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.kt === i))); const b = tabs.querySelector(`[data-kt="${i}"]`); b && b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }); }, { passive: true });
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-kt]'); if (!b) return; e.stopPropagation(); const c = board.querySelectorAll('.kb-col')[+b.dataset.kt]; if (c) board.scrollTo({ left: c.offsetLeft - board.offsetLeft - parseFloat(getComputedStyle(board).paddingLeft || 0), behavior: 'smooth' }); });
  const undoBar = (msg, fn) => { const u = ov.querySelector('.kb-undo'); u.innerHTML = `<span>${esc(msg)}</span><button type="button">Rückgängig</button>`; u.hidden = false; u.querySelector('button').onclick = () => { fn(); u.hidden = true; save(); render(); }; clearTimeout(undoT); undoT = setTimeout(() => { u.hidden = true; }, 6000); };
  // Bearbeiten direkt in der Karte: Text, Farbe, Fälligkeit, verknüpfte Stunde
  const lessonOpts = sel => { const L = state.lib.slice().sort((a, b) => String(b.updated || '').localeCompare(String(a.updated || ''))).slice(0, 300);
    return `<option value="">– keine Stunde –</option>` + L.map(d => `<option value="${esc(d.id)}"${d.id === sel ? ' selected' : ''}>${esc((d.title || 'Ohne Titel').slice(0, 60))}${d.klasse ? ' · ' + esc(KL(d.klasse).label) : ''}</option>`).join(''); };
  const editCard = (id, fresh) => {
    finishEdit(); const f = findCard(id); if (!f) return; const cEl = board.querySelector(`[data-card="${id}"]`); if (!cEl) return;
    edit = { id, fresh, old: { ...f.x } };
    cEl.classList.add('ed'); cEl.innerHTML = `<textarea class="kb-ta" rows="2" aria-label="Text der Karte" placeholder="Was ist zu tun? #tag · [ ] Checkliste">${esc(f.x.t)}</textarea>
      <div class="kb-eb">${Object.entries(KB_COLS).map(([k, c]) => `<button type="button" class="kb-dot" data-kb="color" data-v="${k}" style="--dc:${c}" aria-pressed="${(f.x.c || 'grau') === k}" aria-label="Farbe ${k}"></button>`).join('')}</div>
      <div class="kb-eb kb-ed2"><span class="kb-lab">Fällig</span><button type="button" class="kb-chip" data-kb="due" data-v="0">heute</button><button type="button" class="kb-chip" data-kb="due" data-v="1">morgen</button><button type="button" class="kb-chip" data-kb="due" data-v="7">+1 Woche</button><input type="date" class="kb-date" value="${f.x.d || ''}" aria-label="Fällig am">${f.x.d ? '<button type="button" class="kb-chip" data-kb="due" data-v="x" title="Datum entfernen">×</button>' : ''}</div>
      ${state.lib.length ? `<div class="kb-eb"><span class="kb-lab">Stunde</span><select class="kb-sel" aria-label="Verknüpfte Stunde">${lessonOpts(f.x.lk)}</select></div>` : ''}
      <div class="kb-eb"><span class="kb-sp"></span><button type="button" class="kb-ok" data-kb="ok">Fertig</button></div>`;
    const ta = cEl.querySelector('textarea'); const fitTa = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }; fitTa(); ta.addEventListener('input', fitTa); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    cEl.querySelector('.kb-date').addEventListener('change', e => { f.x.d = e.target.value || undefined; if (!f.x.d) delete f.x.d; save(); });
    const se = cEl.querySelector('.kb-sel'); if (se) se.addEventListener('change', e => { if (e.target.value) f.x.lk = e.target.value; else delete f.x.lk; save(); });
  };
  // ---------- Detailansicht: Text, Fälligkeit, Stunde, Links, Kommentare ----------
  let det = null;
  const closeDet = () => { if (!det) return; det.el.remove(); ov.querySelector('.kb-detbg')?.remove(); det = null; save(); render(); };
  const detBody = () => {
    const f = findCard(det.id); if (!f) { closeDet(); return; } const x = f.x;
    const links = (x.ln || []).map((l, i) => `<li><a href="${esc(l.u)}" target="_blank" rel="noopener noreferrer"><b>${esc(l.t || decodeURIComponent(l.u.replace(/^https?:\/\/(www\.)?/i, '')).replace(/\/$/, '').slice(0, 70))}</b><small>${esc(kbHost(l.u))}</small></a><button type="button" class="kb-dx" data-kd="ldel" data-i="${i}" aria-label="Link entfernen">×</button></li>`).join('');
    const cms = (x.cm || []).map(m => `<li data-m="${m.id}"><div class="kb-cmt">${kbLinkify(esc(m.t))}</div><small>${kbWhen(m.ts)}<button type="button" class="kb-dx" data-kd="cdel" aria-label="Kommentar löschen">×</button></small></li>`).join('');
    det.el.querySelector('.kb-dlinks').innerHTML = links || '<li class="kb-dnone">Noch keine Links</li>';
    det.el.querySelector('.kb-dcms').innerHTML = cms || '<li class="kb-dnone">Noch keine Kommentare</li>';
    det.el.querySelectorAll('[data-kd="mv"]').forEach(b => { const ci = K.cols.indexOf(f.c); b.disabled = +b.dataset.v < 0 ? ci <= 0 : ci >= K.cols.length - 1; });
    det.el.querySelector('.kb-dcol').innerHTML = K.cols.map(c => `<option value="${c.id}"${c === f.c ? ' selected' : ''}>${c.e || ''} ${esc(c.t)}</option>`).join('');
    det.el.querySelectorAll('[data-kd="color"]').forEach(b => b.setAttribute('aria-pressed', String((x.c || 'grau') === b.dataset.v)));
    det.el.querySelector('.kb-date').value = x.d || '';
    det.el.style.setProperty('--kc', KB_COLS[x.c] || 'transparent');
  };
  const openDet = id => {
    finishEdit(); if (det) closeDet(); const f = findCard(id); if (!f) return;
    ov.insertAdjacentHTML('beforeend', '<div class="kb-detbg"></div>');
    const el2 = el(`<aside class="kb-det" role="dialog" aria-label="Karte"><div class="kb-dh"><button type="button" class="kb-chip kb-mv" data-kd="mv" data-v="-1" aria-label="Eine Spalte nach links" title="Eine Spalte nach links">‹</button><select class="kb-dcol" aria-label="Spalte"></select><button type="button" class="kb-chip kb-mv" data-kd="mv" data-v="1" aria-label="Eine Spalte nach rechts" title="Eine Spalte nach rechts">›</button><span class="kb-sp"></span><button type="button" class="kb-x" data-kd="close" aria-label="Schließen">×</button></div>
      <textarea class="kb-dta" aria-label="Text der Karte" placeholder="Was ist zu tun? #tag · [ ] Checkliste">${esc(f.x.t)}</textarea>
      <div class="kb-drow">${Object.entries(KB_COLS).map(([k, c]) => `<button type="button" class="kb-dot" data-kd="color" data-v="${k}" style="--dc:${c}" aria-label="Farbe ${k}"></button>`).join('')}</div>
      <div class="kb-drow"><span class="kb-lab">Fällig</span><button type="button" class="kb-chip" data-kd="due" data-v="0">heute</button><button type="button" class="kb-chip" data-kd="due" data-v="1">morgen</button><button type="button" class="kb-chip" data-kd="due" data-v="7">+1 Woche</button><input type="date" class="kb-date" aria-label="Fällig am"><button type="button" class="kb-chip" data-kd="due" data-v="x" title="Ohne Datum">×</button></div>
      ${state.lib.length ? `<div class="kb-drow"><span class="kb-lab">Stunde</span><select class="kb-sel" aria-label="Verknüpfte Stunde">${lessonOpts(f.x.lk)}</select>${f.x.lk ? '<button type="button" class="kb-chip" data-kd="open">öffnen</button>' : ''}</div>` : ''}
      <h4>🔗 Links</h4><ul class="kb-dlinks"></ul>
      <div class="kb-dadd"><input type="url" class="kb-lu" placeholder="Link einfügen, z. B. https://…" aria-label="Link"><input type="text" class="kb-lt" placeholder="Titel (optional)" aria-label="Titel des Links" maxlength="120"><button type="button" class="kb-chip" data-kd="ladd">Hinzufügen</button></div>
      <h4>💬 Kommentare</h4><ul class="kb-dcms"></ul>
      <div class="kb-dadd kb-dcm"><textarea class="kb-cin" rows="2" placeholder="Kommentar schreiben … (Enter senden, Umschalt+Enter neue Zeile)" aria-label="Kommentar"></textarea><button type="button" class="kb-ok" data-kd="cadd">Senden</button></div>
      <div class="kb-dfoot"><button type="button" class="kb-chip dng" data-kd="del">Karte löschen</button></div></aside>`);
    ov.appendChild(el2); det = { id, el: el2 }; detBody();
    const ta = el2.querySelector('.kb-dta'); const fit2 = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 320) + 'px'; }; fit2();
    ta.addEventListener('input', () => { fit2(); const g = findCard(id); if (g) { g.x.t = ta.value; save(); } });
    el2.querySelector('.kb-date').addEventListener('change', e => { const g = findCard(id); if (!g) return; if (e.target.value) g.x.d = e.target.value; else delete g.x.d; save(); });
    const se = el2.querySelector('.kb-sel'); if (se) se.addEventListener('change', e => { const g = findCard(id); if (!g) return; if (e.target.value) g.x.lk = e.target.value; else delete g.x.lk; save(); });
    const moveTo = (to, src) => { const g = findCard(id); if (!g || !to || to === g.c) return; g.c.cards.splice(g.i, 1); to.cards.unshift(g.x); if (kbIsDone(to) && !kbIsDone(g.c)) { g.x.fin = Date.now(); const r = src.getBoundingClientRect(); kbConfetti(r.left + r.width / 2, r.bottom); } else if (!kbIsDone(to)) delete g.x.fin; save(); render(); detBody(); };
    el2.querySelector('.kb-dcol').addEventListener('change', e => moveTo(colOf(e.target.value), e.target));
    el2.querySelectorAll('[data-kd="mv"]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const g = findCard(id); if (!g) return; moveTo(K.cols[K.cols.indexOf(g.c) + +b.dataset.v], b); }));
    const addLink = () => { const g = findCard(id); if (!g) return; let u = el2.querySelector('.kb-lu').value.trim(); const tt = el2.querySelector('.kb-lt').value.trim(); if (!u) return; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { new URL(u); } catch { toast('Das sieht nicht wie ein Link aus.'); return; }
      (g.x.ln = g.x.ln || []).push({ u: u.slice(0, 1000), ...(tt ? { t: tt } : {}) }); el2.querySelector('.kb-lu').value = ''; el2.querySelector('.kb-lt').value = ''; save(); detBody(); el2.querySelector('.kb-lu').focus(); };
    const addCm = () => { const g = findCard(id); const ci = el2.querySelector('.kb-cin'); const v = ci.value.trim(); if (!g || !v) return; (g.x.cm = g.x.cm || []).push({ id: 'm' + uid(), t: v.slice(0, 2000), ts: Date.now() }); ci.value = ''; save(); detBody(); const L = el2.querySelector('.kb-dcms'); L.lastElementChild && L.lastElementChild.scrollIntoView({ block: 'nearest' }); ci.focus(); };
    el2.querySelector('.kb-lu').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } });
    el2.querySelector('.kb-lt').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } });
    el2.querySelector('.kb-lu').addEventListener('paste', () => setTimeout(() => el2.querySelector('.kb-lt').focus(), 0));
    el2.querySelector('.kb-cin').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCm(); } });
    el2.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-kd]'); if (!b) return; const k = b.dataset.kd; const g = findCard(id); if (!g) return;
      if (k === 'close') closeDet();
      else if (k === 'color') { if (b.dataset.v === 'grau') delete g.x.c; else g.x.c = b.dataset.v; save(); detBody(); }
      else if (k === 'due') { if (b.dataset.v === 'x') delete g.x.d; else { const d = new Date(); d.setDate(d.getDate() + +b.dataset.v); g.x.d = kbIso(d); } save(); detBody(); }
      else if (k === 'open') { if (g.x.lk) { const lk = g.x.lk; closeDet(); close(); openById(lk); } }
      else if (k === 'ladd') addLink();
      else if (k === 'cadd') addCm();
      else if (k === 'ldel') { const i = +b.dataset.i; const old = g.x.ln[i]; g.x.ln.splice(i, 1); if (!g.x.ln.length) delete g.x.ln; save(); detBody(); undoBar('Link entfernt', () => { (g.x.ln = g.x.ln || []).splice(i, 0, old); if (det) detBody(); }); }
      else if (k === 'cdel') { const mid = b.closest('[data-m]').dataset.m; const i = g.x.cm.findIndex(m => m.id === mid); const old = g.x.cm[i]; g.x.cm.splice(i, 1); if (!g.x.cm.length) delete g.x.cm; save(); detBody(); undoBar('Kommentar gelöscht', () => { (g.x.cm = g.x.cm || []).splice(i, 0, old); if (det) detBody(); }); }
      else if (k === 'del') { closeDet(); const h = findCard(id); if (!h) return; h.c.cards.splice(h.i, 1); save(); render(); undoBar('Karte gelöscht', () => { const c = colOf(h.c.id) || K.cols[0]; c.cards.splice(Math.min(h.i, c.cards.length), 0, h.x); }); } });
    ov.querySelector('.kb-detbg').addEventListener('click', e => { e.stopPropagation(); closeDet(); });
    if (!f.x.t) ta.focus();
  };
  function finishEdit(cancel) {
    if (!edit) return; const e = edit; edit = null; const f = findCard(e.id); const ta = board.querySelector(`[data-card="${e.id}"] textarea`);
    if (f) { if (cancel) { Object.keys(f.x).forEach(k => delete f.x[k]); Object.assign(f.x, e.old); if (e.fresh && !f.x.t) f.c.cards.splice(f.i, 1); }
      else { const v = ta ? ta.value.replace(/\s+$/, '') : f.x.t; if (!v.trim()) f.c.cards.splice(f.i, 1); else { const p = e.fresh ? kbParse(v) : null; f.x.t = p && !v.includes('\n') ? p.t || v : v; if (p && p.d && !f.x.d) f.x.d = p.d; if (p && p.c && !f.x.c) f.x.c = p.c; } } save(); }
    render();
  }
  const addCard = (colId, top) => { const c = colOf(colId); if (!c) return; finishEdit(); const x = { id: 'k' + uid(), t: '' }; if (top) c.cards.unshift(x); else c.cards.push(x); if (q) { q = ''; sIn.value = ''; } render(); editCard(x.id, true); const L = board.querySelector(`[data-col="${colId}"] .kb-list`); if (L && !top) L.scrollTop = L.scrollHeight; };
  const quickAdd = () => { const v = qIn.value.trim(); if (!v) return; const p = kbParse(v); const col = K.cols.find(c => /^to ?do|^zu tun|^offen/i.test(c.t)) || K.cols.find(c => !kbIsDone(c)) || K.cols[0];
    const x = { id: 'k' + uid(), t: p.t || v, ...(p.d ? { d: p.d } : {}), ...(p.c ? { c: p.c } : {}) }; col.cards.unshift(x); flash = x.id; qIn.value = ''; save(); render(); };
  const renameCol = id => { const c = colOf(id); const h = board.querySelector(`[data-col="${id}"] h3`); if (!c || !h) return; finishEdit();
    h.innerHTML = `<input class="kb-ti" value="${esc(c.t)}" maxlength="60" aria-label="Titel der Spalte">`; const i = h.querySelector('input'); i.focus(); i.select(); let fin = false;
    const done = ok => { if (fin) return; fin = true; if (ok) c.t = i.value.trim() || c.t; save(); render(); }; i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); } }); i.addEventListener('blur', () => done(true)); };
  const colMenu = (id, btn) => {
    ov.querySelectorAll('.kb-menu').forEach(x => x.remove()); const c = colOf(id); if (!c) return; const r = btn.getBoundingClientRect();
    const mn = el(`<div class="kb-menu" role="menu"><div class="kb-emos">${KB_EMO.map(e => `<button type="button" data-kb="m-emo" data-v="${e}" aria-pressed="${c.e === e}">${e}</button>`).join('')}</div><button type="button" data-kb="m-ren">Umbenennen</button><button type="button" data-kb="m-top">Karte oben einfügen</button><button type="button" data-kb="m-done">${c.done ? '✓ ' : ''}Spalte für Erledigtes</button><button type="button" data-kb="m-lim">Limit: ${c.lim ? c.lim + ' Karten' : 'keins'}</button>${c.cards.length ? '<button type="button" data-kb="m-clr">Alle Karten löschen</button>' : ''}<button type="button" data-kb="m-del" class="dng">Spalte löschen</button></div>`);
    mn.style.left = Math.max(8, Math.min(innerWidth - Math.min(260, innerWidth - 24) - 8, r.left - 180)) + 'px'; mn.style.top = (r.bottom + 4) + 'px'; mn.dataset.col = id; ov.appendChild(mn);
  };
  ov.addEventListener('click', e => {
    const t = e.target; const b = t.closest('[data-kb]'); const a = b && b.dataset.kb;
    if (!t.closest('.kb-menu') && !(a === 'cmenu')) ov.querySelectorAll('.kb-menu').forEach(x => x.remove());
    if (a === 'close') { close(); return; }
    if (a === 'srch') { ov.classList.toggle('kb-srch'); if (ov.classList.contains('kb-srch')) sIn.focus(); else { sIn.value = ''; q = ''; render(); } return; }
    if (a === 'ok') { finishEdit(); return; }
    if (a === 'clrq') { q = ''; sIn.value = ''; render(); return; }
    const tg = t.closest('.kb-tag'); if (tg && !t.closest('.kb-card.ed')) { const w = '#' + tg.dataset.tag; const ws = q.split(/\s+/).filter(Boolean); q = (ws.includes(w) ? ws.filter(x => x !== w) : ws.concat(w)).join(' '); sIn.value = q; render(); return; }
    if (a === 'color') { const f = edit && findCard(edit.id); if (f) { if (b.dataset.v === 'grau') delete f.x.c; else f.x.c = b.dataset.v; b.parentNode.querySelectorAll('.kb-dot').forEach(d => d.setAttribute('aria-pressed', String(d === b))); b.closest('.kb-card').style.setProperty('--kc', KB_COLS[f.x.c] || 'transparent'); save(); } return; }
    if (a === 'due') { const f = edit && findCard(edit.id); if (f) { const v = b.dataset.v; if (v === 'x') delete f.x.d; else { const d = new Date(); d.setDate(d.getDate() + +v); f.x.d = kbIso(d); } const di = b.closest('.kb-card').querySelector('.kb-date'); if (di) di.value = f.x.d || ''; save(); } return; }
    if (a === 'lesson') { const id = b.closest('[data-card]').dataset.card; const f = findCard(id); if (f && f.x.lk) { close(); openById(f.x.lk); } return; }
    if (a === 'del') { const id = b.closest('[data-card]').dataset.card; const f = findCard(id); if (!f) return; f.c.cards.splice(f.i, 1); save(); render(); undoBar('Karte gelöscht', () => { const c = colOf(f.c.id) || K.cols[0]; c.cards.splice(Math.min(f.i, c.cards.length), 0, f.x); }); return; }
    if (a === 'add') { addCard(b.closest('[data-col]').dataset.col); return; }
    if (a === 'addcol') { finishEdit(); const c = { id: 'c' + uid(), t: 'Neue Spalte', e: KB_EMO[(K.cols.length + 4) % KB_EMO.length], cards: [] }; K.cols.push(c); save(); render(); board.scrollLeft = board.scrollWidth; renameCol(c.id); return; }
    if (a === 'cmenu') { colMenu(b.closest('[data-col]').dataset.col, b); return; }
    if (a && a.startsWith('m-')) { const mnu = b.closest('.kb-menu'); const id = mnu.dataset.col; const c = colOf(id); if (!c) return;
      if (a === 'm-emo') { c.e = b.dataset.v; save(); render(); mnu.remove(); return; }
      mnu.remove();
      if (a === 'm-ren') renameCol(id);
      else if (a === 'm-top') addCard(id, true);
      else if (a === 'm-done') { c.done = !c.done; save(); render(); }
      else if (a === 'm-lim') { const opts = [0, 3, 5, 8]; c.lim = opts[(opts.indexOf(c.lim || 0) + 1) % opts.length] || undefined; if (!c.lim) delete c.lim; save(); render(); toast(c.lim ? `Limit für „${c.t}“: ${c.lim} Karten` : `Kein Limit für „${c.t}“`); }
      else if (a === 'm-clr') { const old = c.cards.slice(); c.cards = []; save(); render(); undoBar(`${old.length} Karten gelöscht`, () => { c.cards = old.concat(c.cards); }); }
      else if (a === 'm-del') { if (K.cols.length <= 1) { toast('Eine Spalte muss bleiben.'); return; } const i = K.cols.indexOf(c); K.cols.splice(i, 1); save(); render(); undoBar(`Spalte „${c.t}“ gelöscht`, () => K.cols.splice(Math.min(i, K.cols.length), 0, c)); }
      return; }
    if (moved) return;
    const chk = t.closest('.kb-chk'); const card = t.closest('.kb-card');
    if (chk && card && !card.classList.contains('ed')) { const f = findCard(card.dataset.card); if (f) { const L = f.x.t.split('\n'); const i = +chk.dataset.li; L[i] = L[i].replace(/\[( |x|X)\]/, m => (m === '[ ]' ? '[x]' : '[ ]')); f.x.t = L.join('\n'); save(); render(); } return; }
    if (t.closest('a.kb-url')) return;
    if (card && !card.classList.contains('ed')) { openDet(card.dataset.card); return; }
    if (edit && !t.closest('.kb-card.ed')) finishEdit();
  });
  ov.addEventListener('dblclick', e => { const h = e.target.closest('.kb-ch'); if (h && !e.target.closest('button')) renameCol(h.closest('[data-col]').dataset.col); else if (e.target.closest('.kb-list') && !e.target.closest('.kb-card')) addCard(e.target.closest('[data-col]').dataset.col); });
  qIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); quickAdd(); } });
  sIn.addEventListener('input', () => { q = sIn.value.trim().toLowerCase(); render(); });
  const kbKey = e => {
    if (!ov.isConnected) return; if (e.target && e.target.closest && !e.target.closest('.kb-ov') && e.target !== document.body) return;
    const ta = e.target.closest && e.target.closest('.kb-ta'); const inField = e.target.closest && e.target.closest('input, select, textarea');
    if (ta) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const id = edit && edit.id; const f = id && findCard(id); const col = f && f.c.id; finishEdit(); if ((e.ctrlKey || e.metaKey) && col) addCard(col); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finishEdit(true); } return; }
    if (e.key === 'Escape' && ov.querySelector('.kb-det')) { e.preventDefault(); e.stopPropagation(); if (inField && e.target.value && !e.target.classList.contains('kb-dta')) e.target.value = ''; else closeDet(); return; }
    if (ov.querySelector('.kb-det') && inField) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (ov.querySelector('.kb-menu')) ov.querySelectorAll('.kb-menu').forEach(x => x.remove()); else if (inField && e.target.value) { e.target.value = ''; if (e.target === sIn) { q = ''; render(); } } else if (inField) e.target.blur(); else close(); return; }
    if (inField) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); qIn.focus(); return; }
    if (e.key === '/') { e.preventDefault(); sIn.focus(); return; }
    const card = e.target.closest && e.target.closest('.kb-card'); if (card && e.key === 'Enter') { e.preventDefault(); openDet(card.dataset.card); }
    if (card && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); card.querySelector('[data-kb="del"]').click(); }
  };
  document.addEventListener('keydown', kbKey, true);
  // ---------- Ziehen: Karten zwischen Spalten, Spalten untereinander (Maus sofort, Finger nach kurzem Halten) ----------
  let drag = null, moved = false, holdT = 0, pd = null, kbMove, kbUp, kbTm;
  const startDrag = (e, kind, srcEl) => {
    finishEdit(); srcEl = board.querySelector(kind === 'card' ? `[data-card="${srcEl.dataset.card}"]` : `[data-col="${srcEl.dataset.col}"]`) || srcEl; const r = srcEl.getBoundingClientRect();
    const g = srcEl.cloneNode(true); g.classList.add('kb-ghost'); g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; document.body.appendChild(g);
    const ph = document.createElement('div'); ph.className = kind === 'card' ? 'kb-ph' : 'kb-phc'; ph.style.height = r.height + 'px'; if (kind === 'col') ph.style.width = r.width + 'px';
    srcEl.after(ph); srcEl.classList.add('kb-src');
    drag = { kind, el: srcEl, g, ph, dx: e.clientX - r.left, dy: e.clientY - r.top, id: kind === 'card' ? srcEl.dataset.card : srcEl.dataset.col, from: kind === 'card' ? srcEl.closest('[data-col]').dataset.col : null, lx: e.clientX };
    ov.classList.add('kb-dragging'); moveDrag(e);
  };
  const moveDrag = e => {
    const d = drag; const tilt = Math.max(-8, Math.min(8, (e.clientX - d.lx) * 0.6)); d.lx = e.clientX; d.g.style.transform = `translate(${e.clientX - d.dx}px,${e.clientY - d.dy}px) rotate(${(d.kind === 'card' ? 2 : 1) + tilt * 0.4}deg) scale(1.03)`;
    const br = board.getBoundingClientRect(); if (e.clientX > br.right - 60) board.scrollLeft += 14; else if (e.clientX < br.left + 60) board.scrollLeft -= 14;
    if (d.kind === 'card') {
      const cols = [...board.querySelectorAll('.kb-col')]; let col = cols.find(c => { const r = c.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right; });
      if (!col) col = cols.reduce((best, c) => { const r = c.getBoundingClientRect(); const dd = Math.abs(e.clientX - (r.left + r.width / 2)); return !best || dd < best[0] ? [dd, c] : best; }, null)[1];
      cols.forEach(c => c.classList.toggle('kb-over', c === col));
      const list = col.querySelector('.kb-list'); const lr = list.getBoundingClientRect(); if (e.clientY > lr.bottom - 40) list.scrollTop += 10; else if (e.clientY < lr.top + 30) list.scrollTop -= 10;
      const cards = [...list.querySelectorAll('.kb-card:not(.kb-src)')]; const nx = cards.find(c => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
      if (nx) { if (d.ph.nextSibling !== nx) list.insertBefore(d.ph, nx); } else { const hint = list.querySelector('.kb-hint'); if (hint) hint.remove(); if (list.lastElementChild !== d.ph) list.appendChild(d.ph); }
    } else {
      const cols = [...board.querySelectorAll('.kb-col:not(.kb-src)')]; const nx = cols.find(c => { const r = c.getBoundingClientRect(); return e.clientX < r.left + r.width / 2; });
      if (nx) { if (d.ph.nextSibling !== nx) board.insertBefore(d.ph, nx); } else { const add = board.querySelector('.kb-addcol'); if (d.ph.nextSibling !== add) board.insertBefore(d.ph, add); }
    }
  };
  const endDrag = e => {
    const d = drag; drag = null; ov.classList.remove('kb-dragging'); d.g.remove(); board.querySelectorAll('.kb-over').forEach(c => c.classList.remove('kb-over'));
    if (d.kind === 'card') { const f = findCard(d.id); const col = d.ph.closest('[data-col]'); if (f && col) { const to = colOf(col.dataset.col); const vis = [...d.ph.parentNode.children].filter(x => (x.classList.contains('kb-card') && !x.classList.contains('kb-src')) || x === d.ph); const idxVis = vis.indexOf(d.ph);
      const before = vis[idxVis + 1] ? findCard(vis[idxVis + 1].dataset.card) : null; f.c.cards.splice(f.i, 1); let idx = before && before.c === to ? to.cards.indexOf(before.x) : to.cards.length; if (idx < 0) idx = to.cards.length;
      to.cards.splice(idx, 0, f.x); flash = f.x.id; if (kbIsDone(to) && !kbIsDone(f.c)) { f.x.fin = Date.now(); kbConfetti(e ? e.clientX : innerWidth / 2, e ? e.clientY : innerHeight / 2); } else if (!kbIsDone(to)) delete f.x.fin; } }
    else { const i = K.cols.findIndex(c => c.id === d.id); const idx = [...board.children].filter(x => (x.classList.contains('kb-col') && !x.classList.contains('kb-src')) || x === d.ph).indexOf(d.ph); if (i >= 0 && idx >= 0) { const [c] = K.cols.splice(i, 1); K.cols.splice(idx, 0, c); } }
    save(); render();
  };
  board.addEventListener('pointerdown', e => {
    if (e.button > 0 || drag) return; const t = e.target; if (t.closest('button, textarea, input, select, .kb-card.ed, .kb-chk')) return;
    const card = t.closest('.kb-card'), head = t.closest('.kb-ch'); const src = card || (head && head.closest('.kb-col')); if (!src) return;
    moved = false; pd = { x: e.clientX, y: e.clientY, src, kind: card ? 'card' : 'col', id: e.pointerId, touch: e.pointerType !== 'mouse', ready: e.pointerType === 'mouse' };
    if (pd.touch) { clearTimeout(holdT); holdT = setTimeout(() => { if (pd && !drag) { pd.ready = true; navigator.vibrate && navigator.vibrate(15); src.classList.add('kb-hold'); } }, 280); }
  });
  window.addEventListener('pointermove', kbMove = e => {
    if (drag) { e.preventDefault(); moveDrag(e); return; }
    if (!pd || e.pointerId !== pd.id) return; const dist = Math.hypot(e.clientX - pd.x, e.clientY - pd.y);
    if (!pd.ready) { if (dist > 8) { clearTimeout(holdT); pd = null; } return; }
    if (dist > 5) { moved = true; pd.src.classList.remove('kb-hold'); try { board.setPointerCapture(e.pointerId); } catch {} startDrag(e, pd.kind, pd.src); pd = null; }
  }, { passive: false });
  window.addEventListener('pointerup', kbUp = e => { clearTimeout(holdT); if (pd) pd.src.classList.remove('kb-hold'); pd = null; if (drag) { endDrag(e); setTimeout(() => { moved = false; }, 0); } });
  window.addEventListener('pointercancel', kbUp);
  board.addEventListener('touchmove', kbTm = e => { if (drag) e.preventDefault(); }, { passive: false });
  function close() { finishEdit(); document.removeEventListener('keydown', kbKey, true); window.removeEventListener('pointermove', kbMove); window.removeEventListener('pointerup', kbUp); window.removeEventListener('pointercancel', kbUp); ov.classList.add('kb-out'); setTimeout(() => ov.remove(), 180); }
  render(); ov.focus();
}
