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
