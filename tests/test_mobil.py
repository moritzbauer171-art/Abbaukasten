"""Handy-Ansicht."""
from conftest import blocks_standard

def test_kopf_kompakt_und_weicht(lw):
    pg = lw.open(viewport={'width': 390, 'height': 844}); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.click('#mbar [data-mb="edit"]'); pg.wait_for_timeout(500)
    assert pg.locator('header.bar').bounding_box()['height'] < 100
    gaps = pg.evaluate("(() => { const c = [...document.querySelectorAll('#editor .card')].map(x => x.getBoundingClientRect()); return c.slice(1).map((r, i) => r.top - c[i].bottom); })()")
    assert max(gaps) <= 16, gaps
    pg.click('#mbar [data-mb="preview"]'); pg.wait_for_timeout(800)
    pg.locator('#preview-scroll').evaluate("e => e.scrollTop = 300"); pg.wait_for_timeout(100); pg.locator('#preview-scroll').evaluate("e => e.scrollTop = 600"); pg.wait_for_timeout(400)
    assert pg.evaluate("document.body.classList.contains('hd-hide')")
