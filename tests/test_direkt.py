"""Direktverbindung Laptop ↔ iPad (Hotspot): echter Server aus desktop/lan.js, iPad ohne Konto."""
import subprocess, json, pytest
from conftest import blocks_standard, ROOT

TOKEN = 'testtoken1234abcd'

@pytest.fixture
def lan(page_file):
    p = subprocess.Popen(['node', str(ROOT / 'tests' / 'fixtures' / 'lan_server.js'), str(page_file), TOKEN], stdout=subprocess.PIPE, text=True)
    line = p.stdout.readline(); port = int(line.split()[1])
    yield port
    p.kill()

def test_ipad_direkt_ueber_hotspot(lw, lan, browser):
    port = lan
    info = {'on': True, 'port': port, 'token': TOKEN, 'ws': f'ws://127.0.0.1:{port}/lw-ws?t={TOKEN}', 'url': f'http://127.0.0.1:{port}/?tafel&lan={TOKEN}', 'hotspot': True, 'addrs': [], 'n': 1}
    lw.ctx.add_init_script("window.abDesktop = { lan: async on => (" + json.dumps(info) + "), hotspot: async () => {} };")
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(400)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    # iPad: eigenes Gerät, nicht angemeldet, Seite kommt vom Laptop
    ctx = browser.new_context(viewport={'width': 1180, 'height': 820})
    def rt(r):
        u = r.request.url
        if u.startswith(f'http://127.0.0.1:{port}'): return r.continue_()
        return r.fulfill(status=200, body='', content_type='application/javascript')
    ctx.route('**/*', rt)
    pad = ctx.new_page(); errs = []; pad.on('pageerror', lambda e: errs.append(str(e)))
    pad.goto(info['url']); pad.wait_for_selector('.lfc-tkm', timeout=20000)
    # Folie kommt über die Direktverbindung (iPad holt die Stunde vom Laptop)
    pad.wait_for_selector('.lfc-sw .pr-slide', timeout=15000)
    assert '1 /' in pad.locator('.lfc-tc').inner_text()
    assert pad.locator('.lfc-modes [data-tab="cam"], .lfc-seg [data-tab="cam"]').count() == 0
    # Laptop zeigt den Status im Panel
    pg.locator('.pr [data-p="lan"]').first.click(); pg.wait_for_timeout(3500)
    assert 'iPad verbunden' in pg.locator('.lan-pan').inner_text()
    assert pg.locator('.lan-pan .lan-qr img').count() == 1
    # Fernbedienung: weiterblättern vom iPad
    n0 = pg.evaluate("document.querySelector('.pr .pr-n').textContent")
    pad.evaluate("document.querySelector('[data-nav=\"next\"]') && document.querySelector('[data-nav=\"next\"]').click()")
    # Stift auf der Tafel: Striche kommen am Laptop an
    pad.click('.lfc-tkm'); pad.wait_for_timeout(300); pad.click('.lfc-modes [data-tab="tafel"]'); pad.wait_for_timeout(900); pad.locator('.lfc-palb [data-tool="pen"]').click(); pad.wait_for_timeout(300)
    b = pad.locator('.lfc-board').bounding_box()
    for r in range(2):
        pad.mouse.move(b['x'] + 100, b['y'] + 100 + r * 80); pad.mouse.down()
        for k in range(8): pad.mouse.move(b['x'] + 100 + k * 30, b['y'] + 110 + r * 80)
        pad.mouse.up(); pad.wait_for_timeout(150)
    pad.wait_for_timeout(2000)
    assert pg.evaluate("__PCT()") == 2
    assert not errs, errs
    ctx.close()
