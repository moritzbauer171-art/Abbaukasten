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
