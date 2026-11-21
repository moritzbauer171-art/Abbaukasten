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
