# Proiect Istorie — Hunii și Marea Migrație

Proiect pentru concursul național „Istorie și societate în dimensiune virtuală".

🔗 **Site live:** https://cojocariuemilian73.github.io/atelierul-hunilor/

## Ce deschizi

**`atelierul-hunilor.html`** (= `index.html`, identice) — pagina finală, completă, cu toate cele 5 module combinate într-un singur site. Deschide direct în browser (dublu-click) sau accesează link-ul de mai sus.

## Structura folderului

- `atelierul-hunilor.html` — pagina combinată finală (aceasta e livrarea)
- `module-individuale/` — cele 5 module ca fișiere separate, de sine stătătoare (utile pentru testare izolată sau dacă vrei să lucrezi pe un singur modul):
  - `huni-prezentare.html` — articolul academic (Acasă / Context / Cronologie / Marea Migrație / Personalități)
  - `huni-migratia.html` — jocul „Campania Hunilor"
  - `solia-la-attila.html` — jocul „Solia la Attila"
  - `atlas-hunic.html` — harta interactivă (D3.js + date geografice reale)
  - `laborator-muzeu.html` — Laborator și Muzeu Virtual (artefacte 3D, mit vs. adevăr paleogenetic)
- `build/` — piesele intermediare din care e asamblată pagina combinată (CSS/JS/HTML separate pe modul + `FINAL.html`, rezultatul brut al asamblării)
- `scripturi-build/` — scripturile Node.js folosite ca să reconstruiesc pagina combinată după orice modificare:
  - `scope-css.js` — izolează CSS-ul fiecărui modul sub o clasă unică, ca stilurile să nu se ciocnească
  - `assemble.js` — combină toate modulele într-un singur `FINAL.html`
  - `deglow.js` / `extract.js` — scripturi folosite punctual în etapele de curățare a designului
- `imagini/` — imaginile generate (Flux/Midjourney) folosite ca fundaluri, deja integrate în pagini (încorporate direct ca `base64` în HTML).

## Cum reconstruiesc pagina după o modificare

Dacă modific un fișier din `build/` (ex. `build/atlas.css`), rulez din acest folder:
```
node scripturi-build/scope-css.js build/atlas.css build/atlas.scoped.css m-atlas
node scripturi-build/assemble.js build
```
apoi copiez `build/FINAL.html` peste `atelierul-hunilor.html` **și** peste `index.html`.

## Cum public modificările pe site-ul live

```
git add -A
git commit -m "descriere modificare"
git push
```
GitHub Pages redeployează automat din `index.html`, în ~1 minut.
