"""Sprech- und Denkblasen auf Bildern: Editor, Blatt, Folie, Word."""
import zipfile
from conftest import OUT

IMG = """(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#b08a60'; g.fillRect(0, 0, 400, 300);
  g.fillStyle = '#5a4330'; g.beginPath(); g.arc(120, 110, 40, 0, 7); g.fill(); g.beginPath(); g.arc(290, 100, 40, 0, 7); g.fill(); return c.toDataURL('image/jpeg', .8); })()"""

def setup(lw, pg):
    src = pg.evaluate(IMG)
    lw.setup(pg, [{'id': 'im', 'type': 'image', 'src': src, 'w': 400, 'h': 300, 'width': 80, 'caption': 'Goebbels testet den Volksempfänger', 'source': 'Quelle', 'mk': 'q', 'pres': True}])
    pg.evaluate("__S.sel = 'im'; __RE(); __RP()"); pg.wait_for_timeout(500)

def test_blasen(lw):
    pg = lw.open(); lw.new_lesson(pg); setup(lw, pg)
    pg.evaluate("document.querySelector('#editor [data-act=\"bub-add\"][data-v=\"sprech\"]').click()"); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#editor [data-act=\"bub-add\"][data-v=\"denk\"]').click()"); pg.wait_for_timeout(600)
    B = pg.evaluate("__S.sheet.blocks[0].bub"); W = pg.evaluate("__S.sheet.blocks[0].width")
    assert len(B) == 2 and B[0]['k'] == 'sprech' and B[1]['k'] == 'denk' and B[0]['x'] < 25 and B[1]['x'] > 75 and W == 50, (B, W)
    pg.evaluate("__S.sheet.blocks[0].bub[0].text = 'Ein Radio für jeden deutschen Haushalt!'; __RE(); __RP()"); pg.wait_for_timeout(600)
    st = pg.locator('#pages .bub-st'); assert st.count() == 1
    assert pg.locator('#pages .bub').count() == 2 and pg.locator('#pages .bub.k-denk .bub-l').count() == 3
    assert pg.locator('#pages .bub-svg g').count() == 2 and pg.locator('#pages .bub-svg ellipse').count() == 3
    # Blasen liegen neben dem Bild, nicht darauf
    g = pg.evaluate("""(() => { const im = document.querySelector('#pages .bub-st img').getBoundingClientRect(); return [...document.querySelectorAll('#pages .bub')].map(b => { const r = b.getBoundingClientRect(); return [r.right <= im.left + 2, r.left >= im.right - 2]; }); })()""")
    pg.locator("#pages .page").first.screenshot(path=str(OUT / "blasen_blatt.png")); assert g[0][0] and g[1][1], g
    pg.locator('#pages .page').first.screenshot(path=str(OUT / 'blasen_blatt.png'))
    pg.locator('#editor .bub-ed').screenshot(path=str(OUT / 'blasen_editor.png'))
    pg.evaluate("__S.sheet.blocks[0].bub.push({k:'ruf',x:14,y:78,w:18,tx:30,ty:70,text:'Heil!',n:2},{k:'fluester',x:86,y:78,w:20,tx:70,ty:70,text:'Das hört doch jeder mit …',n:2}); __RP()"); pg.wait_for_timeout(500)
    pg.locator('#pages .bub-st').screenshot(path=str(OUT / 'blasen_alle.png'))
    pg.evaluate("__S.sheet.blocks[0].bub.splice(2, 2); __RP()"); pg.wait_for_timeout(400)
    # Griff im Editor ziehen
    h = pg.locator('#editor .bub-h[data-p="t"]').first.bounding_box(); pg.mouse.move(h['x'] + 5, h['y'] + 5); pg.mouse.down(); pg.mouse.move(h['x'] + 40, h['y'] + 30, steps=5); pg.mouse.up(); pg.wait_for_timeout(500)
    assert pg.evaluate("__S.sheet.blocks[0].bub[0].tx") != B[0]['tx']
    # Folie
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    for _ in range(6):
        if pg.locator('.pr .pr-slide .bub-st').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(350)
    assert pg.locator('.pr .pr-slide .bub').count() == 2
    pg.screenshot(path=str(OUT / 'blasen_folie.png'))

def test_blasen_word(lw):
    from test_quer_beschriftung import docx
    pg = lw.open(); lw.new_lesson(pg); setup(lw, pg)
    pg.evaluate("__S.sheet.blocks[0].width = 60; __S.sheet.blocks[0].bub = [{k:'sprech',x:12,y:30,w:22,tx:30,ty:35,text:'Hallo',n:3},{k:'denk',x:88,y:30,w:22,tx:70,ty:35,text:'',n:3}]; __RP()"); pg.wait_for_timeout(400)
    docx(pg, 'blasen.docx'); z = zipfile.ZipFile(OUT / 'blasen.docx')
    imgs = [n for n in z.namelist() if n.startswith('word/media/')]
    assert imgs and max(z.getinfo(n).file_size for n in imgs) > 20000
