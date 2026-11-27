"""Links aus Webseiten werden beim Einfügen nicht unterstrichen; vorhandene Unterstreichungen lassen sich entfernen."""

def test_link_nicht_unterstrichen(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 'm1', 'type': 'material', 'title': 'Volksempfänger', 'text': '', 'source': '', 'glossary': []}]); pg.evaluate("__S.sel = 'm1'; __RE()"); pg.wait_for_timeout(500)
    pg.evaluate("""(() => { const f = document.querySelector('#editor .card[data-bid="m1"] [data-k="text"]'); f.focus();
      const dt = new DataTransfer(); dt.setData('text/html', '<p>fand im <a href="https://bpb.de/x" style="text-decoration: underline">NS-Regime</a> rasche <u>echte</u> Verbreitung.</p>'); dt.setData('text/plain', 'fand im NS-Regime rasche echte Verbreitung.');
      f.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })()"""); pg.wait_for_timeout(800)
    t = pg.evaluate("__S.sheet.blocks[0].text")
    assert 'NS-Regime' in t and '++NS-Regime++' not in t and '++echte++' in t, t

def test_unterstreichungen_entfernen(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 'm1', 'type': 'material', 'title': 'V', 'text': 'im ++NS-Regime++ und ++Joseph Goebbels++ **fett**', 'source': '', 'glossary': []}]); pg.evaluate("__S.sel = 'm1'; __RE()"); pg.wait_for_timeout(500)
    b = pg.locator('#editor [data-act="mat-noul"]')
    assert '(2)' in b.inner_text()
    pg.evaluate("document.querySelector('#editor [data-act=\"mat-noul\"]').click()"); pg.wait_for_timeout(500)
    assert pg.evaluate("__S.sheet.blocks[0].text") == 'im NS-Regime und Joseph Goebbels **fett**'
