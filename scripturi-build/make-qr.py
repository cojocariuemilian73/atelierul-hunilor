# Generates the QR code for the game (needs: pip install segno).
# Writes qr-joc.html (printable page) and prints the inline SVG for the game page.
import io, sys, segno
URL = 'https://cojocariuemilian73.github.io/atelierul-hunilor/#mod-game'
q = segno.make(URL, error='m', micro=False)
def svg(dark):
    b = io.BytesIO()
    q.save(b, kind='svg', border=0, xmldecl=False, svgns=True, nl=False, dark=dark, light=None, scale=1, omitsize=True)
    return b.getvalue().decode()
if len(sys.argv) > 1 and sys.argv[1] == 'inline':
    print(svg('#121214'))
else:
    html = '''<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Joacă pe telefon — Campania Hunilor</title>
<style>
  :root{ --gold:#D4AF37; --night:#121214; --ink:#e6d7c3; }
  *{ box-sizing: border-box; }
  body{ margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--night); color: var(--ink); font-family: 'Source Serif 4', Georgia, serif; padding: 24px 16px; }
  main{ width: min(100%, 560px); text-align: center; border: 1px solid rgba(212,175,55,0.45); padding: clamp(24px, 6vw, 44px); position: relative; }
  main::before, main::after{ content: ''; position: absolute; width: 34px; height: 34px; border: 2px solid var(--gold); }
  main::before{ top: -6px; left: -6px; border-right: 0; border-bottom: 0; }
  main::after{ bottom: -6px; right: -6px; border-left: 0; border-top: 0; }
  .eyebrow{ font: 700 0.72rem 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); margin: 0 0 12px; }
  h1{ font-family: 'Cinzel', Georgia, serif; font-size: clamp(1.8rem, 7vw, 2.6rem); margin: 0 0 8px; color: #f6eddc; line-height: 1.1; }
  h1 span{ color: var(--gold); }
  .sub{ margin: 0 auto 26px; max-width: 34ch; color: #cbbca4; line-height: 1.55; }
  .qr{ width: min(100%, 340px); margin: 0 auto 20px; padding: 16px; background: #fff; border-radius: 4px; }
  .qr svg{ display: block; width: 100%; height: auto; }
  .url{ font: 0.78rem 'JetBrains Mono', ui-monospace, monospace; color: var(--gold); word-break: break-all; margin: 0 0 6px; }
  .how{ font-size: 0.92rem; color: #a89a85; margin: 0; }
  @media print{
    body{ background: #fff; color: #222; }
    main{ border-color: #8a6d12; }
    h1{ color: #222; } h1 span, .eyebrow, .url{ color: #8a6d12; } .sub, .how{ color: #333; }
    .qr{ border: 1px solid #ccc; }
  }
</style>
</head>
<body>
<main>
  <p class="eyebrow">Atelierul Hunilor · Secțiunea I, Istorie</p>
  <h1>Campania <span>Hunilor</span></h1>
  <p class="sub">Un joc de istorie despre huni. Scanează codul și joacă pe telefon.</p>
  <div class="qr" role="img" aria-label="Cod QR care deschide jocul Campania Hunilor">''' + svg('#000000') + '''</div>
  <p class="url">cojocariuemilian73.github.io/atelierul-hunilor</p>
  <p class="how">Deschide camera telefonului, îndreaptă-o spre cod și apasă linkul care apare.</p>
</main>
</body>
</html>
'''
    open('qr-joc.html', 'w', encoding='utf-8').write(html)
    print('qr-joc.html scris')
