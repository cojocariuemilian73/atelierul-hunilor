# Proiect Istorie — Hunii și Marea Migrație

Proiect pentru concursul național „Istorie și societate în dimensiune virtuală", Secțiunea I, Istorie.

🔗 **Site live:** https://cojocariuemilian73.github.io/atelierul-hunilor/

## Ce deschizi

**`index.html`** (identic cu `atelierul-hunilor.html`) — site-ul complet, într-un singur fișier, cu trei pagini:

1. **Acasă / Articol** — articolul cu 23 de note și bibliografie, cronologia pe epoci, graficul „Aurul hunilor”, atlasul migrației, muzeul virtual, miturile verificate la sfârșitul capitolelor și glosarul.
2. **Attila și Marea Migrație** — un singur joc, în trei acte, pe harta reală (370–476): simulare cu agenți (Valens, Stilicho, Honorius), cele 8 runde ale lui Attila (435–452) cu aur, renume, loialitate, cavalerie și moștenire, apoi Ardaric la Nedao și Leon I la Capul Bon; un citat din izvor la fiecare decizie; la final, titlul jucătorului, reluarea pe hartă (drumul tău și drumul real, an de an) și „Cronica ta”, o imagine de salvat; tastele 1, 2, 3 pentru alegeri; mod ușor pentru calculatoare lente. Adresa veche `#mod-game` duce tot aici.
3. **Masa istoricului** — 13 surse de așezat pe axa timpului și de clasificat.

Se deschide direct în browser (dublu-clic) sau la adresa de mai sus.

## Structura folderului

- `index.html`, `atelierul-hunilor.html` — site-ul (aceeași pagină, două nume).
- `qr-joc.html` — pagina cu codul QR care deschide jocul pe telefon (`python scripturi-build/make-qr.py`, are nevoie de `pip install segno`).
- `og.jpg` — imaginea care apare când trimiți linkul pe WhatsApp sau Facebook.
- `module-individuale/` — câteva părți ale site-ului ca fișiere separate: articolul, atlasul, muzeul, jocul și simularea. Sunt păstrate pentru prezentare; versiunea de referință e `index.html`.
- `imagini/` — originalele imaginilor (Wikimedia Commons, cu sursa și licența trecute pe site). În pagină sunt încorporate ca WebP, cu `python scripturi-build/to-webp.py fisier.html`.
- `scripturi-build/` — sursele părților interactive și scripturile care le pun în pagină (vezi mai jos).

## Cum se actualizează site-ul

Fiecare parte interactivă are sursele într-un folder separat. După o modificare, scriptul ei o pune în `index.html`, `atelierul-hunilor.html` și, unde e cazul, în pagina separată din `module-individuale/`:

| Partea | Sursele | Comanda |
|---|---|---|
| Jocul (simularea cu actul lui Attila), stilurile jocurilor | `scripturi-build/jocuri/` | `node scripturi-build/splice-jocuri.js`, apoi `node scripturi-build/splice-joc-unic.js` |
| Masa istoricului | `scripturi-build/atelier/` | `node scripturi-build/splice-atelier.js` |
| Cronologia | `scripturi-build/cronologie/` | `node scripturi-build/splice-cronologie.js` |
| Aurul hunilor | `scripturi-build/aur/` | `node scripturi-build/splice-aur.js` |
| Glosarul | `scripturi-build/glosar/` | `node scripturi-build/splice-glosar.js` |
| Miturile în capitole | în script | `node scripturi-build/patch-mituri-in-pagina.js` |
| Zoom pe imagini, „Înapoi sus” | în script | `node scripturi-build/patch-lightbox-zoom.js` |
| Imagini lângă textele scurte | în script | `node scripturi-build/patch-sr-fit.js` |

Toate scripturile se pot rula de mai multe ori: înlocuiesc partea lor, fără s-o dubleze.

Textul articolului (capitole, note, bibliografie) se modifică direct în `index.html`, apoi se copiază peste `atelierul-hunilor.html`.

**Atenție:** scripturile vechi de asamblare (`assemble.js`, `build-standalone.js`, `restore-build.js`, `rebuild-*.js`) țin de prima versiune a site-ului, construită din folderul `build/`. Ele nu mai trebuie rulate, pentru că ar scrie peste pagini versiuni mai vechi.

## Cum public modificările pe site-ul live

```
git add -A
git commit -m "descriere modificare"
git push
```

GitHub Pages republică automat site-ul din `index.html`, în circa un minut.
