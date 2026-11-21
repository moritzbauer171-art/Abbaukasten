/* ---------- Liste, Reiter ---------- */
function sortLib() { state.lib.sort((a, b) => b.updatedAt - a.updatedAt); }
function upsertLib(e) { const i = state.lib.findIndex(d => d.id === e.id); if (i >= 0) state.lib[i] = e; else state.lib.push(e); sortLib(); renderTabs(); if (state.libOpen) renderLib(); }
async function refreshLib() { if (!backend) return; state.lib = await backend.list(); sortLib(); renderTabs(); if (state.libOpen) renderLib(); }
function nextNr(k) { let m = 0; state.lib.forEach(d => { if (d.klasse !== k) return; const n = parseInt(d.nr, 10); if (n > m) m = n; }); return m ? String(m + 1) : ''; }
function setKlColor() {
  const k = KL(state.klasse); const a = ACCENTS[k.accent] || ACCENTS.tinte; const r = document.documentElement.style;
  r.setProperty('--kl', a.c); r.setProperty('--kl-l', a.c); r.setProperty('--kl-t', a.t); r.setProperty('--kl-hi', mixHex(a.c, .45)); r.setProperty('--kl-dk', '#' + [1, 3, 5].map(i => Math.round(parseInt(a.c.slice(i, i + 2), 16) * .28 + 30 * .72).toString(16).padStart(2, '0')).join(''));
  const dark = matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light' || document.documentElement.dataset.theme === 'dark';
  if (dark) { r.setProperty('--kl-l', mixHex(a.c, .45)); r.setProperty('--kl-t', 'var(--kl-dk)'); }
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.sheet) setKlColor(); }); } catch {}
const LS_FACHKL = 'abw.fachkl';
const FACH_DOT = { deutsch: '#2741B5', gp: '#7A4E1D', bio: '#2E6B3A', en: '#9B2335', es: '#B4530C', fr: '#1F5FA8', la: '#6B4E9B', ma: '#0E7490', inf: '#334155', ph: '#1D4ED8', ch: '#B45309', nawi: '#15803D', su: '#65A30D', geo: '#0F766E', pb: '#BE123C', gewi: '#9A3412', wat: '#4D7C0F', eth: '#7C3AED', phil: '#5B21B6', reli: '#A16207', ku: '#DB2777', mu: '#C026D3', sp: '#EA580C', th: '#9F1239' };
const FACH_ORDER = ['deutsch', 'ma', 'en', 'fr', 'es', 'la', 'gp', 'geo', 'pb', 'gewi', 'eth', 'phil', 'reli', 'bio', 'ph', 'ch', 'nawi', 'su', 'inf', 'wat', 'ku', 'mu', 'sp', 'th'];
let fachAddOpen = false;
function fachPopHTML() {
  const cur = fachKey(state.klasse); const mine = FACH_ORDER.filter(k => KLASSEN.some(x => x.fach === k)); const rest = FACH_ORDER.filter(k => !mine.includes(k));
  const row = k => { const n = KLASSEN.filter(x => x.fach === k).length; return `<button type="button" class="fp-i" data-fach="${k}" aria-pressed="${k === cur}"><i style="background:${FACH_DOT[k] || '#64748B'}"></i><b>${esc(FAECHER[k].label)}</b><small>${n + (n === 1 ? ' Klasse' : ' Klassen')}</small></button>`; };
  return `<div class="fp-h">Fach wechseln</div>${mine.map(row).join('')}<div class="fp-sep"></div>
    <button type="button" class="fp-i fp-add" data-fach-act="add" aria-expanded="${fachAddOpen}"><b>+ Fach hinzufügen</b></button>
    ${fachAddOpen ? `<div class="fp-addl">${rest.map(k => `<button type="button" class="fp-i fp-new" data-fach="${k}"><i style="background:${FACH_DOT[k] || '#64748B'}"></i><b>${esc(FAECHER[k].label)}</b><small>Klasse anlegen</small></button>`).join('')}</div>` : ''}
    <button type="button" class="fp-i fp-kl" data-fach-act="klassen">Klassen und Fächer verwalten …</button>`;
}
function toggleFachPop(open) {
  const p = $('#fach-pop'), b = $('#btn-fach'); if (!p) return;
  const on = open === undefined ? p.hidden : open;
  if (on) { if (open === undefined || open === true) fachAddOpen = fachAddOpen && !p.hidden; p.innerHTML = fachPopHTML(); const br = b.getBoundingClientRect(), pr = p.parentElement.getBoundingClientRect(); const w = Math.min(310, window.innerWidth - 24); p.style.left = Math.max(8 - pr.left, Math.min(br.left - pr.left, window.innerWidth - 12 - w - pr.left)) + 'px'; p.style.width = w + 'px'; }
  p.hidden = !on; b.setAttribute('aria-expanded', String(on));
  if (on) { const f = p.querySelector('[aria-pressed="true"]') || p.querySelector('.fp-i'); if (f) f.focus(); }
}
function chooseFach(k) {
  toggleFachPop(false);
  if (k === fachKey(state.klasse)) return;
  const list = KLASSEN.filter(x => x.fach === k);
  if (!list.length) { openKlassen(false, k); return; }
  const last = (lsGet(LS_FACHKL) || {})[k];
  switchKlasse((list.find(x => x.id === last) || list[0]).id);
}
function renderTabs() {
  if (hmS.open) setTimeout(homeRender, 0);
  setKlColor(); const fk = fachKey(state.klasse); const bn = document.querySelector('#btn-fach span'); if (bn) bn.textContent = FAECHER[fk].label; document.documentElement.dataset.fach = fk;
  const fm = lsGet(LS_FACHKL) || {}; if (fm[fk] !== state.klasse) { fm[fk] = state.klasse; lsSet(LS_FACHKL, fm); }
  const counts = {}; state.lib.forEach(d => { counts[d.klasse] = (counts[d.klasse] || 0) + 1; });
  $('#reiter').innerHTML = KLASSEN.filter(k => k.fach === fk).map(k => `<button type="button" role="tab" class="rt" data-k="${k.id}" aria-selected="${state.klasse === k.id}"><i style="background:${ACCENTS[k.accent].c}"></i>${esc(k.label)}${counts[k.id] ? `<span>${counts[k.id]}</span>` : ''}</button>`).join('') + `<button type="button" class="rt rt-edit" data-kl="edit" title="Klassen anlegen und bearbeiten" aria-label="Klassen anlegen und bearbeiten"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg><span class="l-long">Klassen</span></button>`;
}

