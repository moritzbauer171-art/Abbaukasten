"""Folien wie PowerPoint."""
from conftest import blocks_standard

def test_vorschaubild_linksbuendig_und_einfuegen(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.click('[data-act="area-set"][data-v="pres"]'); pg.wait_for_timeout(1500)
    al = pg.evaluate("getComputedStyle(document.querySelector('.pp-th')).textAlign")
    assert al in ('left', 'start')
    g = pg.locator('.pp-gap').nth(1); assert float(pg.evaluate("getComputedStyle(document.querySelectorAll('.pp-gap .pp-plus')[1]).opacity")) == 0
    gb = g.bounding_box(); pg.mouse.click(gb['x'] + 40, gb['y'] + gb['height'] / 2); pg.wait_for_timeout(500)
    assert pg.locator('#pp-gal').count() == 1

def test_think_pair_share_dreischritt(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard(); b[3]['items'][0]['soz'] = 'tps'; b[3]['items'][1]['soz'] = 'tps'; lw.setup(pg, b)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    for _ in range(12):
        if pg.locator('.pr .pr-slide .pr-tps').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(350)
    assert pg.locator('.pr .pr-slide .pr-tps-s').count() == 3
    pg.locator('.pr .pr-slide .pr-tps-s').nth(1).click(); pg.wait_for_timeout(300)
    assert pg.locator('.pr .pr-slide .pr-tps-s.on').inner_text().strip() == 'Pair'
    pg.locator('.pr .pr-slide').screenshot(path=str(__import__('conftest').OUT / 'tps_folie.png'))

def test_video_gross_mit_auftrag(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard()
    b.insert(1, {'id': 'v1', 'type': 'step', 'tpl': 'video', 'title': '', 'ph': 'ein', 'min': '5', 'soz': 'pl', 'fol': 'video', 'head': '', 'cap': 'Kurzvideo', 'text': 'Achten Sie beim Ansehen darauf, wie Nähe erzeugt wird.', 'yt': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'quote': '', 'author': '', 'src': '', 'note': '', 'eh': '', 'media': ''})
    lw.setup(pg, b)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1000)
    for _ in range(8):
        if pg.locator('.pr .pr-slide .pr-yt').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(300)
    pg.locator('.pr .pr-slide .pr-yt-go').click(); pg.wait_for_timeout(800)
    assert not pg.locator('.pr .pr-ytb').is_hidden()
    pg.keyboard.press('v'); pg.wait_for_timeout(300)
    assert pg.locator('.pr.pr-ytbig').count() == 1
    assert pg.locator('.pr .pr-slide .pr-phb').is_hidden() and pg.locator('.pr .pr-fbtns').is_hidden()
    assert float(pg.evaluate("getComputedStyle(document.querySelector('.pr > .pr-bar')).opacity")) == 0
    pg.keyboard.press('a'); pg.wait_for_timeout(500)
    assert pg.locator('.pr.pr-ytauf').count() == 1
    pg.screenshot(path=str(__import__('conftest').OUT / 'video_auftrag.png'))

def test_ton_unter_30_prozent(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard(); b[3]['timer'] = 'on'; b[3]['min'] = '1'; b[3]['items'][0]['min'] = '1'; b[3]['items'][1]['min'] = '0'; lw.setup(pg, b)
    pg.evaluate("""() => { window.__tones = 0; const A = window.AudioContext; window.AudioContext = function () { window.__tones++; return new A(); };
      const d0 = Date.now.bind(Date); window.__off = 0; Date.now = () => d0() + window.__off; }""")
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(800)
    for _ in range(10):
        if pg.locator('.pr .pr-slide .pr-timer').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(300)
    pg.locator('.pr .pr-slide .pr-timer').click(); pg.wait_for_timeout(600)
    assert pg.evaluate("window.__tones") == 0
    pg.evaluate("window.__off = 45000"); pg.wait_for_timeout(800)
    assert pg.evaluate("window.__tones") == 1
    pg.evaluate("window.__off = 50000"); pg.wait_for_timeout(800)
    assert pg.evaluate("window.__tones") == 1

def test_arbeitsteilige_abs_auf_einer_folie(lw):
    pg = lw.open(); lw.new_lesson(pg)
    tA = {'id': 'ta', 'type': 'tasks', 'title': '', 'min': 20, 'items': [{'text': 'Analysieren Sie die Panels auf S. 12.', 'soz': 'ga'}, {'text': 'Notieren Sie Ihre Ergebnisse.', 'soz': 'ga'}]}
    tA2 = {'id': 'ta2', 'type': 'tasks', 'title': '', 'min': 10, 'items': [{'text': 'Deuten Sie die Leerstelle.', 'soz': 'pa'}, {'text': 'Begründen Sie Ihre Deutung.', 'soz': 'ea'}]}
    lw.setup(pg, [tA, tA2]); pg.evaluate("__S.sheet.meta.title = 'Folman: Versteck'; __RE()")
    pg.evaluate("""(() => { const P = __S.sheet; P.abs = [{ id: 'ab1', active: true }, { id: 'ab2', meta: { nr: '', title: 'Folman: Traum', topic: '' }, zrefs: [],
      blocks: [{ id: 'tb', type: 'tasks', title: '', min: 25, items: [{ text: 'Untersuchen Sie die Farbgebung auf S. 40.', soz: 'ga' }, { text: 'Halten Sie Ihre Beobachtungen fest.', soz: 'ga' }] }, { id: 'tb2', type: 'tasks', title: '', min: 10, items: [{ text: 'Vergleichen Sie mit dem Tagebuch.', soz: 'pa' }, { text: 'Bewerten Sie die Umsetzung.', soz: 'ea' }] }] }]; P.abActive = 0; P.stunde = { title: 'Graphic Diary' }; __RE(); __RP(); })()""")
    pg.wait_for_timeout(500)
    pg.locator('#editor [data-act="abx-par"]').check(); pg.wait_for_timeout(400)
    pg.locator('#editor [data-act="abx-go"][data-abk="1"]').click(); pg.wait_for_timeout(500)
    pg.locator('#editor [data-act="abx-par"]').check(); pg.wait_for_timeout(400)
    assert 'parallel zu AB' in pg.locator('#editor .ab-par').inner_text()
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    seen = []
    for _ in range(10):
        seen.append(pg.locator('.pr .pr-slide').inner_text())
        if pg.locator('.pr .pr-slide .pr-cols').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(350)
    assert pg.locator('.pr .pr-slide .pr-col').count() == 2
    t = pg.locator('.pr .pr-slide').inner_text()
    assert 'Panels auf S. 12' in t and 'Farbgebung auf S. 40' in t and 'Folman: Traum' in t
    assert 'aufgaben 1–2 · arbeitsteilig · 2 abs parallel' in t.lower() and '25' in t
    assert any('Arbeitsteilige Phase' in s for s in seen)
    assert 'Vergleichen Sie' not in t and 'Deuten Sie' not in t
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
    t2 = pg.locator('.pr .pr-slide').inner_text()
    assert pg.locator('.pr .pr-slide .pr-col').count() == 2 and 'Deuten Sie' in t2 and 'Bewerten Sie' in t2 and 'Panels' not in t2 and '10' in t2 and 'aufgaben 3–4' in t2.lower()
    pg.locator('.pr .pr-slide').screenshot(path=str(__import__('conftest').OUT / 'par_folie.png'))

def test_seite_arbeitsteilig_fenster_wand(lw):
    pg = lw.open(); lw.new_lesson(pg)
    t0 = {'id': 't0', 'type': 'tasks', 'title': '', 'items': [{'text': 'Arbeiten Sie die Muster heraus.', 'soz': 'ea'}, {'text': 'Erläutern Sie die Muster.', 'soz': 'pa'}]}
    hF = {'id': 'hf', 'type': 'heading', 'text': 'Fensterseite - MyAI in Snapchat'}
    tF = {'id': 'tf', 'type': 'tasks', 'title': '', 'items': [{'text': 'Analysieren Sie MyAI.', 'soz': 'ga'}, {'text': 'Vergleichen Sie MyAI.', 'soz': 'ga'}, {'text': 'Rakete MyAI', 'rk': True}]}
    hW = {'id': 'hw', 'type': 'heading', 'text': 'Wandseite - Das Beispiel MetaAI'}
    tW = {'id': 'tw', 'type': 'tasks', 'title': '', 'items': [{'text': 'Analysieren Sie MetaAI.', 'soz': 'ga'}, {'text': 'Vergleichen Sie MetaAI.', 'soz': 'ga'}]}
    tE = {'id': 'te', 'type': 'tasks', 'title': '', 'items': [{'text': 'Sichern Sie im Plenum.', 'soz': 'ea'}]}
    lw.setup(pg, [t0, {'id': 'p1', 'type': 'pagebreak'}, hF, tF, {'id': 'p2', 'type': 'pagebreak'}, hW, tW, {'id': 'p3', 'type': 'pagebreak'}, tE]); pg.evaluate("__RP()"); pg.wait_for_timeout(700)
    pg.locator('#pages .page').first.hover(); pg.wait_for_timeout(300)
    assert not pg.locator('#pg-split').is_visible()
    pg.locator('#pages .page').nth(2).hover(); pg.wait_for_timeout(300)
    assert pg.locator('#pg-split').is_visible()
    pg.locator('#pg-split .pgs-b').click(); pg.wait_for_timeout(800)
    assert pg.evaluate("__S.sheet.blocks.find(b => b.id === 'tw').par") is True
    nos = pg.evaluate("[...document.querySelectorAll('#pages .task-no')].map(x => x.textContent.trim())")
    assert [n for n in nos if n] [:7] == ['1', '2', '3', '4', '3', '4', '5'], nos
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    for _ in range(10):
        if pg.locator('.pr .pr-slide .pr-cols').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(350)
    t = pg.locator('.pr .pr-slide').inner_text()
    assert pg.locator('.pr .pr-slide .pr-col').count() == 2 and 'Analysieren Sie MyAI' in t and 'Analysieren Sie MetaAI' in t and 'Fensterseite' in t and 'Wandseite' in t, t
