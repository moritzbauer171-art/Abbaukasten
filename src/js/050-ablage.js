/* ================= Ablage ================= */
/* Drei Speicherorte mit gleicher Schnittstelle (list, load, save, remove):
   local    – nur dieser Browser (Standard auf GitHub Pages, solange SUPABASE leer ist)
   supabase – Online-Ablage, nach Anmeldung; nur das eigene Konto sieht seine Zeilen
   claude   – Ablage des claude.ai-Kontos, wenn die Seite als Artifact läuft */
const LS = { lib: 'abw.lib', last: 'abw.last', klasse: 'abw.klasse', cur: 'abw.cur', pending: 'abw.pending', skip: 'abw.nologin' };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
const inClaude = !!(window.claude && typeof window.claude.use === 'function');
function localLib() { return lsGet(LS.lib) || {}; }
// Suchtext eines Blatts: alles, wonach man ein Blatt wiederfinden möchte (ohne Formatierungszeichen, höchstens 4000 Zeichen)
function searchText(sh) {
  const out = []; const add = v => { if (v != null && String(v).trim()) out.push(String(v)); };
  const m = sh.meta || {}; add(m.topic); if (m.mode === 'klausur') add(m.exam && m.exam.label);
  if (sh.abs) { add(sh.stunde && sh.stunde.title); sh.abs.forEach(a => { if (a && a.meta) { add(a.meta.title); add(a.meta.topic); } }); }
  [...(sh.blocks || []), ...(sh.abs || []).flatMap(a => (a && a.blocks) || [])].forEach(b => {
    add(b.title); add(b.source); add(b.caption);
    if (b.type === 'tasks') (b.items || []).forEach(it => add(it.text));
    if (['info', 'heading', 'text', 'quote'].includes(b.type)) { add(b.text); add(b.author); }
    if (b.type === 'material') { add(String(b.text || '').slice(0, 400)); (b.glossary || []).forEach(g => add(g.term)); }
    if (b.type === 'table') (b.cols || []).forEach(add);
    if (b.type === 'phrases') (b.groups || []).forEach(g => add(g.head));
    if (b.type === 'match') { if (b.sort) { (b.cats || []).forEach(c => add(c.t)); (b.words || []).forEach(w => add(w.t)); } else (b.pairs || []).forEach(p => { add(p.a); add(p.b); }); }
  });
  return out.join(' ').replace(/[*+=_\\]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 4000);
}
function entryOf(sh) { return { id: sh.id, klasse: KL(sh.klasse).id, title: stTitle(sh), nr: String(stNr(sh)), abs: sh.abs ? sh.abs.length : 1, updatedAt: sh.updatedAt || 0, q: searchText(sh) }; }

const localB = {
  kind: 'local', key: 'local',
  async list() { return Object.values(localLib()).filter(d => d && d.sheet && d.sheet.meta).map(d => ({ ...entryOf(d.sheet), kraw: d.sheet.klasse, updatedAt: d.updatedAt || d.sheet.updatedAt || 0 })); },
  async load(id) { const d = localLib()[id]; return d && d.sheet ? clone(d.sheet) : null; },
  async save(sh) { const lib = localLib(); lib[sh.id] = { updatedAt: sh.updatedAt, sheet: sh }; if (!lsSet(LS.lib, lib)) throw { code: 'quota' }; },
  async remove(id) { const lib = localLib(); delete lib[id]; lsSet(LS.lib, lib); },
  async loadPrefs() { return lsGet(LS_PREF); },
  async savePrefs(p) { if (!lsSet(LS_PREF, p)) throw { code: 'quota' }; }
};
function claudeB(db, id) {
  const col = () => db.collection('data/users/' + id);
  return {
    kind: 'claude', key: 'claude:' + id,
    async list() {
      const snap = await col().get();
      return snap.docs.filter(d => d.exists && d.data() && d.data().sheet).map(d => { const x = d.data(); return { id: d.id, kraw: x.klasse, klasse: KL(x.klasse).id, title: x.title || 'Ohne Titel', nr: String(x.nr || ''), updatedAt: x.updatedAt || 0, q: x.q || searchText(x.sheet) }; });
    },
    async load(docId) { const d = await col().doc(docId).get(); return d.exists && d.data().sheet ? clone(d.data().sheet) : null; },
    async save(sh) {
      const body = { kind: 'sheet', ...entryOf(sh), sheet: sh };
      if (JSON.stringify(body).length > 250000) throw { code: 'toolarge' };
      try { await col().doc(sh.id).set(body); } catch (e) { throw (e && e.code === 'invalid_argument') ? { code: 'toolarge' } : e; }
    },
    async remove(docId) { await col().doc(docId).delete(); },
    async stamp(docId) { const d = await col().doc(docId).get(); return d.exists && d.data() ? Number(d.data().updatedAt) || 0 : null; },
    async loadPrefs() { const d = await col().doc('ordner-einstellungen').get(); return d.exists && d.data() ? d.data().prefs || null : null; },
    async savePrefs(p) { await col().doc('ordner-einstellungen').set({ kind: 'prefs', prefs: p, updatedAt: Date.now() }); }
  };
}
function supaB(sb, user) {
  const T = () => sb.from(SUPABASE.table || 'ab_arbeitsblaetter');
  const chk = r => { if (r.error) throw r.error; return r.data; };
  return {
    kind: 'supabase', key: 'sb:' + user.id,
    async list() {
      const rows = chk(await T().select('id,klasse,title,nr,updated_at,suchtext').order('updated_at', { ascending: false })) || [];
      return rows.map(r => ({ id: r.id, kraw: r.klasse, klasse: KL(r.klasse).id, title: r.title || 'Ohne Titel', nr: r.nr || '', updatedAt: Date.parse(r.updated_at) || 0, q: r.suchtext || '' }));
    },
    async load(id) { const d = chk(await T().select('data').eq('id', id).maybeSingle()); return d && d.data ? d.data : null; },
    async save(sh) { chk(await T().upsert({ user_id: user.id, id: sh.id, klasse: KL(sh.klasse).id, title: stTitle(sh), nr: String(stNr(sh)), data: sh, suchtext: searchText(sh), updated_at: new Date(sh.updatedAt || Date.now()).toISOString() }, { onConflict: 'user_id,id' })); },
    async remove(id) { chk(await T().delete().eq('id', id)); },
    async stamp(id) { const d = chk(await T().select('updated_at').eq('id', id).maybeSingle()); return d ? Date.parse(d.updated_at) || 0 : null; },
    async loadPrefs() { const d = chk(await sb.from('ab_einstellungen').select('data').maybeSingle()); return d ? d.data : null; },
    async savePrefs(p) { chk(await sb.from('ab_einstellungen').upsert({ user_id: user.id, data: p, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })); },
    async shareList() {
      const rows = chk(await sb.from('ab_geteilt').select('id,user_id,sheet_id,title,klasse,fach,beschreibung,autor,updated_at,suchtext,kategorien,stufe').order('updated_at', { ascending: false }).limit(500)) || [];
      return rows.map(r => ({ id: r.id, sheetId: r.sheet_id, mine: r.user_id === user.id, uid: r.user_id, title: r.title || 'Ohne Titel', klasse: r.klasse || '', fach: r.fach || '', text: r.beschreibung || '', autor: r.autor || '', q: r.suchtext || '', cats: Array.isArray(r.kategorien) ? r.kategorien : [], stufe: r.stufe || '', updatedAt: Date.parse(r.updated_at) || 0 }));
    },
    async shareGet(id) { const d = chk(await sb.from('ab_geteilt').select('data').eq('id', id).maybeSingle()); return d && d.data ? d.data : null; },
    async sharePut(sh, info) {
      const rid = info.id || Array.from(crypto.getRandomValues(new Uint8Array(14)), x => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 56]).join('');
      chk(await sb.from('ab_geteilt').upsert({ id: rid, user_id: user.id, sheet_id: sh.id, title: stTitle(sh) || 'Ohne Titel', klasse: KL(sh.klasse).label || '', fach: fachKey(sh.klasse), beschreibung: String(info.text || '').slice(0, 600), autor: String(info.autor || '').slice(0, 80), kategorien: (info.cats || []).map(x => String(x).slice(0, 40)).slice(0, 12), stufe: String(info.stufe || '').slice(0, 4), suchtext: searchText(sh) + ' ' + (info.cats || []).join(' ').toLowerCase(), data: sh, updated_at: new Date().toISOString() }, { onConflict: 'user_id,sheet_id' }));
    },
    async shareDel(id) { chk(await sb.from('ab_geteilt').delete().eq('id', id)); }
  };
}

/* ---------- Offline: Kopie der eigenen Stunden im Browser (IndexedDB) ---------- */
// Nach jedem erfolgreichen Laden der Liste werden alle eigenen Stunden im Hintergrund mitgeschrieben.
// Ohne Verbindung zeigen „Meine Stunden“ und das Öffnen diesen letzten Stand; Änderungen gehen wie bisher
// in die Warteschlange und werden nachgetragen, sobald die Ablage wieder erreichbar ist.
const OFF = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => { try { const r = indexedDB.open('abw-offline', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const run = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('kv', mode); const q = fn(t.objectStore('kv')); t.oncomplete = () => res(q ? q.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
  return { get: k => run('readonly', st => st.get(k)).catch(() => null), set: (k, v) => run('readwrite', st => st.put(v, k)).catch(() => null), del: k => run('readwrite', st => st.delete(k)).catch(() => null) };
})();
const LS_OFFUSER = 'abw.offuser';
let offWarmRun = 0;
async function offWarm(b, L) {
  const run = ++offWarmRun; await wait(2500);
  const st = (await OFF.get('stamps:' + b.key)) || {}; let n = 0;
  for (const e of L) {
    if (run !== offWarmRun || !navigator.onLine) return;
    if (st[e.id] && st[e.id] >= (e.updatedAt || 0)) continue;
    try { const sh = await b.load(e.id); if (sh) { await OFF.set('sh:' + b.key + ':' + e.id, sh); st[e.id] = e.updatedAt || Date.now(); if (++n % 5 === 0) await OFF.set('stamps:' + b.key, st); } } catch {}
    await wait(120);
  }
  const ids = new Set(L.map(e => e.id)); Object.keys(st).forEach(id => { if (!ids.has(id)) { delete st[id]; OFF.del('sh:' + b.key + ':' + id); } });
  await OFF.set('stamps:' + b.key, st);
}
function offMergePend(b, L) {
  const P = lsGet(pendKey(b)) || {}; const out = L.slice();
  Object.values(P).forEach(sh => { if (!sh || !sh.meta) return; const e = { ...entryOf(sh), kraw: sh.klasse, pend: true }; const i = out.findIndex(x => x.id === sh.id); if (i >= 0) out[i] = e; else out.unshift(e); });
  return out;
}
function withOffline(b) {
  if (!b || b.kind === 'local' || b.offWrapped) return b;
  const K = b.key; const W = Object.create(b); W.offWrapped = true; W.base = b;
  const hit = at => { state.offline = { at: at || (state.offline && state.offline.at) || 0 }; };
  W.list = async () => {
    try { const L = await b.list(); state.offline = null; OFF.set('list:' + K, { at: Date.now(), list: L }); offWarm(b, L); return L; }
    catch (e) { const c = await OFF.get('list:' + K); if (!c || !Array.isArray(c.list)) throw e; hit(c.at); return offMergePend(W, c.list); }
  };
  W.load = async id => {
    try { const sh = await b.load(id); if (sh) OFF.set('sh:' + K + ':' + id, sh); return sh; }
    catch (e) { const p = (lsGet(pendKey(W)) || {})[id]; if (p) { hit(); return clone(p); } const c = await OFF.get('sh:' + K + ':' + id); if (c) { hit(); return c; } throw e; }
  };
  W.save = async sh => { await b.save(sh); OFF.set('sh:' + K + ':' + sh.id, sh); };
  W.loadPrefs = async () => { try { const p = await b.loadPrefs(); OFF.set('prefs:' + K, p); return p; } catch (e) { const c = await OFF.get('prefs:' + K); if (c) return c; throw e; } };
  return W;
}
// Ohne Netz und ohne gültige Anmeldung: das zuletzt angemeldete Konto aus der Kopie
function offlineOnlyB(u) {
  const no = async () => { throw { code: 'offline' }; };
  return withOffline({ kind: 'supabase', key: 'sb:' + u.id, offOnly: true, list: no, load: no, save: no, remove: no, stamp: no, loadPrefs: no, savePrefs: no, shareList: no, shareGet: no, sharePut: no, shareDel: no });
}
const offDate = at => at ? new Date(at).toLocaleString('de-DE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr' : '';
window.addEventListener('online', () => {
  if (!state.offline || !backend) return;
  toast('Wieder online. Änderungen werden nachgetragen.');
  if (backend.offOnly) { initBackend(); return; }
  useBackend(backend);
});

/* ---------- Rahmenlehrplan Berlin: Fenster mit Suche ---------- */
// Quellen: berlin.de (Senatsverwaltung) und Bildungsserver Berlin-Brandenburg. Gezeigt wird die PDF selbst (amtliche
// Fassung); wer sie einmal ablegt, hat sie in diesem Browser gespeichert und kann sie auch offline öffnen.
const RLP_BE = 'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/';
const RLP_BBB = 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/';
const RLP_DOCS = {
  deutsch: { s1: [['de1', 'Deutsch · Jahrgangsstufen 1–10 · Teil C', RLP_BE + 'rlp-deutsch_1-10-teil-c.pdf']], go: [['dego', 'Deutsch · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-deutsch-go-teil-c.pdf']] },
  gp: { s1: [['ge1', 'Geschichte · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Geschichte_2015_11_10.pdf']], go: [['gego', 'Geschichte · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-geschichte-go-teil-c.pdf'], ['gego26', 'Geschichte · Oberstufe · neu ab 2026/27 (Klasse 11)', RLP_BE + 'oberstufe/rlp-go-teil-c-geschichte-neu_26-27.pdf'], ['pwgo', 'Politikwissenschaft · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-politikwissenschaft-go-teil-c.pdf']] },
  bio: { s1: [['bi1', 'Biologie · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Biologie_2015_11_10.pdf']], go: [['bigo', 'Biologie · gymnasiale Oberstufe · Teil C', RLP_BE + 'rlp_go_teil_c_biologie_2021.pdf']] },
  en: { s1: [['mf1', 'Moderne Fremdsprachen · Jahrgangsstufen 1–10 · Teil C', RLP_BE + 'klasse-1-10/moderne-fremdsprachen-teil-c.pdf']], go: [['engo', 'Englisch · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-englisch-go-teil-c.pdf']] },
  es: { s1: [['mf1', 'Moderne Fremdsprachen · Jahrgangsstufen 1–10 · Teil C', RLP_BE + 'klasse-1-10/moderne-fremdsprachen-teil-c.pdf']], go: [['esgo', 'Spanisch · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-spanisch-go-teil-c.pdf']] }
};
Object.assign(RLP_DOCS, {
  fr: { s1: [['mf1', 'Moderne Fremdsprachen · Jahrgangsstufen 1–10 · Teil C', RLP_BE + 'klasse-1-10/moderne-fremdsprachen-teil-c.pdf']], go: [['frgo', 'Französisch · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-franzoesisch-go-teil-c.pdf']] },
  la: { s1: [['la1', 'Latein · Jahrgangsstufen 5–10 · Teil C', RLP_BBB + 'Teil_C_Latein_2015_11_10.pdf']], go: [['lago', 'Latein · gymnasiale Oberstufe · Teil C', RLP_BE + 'oberstufe/rlp-go-teil-c-latein-neu_25-26.pdf']] },
  ma: { s1: [['ma1', 'Mathematik · Jahrgangsstufen 1–10 · Teil C', RLP_BE + 'rahmenlehrplan-teil-c_mathe-1-10.pdf']], go: [['mago', 'Mathematik · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-mathematik_go-teil-c.pdf']] },
  inf: { s1: [['in1', 'Informatik · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Informatik_2015_11_10.pdf']], go: [['ingo', 'Informatik · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-informatik-go-teil-c.pdf']] },
  ph: { s1: [['ph1', 'Physik · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Physik_2015_11_16.pdf']], go: [['phgo', 'Physik · gymnasiale Oberstufe · Teil C', RLP_BE + 'rlp_go_teil_c_physik_2021.pdf']] },
  ch: { s1: [['ch1', 'Chemie · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Chemie_2015_11_10.pdf']], go: [['chgo', 'Chemie · gymnasiale Oberstufe · Teil C', RLP_BE + 'rlp_go_teil_c-chemie_2021.pdf']] },
  nawi: { s1: [['nw56', 'Naturwissenschaften · Jahrgangsstufen 5–6 · Teil C', RLP_BBB + 'Teil_C_Nawi_5-6_2015_11_16.pdf'], ['nw710', 'Naturwissenschaften (Wahlpflicht) · 7–10 · Teil C', RLP_BBB + 'Teil_C_Nawi_7-10_2015_11_16.pdf']] },
  su: { s1: [['su1', 'Sachunterricht · Jahrgangsstufen 1–4 · Teil C', RLP_BBB + 'Teil_C_Sachunterricht_2015_11_16.pdf']] },
  geo: { s1: [['geo1', 'Geografie · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Geografie_2015_11_10.pdf']], go: [['geogo', 'Geografie · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-geografie-go-teil-c.pdf'], ['geogo26', 'Geografie · Oberstufe · neu ab 2026/27 (Klasse 11)', RLP_BE + 'oberstufe/rlp-go-teil-c-geografie-neu_26-27.pdf']] },
  pb: { s1: [['pb1', 'Politische Bildung · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Politische_Bildung_2015_11_16.pdf']], go: [['pbgo26', 'Politische Bildung · Oberstufe · neu ab 2026/27 (Klasse 11)', RLP_BE + 'oberstufe/rlp-go-teil-c-politische_-bildung-neu_26-27.pdf'], ['pwgo', 'Politikwissenschaft · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-politikwissenschaft-go-teil-c.pdf']] },
  gewi: { s1: [['gw56', 'Gesellschaftswissenschaften · Jahrgangsstufen 5–6 · Teil C', RLP_BBB + 'Teil_C_Gesellschaftswissenschaften_2015_11_10.pdf']] },
  wat: { s1: [['wat1', 'Wirtschaft-Arbeit-Technik · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_WAT_2015_11_10.pdf']], go: [['wwgo', 'Wirtschaftswissenschaft · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-wirtschaftswissenschaft-go-teil-c.pdf']] },
  eth: { s1: [['et1', 'Ethik · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Ethik_2015_11_10.pdf']], go: [['phgo2', 'Philosophie · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-philosophie-go-teil-c.pdf']] },
  phil: { s1: [['phi1', 'Philosophie (Wahlpflicht) · 9–10 · Teil C', RLP_BBB + 'Teil_C_Philosophie_2015_11_16.pdf']], go: [['phigo', 'Philosophie · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-philosophie-go-teil-c.pdf'], ['phigo26', 'Philosophie · Oberstufe · neu ab 2026/27 (Klasse 11)', RLP_BE + 'oberstufe/rlp-go-teil-c-philosophie-neu_26-27.pdf']] },
  reli: { s1: [['reli', 'Religion · Lehrplan der Kirche oder Religionsgemeinschaft (bitte als PDF hinterlegen)', RLP_BE + 'klasse-1-10/']] },
  ku: { s1: [['ku1', 'Kunst · Jahrgangsstufen 1–10 · Teil C', RLP_BBB + 'Teil_C_Kunst_2015_11_10.pdf']], go: [['kugo', 'Bildende Kunst · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-bildende-kunst-go-teil-c.pdf']] },
  mu: { s1: [['mu1', 'Musik · Jahrgangsstufen 1–10 · Teil C', RLP_BBB + 'Teil_C_Musik_2015_11_16.pdf']], go: [['mugo', 'Musik · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-musik-go-teil-c.pdf']] },
  sp: { s1: [['sp1', 'Sport · Jahrgangsstufen 1–10 · Teil C', RLP_BBB + 'Teil_C_Sport_2015_11_16.pdf']], go: [['spgo', 'Sport · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-sport-go-teil-c.pdf']] },
  th: { s1: [['th1', 'Theater · Jahrgangsstufen 7–10 · Teil C', RLP_BBB + 'Teil_C_Theater_2015_11_10.pdf']], go: [['dsgo', 'Darstellendes Spiel · gymnasiale Oberstufe · Teil C', RLP_BE + 'rahmenlehrplan-darstellendes-spiel-go-teil-c.pdf']] }
});
const RLP_TB = { s1: ['Teil B · fachübergreifend (1–10)', RLP_BBB + 'Teil_B_2015_11_10.pdf'], go: ['Teil B · fachübergreifend (Oberstufe)', RLP_BE + 'rlp_go_teil_b_2021.pdf'] };
const RLP_OVR = { s1: RLP_BE + 'klasse-1-10/', go: RLP_BE + 'oberstufe/' };
const LS_RLPV = 'abw.rlpv';
const rlpv = { open: false, doc: null, rec: null, url: '', busy: false, err: '' };
const rlpGO = kl => /grundkurs|leistungskurs|oberstufe|e-?phase|einführungsphase|\bq[1-4]\b|\b(11|12|13)\b|\bgk\b|\blk\b/i.test((kl.course || '') + ' ' + (kl.label || ''));
function rlpSel() { const kl = KL(state.sheet.klasse); const v = (lsGet(LS_RLPV) || {})[kl.id] || {}; const st = v.st || (rlpGO(kl) ? 'go' : 's1'); const D = RLP_DOCS[fachKey(kl.id)] || RLP_DOCS.deutsch; const L = D[st] || D.s1 || D.go; const d = L.find(x => x[0] === v.d) || L[0]; return { kl, st, L, d }; }
function rlpSave(o) { const kl = KL(state.sheet.klasse); const all = lsGet(LS_RLPV) || {}; all[kl.id] = { ...(all[kl.id] || {}), ...o }; lsSet(LS_RLPV, all); }
// Angezeigt wird die PDF selbst: die in diesem Browser gespeicherte Fassung (geht auch offline) oder die amtliche Fassung von berlin.de
async function rlpLoad() {
  const { d } = rlpSel(); rlpv.doc = d[0];
  if (rlpv.url) { URL.revokeObjectURL(rlpv.url); rlpv.url = ''; }
  rlpv.rec = (await OFF.get('rlp:' + d[0])) || null;
  if (rlpv.rec && rlpv.rec.blob) rlpv.url = URL.createObjectURL(rlpv.rec.blob);
}
async function rlpImport(file) {
  if (!file || !/pdf$/i.test(file.type || file.name)) { rlpv.err = 'Bitte eine PDF-Datei wählen.'; rlpRender(); return; }
  rlpv.err = ''; await OFF.set('rlp:' + rlpv.doc, { name: file.name, at: Date.now(), blob: file }); await rlpLoad(); rlpRender();
  toast('Gespeichert: Der Rahmenlehrplan öffnet sich jetzt aus diesem Browser, auch ohne Internet.');
}
/* Stelle merken: je Plan Seite und Position. Innerhalb von 2 Stunden geht es dort weiter, danach beim ersten Kompetenzstandard. */
const LS_RLPPOS = 'abw.rlpPos', RLP_KEEP = 2 * 3600e3;
const rlpPosAll = () => lsGet(LS_RLPPOS) || {};
function rlpPosSave() {
  const host = document.getElementById('rlp-view'); if (!host || !rpv.pages.length || !rlpv.doc || host.dataset.ready !== '1') return;
  const y = host.scrollTop; let p = 1; rpv.pages.forEach((x, i) => { if (x.el.offsetTop <= y + 2) p = i + 1; });
  const el = rpv.pages[p - 1].el; const f = Math.max(0, Math.min(1, (y - el.offsetTop) / (el.offsetHeight || 1)));
  const A = rlpPosAll(); A[rlpv.doc] = { p, f: +f.toFixed(4), at: Date.now(), q: rpv.q || '' }; lsSet(LS_RLPPOS, A);
}
// Erste Seite mit Kompetenzstandards: Überschriften wie „3.2 Abschlussorientierte Standards“ oder „2 Kompetenzen und Standards“, Inhaltsverzeichnis übersprungen
async function rlpStdPage() {
  try {
    const T = await rlpText(); const pages = T.map(items => items.map(it => it.n).join(' ').replace(/\s+/g, ' '));
    const toc = t => (t.match(/\.{6,}/g) || []).length >= 3 || /inhaltsverzeichnis/.test(t);
    const pats = [/\b\d(\.\d){0,2}\s+abschlussorientierte standards\b/, /\b\d(\.\d){0,2}\s+(fachbezogene )?kompetenzen und standards\b/, /\b\d(\.\d){0,2}\s+standards\b/, /\bstandards?\b.*\bdie schulerinnen und schuler konnen\b/];
    for (const re of pats) { const i = pages.findIndex(t => !toc(t) && re.test(t)); if (i >= 0) return i + 1; }
  } catch (e) { console.error(e); }
  return 0;
}
function rlpRender() {
  rlpRender0(); if (!(rlpv.open && rlpv.rec && rlpv.rec.blob)) return;
  const P = rlpPosAll()[rlpv.doc], fresh = P && Date.now() - P.at < RLP_KEEP;
  rlpViewer().then(async () => {
    const host = document.getElementById('rlp-view'); if (!host || !rpv.pages.length) return;
    if (fresh) {
      const x = rpv.pages[Math.min(rpv.pages.length, P.p) - 1]; host.scrollTop = x.el.offsetTop + P.f * x.el.offsetHeight;
      const q = rpv.q || P.q; if (q) { const qi = document.getElementById('rlpv-q'); if (qi) qi.value = q; rlpSearch(q, true); }
    } else {
      rpv.q = ''; const n = await rlpStdPage();
      if (n && rpv.pages[n - 1]) { host.scrollTop = Math.max(0, rpv.pages[n - 1].el.offsetTop - 2); toast('Rahmenlehrplan: Start beim ersten Kompetenzstandard (S. ' + n + ').'); }
    }
    host.dataset.ready = '1'; rlpPosSave();
    if (!host.dataset.pos) { host.dataset.pos = '1'; let tm = 0; host.addEventListener('scroll', () => { clearTimeout(tm); tm = setTimeout(rlpPosSave, 400); }, { passive: true }); }
  });
}
function rlpRender0() {
  let box = document.getElementById('rlpv');
  if (!rlpv.open) { if (box) box.remove(); return; }
  const { kl, st, L, d } = rlpSel(); const F = FAECHER[fachKey(kl.id)] || FAECHER.deutsch; const R = rlpv.rec;
  if (!box) { box = document.createElement('div'); box.id = 'rlpv'; box.className = 'rlpv'; box.innerHTML = '<div class="rlpv-scrim" data-rlp="x"></div><div class="rlpv-w" role="dialog" aria-modal="true" aria-labelledby="rlpv-t"></div>'; document.body.appendChild(box);
    box.addEventListener('click', rlpClick); box.addEventListener('change', rlpChange);
    box.addEventListener('input', e => { if (e.target.id === 'rlpv-q') { clearTimeout(rpv.tm); rpv.tm = setTimeout(() => rlpSearch(e.target.value), 250); } });
    box.addEventListener('keydown', e => { if (e.target.id === 'rlpv-q' && e.key === 'Enter') { e.preventDefault(); rlpJump(rpv.hi + (e.shiftKey ? -1 : 1)); } });
    box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('over'); });
    box.addEventListener('dragleave', e => { if (e.target === box || !box.contains(e.relatedTarget)) box.classList.remove('over'); });
    box.addEventListener('drop', e => { e.preventDefault(); box.classList.remove('over'); if (e.dataTransfer.files[0]) rlpImport(e.dataTransfer.files[0]); }); }
  const src = (rlpv.url || d[2]) + '#view=FitH';
  box.querySelector('.rlpv-w').innerHTML = `<div class="rlpv-h"><div><b id="rlpv-t">Rahmenlehrplan Berlin</b><small>${esc(F.label)} · ${esc(kl.label)}</small></div><button type="button" class="ib" data-rlp="x" title="Schließen (Esc)" aria-label="Schließen">${I.x}</button></div>
    <div class="rlpv-tools"><div class="seg sm" role="group" aria-label="Stufe"><button type="button" data-rlp="st" data-v="s1" aria-pressed="${st === 's1'}">Klasse 1–10</button><button type="button" data-rlp="st" data-v="go" aria-pressed="${st === 'go'}">Oberstufe</button></div>
      ${L.length > 1 ? `<select data-rlp-doc aria-label="Plan">${L.map(x => `<option value="${x[0]}"${x[0] === d[0] ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select>` : `<span class="rlp-dn">${esc(d[1])}</span>`}
      <span class="rlp-acts"><a class="btn sm" href="${esc(rlpv.url || d[2])}" target="_blank" rel="noopener">In neuem Tab ↗</a></span></div>
    ${R ? `<div class="rlpv-s"><input id="rlpv-q" class="inp" type="search" placeholder="Im Rahmenlehrplan suchen" aria-label="Im Rahmenlehrplan suchen" autocomplete="off"><span class="rlp-hn" id="rlp-hn"></span><button type="button" class="ib" data-rlp="hp" title="Voriger Treffer" aria-label="Voriger Treffer">‹</button><button type="button" class="ib" data-rlp="hx" title="Nächster Treffer" aria-label="Nächster Treffer">›</button><span class="rlp-zm"><button type="button" class="ib" data-rlp="zo" title="Kleiner" aria-label="Kleiner">−</button><button type="button" class="ib" data-rlp="zi" title="Größer" aria-label="Größer">+</button></span></div>
      <div class="rlpv-b rlp-view" id="rlp-view"><div class="rlp-load">PDF wird geladen …</div></div>`
      : RLP_MOBILE() ? `<div class="rlpv-b rlp-nomob"><div><b>Auf diesem Gerät kann der Browser die PDF nicht im Fenster zeigen.</b><p>Öffne sie mit „In neuem Tab“ oder lade sie einmal herunter und speichere sie hier mit „PDF hier speichern“. Dann zeigt das Fenster sie mit Suche, auch offline.</p><a class="btn" href="${esc(d[2])}" target="_blank" rel="noopener">PDF öffnen ↗</a></div></div>`
      : `<div class="rlpv-b"><iframe class="rlp-pdf" src="${esc(src)}" title="${esc(d[1])}"></iframe></div>`}
    <div class="rlpv-f">${R ? `<span>Gespeicherte Fassung vom ${new Date(R.at).toLocaleDateString('de-DE')} (${esc(R.name)}) · geht auch offline</span><label class="link">ersetzen<input type="file" accept="application/pdf,.pdf" data-rlp-file hidden></label><button type="button" class="link" data-rlp="del">entfernen</button>`
      : `<span>Amtliche Fassung von berlin.de. Suchen mit Strg+F im Dokument. Leer? Dann „In neuem Tab“ oder die PDF einmal hier ablegen. Gespeichert gibt es Suche, und das LehrWerk merkt sich die Stelle:</span><label class="link">PDF hier speichern (auch offline)<input type="file" accept="application/pdf,.pdf" data-rlp-file hidden></label>`}
      <a href="${esc(RLP_TB[st][1])}" target="_blank" rel="noopener">${esc(RLP_TB[st][0])} ↗</a><a href="${esc(RLP_OVR[st])}" target="_blank" rel="noopener">Alle Pläne ↗</a>${rlpv.err ? `<b class="rlp-err">${esc(rlpv.err)}</b>` : ''}</div>`;
}
const RLP_MOBILE = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const rlpNorm = x => { let o = ''; for (let i = 0; i < x.length; i++) { const c = x[i]; const d = c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); o += d.length === 1 ? d : c.toLowerCase().length === 1 ? c.toLowerCase() : c; } return o; };
const rpv = { doc: null, key: '', zoom: 1, pages: [], text: null, hits: [], hi: -1, io: null };
async function rlpViewer() {
  const host = document.getElementById('rlp-view'); if (!host || !rlpv.rec || !rlpv.rec.blob) return;
  const key = rlpv.doc + ':' + rlpv.rec.at;
  try {
    if (rpv.key !== key) { rpv.doc = await ocrPdfDoc(rlpv.rec.blob); rpv.key = key; rpv.text = null; rpv.hits = []; rpv.hi = -1; }
    const doc = rpv.doc; const W = Math.max(240, host.clientWidth - 24);
    host.innerHTML = ''; rpv.pages = []; if (rpv.io) rpv.io.disconnect();
    const p1 = await doc.getPage(1); const v1 = p1.getViewport({ scale: 1 });
    for (let i = 1; i <= doc.numPages; i++) {
      const el = document.createElement('div'); el.className = 'rlp-pg'; el.dataset.n = i;
      const sc = (W / v1.width) * rpv.zoom; el.style.width = Math.round(v1.width * sc) + 'px'; el.style.height = Math.round(v1.height * sc) + 'px';
      el.innerHTML = `<span class="rlp-pgn">${i}</span>`; host.appendChild(el); rpv.pages.push({ el, sc, done: false });
    }
    rpv.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) rlpDraw(+e.target.dataset.n); }), { root: host, rootMargin: '600px 0px' });
    rpv.pages.forEach(x => rpv.io.observe(x.el));
  } catch (e) { console.error(e); host.innerHTML = '<div class="rlp-load">Die PDF ließ sich nicht öffnen. Bitte mit „ersetzen“ neu speichern.</div>'; }
}
async function rlpDraw(n) {
  const x = rpv.pages[n - 1]; if (!x || x.done) return; x.done = true;
  try {
    const pg = await rpv.doc.getPage(n); const vp = pg.getViewport({ scale: x.sc }); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cv = document.createElement('canvas'); cv.width = Math.floor(vp.width * dpr); cv.height = Math.floor(vp.height * dpr); cv.style.width = vp.width + 'px'; cv.style.height = vp.height + 'px';
    await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
    x.el.prepend(cv); x.vp = vp; rlpMarks(n);
  } catch (e) { console.error(e); x.done = false; }
}
async function rlpText() {
  if (rpv.text) return rpv.text; const T = [];
  for (let i = 1; i <= rpv.doc.numPages; i++) { const tc = await (await rpv.doc.getPage(i)).getTextContent(); T.push(tc.items.filter(it => it.str).map(it => ({ s: it.str, n: rlpNorm(it.str), t: it.transform, w: it.width, h: it.height }))); }
  return (rpv.text = T);
}
// Treffer je Textstück; Wörter über mehrere Stücke werden über den Seitentext gefunden und am ersten Wort markiert
async function rlpSearch(q, noJump) {
  const w = rlpNorm(q).trim(); rpv.hits = []; rpv.hi = -1; rpv.q = w;
  if (w.length > 1) { const T = await rlpText(); const first = w.split(/\s+/)[0];
    T.forEach((items, pi) => { const page = items.map(it => it.n).join(' ').replace(/\s+/g, ' '); if (!page.includes(w)) return; items.forEach((it, k) => { if (it.n.includes(first)) rpv.hits.push({ p: pi + 1, k }); }); }); }
  rpv.pages.forEach((x, i) => rlpMarks(i + 1));
  const hn = document.getElementById('rlp-hn'); if (hn) hn.textContent = w.length > 1 ? (rpv.hits.length ? `${rpv.hits.length} Treffer` : 'kein Treffer') : '';
  if (rpv.hits.length && !noJump) rlpJump(0);
  rlpPosSave();
}
function rlpMarks(n) {
  const x = rpv.pages[n - 1]; if (!x || !x.vp) return; x.el.querySelectorAll('.rlp-mk').forEach(m => m.remove());
  if (!rpv.text) return; const items = rpv.text[n - 1] || [];
  rpv.hits.forEach((h, i) => { if (h.p !== n) return; const it = items[h.k]; const r = x.vp.convertToViewportRectangle([it.t[4], it.t[5], it.t[4] + it.w, it.t[5] + (it.h || Math.abs(it.t[3]))]);
    const m = document.createElement('i'); m.className = 'rlp-mk' + (i === rpv.hi ? ' cur' : ''); const L = Math.min(r[0], r[2]), Tp = Math.min(r[1], r[3]);
    Object.assign(m.style, { left: L + 'px', top: (Tp - 1) + 'px', width: Math.abs(r[2] - r[0]) + 'px', height: (Math.abs(r[3] - r[1]) + 3) + 'px' }); x.el.appendChild(m); });
}
function rlpJump(i) {
  if (!rpv.hits.length) return; rpv.hi = (i + rpv.hits.length) % rpv.hits.length; const h = rpv.hits[rpv.hi]; const x = rpv.pages[h.p - 1]; const host = document.getElementById('rlp-view'); if (!x || !host) return;
  rlpDraw(h.p).then(() => { rpv.pages.forEach((_, j) => rlpMarks(j + 1)); const m = x.el.querySelector('.rlp-mk.cur'); host.scrollTop = x.el.offsetTop - host.offsetTop + (m ? m.offsetTop - host.clientHeight / 3 : 0); });
  const hn = document.getElementById('rlp-hn'); if (hn) hn.textContent = `${rpv.hi + 1} von ${rpv.hits.length}`;
}
// Einmaliger Hinweis auf Neues: erscheint beim nächsten Laden genau einmal
const LS_NEWS = 'abw.news', NEWS_ID = 'kollegium-2026-11';
function newsMaybe() {
  if (DG_VIEW || MAPPE_LOCK || String(lsGet(LS_NEWS) || '') === NEWS_ID) return;
  if (!state.klReady || state.needSetup) { setTimeout(newsMaybe, 1500); return; }
  if (state.newAcct) { lsSet(LS_NEWS, NEWS_ID); return; }
  if (state.dlg || state.libOpen || document.querySelector('.pr-ov, #rlpv, .nw-ov')) { setTimeout(newsMaybe, 1500); return; }
  const box = document.createElement('div'); box.className = 'nw-ov'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'nw-t');
  box.innerHTML = `<div class="nw-scrim" data-nw="x"></div><div class="nw-card">
    <div class="nw-art" aria-hidden="true"><svg viewBox="0 0 320 150" fill="none">
      <defs><linearGradient id="nwg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient></defs>
      <circle class="nw-dot d1" cx="44" cy="34" r="5" fill="#FDE68A"/><circle class="nw-dot d2" cx="276" cy="28" r="4" fill="#fff"/><circle class="nw-dot d3" cx="290" cy="112" r="6" fill="#FDE68A" opacity=".8"/><circle class="nw-dot d1" cx="30" cy="118" r="3" fill="#fff"/>
      <g class="nw-book"><path d="M58 40h120a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14H104l-28 22v-22H58a14 14 0 0 1-14-14V54a14 14 0 0 1 14-14z" fill="url(#nwg)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
        <path d="M66 62h96M66 78h70" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
        <path d="M206 64h50a12 12 0 0 1 12 12v32a12 12 0 0 1-12 12h-6v18l-22-18h-22a12 12 0 0 1-12-12V76a12 12 0 0 1 12-12z" fill="url(#nwg)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
        <path d="M216 86h38" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/></g>
      <g class="nw-lens"><circle cx="150" cy="118" r="13" fill="#E0A526"/><circle cx="150" cy="118" r="9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/><path d="M142 128l-4 14 6-3 3 5 3-12M158 128l4 14-6-3-3 5-3-12" fill="#E0A526" opacity=".85"/></g>
    </svg><span class="nw-badge">Neu</span></div>
    <div class="nw-in"><h2 id="nw-t">Neu: das Lehrerzimmer</h2>
      <p class="nw-lead">Das LehrWerk wird zum Treffpunkt fürs Kollegium. Oben in der Leiste öffnen die Sprechblasen das <b class="nw-k">Lehrerzimmer</b> (am Handy unter ⋯).</p>
      <ul class="nw-list">
        <li><i>1</i><span><b>Fragen, Tipps, Austausch.</b> Ein Forum nach Fach und Art sortiert, etwa „Vertretung“ oder „Material gesucht“. Ein roter Zähler zeigt neue Beiträge.</span></li>
        <li><i>2</i><span><b>Teilen in zwei Schritten.</b> Stunde wählen, dann Klassenstufe und Kategorien. Unter „Geteilte Stunden“ lässt sich danach filtern.</span></li>
        <li><i>3</i><span><b>Aufsteigen.</b> Wer teilt, wird vom „Abendspender“ zur „Absoluten Lehrlegende“. Ab 50 geteilten Stunden gibt es einen Platz an der Wall of Fame.</span></li>
      </ul>
      <div class="nw-acts"><button type="button" class="btn primary" data-nw="go">Lehrerzimmer öffnen</button><button type="button" class="btn" data-nw="tour">Kurze Tour</button><button type="button" class="btn" data-nw="x">Später</button></div></div></div>`;
  document.body.appendChild(box);
  const close = go => { lsSet(LS_NEWS, NEWS_ID); box.classList.add('out'); setTimeout(() => box.remove(), 220); document.removeEventListener('keydown', onK, true);
    const b = $('#btn-forum'); if (b) { b.classList.add('nw-pulse'); setTimeout(() => b.classList.remove('nw-pulse'), 4200); }
    if (go === 'go') setTimeout(() => forumOpen(), 230); if (go === 'tour') setTimeout(tourStart, 260); };
  const onK = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); } };
  document.addEventListener('keydown', onK, true);
  box.addEventListener('click', e => { const a = e.target.closest('[data-nw]'); if (a) close(a.dataset.nw); });
  setTimeout(() => { const g = box.querySelector('[data-nw="go"]'); if (g) g.focus(); }, 60);
}

