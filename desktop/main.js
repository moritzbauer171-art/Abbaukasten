'use strict';
// AB-Werkstatt als Desktop-App (Electron). Die Oberfläche ist dieselbe wie auf GitHub Pages,
// nur ohne Internet: Schriften und Bibliotheken liegen im Ordner app/.
const { app, BrowserWindow, Menu, dialog, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_NAME = 'AB-Werkstatt';
const ONLINE_URL = 'https://moritzbauer171-art.github.io/Abbaukasten/';
app.setName(APP_NAME);
if (process.platform === 'win32') app.setAppUserModelId('de.abwerkstatt.app');

if (!app.requestSingleInstanceLock()) { app.quit(); return; }

let win = null;
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
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true }
  });
  if (st.max) win.maximize();
  win.once('ready-to-show', () => { win.show(); setTimeout(firstRun, 800); });
  const save = () => { if (!win || win.isDestroyed()) return; const b = win.getNormalBounds(); writeJSON(statePath(), { ...b, max: win.isMaximized() }); };
  win.on('close', save);
  win.on('page-title-updated', e => e.preventDefault());

  // Links nach außen im Standardbrowser öffnen, die App selbst nie wegnavigieren
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });

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

  win.loadFile(path.join(__dirname, 'app', 'index.html'));
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
    message: 'AB-Werkstatt auf dem Desktop und im Startmenü ablegen?',
    detail: 'Dann starten Sie die App künftig mit einem Klick. Das geht auch später über „Datei → Verknüpfungen anlegen“.' });
  if (r.response === 0) makeShortcuts();
}

// ---------- Brücke zur Seite (preload.js) ----------
ipcMain.handle('ab:save', async (e, name, bytes) => {
  const ext = path.extname(name).slice(1).toLowerCase();
  const kinds = { pdf: 'PDF-Dokument', docx: 'Word-Dokument', json: 'Sicherung', md: 'Markdown-Datei', png: 'Bild' };
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

ipcMain.handle('ab:print', async (e, info) => {
  // Gemischte Hoch- und Querseiten lassen sich nicht in einem Druckauftrag ausrichten: dann über das PDF
  if (info && info.mixed) {
    const p = path.join(os.tmpdir(), 'AB-Werkstatt-Druck-' + Date.now() + '.pdf');
    fs.writeFileSync(p, await makePdf()); shell.openPath(p); return 'pdf';
  }
  return new Promise(res => win.webContents.print({ silent: false, printBackground: true, landscape: !!(info && info.landscape), pageSize: 'A4', margins: { marginType: 'none' } }, ok => res(ok ? 'ok' : 'abgebrochen')));
});
ipcMain.handle('ab:open', (e, p) => shell.openPath(p));
ipcMain.handle('ab:reveal', (e, p) => { shell.showItemInFolder(p); });

// ---------- Menü ----------
function menu() {
  const click = sel => () => win && win.webContents.executeJavaScript(`(document.querySelector(${JSON.stringify(sel)})||{click(){}}).click()`);
  const isWin = process.platform === 'win32';
  const tpl = [
    { label: 'Datei', submenu: [
      { label: 'Meine Blätter', accelerator: 'CmdOrCtrl+O', click: click('#btn-lib') },
      { type: 'separator' },
      { label: 'Als PDF speichern …', accelerator: 'CmdOrCtrl+S', click: click('#btn-pdf') },
      { label: 'Als Word-Datei speichern …', accelerator: 'CmdOrCtrl+Shift+S', click: click('#btn-docx') },
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
    { label: 'Hilfe', submenu: [
      { label: 'Online-Version öffnen', click: () => shell.openExternal(ONLINE_URL) },
      { label: 'Datenordner öffnen', click: () => shell.openPath(app.getPath('userData')) },
      { type: 'separator' },
      { label: 'Über AB-Werkstatt', click: () => dialog.showMessageBox(win, { type: 'info', title: APP_NAME, icon: iconPath(), message: `${APP_NAME} ${app.getVersion()}`,
        detail: `Arbeitsblätter, Tippkarten und Tafelkarten setzen und drucken.\n\nIhre Blätter liegen auf diesem Computer im Datenordner der App. Sichern Sie sie ab und zu über „Meine Blätter → Alle Blätter sichern“.\n\nElectron ${process.versions.electron} · Chromium ${process.versions.chrome}` }) }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  try { session.defaultSession.setSpellCheckerLanguages(['de-DE']); } catch {}
  // Downloads, die nicht über die Brücke laufen, trotzdem mit Speichern-Dialog
  session.defaultSession.on('will-download', (e, item) => { item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('documents'), safeName(item.getFilename())) }); });
  menu(); createWindow();
});
app.on('window-all-closed', () => app.quit());
