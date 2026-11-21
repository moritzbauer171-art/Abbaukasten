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
