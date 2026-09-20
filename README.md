# Proiect Istorie — Hunii și Marea Migrație

Proiect pentru concursul național „Istorie și societate în dimensiune virtuală".

## Ce deschizi

**`atelierul-hunilor.html`** — pagina finală, completă, cu toate cele 6 module combinate într-un singur site. Deschide direct în browser (dublu-click).

## Structura folderului

- `atelierul-hunilor.html` — pagina combinată finală (aceasta e livrarea)
- `module-individuale/` — cele 6 module ca fișiere separate, de sine stătătoare (utile pentru testare izolată sau dacă vrei să lucrezi pe un singur modul):
  - `huni-prezentare.html` — articolul academic (Acasă / Context / Cronologie / Marea Migrație / Personalități)
  - `huni-migratia.html` — jocul „Campania Hunilor"
  - `solia-la-attila.html` — jocul „Solia la Attila"
  - `atlas-hunic.html` — harta interactivă (D3.js + date geografice reale)
  - `laborator-muzeu.html` — Laborator și Muzeu Virtual (artefacte 3D, certificat PDF)
  - `cinema-hunic.html` — Cinema Hunic (scrollytelling)
- `build/` — piesele intermediare din care e asamblată pagina combinată (CSS/JS/HTML separate pe modul + `FINAL.html`, rezultatul brut al asamblării)
- `scripturi-build/` — scripturile Node.js folosite ca să reconstruiesc pagina combinată după orice modificare:
  - `scope-css.js` — izolează CSS-ul fiecărui modul sub o clasă unică, ca stilurile să nu se ciocnească
  - `assemble.js` — combină toate modulele într-un singur `FINAL.html`
  - `deglow.js` / `extract.js` — scripturi folosite punctual în etapele de curățare a designului
- `imagini/` — pune aici imaginile generate (ex. harta de fundal Flux/Midjourney) — spune-mi când sunt acolo și le integrez.

## Cum reconstruiesc pagina după o modificare

Dacă modific un fișier din `build/` (ex. `build/atlas.css`), rulez din acest folder:
```
node scripturi-build/scope-css.js build/atlas.css build/atlas.scoped.css m-atlas
node scripturi-build/assemble.js build
```
apoi copiez `build/FINAL.html` peste `atelierul-hunilor.html`.
