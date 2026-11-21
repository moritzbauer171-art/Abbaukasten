/* ================= Zustand ================= */
const closedKey = id => 'abw-zu-' + id;
function loadClosed(id) { try { const raw = localStorage.getItem(closedKey(id)); if (raw == null) return null; const a = JSON.parse(raw); return new Set(Array.isArray(a) ? a : []); } catch { return null; } }
const cardIds = () => ['meta', 'seite', ...state.sheet.blocks.filter(b => b.type !== 'pagebreak').map(b => b.id)];
const LS_ONECARD = 'abw.onecard';
const oneCard = () => lsGet(LS_ONECARD) !== 0;
// Standard: nur der Kopf ist offen (mit „Eine Karte offen“), sonst alles offen
const defaultClosed = () => oneCard() ? new Set(cardIds()) : new Set();
// Immer nur eine Karte offen (außer nach „Alle aufklappen“)
function enforceOne() {
  if (state.allOpen || state.out === 'karten' || !oneCard()) return;
  const ids = cardIds(); const open = ids.filter(x => !state.closed.has(x)); if (open.length <= 1) return;
  const keep = open.includes(state.sel) ? state.sel : open[0];
  state.closed = new Set(ids.filter(x => x !== keep));
}
function openOnly(bid) { if (!oneCard()) { state.closed.delete(bid); saveClosed(); return; } state.allOpen = false; state.closed = new Set(cardIds().filter(x => x !== bid)); saveClosed(); }
function saveClosed() { try { const id = state.sheet && state.sheet.id; if (!id) return; localStorage.setItem(closedKey(id), JSON.stringify([...state.closed])); } catch {} }
const state = { libTab: 'mine', shareQuery: '', shared: null, sharedAt: 0, sharedErr: '', shareBusy: null, lvl: 'all', area: 'blatt', areaOut: {}, sheet: null, sel: null, closed: new Set(), fmtOpen: new Set(), taskOpen: new Set(), tbEh: new Set(), out: 'blatt', fassung: 'schueler', grp: 'all', view: 'edit', zoom: 'fit', lib: [], libOpen: false, libQuery: '', confirmDel: null, klasse: 'gk', touched: false, dlg: null, openSnap: null, insAt: null, allOpen: false, wide: false, base: null, conflict: null, prefs: { v: 1, folders: [], place: {}, order: {} }, fNew: false, fEdit: null, fMenu: null, fDel: null, moveOpen: null };
const store = { dl: null, assets: null, sb: null, user: null };
let backend = null, backendToken = 0;
// Darstellung: standardmäßig hell; dunkel oder „wie das Gerät“ nur auf Wunsch (Einstellungen → Allgemein)
const LS_THEME = 'abw.theme';
const themePref = () => { try { const v = JSON.parse(localStorage.getItem(LS_THEME) || '"light"'); return v === 'dark' || v === 'auto' ? v : 'light'; } catch { return 'light'; } };
function themeApply() { const v = themePref(); if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v; }
themeApply();
const isFramed = (() => { try { return window.top !== window.self; } catch { return true; } })();
// Installierbar als App (Startbildschirm, Vollbild, offline) nur auf der eigenen Online-Seite, nicht in Claude und nicht in der Windows-App
function setupPWA() {
  if (location.protocol !== 'https:' || isFramed || window.claude || !('serviceWorker' in navigator)) return;
  const add = (tag, attrs) => { const n = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); document.head.appendChild(n); };
  add('link', { rel: 'manifest', href: 'manifest.webmanifest' });
  add('link', { rel: 'apple-touch-icon', href: 'icons/apple-touch-icon.png' });
  add('meta', { name: 'theme-color', content: '#2741B5' });
  add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-title', content: 'LehrWerk' });
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(r => { if (r.active) r.active.postMessage({ warm: [...Object.values(LIBS), 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'] }); }).catch(err => console.warn('Offline-Speicher nicht verfügbar', err)));
}
const isNarrow = () => window.matchMedia('(max-width: 899px)').matches;
const canPrint = location.protocol === 'file:' || (!isFramed && !window.claude);

