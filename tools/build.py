"""LehrWerk zusammenbauen.

Die Quelle liegt in src/ (Reihenfolge in src/REIHENFOLGE.txt). Daraus entstehen
  dist/ab-werkstatt.html  – eine Datei für die Online-Version (Artifact)
  index.html              – dieselbe Seite für GitHub Pages und die Windows-App

Aufruf:  python3 tools/build.py          (baut beides)
         python3 tools/build.py --check  (prüft nur, ob index.html aktuell ist)
"""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'

def join():
    order = [l.strip() for l in (SRC / 'REIHENFOLGE.txt').read_text().splitlines() if l.strip() and not l.startswith('#')]
    parts = [(SRC / n).read_text() for n in order]
    # jede Datei endet mit genau einem Zeilenumbruch; die letzte ohne
    return ''.join(parts)

def index_html(src):
    cut = src.index('<div id="app">')
    head, body = src[:cut], src[cut:]
    head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
    return ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<meta name="description" content="Arbeitsblätter für den Deutschunterricht aus Bausteinen setzen und als PDF oder Word speichern.">\n'
            '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;font:14px/1.45 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
            + head.strip() + '\n</head>\n<body>\n' + body.strip() + '\n</body>\n</html>\n')

if __name__ == '__main__':
    src = join(); idx = index_html(src)
    if '--check' in sys.argv:
        ok = (ROOT / 'index.html').read_text() == idx
        print('index.html ist aktuell' if ok else 'index.html ist veraltet – bitte tools/build.py ausführen'); sys.exit(0 if ok else 1)
    (ROOT / 'dist').mkdir(exist_ok=True)
    (ROOT / 'dist' / 'ab-werkstatt.html').write_text(src)
    (ROOT / 'index.html').write_text(idx)
    print(f'gebaut: dist/ab-werkstatt.html ({len(src):,} Zeichen), index.html'.replace(',', '.'))
