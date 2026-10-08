# Proiect Istorie — Hunii și Marea Migrație

Proiect pentru concursul național „Istorie și societate în dimensiune virtuală".

🔗 **Site live:** https://cojocariuemilian73.github.io/atelierul-hunilor/

## Ce deschizi

**`atelierul-hunilor.html`** (= `index.html`, identice) — pagina finală, completă, cu toate cele 5 module combinate într-un singur site. Deschide direct în browser (dublu-click) sau accesează link-ul de mai sus.

## Structura folderului

- `atelierul-hunilor.html` — pagina combinată finală (aceasta e livrarea)
- Pagina „Atelierul istoricului” (trei jocuri de gândire istorică) are sursele în `scripturi-build/atelier/` (HTML, CSS, JS) și e inserată în paginile construite cu `scripturi-build/rebuild-atelier.js`.
- `qr-joc.html` — pagină de tipărit sau de proiectat, cu codul QR care deschide jocul pe telefon (generat cu `python scripturi-build/make-qr.py`, are nevoie de `pip install segno`).
- `module-individuale/` — cele 5 module ca fișiere separate, de sine stătătoare (regenerate automat din aceleași surse ca pagina combinată, cu `scripturi-build/build-standalone.js`):
  - `huni-prezentare.html` — articolul academic (Acasă / Context / Cronologie / Marea Migrație / Personalități)
  - `huni-migratia.html` — jocul „Campania Hunilor"
  - `solia-la-attila.html` — jocul „Solia la Attila"
  - `atlas-hunic.html` — harta interactivă (orașe, bătălii și trasee poziționate pe coordonate geografice reale)
  - `laborator-muzeu.html` — Muzeul Hunilor (artefacte reale fotografiate în muzee, mit vs. adevăr paleogenetic)
- `build/` — piesele intermediare din care e asamblată pagina combinată (CSS/JS/HTML separate pe modul + `FINAL.html`, rezultatul brut al asamblării)
- `scripturi-build/` — scripturile Node.js folosite ca să reconstruiesc pagina combinată după orice modificare:
  - `scope-css.js` — izolează CSS-ul fiecărui modul sub o clasă unică, ca stilurile să nu se ciocnească
  - `assemble.js` — combină toate modulele într-un singur `FINAL.html`
  - `deglow.js` / `extract.js` — scripturi folosite punctual în etapele de curățare a designului
- `imagini/reale/` — imaginile folosite acum pe site, toate de pe Wikimedia Commons: fresca lui Rafael, gravura lui Geiger și pictura lui Mór Than (domeniu public) pentru antete și harta fizică a Europei (Alexrk2, CC BY-SA 3.0) pentru hărțile interactive. Fotografiile de artefact și hărțile istorice din articol sunt în `imagini/muzeu/`. Toate sunt încorporate direct ca `base64` în HTML. Restul fișierelor din `imagini/` sunt versiuni vechi, care nu mai sunt folosite.
- `scripturi-build/geo.js` — proiecția hărții fizice: transformă latitudinea și longitudinea în poziția exactă pe imagine (aceleași formule pe care le folosește Wikipedia pentru această hartă).

## Cum reconstruiesc pagina după o modificare

Folderul `build/` nu e în git (e în `.gitignore`). Pe un calculator unde lipsește, îl recreezi din paginile existente:
```
node scripturi-build/restore-build.js
```
Scriptul verifică singur că sursele refăcute dau exact aceeași pagină (`FINAL.html` identic cu `index.html`).

Dacă modific un fișier din `build/` (ex. `build/atlas.css`), rulez din acest folder:
```
node scripturi-build/scope-css.js build/atlas.css build/atlas.scoped.css m-atlas
node scripturi-build/assemble.js build
```
apoi copiez `build/FINAL.html` peste `atelierul-hunilor.html` **și** peste `index.html`, și rulez `node scripturi-build/build-standalone.js` pentru paginile din `module-individuale/`.

## Cum public modificările pe site-ul live

```
git add -A
git commit -m "descriere modificare"
git push
```
GitHub Pages redeployează automat din `index.html`, în ~1 minut.
