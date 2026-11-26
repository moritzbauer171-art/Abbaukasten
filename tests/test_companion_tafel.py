"""Companion bedient die Tafelansicht (Classroomscreen-Werkzeuge) am Rechner."""
from conftest import blocks_standard, OUT

def center(loc):
    b = loc.bounding_box(); return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2

def test_tafelansicht_vom_tablet(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.evaluate("__SV()"); pg.wait_for_timeout(800)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    pg.click('.pr [data-p="mode"]'); pg.wait_for_timeout(800)
    assert pg.locator('.pr.pr-tafel').count() == 1
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820})
    for _ in range(3):
        try: pad.wait_for_selector('.lfc-tmb', timeout=10000); break
        except Exception: pad.reload()
    pad.wait_for_timeout(4000); pad.screenshot(path=str(OUT / 'tm_pad0.png')); print('TF', pad.locator('.lfc-prw').count(), pad.locator('.lfc-sl').inner_html()[:300])
    pad.wait_for_selector('.lfc-prw .tw-timer', timeout=15000)
    pad.screenshot(path=str(OUT / 'tm_pad.png'))
    # Timer starten
    x, y = center(pad.locator('.lfc-prw .tw-timer [data-ta="go"]')); pad.mouse.click(x, y); pg.wait_for_timeout(800)
    assert pg.locator('.pr .tw-timer [data-ta="go"]').inner_text().strip() == 'Pause'
    # Werkzeug dazunehmen: Ampel
    pad.click('.lfc-tmb'); pad.wait_for_timeout(300); pad.click('.lfc-sh [data-tmc*="ampel"]'); pg.wait_for_timeout(800)
    assert pg.locator('.pr .tw-ampel').count() == 1
    pad.wait_for_selector('.lfc-prw .tw-ampel', timeout=8000); pad.wait_for_timeout(500)
    x, y = center(pad.locator('.lfc-prw .tw-ampel [data-ta="am"][data-v="r"]')); pad.mouse.click(x, y); pg.wait_for_timeout(800)
    assert pg.locator('.pr .tw-ampel .lamps i.r.on').count() == 1
    # Arbeitsform ziehen (verschieben)
    h = pad.locator('.lfc-prw .tw-symbol .tw-h b'); x, y = center(h); before = pg.evaluate("parseFloat(document.querySelector('.pr .tw-symbol').style.left)")
    pad.mouse.move(x, y); pad.mouse.down(); pad.mouse.move(x - 60, y + 20, steps=6); pad.mouse.up(); pg.wait_for_timeout(800)
    after = pg.evaluate("parseFloat(document.querySelector('.pr .tw-symbol').style.left)")
    assert after < before - 40
    pad.wait_for_timeout(1800); pad.screenshot(path=str(OUT / 'tm_pad2.png'))

def test_knopf_zurueck_zur_folie(lw):
    from conftest import blocks_standard
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(400)
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820})
    pg.evaluate("__OP(0)")
    try: pad.wait_for_selector('.lfc-tkm', timeout=12000)
    except Exception: pad.reload(); pad.wait_for_selector('.lfc-tkm', timeout=15000)
    pad.wait_for_timeout(800)
    assert pad.locator('.lfc-back').count() == 0
    # Tafel an den Beamer
    pad.click('.lfc-tkm'); pad.wait_for_timeout(300); pad.click('.lfc-modes [data-tab="tafel"]'); pad.wait_for_timeout(800)
    pad.locator('.lfc-fx').click(); pad.wait_for_timeout(1500)
    assert pg.locator('.pr.pr-boarding, .pr-boarding').count() == 1
    assert pad.locator('.lfc-back').is_visible()
    # auch im Fotos-Bereich sichtbar
    pad.click('.lfc-tkm'); pad.wait_for_timeout(300)
    if pad.locator('.lfc-modes [data-tab="cam"]').count(): pad.click('.lfc-modes [data-tab="cam"]'); pad.wait_for_timeout(600); assert pad.locator('.lfc-back').is_visible()
    pad.locator('.lfc-back').click(); pad.wait_for_timeout(1500)
    assert pg.locator('.pr-boarding').count() == 0
    assert pad.locator('.lfc-back').count() == 0
    assert pad.locator('.lfc-seg [data-tab="fol"][aria-selected="true"], .lfc2').count() >= 1
    # Beamer schwarz → Knopf erscheint, Tipp schaltet wieder an
    pg.locator('.pr-bar button', has_text='Schwarz').first.click(); pg.wait_for_timeout(1500)
    assert pad.locator('.lfc-back').is_visible() and 'schwarz' in pad.locator('.lfc-back').inner_text()
    pad.locator('.lfc-back').click(); pad.wait_for_timeout(1500); assert pad.locator('.lfc-back').count() == 0
    pad.screenshot(path=str(__import__('conftest').OUT / 'back_end.png'))
