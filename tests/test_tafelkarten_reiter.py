from conftest import blocks_standard

def test_tafelkarten_reiter_auch_ohne_karten(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.evaluate("__S.sheet.cards = []; __RE()")
    pg.locator('[data-act="area-more"]').click(); pg.wait_for_timeout(300)
    pg.locator('.area-mp [data-v="tafel"]').click(); pg.wait_for_timeout(600)
    r = pg.locator('#outsw [data-out="karten"]'); assert r.is_visible()
    r.click(); pg.wait_for_timeout(600)
    assert pg.locator('#editor [data-act="kk-add"], #editor [data-act="card-add"]').count() >= 1 or 'Karte' in pg.locator('#editor').inner_text()
