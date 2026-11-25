"""Gemeinsame Hilfen für die LehrWerk-Tests (pytest + Playwright).

Die Tests laden dist/ab-werkstatt.html als Datei, ersetzen Supabase durch eine
Attrappe im localStorage (tests/fixtures/fake_supabase.js) und legen drei Klassen an.
Ohne Netz (z. B. in einer abgeschotteten Umgebung) können Bibliotheken aus einem
Ordner kommen: LW_LIBS=/pfad/mit/html2canvas.min.js,jspdf.umd.min.js,jszip.min.js,pptxgen.bundle.js
"""
import os, pathlib, re, pytest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FIX = pathlib.Path(__file__).resolve().parent / 'fixtures'
OUT = pathlib.Path(os.environ.get('LW_TEST_OUT', ROOT / 'tests' / '_out')); OUT.mkdir(parents=True, exist_ok=True)
LIBS = pathlib.Path(os.environ['LW_LIBS']) if os.environ.get('LW_LIBS') else None

# Haken für die Tests: Zustand und Neuzeichnen von außen erreichbar
HOOKS = [('const state = {', 'const state = window.__S = {'),
         ('function renderEditor(focusSel) {', 'window.__RE = () => renderEditor(); function renderEditor(focusSel) {'),
         ('function openPres(start, opts = {}) {', 'window.__OP = (...a) => openPres(...a);\nfunction openPres(start, opts = {}) {'),
         ('function renderPreview() {', 'window.__RP = () => renderPreview(); function renderPreview() {'),
         ('async function openFass() {', 'window.__FA = () => openFass(); async function openFass() {'),
         ('function saveNow() {', 'window.__SV = () => saveNow(); function saveNow() {'),
         ('function openVP() {', 'window.__VP = () => openVP(); function openVP() {'),
         ("const kOf = () => (tab === 'fol' ? 'sl' : tab);", "const kOf = () => (tab === 'fol' ? 'sl' : tab); window.__LB = () => B;"),
         ('function lfcFull(key) {', 'window.__PCT = () => INK.remote.keyed(BOARD.s.id).length;\n  function lfcFull(key) {')]

@pytest.fixture(scope='session')
def page_file():
    src = (ROOT / 'dist' / 'ab-werkstatt.html').read_text()
    for a, b in HOOKS:
        assert src.count(a) >= 1, f'Haken fehlt: {a[:50]}'
        src = src.replace(a, b, 1)
    p = OUT / 'lehrwerk-test.html'
    p.write_text('<!doctype html><html lang="de"><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + '</body></html>')
    return p

FAKE = (FIX / 'fake_supabase.js').read_text()
def _route(r):
    u = r.request.url
    if u.startswith('file:'): return r.continue_()
    if 'supabase-js' in u: return r.fulfill(status=200, body=FAKE, content_type='application/javascript')
    if LIBS:
        for f in ['html2canvas.min.js', 'jspdf.umd.min.js', 'jszip.min.js', 'pptxgen.bundle.js']:
            if f.split('.')[0] in u and (LIBS / f).exists(): return r.fulfill(status=200, body=(LIBS / f).read_text(), content_type='application/javascript')
        return r.fulfill(status=200, body='', content_type='text/css' if 'font' in u else 'application/javascript')
    if 'youtube' in u or 'wiktionary' in u or 'dwds' in u: return r.fulfill(status=200, body='')
    return r.continue_()

@pytest.fixture(scope='session')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(); yield b; b.close()

class LW:
    """Eine geöffnete LehrWerk-Seite mit kleinen Hilfen."""
    def __init__(self, ctx, page_file):
        self.ctx, self.file, self.errs = ctx, page_file, []
    def open(self, url_suffix='', viewport=None, init=None):
        pg = self.ctx.new_page()
        if init: pg.add_init_script(init)
        if viewport: pg.set_viewport_size(viewport)
        pg.on('pageerror', lambda e: self.errs.append(str(e)))
        pg.goto('file://' + str(self.file) + url_suffix); pg.wait_for_timeout(1800)
        return pg
    def new_lesson(self, pg):
        pg.click('#btn-stunden'); pg.click('#mmore-pop [data-mm="btn-lib"]'); pg.wait_for_timeout(300)
        pg.click('#lib-root [data-act="lib-new"]'); pg.wait_for_timeout(250)
        pg.click('#dlg-root [data-act="nw-tpl"][data-k="leer"]'); pg.click('#dlg-root [data-act="nw-go"]'); pg.wait_for_timeout(500)
    def setup(self, pg, blocks_js, title='Nähe und Distanz'):
        """Blöcke setzen und Vorschau neu rechnen lassen (über eine echte Eingabe)."""
        pg.evaluate("([b, t]) => { const S = __S.sheet; S.meta.title = t; S.meta.nr = '6'; S.blocks = b; __RE(); }", [blocks_js, title])
        pg.evaluate("__RP()"); pg.wait_for_timeout(2500)

LONG = ' '.join(['Das Thema Multimodalität in der Kommunikation ist nicht neu und wird in der Forschung intensiv untersucht.'] * 9)
def blocks_standard():
    tx = LONG + '\n\n## Forschungsfragen\n\nSomit gilt es, Fragen zu stellen: ' + LONG + '\n\nEin neuer Absatz beginnt hier. ' + LONG + '\n\n## Rezeption\n\nEinige Antworten gibt es bereits. ' + LONG
    return [
        {'id': 'q1', 'type': 'quote', 'text': 'Wer nah ist, muss nicht nah sein.', 'author': 'unbekannt'},
        {'id': 'i1', 'type': 'info', 'kind': 'Merke', 'title': 'Sprache der Distanz', 'text': 'Merkmale: Planung, Sachlichkeit, Themenfixierung.'},
        {'id': 'm1', 'type': 'material', 'title': 'Multimodalität', 'text': tx, 'glossary': [], 'source': 'Quelle A', 'lineNumbers': True, 'fmt': {'cols': '2'}, 'memo': '', 'nl': 1, 'gaps': []},
        {'id': 'k1', 'type': 'tasks', 'title': '', 'restart': False, 'items': [
            {'text': 'Erschließen Sie sich mithilfe des Textes den Begriff Multimodalität.', 'soz': 'ea', 'ph': 'era', 'min': '15', 'eh': 'Zusammenspiel mehrerer Zeichensysteme'},
            {'text': 'Stellen Sie in einem Flussdiagramm dar, wie die Modi zusammenwirken.', 'soz': 'ga', 'ph': 'era', 'min': '20'}]},
        {'id': 'k2', 'type': 'tasks', 'title': '', 'restart': False, 'items': [{'text': 'Beurteilen Sie, ob kritisches Hinterfragen im Alltag realistisch ist.', 'soz': 'pl', 'ph': 'refl', 'min': '10'}]},
    ]

@pytest.fixture
def lw(browser, page_file):
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
    ctx.add_init_script("localStorage.setItem('abw.tips', '1'); localStorage.setItem('abw.start', '0'); localStorage.setItem('abw.news', JSON.stringify('kollegium-2026-11')); if (!localStorage.getItem('fakeuser')) localStorage.setItem('fakeuser', 'userA'); localStorage.setItem('abw.onecard', '1')")
    ctx.add_init_script((FIX / 'init.js').read_text())
    ctx.route('**/*', _route)
    w = LW(ctx, page_file); yield w
    ctx.close()
    assert not w.errs, 'Fehler auf der Seite: ' + ' | '.join(w.errs[:3])
