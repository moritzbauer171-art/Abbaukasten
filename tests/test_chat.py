"""Baustein Chat: Stile, Bedienung, Word, Folie."""
import zipfile
from xml.dom import minidom
from conftest import OUT
from test_quer_beschriftung import docx

def chat(style='gruen', **kw):
    b = {'id': 'c1', 'type': 'chat', 'title': 'Chat der Klasse 10b', 'style': style, 'head': {'name': 'Klasse 10b 📚', 'sub': ''},
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
