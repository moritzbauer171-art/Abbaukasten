'use strict';
// LehrWerk als Windows-App (Electron). Die App lädt die aktuelle Online-Version (immer auf dem neuesten Stand,
// mit Konto, Videos und Lehrerzimmer). Ohne Internet startet die mitgelieferte Kopie im Ordner app/.
const { app, BrowserWindow, Menu, dialog, ipcMain, shell, session, net, screen } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_NAME = 'LehrWerk';
const ONLINE_URL = 'https://moritzbauer171-art.github.io/Abbaukasten/';
app.setName(APP_NAME);
if (process.platform === 'win32') app.setAppUserModelId('de.lehrwerk.app');
const ONLINE = new URL(ONLINE_URL);
const isOurs = u => { try { const x = new URL(u); return x.protocol === 'file:' || (x.origin === ONLINE.origin && x.pathname.startsWith(ONLINE.pathname)); } catch { return false; } };


if (!app.requestSingleInstanceLock()) { app.quit(); return; }

let win = null, audWin = null, switched = false;
const statePath = () => path.join(app.getPath('userData'), 'fenster.json');
const prefsPath = () => path.join(app.getPath('userData'), 'einstellungen.json');
const readJSON = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const writeJSON = (p, v) => { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)); } catch {} };
const iconPath = () => path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon-256.png');
const safeName = n => String(n || 'Datei').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 180);

function createWindow() {
  const st = readJSON(statePath(), {});
  win = new BrowserWindow({
    width: st.width || 1440, height: st.height || 920, x: st.x, y: st.y,
    minWidth: 900, minHeight: 600, show: false, title: APP_NAME, icon: iconPath(), backgroundColor: '#EEF0F4',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true, autoplayPolicy: 'no-user-gesture-required' }
  });
  if (st.max) win.maximize();
  win.once('ready-to-show', () => { win.show(); setTimeout(firstRun, 800); });
  const save = () => { if (!win || win.isDestroyed()) return; const b = win.getNormalBounds(); writeJSON(statePath(), { ...b, max: win.isMaximized() }); };
  win.on('close', save);
  win.on('page-title-updated', e => e.preventDefault());

  // Links nach außen im Standardbrowser öffnen, die App selbst nie wegnavigieren
  // Beamerfenster der Referentenansicht (leeres Fenster der Seite) zulassen, alles andere im Standardbrowser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank' || isOurs(url)) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, icon: iconPath(), backgroundColor: '#000000', title: APP_NAME + ' – Beamer', webPreferences: { autoplayPolicy: 'no-user-gesture-required' } } };
    if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' };
  });
  // Beamerfenster merken, damit es auf den zweiten Bildschirm gesetzt werden kann
  win.webContents.on('did-create-window', child => { audWin = child; child.setMenuBarVisibility(false); child.on('closed', () => { if (audWin === child) audWin = null; }); });
  win.webContents.on('will-navigate', (e, url) => { if (!isOurs(url)) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  // Ohne Internet und ohne Zwischenspeicher: Hinweisseite mit „Erneut versuchen“
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (!isMain || !/^https:/i.test(url) || code === -3) return;
    win.loadFile(path.join(__dirname, 'offline.html'));
  });

  // Rechtsklick: Rechtschreibvorschläge, Ausschneiden, Kopieren, Einfügen
  win.webContents.on('context-menu', (e, p) => {
    const items = [];
    if (p.misspelledWord) {
      (p.dictionarySuggestions || []).slice(0, 6).forEach(s => items.push({ label: s, click: () => win.webContents.replaceMisspelling(s) }));
      if (!items.length) items.push({ label: 'Keine Vorschläge', enabled: false });
      items.push({ label: 'Zum Wörterbuch hinzufügen', click: () => win.webContents.session.addWordToSpellCheckerDictionary(p.misspelledWord) }, { type: 'separator' });
    }
    if (p.isEditable) items.push({ label: 'Ausschneiden', role: 'cut', enabled: p.editFlags.canCut }, { label: 'Kopieren', role: 'copy', enabled: p.editFlags.canCopy }, { label: 'Einfügen', role: 'paste', enabled: p.editFlags.canPaste }, { type: 'separator' }, { label: 'Alles auswählen', role: 'selectAll' });
    else if (p.selectionText) items.push({ label: 'Kopieren', role: 'copy' });
    if (items.length) Menu.buildFromTemplate(items).popup({ window: win });
  });

  win.loadURL(ONLINE_URL);
}

// Beim ersten Start Verknüpfungen auf dem Desktop und im Startmenü anbieten (nur Windows)
function shortcutTargets() {
  return [path.join(app.getPath('desktop'), APP_NAME + '.lnk'),
    path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', APP_NAME + '.lnk')];
}
function makeShortcuts() {
  let n = 0;
  for (const p of shortcutTargets()) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); if (shell.writeShortcutLink(p, 'create', { target: process.execPath, cwd: path.dirname(process.execPath), description: 'Arbeitsblätter setzen und drucken', icon: process.execPath, iconIndex: 0, appUserModelId: 'de.abwerkstatt.app' })) n++; } catch {}
  }
  return n;
}
async function firstRun() {
  if (process.platform !== 'win32' || !app.isPackaged) return;
  const prefs = readJSON(prefsPath(), {});
  if (prefs.shortcutAsked) return;
  writeJSON(prefsPath(), { ...prefs, shortcutAsked: true });
  const r = await dialog.showMessageBox(win, { type: 'question', title: APP_NAME, buttons: ['Verknüpfungen anlegen', 'Nicht jetzt'], defaultId: 0, cancelId: 1, noLink: true,
    message: 'LehrWerk auf dem Desktop und im Startmenü ablegen?',
    detail: 'Dann starten Sie die App künftig mit einem Klick. Das geht auch später über „Datei → Verknüpfungen anlegen“.' });
  if (r.response === 0) makeShortcuts();
}

// ---------- Brücke zur Seite (preload.js) ----------
ipcMain.handle('ab:save', async (e, name, bytes) => {
  const ext = path.extname(name).slice(1).toLowerCase();
  const kinds = { pdf: 'PDF-Dokument', docx: 'Word-Dokument', pptx: 'PowerPoint-Präsentation', json: 'Sicherung', md: 'Markdown-Datei', png: 'Bild', html: 'Webseite' };
  const r = await dialog.showSaveDialog(win, { title: 'Speichern unter', defaultPath: path.join(app.getPath('documents'), safeName(name)), filters: ext ? [{ name: kinds[ext] || ext.toUpperCase(), extensions: [ext] }] : [] });
  if (r.canceled || !r.filePath) return { canceled: true };
  fs.writeFileSync(r.filePath, Buffer.from(bytes));
  return { ok: true, path: r.filePath, name: path.basename(r.filePath) };
});

async function makePdf() {
  return win.webContents.printToPDF({ preferCSSPageSize: true, printBackground: true, margins: { marginType: 'none' }, generateDocumentOutline: false });
}
ipcMain.handle('ab:pdf', async (e, info) => {
  const data = await makePdf();
  const r = await dialog.showSaveDialog(win, { title: 'PDF speichern', defaultPath: path.join(app.getPath('documents'), safeName(info && info.name || 'Arbeitsblatt.pdf')), filters: [{ name: 'PDF-Dokument', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return { canceled: true };
  fs.writeFileSync(r.filePath, data);
  return { ok: true, path: r.filePath, name: path.basename(r.filePath) };
});

// PDF als Daten (für „Ganze Stunde ausgeben“)
ipcMain.handle('ab:pdfdata', async () => new Uint8Array(await makePdf()));
// Mehrere Dateien in einen neuen Unterordner des gewählten Ordners schreiben
ipcMain.handle('ab:savefolder', async (e, name, files) => {
  const r = await dialog.showOpenDialog(win, { title: 'Wohin soll die Stunde?', defaultPath: app.getPath('documents'), buttonLabel: 'Hier speichern', properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths || !r.filePaths[0]) return { canceled: true };
  const base = path.join(r.filePaths[0], safeName(name)); let dir = base, i = 2;
  while (fs.existsSync(dir)) dir = `${base} (${i++})`;
  fs.mkdirSync(dir, { recursive: true });
  for (const f of files || []) fs.writeFileSync(path.join(dir, safeName(f.name)), Buffer.from(f.bytes));
  return { ok: true, path: dir, n: (files || []).length };
});
ipcMain.handle('ab:print', async (e, info) => {
  // Gemischte Hoch- und Querseiten lassen sich nicht in einem Druckauftrag ausrichten: dann über das PDF
  if (info && info.mixed) {
    const p = path.join(os.tmpdir(), 'LehrWerk-Druck-' + Date.now() + '.pdf');
    fs.writeFileSync(p, await makePdf()); shell.openPath(p); return 'pdf';
  }
  return new Promise(res => win.webContents.print({ silent: false, printBackground: true, landscape: !!(info && info.landscape), pageSize: (info && info.size) || 'A4', margins: { marginType: 'none' } }, ok => res(ok ? 'ok' : 'abgebrochen')));
});
// Nachschlagen für Worterklärungen: nur diese Wörterbuch-Schnittstellen, nur lesen (JSON)
const NET_OK = ['de.wiktionary.org', 'www.openthesaurus.de', 'www.dwds.de'];
ipcMain.handle('ab:json', async (e, url) => {
  let u; try { u = new URL(String(url)); } catch { return null; }
  if (u.protocol !== 'https:' || !NET_OK.includes(u.hostname)) return null;
  try {
    const r = await net.fetch(u.href, { headers: { 'User-Agent': 'LehrWerk/1.0 (Arbeitsblaetter fuer den Unterricht)', Accept: 'application/json' } });
    return r.ok ? await r.json() : null;
  } catch { return null; }
});
ipcMain.handle('ab:open', (e, p) => shell.openPath(p));

// ---------- Referentenansicht wie in PowerPoint ----------
const displays = () => screen.getAllDisplays();
const winDisplay = w => screen.getDisplayMatching(w.getBounds());
ipcMain.handle('lw:displays', () => ({ n: displays().length, win32: process.platform === 'win32' }));
// Beamerfenster auf den Bildschirm, auf dem die App nicht ist, und dort Vollbild
ipcMain.handle('lw:aud-place', () => {
  const ds = displays(); if (!audWin || audWin.isDestroyed()) return { ok: false, n: ds.length };
  if (ds.length < 2) return { ok: false, n: ds.length };
  const mine = winDisplay(win); const d = ds.find(x => x.id !== mine.id); if (!d) return { ok: false, n: ds.length };
  audWin.setFullScreen(false); audWin.setBounds(d.bounds); audWin.setFullScreen(true); audWin.setAlwaysOnTop(false); win.focus();
  return { ok: true, n: ds.length };
});
// Bildschirme tauschen: Beamerfenster und App wechseln die Plätze
ipcMain.handle('lw:aud-swap', () => {
  if (!audWin || audWin.isDestroyed() || displays().length < 2) return { ok: false };
  const a = winDisplay(audWin), m = winDisplay(win); if (a.id === m.id) return { ok: false };
  const fs2 = win.isFullScreen(); audWin.setFullScreen(false); win.setFullScreen(false);
  audWin.setBounds(m.bounds); win.setBounds(a.workArea); audWin.setFullScreen(true); if (fs2) win.setFullScreen(true); win.focus();
  return { ok: true };
});
ipcMain.handle('lw:fullscreen', (e, on) => { if (win) win.setFullScreen(!!on); });
// Windows von „Duplizieren“ auf „Erweitern“ stellen (wie PowerPoint) und nach der Präsentation zurück
const dswitch = args => new Promise(res => { if (process.platform !== 'win32') return res(false); execFile(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'DisplaySwitch.exe'), args, { windowsHide: true }, () => res(true)); });
const waitDisplays = (n0, ms) => new Promise(res => { const t0 = Date.now(); const iv = setInterval(() => { const n = displays().length; if (n > n0 || Date.now() - t0 > ms) { clearInterval(iv); res(n); } }, 250); });
ipcMain.handle('lw:extend', async () => {
  const n0 = displays().length; if (process.platform !== 'win32') return { ok: false, n: n0 };
  await dswitch(['/extend']); let n = await waitDisplays(n0, 4000);
  if (n <= n0) { await dswitch(['3']); n = await waitDisplays(n0, 4000); } // neuere Windows-11-Versionen: Ziffern statt Schalter
  if (n > n0) switched = true;
  return { ok: n > n0, n };
});
ipcMain.handle('lw:restore', async () => { if (!switched) return; switched = false; await dswitch(['/clone']); });
app.on('before-quit', () => { if (switched) { switched = false; try { execFile(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'DisplaySwitch.exe'), ['/clone'], { windowsHide: true }); } catch {} } });
ipcMain.handle('ab:reveal', (e, p) => { shell.showItemInFolder(p); });

// ---------- Menü ----------
function menu() {
  const click = sel => () => win && win.webContents.executeJavaScript(`(document.querySelector(${JSON.stringify(sel)})||{click(){}}).click()`);
  const isWin = process.platform === 'win32';
  const tpl = [
    { label: 'Datei', submenu: [
      { label: 'Neue Stunde …', accelerator: 'CmdOrCtrl+N', click: click('#btn-new') },
      { label: 'Meine Stunden', accelerator: 'CmdOrCtrl+O', click: click('#btn-lib') },
      { label: 'Speichern unter …', accelerator: 'CmdOrCtrl+Shift+S', click: click('#btn-saveas') },
      { label: 'Ausgeben …', accelerator: 'CmdOrCtrl+E', click: click('#btn-out') },
      { type: 'separator' },
      { label: 'Als PDF speichern …', accelerator: 'CmdOrCtrl+S', click: click('#btn-pdf') },
      { label: 'Als Word-Datei speichern …', click: click('#btn-docx') },
      { label: 'Drucken …', accelerator: 'CmdOrCtrl+P', click: click('#btn-print') },
      ...(isWin ? [{ type: 'separator' }, { label: 'Verknüpfungen anlegen', click: () => { const n = makeShortcuts(); dialog.showMessageBox(win, { type: 'info', title: APP_NAME, message: n ? 'Verknüpfungen auf dem Desktop und im Startmenü angelegt.' : 'Die Verknüpfungen konnten nicht angelegt werden.' }); } }] : []),
      { type: 'separator' },
      { label: 'Beenden', role: 'quit', accelerator: isWin ? 'Alt+F4' : 'CmdOrCtrl+Q' }
    ] },
    { label: 'Bearbeiten', submenu: [
      { label: 'Rückgängig', role: 'undo' }, { label: 'Wiederholen', role: 'redo' }, { type: 'separator' },
      { label: 'Ausschneiden', role: 'cut' }, { label: 'Kopieren', role: 'copy' }, { label: 'Einfügen', role: 'paste' }, { label: 'Alles auswählen', role: 'selectAll' }
    ] },
    { label: 'Ansicht', submenu: [
      { label: 'Größer', role: 'zoomIn', accelerator: 'CmdOrCtrl+Plus' }, { label: 'Kleiner', role: 'zoomOut' }, { label: 'Normalgröße', role: 'resetZoom' },
      { type: 'separator' }, { label: 'Vollbild', role: 'togglefullscreen' }, { label: 'Neu laden', role: 'reload' },
      { type: 'separator' }, { label: 'Entwicklerwerkzeuge', role: 'toggleDevTools', visible: false }
    ] },
    { label: 'Konto', submenu: [
      { label: 'Bei YouTube anmelden …', click: () => ytLogin() },
      { label: 'Von YouTube abmelden', click: () => ytLogout().catch(() => {}) }
    ] },
    { label: 'Hilfe', submenu: [
      { label: 'Nach Updates suchen …', click: () => updCheck(true).catch(() => {}) },
      { label: 'Online-Version öffnen', click: () => shell.openExternal(ONLINE_URL) },
      { label: 'Datenordner öffnen', click: () => shell.openPath(app.getPath('userData')) },
      { type: 'separator' },
      { label: 'Über LehrWerk', click: () => dialog.showMessageBox(win, { type: 'info', title: APP_NAME, icon: iconPath(), message: `${APP_NAME} ${app.getVersion()}`,
        detail: `Arbeitsblätter, Stunden und Präsentationen für den Unterricht.

© 2026 Moritz Bauer

Die App lädt die aktuelle Online-Version; deine Stunden liegen in deinem Konto. Ohne Internet laufen die zuletzt geöffneten Stunden weiter.

Electron ${process.versions.electron} · Chromium ${process.versions.chrome}` }) }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

/* ---------- YouTube-Anmeldung: Videos auf den Folien laufen dann mit dem eigenen Konto (z. B. Premium ohne Werbung) ---------- */
// Google lehnt Anmeldungen in Apps manchmal ab; mit der normalen Chrome-Kennung klappt es meist.
// Wie ein normales Chrome (gekürzte Versionsnummer wie im echten Chrome, ohne „Electron“)
const chromeUA = () => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`;
let ytWin = null;
function ytLogin() {
  if (ytWin && !ytWin.isDestroyed()) { ytWin.focus(); return; }
  const ok = dialog.showMessageBoxSync(win, { type: 'info', title: APP_NAME, buttons: ['Weiter zu Google', 'Abbrechen'], defaultId: 0, cancelId: 1, message: 'Bei YouTube anmelden',
    detail: 'Passkeys funktionieren in diesem Fenster nicht. Fragt Google nach einem Passkey, tippe auf „Andere Möglichkeit wählen“ (bzw. „Andere Option ausprobieren“) und nimm dein Passwort, die Bestätigung auf dem Handy oder einen Code.' });
  if (ok !== 0) return;
  ytWin = new BrowserWindow({ parent: win, width: 520, height: 760, title: 'Bei YouTube anmelden', autoHideMenuBar: true, icon: iconPath(), backgroundColor: '#ffffff', webPreferences: { sandbox: true } });
  // Wie in Version 2.4 (dort kam Google bis zur Passkey-Abfrage): normales Chrome, keine Eingriffe in die Seite.
  // Jeder Eingriff (Passkey ausblenden, andere Browserkennung) ließ Google das Fenster als „unsicher“ ablehnen.
  ytWin.webContents.setUserAgent(chromeUA());
  ytWin.webContents.setWindowOpenHandler(({ url }) => { ytWin.loadURL(url); return { action: 'deny' }; });
  let done = false;
  const check = (e, url) => { if (done || !/^https:\/\/(www|m)\.youtube\.com\//.test(url || '')) return;
    done = true; setTimeout(async () => { const ok = (await session.defaultSession.cookies.get({ domain: 'youtube.com' }).catch(() => [])).some(c => /^(LOGIN_INFO|SAPISID|__Secure-3PSID)$/.test(c.name));
      try { ytWin.close(); } catch {}
      dialog.showMessageBox(win, { type: ok ? 'info' : 'warning', title: APP_NAME, message: ok ? 'Bei YouTube angemeldet.' : 'Die Anmeldung ist nicht durchgegangen.',
        detail: ok ? 'Videos auf den Folien laufen jetzt mit deinem YouTube-Konto, mit Premium also ohne Werbung. Abmelden kannst du dich unter „Konto → Von YouTube abmelden“.' : 'Meldet Google „Anmeldung nicht möglich“ oder fragt nach einem Passkey: bei Google „Andere Möglichkeit wählen“ und Passwort, Bestätigung auf dem Handy oder Code nehmen. Videos laufen auch ohne Anmeldung, nur ohne dein Konto.' }); }, 900); };
  ytWin.webContents.on('did-navigate', check); ytWin.webContents.on('did-redirect-navigation', check);
  ytWin.on('closed', () => { ytWin = null; });
  ytWin.loadURL('https://accounts.google.com/ServiceLogin?service=youtube&hl=de&continue=' + encodeURIComponent('https://www.youtube.com/'));
}
async function ytLogout() {
  const ses = session.defaultSession; const all = await ses.cookies.get({}); let n = 0;
  for (const c of all) { const d = String(c.domain || '').replace(/^\./, ''); if (!/(^|\.)(youtube\.com|google\.[a-z.]+|googlevideo\.com|youtube-nocookie\.com)$/.test(d)) continue;
    try { await ses.cookies.remove((c.secure ? 'https://' : 'http://') + d + (c.path || '/'), c.name); n++; } catch {} }
  dialog.showMessageBox(win, { type: 'info', title: APP_NAME, message: n ? 'Von YouTube abgemeldet.' : 'Du warst bei YouTube nicht angemeldet.' });
}

/* ---------- Updates: beim Öffnen nachfragen, wenn es eine neue App-Version gibt ---------- */
// Die Inhalte (Website) sind immer aktuell; nur die App-Hülle (Fenster, Beamer, Speichern) braucht ab und zu ein Update.
const REL_API = 'https://api.github.com/repos/moritzbauer171-art/Abbaukasten/releases/tags/windows';
const REL_PAGE = 'https://github.com/moritzbauer171-art/Abbaukasten/releases/tag/windows';
const verNum = v => String(v || '').split('.').map(x => parseInt(x, 10) || 0);
const newer = (a, b) => { const x = verNum(a), y = verNum(b); for (let i = 0; i < Math.max(x.length, y.length); i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
const updFile = () => path.join(app.getPath('userData'), 'update.json');
const updState = () => { try { return JSON.parse(fs.readFileSync(updFile(), 'utf8')); } catch { return {}; } };
const updSave = o => { try { fs.writeFileSync(updFile(), JSON.stringify({ ...updState(), ...o })); } catch {} };
async function updCheck(manual) {
  let rel;
  try { const r = await net.fetch(REL_API, { headers: { 'User-Agent': 'LehrWerk', Accept: 'application/vnd.github+json' } }); if (!r.ok) throw new Error('HTTP ' + r.status); rel = await r.json(); }
  catch (err) { if (manual) dialog.showMessageBox(win, { type: 'warning', title: APP_NAME, message: 'Die Suche nach Updates hat nicht geklappt.', detail: 'Bitte prüfe die Internetverbindung.' }); return; }
  const m = /\(([\d.]+)\)/.exec(rel.name || ''); const latest = m && m[1]; const mine = app.getVersion();
  const asset = (rel.assets || []).find(a => a.name === 'LehrWerk-Windows-x64.zip');
  if (!latest || !newer(latest, mine)) { if (manual) dialog.showMessageBox(win, { type: 'info', title: APP_NAME, message: 'LehrWerk ist auf dem neuesten Stand.', detail: `Version ${mine}` }); return; }
  if (!manual && updState().skip === latest) return;
  const r = await dialog.showMessageBox(win, { type: 'question', title: APP_NAME, icon: iconPath(), noLink: true, defaultId: 0, cancelId: 1,
    buttons: ['Jetzt aktualisieren', 'Später', 'Diese Version überspringen'],
    message: `Eine neue Version von LehrWerk ist da: ${latest}`,
    detail: `Du hast ${mine}. Das Update lädt einmal rund 120 MB und startet LehrWerk danach neu. Deine Stunden und Einstellungen bleiben, sie liegen in deinem Konto.` });
  if (r.response === 2) { updSave({ skip: latest }); return; }
  if (r.response !== 0) return;
  if (process.platform !== 'win32' || !asset) { shell.openExternal(REL_PAGE); return; }
  updInstall(asset.browser_download_url, latest).catch(err => {
    try { win.setProgressBar(-1); } catch {}
    dialog.showMessageBox(win, { type: 'warning', title: APP_NAME, buttons: ['Download-Seite öffnen', 'Schließen'], defaultId: 0, cancelId: 1, message: 'Das Update konnte nicht automatisch installiert werden.', detail: String(err && err.message || err) + '\n\nDu kannst die neue Version auch selbst herunterladen und über den alten Ordner entpacken.' })
      .then(x => { if (x.response === 0) shell.openExternal(REL_PAGE); });
  });
}
async function updInstall(url, ver) {
  const appDir = path.dirname(process.execPath);
  // Darf in den App-Ordner geschrieben werden? Sonst Download-Seite
  const probe = path.join(appDir, '.lw-schreibtest'); fs.writeFileSync(probe, '1'); fs.unlinkSync(probe);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lehrwerk-update-')); const zip = path.join(tmp, 'update.zip');
  const r = await net.fetch(url, { headers: { 'User-Agent': 'LehrWerk' } }); if (!r.ok || !r.body) throw new Error('Download fehlgeschlagen (HTTP ' + r.status + ')');
  const total = +r.headers.get('content-length') || 0; let got = 0; const out = fs.createWriteStream(zip); const rd = r.body.getReader();
  for (;;) { const { done, value } = await rd.read(); if (done) break; got += value.length; if (!out.write(Buffer.from(value))) await new Promise(res => out.once('drain', res)); if (total && win && !win.isDestroyed()) win.setProgressBar(got / total); }
  await new Promise((res, rej) => { out.end(res); out.on('error', rej); });
  if (total && got < total) throw new Error('Download unvollständig');
  try { win.setProgressBar(-1); } catch {}
  const exe = path.basename(process.execPath); const q = s => s.replace(/"/g, '');
  const bat = path.join(tmp, 'update.cmd');
  fs.writeFileSync(bat, [
    '@echo off', 'chcp 65001 >nul',
    ':warte', `tasklist /FI "PID eq ${process.pid}" 2>nul | find "${process.pid}" >nul && (timeout /t 1 /nobreak >nul & goto warte)`,
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '${q(zip).replace(/'/g, "''")}' -DestinationPath '${q(tmp).replace(/'/g, "''")}\\neu' -Force"`,
    `robocopy "${q(tmp)}\\neu\\LehrWerk" "${q(appDir)}" /E /R:5 /W:1 /NFL /NDL /NJH /NJS /NP >nul`,
    `start "" "${q(appDir)}\\${q(exe)}"`,
    `(goto) 2>nul & rmdir /s /q "${q(tmp)}"`
  ].join('\r\n'), 'utf8');
  updSave({ skip: '', installed: ver });
  await dialog.showMessageBox(win, { type: 'info', title: APP_NAME, message: `Version ${ver} ist geladen.`, detail: 'LehrWerk schließt sich jetzt kurz und startet aktualisiert neu.', buttons: ['OK'] });
  require('child_process').spawn('cmd.exe', ['/c', bat], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  app.quit();
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  try { session.defaultSession.setSpellCheckerLanguages(['de-DE']); } catch {}
  // Mikrofon (Lautstärke-Ampel), zweiter Bildschirm (Referentenansicht), Bildschirm wach halten, Vollbild: nur für LehrWerk selbst
  const OK = new Set(['media', 'window-management', 'fullscreen', 'screen-wake-lock', 'clipboard-sanitized-write', 'clipboard-read', 'notifications']);
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb, d) => cb(OK.has(perm) && isOurs((d && (d.requestingUrl || d.securityOrigin)) || wc.getURL())));
  session.defaultSession.setPermissionCheckHandler((wc, perm, origin) => OK.has(perm) && (isOurs(origin) || (wc && isOurs(wc.getURL()))));
  // Downloads, die nicht über die Brücke laufen, trotzdem mit Speichern-Dialog
  session.defaultSession.on('will-download', (e, item) => { item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('documents'), safeName(item.getFilename())) }); });
  menu(); createWindow();
  // beim Öffnen nach einer neuen App-Version fragen (nicht im Offline-Fall, nicht beim Testen)
  if (app.isPackaged) win.webContents.once('did-finish-load', () => setTimeout(() => updCheck(false).catch(() => {}), 2500));
  // Beamer an- oder abgesteckt: der Seite Bescheid geben
  const tell = () => { if (win && !win.isDestroyed()) win.webContents.send('lw:displays', displays().length); };
  screen.on('display-added', () => setTimeout(tell, 600)); screen.on('display-removed', () => { if (audWin && !audWin.isDestroyed() && displays().length < 2) audWin.close(); setTimeout(tell, 300); });
});
app.on('window-all-closed', () => app.quit());
