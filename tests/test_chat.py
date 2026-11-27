"""Baustein Chat: Stile, Bedienung, Word, Folie."""
import zipfile
from xml.dom import minidom
from conftest import OUT
from test_quer_beschriftung import docx

def chat(style='gruen', **kw):
    b = {'id': 'c1', 'type': 'chat', 'pres': True, 'title': 'Chat der Klasse 10b', 'style': style, 'head': {'name': 'Klasse 10b 📚', 'sub': ''},
         'people': [{'n': 'Ich'}, {'n': 'Lea'}, {'n': 'Tom'}],
         'msgs': [{'sys': True, 't': 'Heute'}, {'p': 1, 't': 'Habt ihr die Aufgabe schon?', 'z': '18:02'}, {'p': 1, 't': 'Bis morgen oder?', 'z': '18:02'},
                  {'p': 2, 't': 'Welche Aufgabe?? 😅', 'z': '18:04'}, {'p': 0, 't': 'Die zu Anne Frank, S. 34', 'z': '18:05'}, {'p': 1, 't': '', 'z': '18:06'}],
         'opt': {'time': True, 'names': True, 'read': True, 'frame': True, 'bar': True}, 'width': 72, 'fiktiv': True}
    b.update(kw); return b

def test_chat_blatt_alle_stile(lw):
    pg = lw.open(); lw.new_lesson(pg)
    for st in ['gruen', 'blau', 'verlauf', 'hell', 'dunkel', 'sms', 'ki']:
        lw.setup(pg, [chat(st)]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
        c = pg.locator('#pages .blk-chat')
        assert c.count() == 1 and f'cs-{st}' in c.get_attribute('class')
        assert pg.locator('#pages .ch-m').count() == 5 and pg.locator('#pages .ch-m.me').count() == 1
        assert pg.locator('#pages .ch-m.leer .ch-wl').count() == 2
        assert 'Fiktiver Chatverlauf' in c.inner_text() and 'M1' in c.inner_text()
        c.screenshot(path=str(OUT / f'chat_{st}.png'))

def test_chat_editor_bedienung(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [chat()]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    E = lambda: pg.evaluate("__S.sheet.blocks[0]")
    pg.locator('#editor [data-act="chat-st"][data-v="blau"]').click(); pg.wait_for_timeout(300); assert E()['style'] == 'blau'
    pg.locator('#editor [data-act="chat-add"]').click(); pg.wait_for_timeout(300)
    m = E()['msgs'][-1]; assert m['p'] == 2 and m['z'] == '18:07'
    pg.keyboard.type('Ich auch nicht'); pg.wait_for_timeout(700)
    assert 'Ich auch nicht' in pg.locator('#pages .blk-chat').inner_text()
    pg.locator('#editor [data-act="chat-p"][data-i="6"][data-v="0"]').click(); pg.wait_for_timeout(300); assert E()['msgs'][6]['p'] == 0
    pg.locator('#editor [data-act="chat-mv"][data-i="6"][data-d="-1"]').click(); pg.wait_for_timeout(300); assert E()['msgs'][5]['t'] == 'Ich auch nicht'
    pg.locator('#editor [data-act="chat-sys"]').click(); pg.wait_for_timeout(300); assert E()['msgs'][-1].get('sys')
    pg.locator('#editor [data-act="chat-pdel"][data-i="2"]').click(); pg.wait_for_timeout(300)
    e = E(); assert len(e['people']) == 2 and all(x.get('sys') or x['p'] in (0, 1) for x in e['msgs'])
    pg.locator('#editor [data-k="opt.frame"]').uncheck(); pg.wait_for_timeout(400)
    assert 'frm' not in pg.locator('#pages .blk-chat').get_attribute('class')

def test_chat_word_und_folie(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [chat('gruen')]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    xml = docx(pg, 'chat.docx'); minidom.parseString(xml.encode())
    assert 'Habt ihr die Aufgabe schon?' in xml and 'D9FDD3' in xml and 'Fiktiver Chatverlauf' in xml and 'Lea' in xml
    pg.keyboard.press('Escape'); pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    for _ in range(6):
        if pg.locator('.pr .pr-slide .blk-chat').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
    assert pg.locator('.pr .pr-slide .blk-chat .ch-m').count() == 5
    pg.locator('.pr .pr-slide').screenshot(path=str(OUT / 'chat_folie.png'))

def test_chat_zeilenangaben(lw):
    pg = lw.open(); lw.new_lesson(pg)
    long = 'Ich finde, dass die Graphic Novel die Gefühle von Anne viel direkter zeigt als das Tagebuch, weil man ihre Mimik sieht und die Träume als Bilder erscheinen.'
    b = chat('gruen', msgs=[{'p': 1, 't': long, 'z': '18:02'}, {'p': 2, 't': 'Stimmt, aber im Tagebuch ist ihre Sprache viel persönlicher.', 'z': '18:03'}, {'p': 0, 't': long + ' ' + long, 'z': '18:05'}, {'p': 1, 't': '', 'z': '18:06'}])
    b['opt']['ln'] = True
    lw.setup(pg, [b]); pg.evaluate("__RP()"); pg.wait_for_timeout(700)
    nums = pg.evaluate("[...document.querySelectorAll('#pages .ch-lnn')].map(x => +x.textContent)")
    assert nums and nums[0] == 5 and all(n % 5 == 0 for n in nums)
    # Zahlen stehen links neben dem Handy und auf Höhe einer Textzeile
    g = pg.evaluate("(() => { const n = document.querySelector('#pages .ch-lnn').getBoundingClientRect(), ph = document.querySelector('#pages .ch-ph').getBoundingClientRect(); return [n.right, ph.left]; })()")
    assert g[0] <= g[1]
    pg.locator('#pages .blk-chat').screenshot(path=str(OUT / 'chat_ln.png'))
    xml = docx(pg, 'chat_ln.docx'); assert 'Z. 1–' in xml
    pg.locator('#editor [data-k="opt.ln"]').uncheck(); pg.wait_for_timeout(600)
    assert pg.locator('#pages .ch-lnn').count() == 0

def test_chat_snap_und_iphone(lw):
    pg = lw.open(); lw.new_lesson(pg)
    b = chat('snap'); lw.setup(pg, [b]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    assert pg.locator('#pages .cs-snap .ch-n').first.inner_text() == 'LEA'
    assert pg.evaluate("getComputedStyle(document.querySelector('#pages .ch-m.me .ch-bub')).backgroundColor") in ('rgba(0, 0, 0, 0)', 'transparent')
    pg.locator('#editor [data-act="chat-dev"][data-v="iphone"]').click(); pg.wait_for_timeout(500)
    assert pg.locator('#pages .ch-ip .ch-isl').count() == 1 and pg.locator('#pages .ch-ip .ch-home').count() == 1
    r = pg.evaluate("(() => { const p = document.querySelector('#pages .ch-ph').getBoundingClientRect(); return p.height / p.width; })()")
    assert 2.1 < r < 2.2
    # viele Nachrichten: oben abgeschnitten wie beim Scrollen, Seite bleibt eine
    pg.evaluate("__S.sheet.blocks[0].msgs = Array.from({length: 40}, (_, i) => ({ p: i % 3, t: 'Nachricht ' + (i + 1), z: '18:00' })); __RE(); __RP()"); pg.wait_for_timeout(600)
    assert pg.locator('#pages .page').count() == 1
    assert 'Nachricht 40' in pg.locator('#pages .ch-b').inner_text()
    # Querformat: iPhone wird kleiner, bleibt auf einer Seite
    pg.evaluate("__S.sheet.meta.paper = 'a4q'; __RE(); __RP()"); pg.wait_for_timeout(700)
    assert pg.locator('#pages .page').count() == 1

def test_chat_quelle(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [chat('gruen')]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    pg.locator('#editor [data-k="source"]').fill('nachgestellt nach Kommentaren auf Instagram, 26.11.2026'); pg.wait_for_timeout(700)
    t = pg.locator('#pages .ch-fk').inner_text()
    assert 'Fiktiver Chatverlauf' in t and 'Quelle: nachgestellt nach Kommentaren' in t
    pg.locator('#editor [data-k="fiktiv"]').uncheck(); pg.wait_for_timeout(600)
    t = pg.locator('#pages .ch-fk').inner_text(); assert t.startswith('Quelle:') and 'Fiktiv' not in t
    xml = docx(pg, 'chat_q.docx'); assert 'nachgestellt nach Kommentaren' in xml
    pg.keyboard.press('Escape'); pg.evaluate("__OP(0)"); pg.wait_for_timeout(1000)
    for _ in range(5):
        if pg.locator('.pr .pr-slide .blk-chat').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
    assert 'Quelle:' in pg.locator('.pr .pr-slide .ch-fk').inner_text()
    pg.locator('.pr .pr-slide').screenshot(path=str(OUT / 'chat_q_folie.png'))

def test_chat_nicht_automatisch_auf_folie(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 'c9', 'type': 'chat', 'title': 'Testchat', 'style': 'gruen', 'head': {'name': 'A', 'sub': ''}, 'people': [], 'msgs': [{'who': 'a', 'text': 'Hallo'}]}, {'id': 't9', 'type': 'tasks', 'title': '', 'items': [{'text': 'Analysieren Sie den Chat.', 'soz': 'ea'}]}])
    ks = pg.evaluate("__PS(true).map(s => s.k)")
    assert 'chat' not in ks and 'tasks' in ks, ks
    pg.evaluate("__S.sheet.blocks[0].pres = true")
    assert 'chat' in pg.evaluate("__PS(true).map(s => s.k)")

PASTE = """async () => { const c = document.createElement('canvas'); c.width = 40; c.height = 30; const g = c.getContext('2d'); g.fillStyle = '#c33'; g.fillRect(0, 0, 40, 30);
  const blob = await new Promise(r => c.toBlob(r, 'image/png')); const dt = new DataTransfer(); dt.items.add(new File([blob], 'x.png', { type: 'image/png' }));
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }); document.body.dispatchEvent(ev); }"""

def test_bild_aus_zwischenablage(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'A', 'soz': 'ea'}]}, {'id': 't2', 'type': 'tasks', 'title': '', 'items': [{'text': 'B', 'soz': 'ea'}]}])
    pg.evaluate("__S.sel = 't1'"); pg.evaluate(PASTE); pg.wait_for_timeout(900)
    st = pg.evaluate("__S.sheet.blocks.map(b => b.type + ':' + (b.type === 'image' ? (b.src || '').slice(0, 10) : b.id))")
    assert st == ['tasks:t1', 'image:data:image', 'tasks:t2'], st
    assert pg.locator('#pages img').count() >= 1
    # leerer, gewählter Bild-Baustein wird gefüllt
    pg.evaluate("__S.sheet.blocks.push({ id: 'im', type: 'image', src: '', caption: '' }); __S.sel = 'im'"); pg.evaluate(PASTE); pg.wait_for_timeout(900)
    assert pg.evaluate("__S.sheet.blocks.length") == 4 and pg.evaluate("__S.sheet.blocks[3].src.startsWith('data:image')")
