/* ================= Tafelansicht (Vorbild Classroomscreen): Folie als Karte, Ablaufleiste, frei verschiebbare Werkzeuge ================= */
const TB_BG = {
  himmel: { l: 'Himmel', c: 'linear-gradient(180deg,#9FD3FF 0%,#DDF0FF 70%,#F3FAFF 100%)' },
  wiese: { l: 'Wiese', c: 'linear-gradient(180deg,#EEF9E6 0%,#C9E9B2 100%)' },
  sonne: { l: 'Sonne', c: 'linear-gradient(135deg,#FFF5CF,#FFD98A)' },
  punkte: { l: 'Punkte', c: 'radial-gradient(circle,#D3CCBC 2px,transparent 2.6px) 0 0/28px 28px,#F6F2EA' },
  tafel: { l: 'Kreidetafel', c: 'radial-gradient(ellipse at 30% 20%,#3F6B4F,#284636 75%)', dark: true },
  nacht: { l: 'Nacht', c: 'radial-gradient(ellipse at 70% 10%,#34457E,#1A2240 72%)', dark: true },
  grau: { l: 'Dunkel', c: '#20242C', dark: true },
  papier: { l: 'Papier', c: '#ECEEF2' },
  raster: { l: 'Raster', c: 'linear-gradient(#DADDE3 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,#DADDE3 1px,transparent 1px) 0 0/40px 40px,#F4F5F7' },
  schiefer: { l: 'Schiefer', c: 'linear-gradient(160deg,#36404D,#232A33)', dark: true }
};
const TW_KINDS = {
  timer: { t: 'Timer', ic: '⏱️', w: 344, h: 360 },
  ampel: { t: 'Ampel', ic: '🚦', w: 170, h: 390 },
  symbol: { t: 'Arbeitsform', ic: '👥', w: 344, h: 290 },
  laut: { t: 'Lautstärke', ic: '🔊', w: 380, h: 250 },
  wuerfel: { t: 'Würfel', ic: '🎲', w: 360, h: 240 },
  namen: { t: 'Namen ziehen', ic: '🎯', w: 400, h: 240 },
  gruppen: { t: 'Gruppen', ic: '🧩', w: 640, h: 380 },
  uhr: { t: 'Uhr', ic: '🕘', w: 320, h: 170 },
  zeichnen: { t: 'Zeichnen', ic: '✏️', w: 620, h: 420 },
  text: { t: 'Notiz', ic: '📝', w: 380, h: 240 },
  qr: { t: 'QR-Code', ic: '🔳', w: 290, h: 340 }
};
const TW_SYM = {
  ea: { l: 'Einzelarbeit' }, pa: { l: 'Partnerarbeit' }, tps: { l: 'Think-Pair-Share' }, ga: { l: 'Gruppenarbeit' }, pl: { l: 'Alle zusammen' },
  zuhoeren: { l: 'Zuhören', e: '👂' }, melden: { l: 'Melden', e: '✋' }, fluestern: { l: 'Flüstern', e: '🤫' }, leise: { l: 'Ganz leise', e: '🤐' },
  kreis: { l: 'Sitzkreis', e: '⭕' }, aufr: { l: 'Aufräumen', e: '🧹' }, pause: { l: 'Pause', e: '🍎' }
};
// Oberschule: sachliche Arbeitsformen mit den Piktogrammen der Arbeitsblätter statt Emojis
const TW_SYM_OS = { ea: { l: 'Einzelarbeit' }, pa: { l: 'Partnerarbeit' }, tps: { l: 'Think-Pair-Share' }, ga: { l: 'Gruppenarbeit' }, pl: { l: 'Plenum' }, lesen: { l: 'Lesen' }, schreiben: { l: 'Schreiben' }, hoeren: { l: 'Zuhören' }, sprechen: { l: 'Diskussion' }, markieren: { l: 'Markieren' }, recherche: { l: 'Recherche' } };
const TW_AMPEL = { r: 'Stopp', y: 'Leise', g: 'Los' };
const TW_TXC = { gelb: '#FFF3B0', rosa: '#FFD9E2', blau: '#D9ECFF', gruen: '#DDF3D2', weiss: '#FFFFFF' };
const TW_PENS = ['#1C1F27', '#E5484D', '#2F6FDB', '#30A46C'];
const TW_GRC = ['#FFE1E1', '#FFE9C7', '#DDF3E4', '#DCEBFF', '#EDE3FF', '#FFF3B0', '#D8F3F1', '#F6DDF0'];
const TW_PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const twShuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const twMmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
// Ansicht beim Präsentieren je Klasse: Grundschule startet mit der Tafel
function presModeOf(klasse) { const k = KL(klasse); const p = state.prefs && state.prefs.presMode; return p && p[k.id] ? p[k.id] : k.stufe === 'gs' ? 'tafel' : 'folien'; }
function setPresMode(v) { const id = KL(state.sheet.klasse).id; if (!state.prefs.presMode) state.prefs.presMode = {}; state.prefs.presMode[id] = v; savePrefs(); }
function tbChime() {
  try { const ac = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880, 1046].forEach((f, i) => { const t = ac.currentTime + i * 0.24; const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.75); });
    setTimeout(() => { try { ac.close(); } catch {} }, 1800); } catch {}
}
const tbStripLab = s => {
  switch (s.k) {
    case 'tasks': { const nos = s.items.map(x => x.no).filter(Boolean); return tsHaAll(s) ? 'Hausaufgabe' : nos.length > 1 ? `Aufgaben ${nos[0]}–${nos[nos.length - 1]}` : nos.length ? 'Aufgabe ' + nos[0] : 'Auftrag'; }
    case 'step': return s.fol === 'video' ? 'Video' : s.fol === 'quiz' ? 'Quiz' : s.fol === 'zitat' ? 'Zitat' : s.fol === 'bild' ? 'Bild' : s.fol === 'frage' ? 'Stundenfrage' : plainText(tfStr(s.b.head).trim() || stepHeadDef(s.b));
    case 'mat': return (s.tag || 'Material') + (matTitle(s.b) ? ' · ' + plainText(matTitle(s.b)) : '');
    case 'tafel': return 'Tafelbild'; case 'info': return s.b.kind || 'Info'; case 'quote': return 'Zitat'; case 'image': return 'Bild';
    case 'blank': return 'Tafelseite'; case 'table': return 'Tabelle'; case 'phr': return 'Wortspeicher'; case 'match': return s.b.sort ? 'Sortieren' : 'Zuordnen'; case 'qr': return 'QR-Code';
  }
  return 'Folie';
};
const tbStripIc = s => (s.k === 'tasks' ? '✏️' : s.k === 'step' ? ({ video: '▶️', quiz: '❓', zitat: '💬', bild: '🖼️', frage: '❔' }[s.fol] || '💡') : { blank: '✍️', mat: '📄', tafel: '🖍️', info: '💡', quote: '💬', image: '🖼️', table: '📋', phr: '🗂️', match: '🔗', qr: '🔳' }[s.k] || '•');
const tbSoz = s => (!s ? '' : s.k === 'tasks' ? tsSoz(s) : s.k === 'step' && s.b && SOZ[s.b.soz] ? s.b.soz : '');

function tafelBoard(X) {
  const kid = X.klId; const acc = () => pageAcc(X.meta).c; const os = !X.gs; const SYM = os ? TW_SYM_OS : TW_SYM;
  const symIc = k => (SOZ[k] ? `<img src="${sozURI(k, acc(), '#fff')}" alt="">` : ARB[k] ? `<img src="${arbURI(k, acc())}" alt="">` : (SYM[k] && SYM[k].e) || '');
  const L = (lsGet('abw.tafel') || {})[kid] || null;
  const st = { on: !!X.on, bg: (L && L.bg) || (os ? 'papier' : 'himmel'), img: null, w: [], seq: 0 };
  if (st.bg === 'bild') { st.img = lsGet('abw.tafelBild.' + kid); if (!st.img) st.bg = 'himmel'; }
  if (!TB_BG[st.bg] && st.bg !== 'bild') st.bg = 'himmel';
  const tb = el('<div class="tfl"><div class="tfl-ws"></div><div class="tfl-strip" role="navigation" aria-label="Ablauf der Stunde"></div></div>');
  X.stage.appendChild(tb);
  const ws = tb.querySelector('.tfl-ws'), strip = tb.querySelector('.tfl-strip');
  const mn = el(`<div class="pr-tmenu" hidden role="dialog" aria-label="Werkzeuge für die Tafel"><h3>Werkzeug dazunehmen</h3><div class="tm-g">${Object.entries(TW_KINDS).map(([k, x]) => `<button type="button" data-tadd="${k}"><i>${x.ic}</i>${esc(x.t)}</button>`).join('')}</div>
    <h3>Hintergrund</h3><div class="tm-bg">${Object.entries(TB_BG).map(([k, x]) => `<button type="button" data-tbg="${k}" style="background:${x.c};color:${x.dark ? '#fff' : '#1C1F27'}">${esc(x.l)}</button>`).join('')}<button type="button" data-tbg="bild" class="tm-img">Eigenes Bild …</button></div><input type="file" accept="image/*" hidden class="tm-file">
    <div class="tm-row"><button type="button" data-tclear>Alle Werkzeuge entfernen</button><button type="button" data-tdef>Standard wiederherstellen</button></div><p class="tm-note">Ziehen am Titel verschiebt ein Werkzeug, die Ecke unten rechts ändert die Größe. Die Anordnung wird je Klasse gemerkt.</p></div>`);
  X.ov.appendChild(mn);
  let K = 1, dirty = 0, svT = 0, drag = null; const R = {};
  const bgCss = () => (st.bg === 'bild' && st.img ? `center/cover no-repeat url("${st.img}"),#20242C` : TB_BG[st.bg].c);
  const save = () => { clearTimeout(svT); svT = setTimeout(() => { const all = lsGet('abw.tafel') || {}; all[kid] = { bg: st.bg, w: st.w.map(w => ({ k: w.k, x: Math.round(w.x), y: Math.round(w.y), w: Math.round(w.w), h: Math.round(w.h), c: w.c })) }; lsSet('abw.tafel', all); }, 300); };
  const names = () => { const n = (lsGet('abw.namen') || {})[kid]; return Array.isArray(n) ? n : []; };
  const sync = () => { if (dirty) return; dirty = requestAnimationFrame(() => { dirty = 0; mirror(); if (X.onSync) X.onSync(); }); };
  // ---------- Werkzeuge: view = Anzeige (auch auf dem Beamer), ctl = Bedienung (nur hier) ----------
  const KW = {
    timer: {
      def: { min: 5, snd: true }, init: (w, r) => { r.full = r.left = w.c.min * 60; r.run = false; },
      view: (w, r) => { const f = r.full ? r.left / r.full : 1, C = 2 * Math.PI * 44; const end = r.full && r.left <= 0 && !r.run; const low = !end && r.left <= r.full * 0.3 && r.left < r.full;
        return `<div class="tw-tm${r.run ? ' run' : ''}${low ? ' low' : ''}${end ? ' end' : ''}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="bg"/><circle cx="50" cy="50" r="44" class="fg" style="stroke-dasharray:${C.toFixed(2)};stroke-dashoffset:${(C * (1 - f)).toFixed(2)}"/></svg><b>${end ? 'Zeit um!' : twMmss(r.left)}</b></div>`; },
      ctl: () => `<button type="button" data-ta="adj" data-v="-1" aria-label="Eine Minute weniger">−1</button><button type="button" data-ta="go" class="tw-main">Start</button><button type="button" data-ta="adj" data-v="1" aria-label="Eine Minute mehr">+1</button><button type="button" data-ta="reset" title="Zurücksetzen" aria-label="Zurücksetzen">↺</button><button type="button" data-ta="snd" title="Klang am Ende" aria-label="Klang am Ende">🔔</button><span class="tw-br"></span>${[1, 2, 3, 5, 10, 15].map(n => `<button type="button" class="tw-sm" data-ta="set" data-v="${n}">${n}</button>`).join('')}`,
      act: (w, r, a, v) => {
        if (a === 'go') { if (r.run) { r.left = Math.max(0, Math.round((r.end - Date.now()) / 1000)); r.run = false; } else { if (r.left <= 0) r.left = r.full; r.end = Date.now() + r.left * 1000; r.run = true; } }
        else if (a === 'adj') { const d = +v * 60; r.left = Math.max(r.run ? 1 : 0, (r.run ? Math.round((r.end - Date.now()) / 1000) : r.left) + d); r.full = Math.max(60, r.full + d, r.left); if (r.run) r.end = Date.now() + r.left * 1000; w.c.min = Math.round(r.full / 60); }
        else if (a === 'set') { w.c.min = +v; r.run = false; r.full = r.left = +v * 60; }
        else if (a === 'reset') { r.run = false; r.left = r.full; }
        else if (a === 'snd') w.c.snd = !w.c.snd;
      },
      sync: (w, r, c) => { const g = c.querySelector('[data-ta="go"]'); g.textContent = r.run ? 'Pause' : r.left > 0 && r.left < r.full ? 'Weiter' : 'Start'; c.querySelector('[data-ta="snd"]').setAttribute('aria-pressed', String(!!w.c.snd)); }
    },
    ampel: {
      def: { v: 'g' },
      view: w => `<div class="tw-am"><div class="lamps">${['r', 'y', 'g'].map(k => `<i class="${k}${w.c.v === k ? ' on' : ''}" data-ta="am" data-v="${k}" role="button" aria-label="${TW_AMPEL[k]}"></i>`).join('')}</div><b>${TW_AMPEL[w.c.v]}</b></div>`,
      act: (w, r, a, v) => { if (a === 'am' && TW_AMPEL[v]) w.c.v = v; }
    },
    symbol: {
      def: { auto: true, v: 'ea' },
      view: w => { const k = SYM[w.c.v] ? w.c.v : 'ea'; return `<div class="tw-sy"><span class="tw-sy-i">${symIc(k)}</span><b>${esc(SYM[k].l)}</b></div>`; },
      ctl: w => `<select data-ta="sym" aria-label="Arbeitsform wählen">${Object.entries(SYM).map(([k, x]) => `<option value="${k}"${w.c.v === k ? ' selected' : ''}>${esc(x.l)}</option>`).join('')}</select><button type="button" class="tw-sm" data-ta="auto" title="Folgt der Sozialform der Aufgabe auf der Folie">Automatisch</button>`,
      act: (w, r, a, v) => { if (a === 'sym' && SYM[v]) { w.c.v = v; w.c.auto = false; } else if (a === 'auto') { w.c.auto = !w.c.auto; const z = tbSoz(X.S[X.idx()]); if (w.c.auto && z) w.c.v = z; } },
      sync: (w, r, c) => { c.querySelector('[data-ta="auto"]').setAttribute('aria-pressed', String(!!w.c.auto)); c.querySelector('select').value = w.c.v; }
    },
    laut: {
      def: { th: 60 },
      view: (w, r) => { const s = r.on ? r.state || 'ok' : 'off'; const face = { off: '🎤', ok: '🙂', warn: '😐', loud: '🙉' }[s]; const txt = { off: 'Mikrofon ist aus', ok: 'Gut so', warn: 'Etwas leiser', loud: 'Zu laut!' }[s];
        return `<div class="tw-lm ${s}"><span class="tw-lm-f">${face}</span><div class="tw-lm-bar"><i style="width:${(r.on ? r.lvl || 0 : 0).toFixed(1)}%"></i><s style="left:${w.c.th}%"></s></div><b>${txt}</b></div>`; },
      ctl: w => `<button type="button" data-ta="mic" class="tw-main">Mikrofon an</button><label class="tw-rg">Grenze <input type="range" min="15" max="95" value="${w.c.th}" data-ta="th" aria-label="Grenze für zu laut"></label><small class="tw-note">Misst nur die Lautstärke, nimmt nichts auf.</small>`,
      act: (w, r, a) => { if (a === 'mic') { if (r.on) micOff(r); else micOn(w, r); } },
      input: (w, r, a, t) => { if (a === 'th') w.c.th = +t.value; },
      sync: (w, r, c) => { c.querySelector('[data-ta="mic"]').textContent = r.on ? 'Mikrofon aus' : 'Mikrofon an'; },
      stop: (w, r) => micOff(r)
    },
    wuerfel: {
      def: { n: 1 }, init: (w, r) => { r.vals = Array.from({ length: w.c.n }, () => 1 + Math.floor(Math.random() * 6)); },
      view: (w, r) => `<div class="tw-dw${r.roll ? ' roll' : ''}" data-ta="roll" role="button" aria-label="Würfeln">${r.vals.map(n => `<span class="tw-d" aria-label="${n}">${[...Array(9)].map((_, i) => `<i${TW_PIPS[n].includes(i) ? ' class="p"' : ''}></i>`).join('')}</span>`).join('')}</div>`,
      ctl: () => `<span class="tw-lab">Anzahl</span>${[1, 2, 3].map(n => `<button type="button" class="tw-sm" data-ta="n" data-v="${n}">${n}</button>`).join('')}<button type="button" data-ta="roll" class="tw-main">Würfeln</button>`,
      act: (w, r, a, v) => { if (a === 'n') { w.c.n = +v; KW.wuerfel.init(w, r); } else if (a === 'roll') { r.vals = Array.from({ length: w.c.n }, () => 1 + Math.floor(Math.random() * 6)); r.roll = true; setTimeout(() => { r.roll = false; }, 600); } },
      sync: (w, r, c) => c.querySelectorAll('[data-ta="n"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === w.c.n)))
    },
    namen: {
      def: { nr: true },
      view: (w, r) => { const N = names(); if (!N.length) return '<div class="tw-nm"><b class="sm">Wer ist dran?</b><small>Zuerst unter „Liste“ die Namen eintragen</small></div>';
        return `<div class="tw-nm${r.spin ? ' spin' : ''}"><b class="${r.cur ? '' : 'sm'}">${esc(r.cur || 'Wer ist dran?')}</b><small>${w.c.nr && r.pool ? `noch ${r.pool.length} von ${N.length}` : `${N.length} Namen`}</small></div>`; },
      ctl: () => `<button type="button" data-ta="draw" class="tw-main">Ziehen</button><button type="button" class="tw-sm" data-ta="nr">Ohne Wiederholung</button><button type="button" class="tw-sm" data-ta="list" aria-expanded="false">Liste</button><div class="tw-nl" hidden><textarea data-ta="names" placeholder="Ein Name pro Zeile" aria-label="Namensliste">${esc(names().join('\n'))}</textarea><small>Nur in diesem Browser gespeichert, nicht im Konto. Ohne Referentenansicht sieht die Klasse die Liste beim Tippen.</small></div>`,
      act: (w, r, a, v, t) => {
        if (a === 'nr') { w.c.nr = !w.c.nr; r.pool = null; }
        else if (a === 'list') { const p = w.el.querySelector('.tw-nl'); p.hidden = !p.hidden; t.setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) { if (w.h < 440) { w.h = 440; if (w.y + w.h > 880) w.y = Math.max(0, 880 - w.h); pos(w); } ws.appendChild(w.el); st.w = st.w.filter(x => x !== w).concat(w); p.querySelector('textarea').focus(); } }
        else if (a === 'draw') {
          const N = names(); if (!N.length) { KW.namen.act(w, r, 'list', '', w.el.querySelector('[data-ta="list"]')); return; }
          let pick; if (w.c.nr) { if (!r.pool || !r.pool.length) r.pool = twShuf(N); pick = r.pool.pop(); } else pick = N[Math.floor(Math.random() * N.length)];
          let n = 0; r.spin = true; clearInterval(r.sid);
          r.sid = setInterval(() => { n++; if (n < 9) r.cur = N[Math.floor(Math.random() * N.length)]; else { clearInterval(r.sid); r.spin = false; r.cur = pick; } upd(w); sync(); }, 70);
        }
      },
      input: (w, r, a, t) => { if (a !== 'names') return; const all = lsGet('abw.namen') || {}; all[kid] = t.value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 60); lsSet('abw.namen', all); r.pool = null; r.cur = ''; },
      sync: (w, r, c) => c.querySelector('[data-ta="nr"]').setAttribute('aria-pressed', String(!!w.c.nr)),
      stop: (w, r) => clearInterval(r.sid)
    },
    gruppen: {
      def: { g: 4, n: 24 },
      view: (w, r) => { if (!r.gr) { const N = names(); return `<div class="tw-gr-e">„Mischen“ verteilt ${N.length ? N.length + ' Namen' : w.c.n + ' Kinder (ohne Namensliste als Nummern)'} auf ${w.c.g} Gruppen.</div>`; }
        const cols = r.gr.length <= 4 ? r.gr.length : Math.ceil(r.gr.length / 2);
        return `<div class="tw-gr" style="--gc:${cols}">${r.gr.map((g, i) => `<div style="--gcl:${TW_GRC[i % TW_GRC.length]}"><b>Gruppe ${i + 1}</b>${g.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>`; },
      ctl: w => `<span class="tw-lab">Gruppen</span><button type="button" class="tw-sm" data-ta="g" data-v="-1" aria-label="Eine Gruppe weniger">−</button><b class="tw-num" data-show="g">${w.c.g}</b><button type="button" class="tw-sm" data-ta="g" data-v="1" aria-label="Eine Gruppe mehr">+</button><button type="button" data-ta="mix" class="tw-main">Mischen</button><label class="tw-lab">ohne Namen: Kinder <input type="number" min="2" max="40" value="${w.c.n}" data-ta="cnt"></label>`,
      act: (w, r, a, v) => {
        if (a === 'g') { w.c.g = Math.max(2, Math.min(10, w.c.g + +v)); r.gr = null; }
        else if (a === 'mix') { const N = names(); const L2 = twShuf(N.length ? N : Array.from({ length: w.c.n }, (_, i) => String(i + 1))); const g = Math.min(w.c.g, L2.length) || 1; r.gr = Array.from({ length: g }, () => []); L2.forEach((x, i) => r.gr[i % g].push(x)); }
      },
      input: (w, r, a, t) => { if (a === 'cnt') { w.c.n = Math.max(2, Math.min(40, +t.value || 24)); r.gr = null; } },
      sync: (w, r, c) => { c.querySelector('[data-show="g"]').textContent = w.c.g; }
    },
    uhr: {
      def: {},
      view: () => { const d = new Date(); return `<div class="tw-uh"><b>${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}</b><small>${esc(d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }))}</small></div>`; }
    },
    zeichnen: {
      def: {}, once: true, init: (w, r) => { r.col = TW_PENS[0]; r.er = false; },
      view: () => '<canvas class="tw-cv" aria-label="Zeichenfläche"></canvas>',
      ctl: () => `${TW_PENS.map(c => `<button type="button" class="tw-pen" data-ta="pen" data-v="${c}" style="--pc:${c}" aria-label="Stift"></button>`).join('')}<button type="button" class="tw-sm" data-ta="er">Radierer</button><button type="button" class="tw-sm" data-ta="clr">Alles löschen</button>`,
      act: (w, r, a, v) => { if (a === 'pen') { r.col = v; r.er = false; } else if (a === 'er') r.er = !r.er; else if (a === 'clr') { const cv = w.el.querySelector('canvas'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); } },
      sync: (w, r, c) => { c.querySelectorAll('[data-ta="pen"]').forEach(b => b.setAttribute('aria-pressed', String(!r.er && b.dataset.v === r.col))); c.querySelector('[data-ta="er"]').setAttribute('aria-pressed', String(!!r.er)); }
    },
    text: {
      def: { t: '', col: 'gelb', fs: 30 }, once: true,
      view: w => `<div class="tw-tx" contenteditable="true" spellcheck="true" lang="de" data-ta="tx" style="font-size:${w.c.fs}px">${esc(w.c.t)}</div>`,
      ctl: () => `${Object.entries(TW_TXC).map(([k, c]) => `<button type="button" class="tw-pen" data-ta="col" data-v="${k}" style="--pc:${c}" aria-label="Farbe ${k}"></button>`).join('')}<button type="button" class="tw-sm" data-ta="fs" data-v="-4" aria-label="Kleiner">A−</button><button type="button" class="tw-sm" data-ta="fs" data-v="4" aria-label="Größer">A+</button>`,
      act: (w, r, a, v) => { if (a === 'col' && TW_TXC[v]) w.c.col = v; else if (a === 'fs') { w.c.fs = Math.max(16, Math.min(90, w.c.fs + +v)); w.el.querySelector('.tw-tx').style.fontSize = w.c.fs + 'px'; } },
      input: (w, r, a, t) => { if (a === 'tx') w.c.t = t.innerText.replace(/\n$/, ''); },
      sync: (w, r, c) => { w.el.style.setProperty('--twc', TW_TXC[w.c.col] || TW_TXC.gelb); c.querySelectorAll('[data-ta="col"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === w.c.col))); }
    },
    qr: {
      def: { u: '' },
      view: w => { const u = String(w.c.u || '').trim(); let img = ''; if (u) { try { img = QR.dataURL(u, 8); } catch {} } return img ? `<div class="tw-qr"><img src="${img}" alt="QR-Code"></div>` : `<small class="tw-hint">${u ? 'Der Link ist zu lang für einen QR-Code.' : 'Link unten eintragen'}</small>`; },
      ctl: w => `<input type="url" data-ta="url" placeholder="https://…" value="${esc(w.c.u)}" aria-label="Link für den QR-Code">`,
      input: (w, r, a, t) => { if (a === 'url') w.c.u = t.value.trim().slice(0, 600); }
    }
  };
  const micOn = (w, r) => {
    const md = navigator.mediaDevices; if (!md || !md.getUserMedia) { toast('Dieser Browser gibt kein Mikrofon frei.'); return; }
    md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(stream => {
      if (!st.w.includes(w)) { stream.getTracks().forEach(t => t.stop()); return; }
      const ac = new (window.AudioContext || window.webkitAudioContext)(); const an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize); Object.assign(r, { on: true, stream, ac, lvl: 0, t: 0, hold: 0, state: 'ok' });
      const loop = () => { if (!r.on) return; an.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; s += d * d; }
        const db = 20 * Math.log10(Math.sqrt(s / buf.length) + 1e-6); const v = Math.max(0, Math.min(100, (db + 60) / 60 * 100)); r.lvl = r.lvl * 0.85 + v * 0.15;
        const now = performance.now(); if (r.lvl > w.c.th) r.hold = now + 1500; r.state = now < r.hold ? 'loud' : r.lvl > w.c.th * 0.8 ? 'warn' : 'ok';
        if (now - r.t > 120) { r.t = now; upd(w); sync(); } r.raf = requestAnimationFrame(loop); };
      loop(); ctlSync(w);
    }).catch(() => toast('Das Mikrofon ist nicht freigegeben. Im Browser erlauben und erneut versuchen.'));
  };
  const micOff = r => { r.on = false; cancelAnimationFrame(r.raf); try { r.stream && r.stream.getTracks().forEach(t => t.stop()); } catch {} try { r.ac && r.ac.close(); } catch {} r.stream = r.ac = null; };
  const pos = w => { const s = w.el.style; s.left = w.x + 'px'; s.top = w.y + 'px'; s.width = w.w + 'px'; s.height = w.h + 'px'; };
  const upd = w => { if (KW[w.k].once) return; w.el.querySelector('.tw-v').innerHTML = KW[w.k].view(w, R[w.id]); };
  const ctlSync = w => { const c = w.el.querySelector('.tw-c'); if (c && KW[w.k].sync) KW[w.k].sync(w, R[w.id], c); };
  const cvFit = w => { const cv = w.el.querySelector('canvas'); if (!cv) return; const W2 = Math.max(10, cv.clientWidth * 2), H2 = Math.max(10, cv.clientHeight * 2); if (cv.width === W2 && cv.height === H2) return;
    const tmp = document.createElement('canvas'); tmp.width = cv.width; tmp.height = cv.height; tmp.getContext('2d').drawImage(cv, 0, 0); cv.width = W2; cv.height = H2; cv.getContext('2d').drawImage(tmp, 0, 0); };
  const add = (k, o = {}) => {
    const D = TW_KINDS[k]; if (!D) return null;
    const w = { id: 'tw' + (++st.seq), k, x: o.x, y: o.y, w: o.w || D.w, h: o.h || D.h, c: { ...KW[k].def, ...(o.c || {}) } };
    if (w.x == null || w.y == null) { // freieste Stelle auf der Tafel (wenig Überdeckung mit anderen Werkzeugen)
      let best = null; for (let y = 24; y + w.h <= 700 || y === 24; y += 46) for (let x = 24; x + w.w <= 1576 || x === 24; x += 46) {
        let ov2 = 0; st.w.forEach(q => { const dx = Math.min(x + w.w, q.x + q.w) - Math.max(x, q.x), dy = Math.min(y + w.h, q.y + q.h) - Math.max(y, q.y); if (dx > 0 && dy > 0) ov2 += dx * dy; });
        const sc = ov2 * 4 + Math.hypot(x + w.w / 2 - 616, y + w.h / 2 - 357); if (!best || sc < best[0]) best = [sc, x, y]; }
      w.x = best[1]; w.y = best[2]; }
    const r = R[w.id] = {}; if (KW[k].init) KW[k].init(w, r);
    const ctl = KW[k].ctl ? KW[k].ctl(w, r) : '';
    w.el = el(`<div class="tw tw-${k}" data-tw="${w.id}"><div class="tw-h"><b>${esc(D.t)}</b><span class="tw-ctl"><button type="button" data-ta="x" title="Entfernen" aria-label="${esc(D.t)} entfernen">×</button></span></div><div class="tw-b"><div class="tw-v">${KW[k].view(w, r)}</div>${ctl ? `<div class="tw-c tw-ctl">${ctl}</div>` : ''}</div><span class="tw-rs tw-ctl" aria-hidden="true"></span></div>`);
    ws.appendChild(w.el); st.w.push(w); pos(w); ctlSync(w);
    if (k === 'zeichnen') requestAnimationFrame(() => cvFit(w));
    if (k === 'symbol' && w.c.auto) { const z = tbSoz(X.S[X.idx()]); if (z) { w.c.v = z; upd(w); ctlSync(w); } }
    return w;
  };
  const remove = w => { const r = R[w.id]; if (KW[w.k].stop) KW[w.k].stop(w, r); w.el.remove(); st.w = st.w.filter(x => x !== w); delete R[w.id]; };
  const defLayout = () => [{ k: 'symbol', x: 1232, y: 24, w: 344, h: 290 }, { k: 'timer', x: 1232, y: 330, w: 344, h: 360 }];
  (L && Array.isArray(L.w) ? L.w : defLayout()).forEach(o => add(o.k, o));
  // ---------- Ablaufleiste: Bausteine der Stunde, „Wir sind hier“, Erledigtes abgehakt ----------
  const stripRender = i => {
    const items = []; X.S.forEach((s, j) => { if (s.k === 'title' || s.k === 'abhead') return; const key = s.b ? 'b:' + s.b.id : s.bid ? 'b:' + s.bid : 'i' + j; const last = items[items.length - 1]; if (last && last.key === key) { last.i1 = j; return; } items.push({ key, i0: j, i1: j, s }); });
    strip.hidden = !items.length; strip.classList.toggle('many', items.length > 8);
    strip.innerHTML = items.map(it => { const s = it.s; const on = i >= it.i0 && i <= it.i1, done = it.i1 < i; const ph = s.ph && PHASEN[s.ph] ? PHASEN[s.ph].c : '#9AA1AE'; const z = tbSoz(s); const lab = tbStripLab(s);
      return `<button type="button" class="tfl-it${on ? ' on' : ''}${done ? ' done' : ''}" data-tfl-go="${it.i0}" style="--phc:${ph}" title="${esc(lab)}${s.ph && PHASEN[s.ph] ? ' · ' + PHASEN[s.ph].label : ''}">${os ? `<small class="tfl-ph">${s.ph && PHASEN[s.ph] ? PHASEN[s.ph].label : '&nbsp;'}</small>` : ''}${z ? `<span class="tfl-ic"><img src="${sozURI(z, acc(), '#fff')}" alt=""></span>` : os ? '' : `<span class="tfl-ic">${tbStripIc(s)}</span>`}<span class="tfl-l">${esc(lab)}</span></button>`; }).join('');
  };
  const applyBg = () => { X.ov.style.setProperty('--tbg', bgCss()); tb.classList.toggle('tfl-dark', !!(TB_BG[st.bg] || {}).dark); mn.querySelectorAll('[data-tbg]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tbg === st.bg))); };
  // ---------- Beamerfenster: Tafel mitschicken (ohne Bedienelemente) ----------
  const placeAw = (d, k) => { const t = d.querySelector('.pr-stage > .tfl'); if (t) t.style.transform = `translate(-50%,-50%) scale(${k})`; };
  function mirror() {
    if (!X.awOk()) return; const d = X.aw().document; const pr = d.querySelector('.pr'), stg = d.querySelector('.pr-stage'); if (!pr || !stg) return;
    const was = pr.classList.contains('pr-tafel'); pr.classList.toggle('pr-tafel', st.on); pr.classList.toggle('pr-tos', os); pr.style.setProperty('--tbg', bgCss());
    let t = stg.querySelector(':scope > .tfl'); if (!t) { t = d.createElement('div'); stg.appendChild(t); }
    t.className = tb.className; t.innerHTML = tb.innerHTML; t.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable')); t.querySelectorAll('.tw-nl').forEach(e => e.remove());
    const a = tb.querySelectorAll('canvas'), b = t.querySelectorAll('canvas'); a.forEach((cv, i) => { const c2 = b[i]; if (!c2) return; c2.width = cv.width; c2.height = cv.height; try { c2.getContext('2d').drawImage(cv, 0, 0); } catch {} });
    placeAw(d, Math.min(stg.clientWidth / 1600, stg.clientHeight / 900));
    if (was !== st.on) X.rescale();
  }
  const menu = on => { mn.hidden = !on; const b = X.ov.querySelector('[data-p="tools"]'); if (b) b.setAttribute('aria-expanded', String(on)); };
  const modeBtn = () => { const b = X.ov.querySelector('[data-p="mode"]'); if (b) { b.textContent = st.on ? 'Folienansicht' : 'Tafelansicht'; b.title = st.on ? 'Zur normalen Folienansicht wechseln · wird je Klasse gemerkt' : 'Zur Tafelansicht mit Ablauf und Werkzeugen wechseln · wird je Klasse gemerkt'; } };
  const setOn = on => { st.on = on; X.ov.classList.toggle('pr-tafel', on); modeBtn(); if (!on) menu(false); X.rescale(); stripRender(X.idx()); sync(); };
  const bgFile = f => {
    if (!f || !/^image\//.test(f.type)) return; const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1920 / im.naturalWidth, 1200 / im.naturalHeight); const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      st.img = c.toDataURL('image/jpeg', 0.84); st.bg = 'bild'; if (!lsSet('abw.tafelBild.' + kid, st.img)) toast('Das Bild ist zu groß zum Merken und bleibt nur bis zum Schließen.'); applyBg(); save(); sync(); }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
  mn.querySelector('.tm-file').addEventListener('change', e => { bgFile(e.target.files && e.target.files[0]); e.target.value = ''; });
  // ---------- Eingaben ----------
  const wOf = t => { const e = t.closest && t.closest('.tw'); return e ? st.w.find(x => x.id === e.dataset.tw) : null; };
  const onInput = e => { const t = e.target, w = wOf(t); if (!w || !t.dataset.ta || !KW[w.k].input) return; KW[w.k].input(w, R[w.id], t.dataset.ta, t); upd(w); save(); sync(); };
  tb.addEventListener('input', onInput);
  tb.addEventListener('change', e => { const t = e.target, w = wOf(t); if (!w || t.dataset.ta !== 'sym') return; KW.symbol.act(w, R[w.id], 'sym', t.value); upd(w); ctlSync(w); save(); sync(); });
  tb.addEventListener('pointerdown', e => {
    const cv = e.target.closest('canvas.tw-cv');
    if (cv) { const w = wOf(cv); const r = R[w.id]; e.preventDefault(); cv.setPointerCapture(e.pointerId); cvFit(w); const p = ev => { const b = cv.getBoundingClientRect(); return [(ev.clientX - b.left) / b.width * cv.width, (ev.clientY - b.top) / b.height * cv.height]; };
      drag = { draw: true, w, cv, last: p(e), p, r }; const g = cv.getContext('2d'); g.globalCompositeOperation = r.er ? 'destination-out' : 'source-over'; g.fillStyle = r.col; g.beginPath(); g.arc(drag.last[0], drag.last[1], r.er ? 20 : 4, 0, 7); g.fill(); sync(); return; }
    const wEl = e.target.closest('.tw'); if (!wEl) return; const w = wOf(wEl); if (!w) return;
    const rs = e.target.closest('.tw-rs'), h = e.target.closest('.tw-h'); if (!rs && (!h || e.target.closest('button'))) return;
    e.preventDefault(); if (ws.lastElementChild !== wEl) { ws.appendChild(wEl); st.w = st.w.filter(x => x !== w).concat(w); }
    try { wEl.setPointerCapture(e.pointerId); } catch {}
    drag = { w, el: wEl, rs: !!rs, sx: e.clientX, sy: e.clientY, x: w.x, y: w.y, ww: w.w, hh: w.h };
  });
  tb.addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.draw) { const q = drag.p(e), g = drag.cv.getContext('2d'); g.globalCompositeOperation = drag.r.er ? 'destination-out' : 'source-over'; g.strokeStyle = drag.r.col; g.lineWidth = drag.r.er ? 40 : 8; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(drag.last[0], drag.last[1]); g.lineTo(q[0], q[1]); g.stroke(); drag.last = q; sync(); return; }
    const dx = (e.clientX - drag.sx) / K, dy = (e.clientY - drag.sy) / K, w = drag.w;
    if (drag.rs) { w.w = Math.max(150, Math.min(1600, drag.ww + dx)); w.h = Math.max(110, Math.min(900, drag.hh + dy)); }
    else { w.x = Math.max(-w.w + 90, Math.min(1600 - 90, drag.x + dx)); w.y = Math.max(0, Math.min(900 - 44, drag.y + dy)); }
    pos(w); sync();
  });
  const up = () => { if (!drag) return; const d = drag; drag = null; if (!d.draw) { if (d.w.k === 'zeichnen') cvFit(d.w); save(); } sync(); };
  tb.addEventListener('pointerup', up); tb.addEventListener('pointercancel', up);
  // Klicks: true = von der Tafel erledigt (kein Weiterblättern)
  const click = e => {
    const t = e.target;
    if (!mn.hidden && !t.closest('.pr-tmenu, [data-p="tools"]')) menu(false);
    const pb = t.closest('[data-p="mode"], [data-p="tools"]');
    if (pb) { if (pb.dataset.p === 'mode') { setOn(!st.on); setPresMode(st.on ? 'tafel' : 'folien'); } else menu(mn.hidden); return true; }
    if (t.closest('.pr-tmenu')) {
      const a = t.closest('[data-tadd]'), g = t.closest('[data-tbg]');
      if (a) { const w = add(a.dataset.tadd); menu(false); save(); sync(); if (w && w.k === 'text') setTimeout(() => w.el.querySelector('.tw-tx').focus(), 30); }
      else if (g) { if (g.dataset.tbg === 'bild') { if (st.img) { st.bg = 'bild'; applyBg(); save(); sync(); } mn.querySelector('.tm-file').click(); } else { st.bg = g.dataset.tbg; applyBg(); save(); sync(); } }
      else if (t.closest('[data-tclear]')) { st.w.slice().forEach(remove); save(); sync(); menu(false); }
      else if (t.closest('[data-tdef]')) { st.w.slice().forEach(remove); defLayout().forEach(o => add(o.k, o)); save(); sync(); menu(false); }
      return true;
    }
    const go = t.closest('[data-tfl-go]'); if (go) { X.go(+go.dataset.tflGo); return true; }
    const wEl = t.closest('.tw'); if (!wEl) return false;
    const w = wOf(wEl); if (!w) return true; const b = t.closest('[data-ta]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA' || b.isContentEditable) return true;
    const a = b.dataset.ta; if (a === 'x') { remove(w); save(); sync(); return true; }
    if (KW[w.k].act) KW[w.k].act(w, R[w.id], a, b.dataset.v, b); upd(w); ctlSync(w); save(); sync(); return true;
  };
  const keyIgnore = e => { const t = e.target; if (!t || !t.closest) return false; const inField = t.closest('.tw input, .tw textarea, .tw select, .tw [contenteditable], .pr-tmenu');
    if (inField && e.key === 'Escape') { t.blur && t.blur(); X.ov.focus(); e.preventDefault(); e.stopPropagation(); return true; } return !!inField; };
  // Takt: Timer, Uhr
  let lastMin = -1;
  const tick = setInterval(() => {
    let ch = false; const mm = new Date().getMinutes();
    st.w.forEach(w => { const r = R[w.id];
      if (w.k === 'timer' && r.run) { r.left = Math.max(0, Math.round((r.end - Date.now()) / 1000)); if (r.left <= 0) { r.run = false; if (w.c.snd) tbChime(); ctlSync(w); } upd(w); ch = true; }
      else if (w.k === 'uhr' && mm !== lastMin) { upd(w); ch = true; } });
    lastMin = mm; if (ch) sync();
  }, 250);
  // Folienwechsel: Leiste, Arbeitsform und Timerzeit der Aufgabe übernehmen
  const onSlide = i => {
    stripRender(i); const s = X.S[i]; const z = tbSoz(s); const m2 = s ? prMin(s) : 0;
    st.w.forEach(w => { const r = R[w.id];
      if (w.k === 'symbol' && w.c.auto && z && w.c.v !== z) { w.c.v = z; upd(w); ctlSync(w); }
      if (w.k === 'timer' && m2 && !r.run && (r.left === r.full || r.left <= 0) && r.full !== m2 * 60) { w.c.min = m2; r.full = r.left = m2 * 60; upd(w); ctlSync(w); } });
    sync();
  };
  const OX = -184, OY = -93, SK = 0.74;
  X.ov.classList.toggle('pr-tafel', st.on); X.ov.classList.toggle('pr-tos', os); tb.classList.toggle('tfl-os', os); applyBg(); modeBtn();
  return {
    slideTf: k => (st.on ? `translate(calc(-50% + ${(OX * k).toFixed(2)}px), calc(-50% + ${(OY * k).toFixed(2)}px)) scale(${(k * SK).toFixed(5)})` : `translate(-50%,-50%) scale(${k})`),
    place: k => { K = k; tb.style.transform = `translate(-50%,-50%) scale(${k})`; },
    placeAw, mirror, click, keyIgnore, slide: onSlide, isOn: () => st.on,
    // Momentaufnahme der Tafelansicht für das Companion-Gerät (ohne Bedienelemente, eigenes Hintergrundbild nicht mitgeschickt)
    snap: () => { if (!st.on) return null; const t = tb.cloneNode(true); t.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable')); t.querySelectorAll('.tw-nl, .tw-ctl, canvas').forEach(e => e.remove());
      return { cls: tb.className, html: t.innerHTML, bg: st.bg === 'bild' ? TB_BG.papier.c : bgCss(), os, ox: OX, oy: OY, sk: SK }; },
    destroy: () => { clearInterval(tick); st.w.forEach(w => { if (KW[w.k].stop) KW[w.k].stop(w, R[w.id]); }); save(); }
  };
}
