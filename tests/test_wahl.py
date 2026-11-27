"""Wahlaufgaben: eine Nummer, Alternativen a/b/c mit Schwierigkeitsgrad – Blatt, Editor, Folie, Word."""
import zipfile
from conftest import OUT

def blocks():
    return [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Lesen Sie den Text.', 'soz': 'ea'}, {'text': 'Fassen Sie zusammen.', 'soz': 'ea'}]},
            {'id': 'tw', 'type': 'tasks', 'title': '', 'items': [{'text': 'Beschreiben Sie den Chatbot.', 'soz': 'ea'}, {'text': 'Analysieren Sie die Strategie.', 'soz': 'ea'}, {'text': 'Beurteilen Sie den Anbieter.', 'soz': 'ea'}, {'text': 'Rakete', 'rk': True}]},
            {'id': 't3', 'type': 'tasks', 'title': '', 'items': [{'text': 'Präsentieren Sie.', 'soz': 'ea'}]}]

def test_wahlaufgabe(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, blocks()); pg.evaluate("__S.sel = 'tw'; __RE(); __RP()"); pg.wait_for_timeout(600)
    card = pg.locator('#editor .card[data-bid="tw"]')
    pg.evaluate("(() => { const c = document.querySelector('#editor .card[data-bid=\"tw\"] input[data-k=\"wahl\"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); c.dispatchEvent(new Event('input', { bubbles: true })); })()"); pg.wait_for_timeout(800)
    assert pg.evaluate("__S.sheet.blocks[1].items.map(x => x.wl || '')") == ['b', 's', 'e', '']
    nos = pg.evaluate("[...document.querySelectorAll('#pages .task-no')].map(x => x.textContent.trim())")
    assert nos == ['1', '2', '3', 'a)', 'b)', 'c)', '', '4'], nos
    t = pg.locator('#pages .blk-tasks').nth(1).inner_text()
    assert 'Wahlaufgabe:' in t and 'Wählen Sie eine der folgenden Aufgaben aus.' in t and '★☆☆' in t and '★★★' in t
    ed = pg.evaluate("[...document.querySelectorAll('#editor .card[data-bid=\"tw\"] .task-ed-h .no')].map(x => x.textContent.trim())")
    assert ed[:3] == ['3a', '3b', '3c'], ed
    pg.evaluate("document.querySelector('#editor .card[data-bid=\"tw\"] button[data-act=\"wl\"][data-v=\"e\"]').click()"); pg.wait_for_timeout(300)
    assert pg.evaluate("__S.sheet.blocks[1].items[0].wl") == 'e'
    ks = pg.evaluate("__PS(true).filter(s => s.k === 'tasks').map(s => s.items.map(x => x.no + (x.wx || '')).join(','))")
    assert ks == ['1,2', '3a,3b,3c,0', '4'], ks
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1200)
    for _ in range(8):
        if 'Wahlaufgabe' in pg.locator('.pr .pr-slide').inner_text(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(350)
    s = pg.locator('.pr .pr-slide').inner_text()
    assert 'WAHLAUFGABE 3' in s.upper() and 'b)' in s and '★★☆' in s, s

def test_wahlaufgabe_word(lw):
    from test_quer_beschriftung import docx
    pg = lw.open(); lw.new_lesson(pg)
    B = blocks(); B[1]['wahl'] = True
    for it, l in zip(B[1]['items'], ['b', 's', 'e']): it['wl'] = l
    lw.setup(pg, B); pg.evaluate("__RP()"); pg.wait_for_timeout(500)
    x = docx(pg, 'wahl.docx')
    assert 'Wahlaufgabe: ' in x and '>a)<' in x and '>c)<' in x and '★★☆' in x
    assert x.index('>3<') < x.index('Wahlaufgabe: ') < x.index('>a)<') and '>4<' in x and '>5<' not in x
