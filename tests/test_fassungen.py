"""Frühere Fassungen wiederherstellen."""
from conftest import blocks_standard

def test_fassung_wiederherstellen(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.wait_for_timeout(1500)
    pg.evaluate("__FA()"); pg.wait_for_timeout(700)
    n0 = pg.locator('#dlg-root .fass-it').count(); assert n0 >= 1
    pg.click('#dlg-root .row [data-act="dlg-close"]')
    pg.evaluate("() => { __S.sheet.blocks = __S.sheet.blocks.slice(0, 2); __RE(); }"); pg.evaluate("__RP()"); pg.wait_for_timeout(300)
    assert pg.evaluate("__S.sheet.blocks.length") == 2
    pg.evaluate("__FA()"); pg.wait_for_timeout(700)
    items = pg.locator('#dlg-root .fass-it'); assert items.count() >= 2
    # ältesten Stand (mit 5 Bausteinen) wiederherstellen
    items.filter(has_text='5 Bausteine').first.locator('[data-act="fass-go"]').click(); pg.wait_for_timeout(1200)
    assert pg.evaluate("__S.sheet.blocks.length") == 5
    pg.evaluate("__FA()"); pg.wait_for_timeout(700)
    assert 'vor dem Wiederherstellen' in pg.locator('#dlg-root .fass-l').inner_text()
