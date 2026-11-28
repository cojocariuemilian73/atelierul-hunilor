#!/bin/sh
# Refacerea completă: fișierul unic pornește de la o versiune fixă din git, apoi toate scripturile, în ordine.
cd "$(dirname "$0")/.." || exit 1
# pagina de pornire e fixă: versiunea din commitul 004d4b6 (înainte de recenziile 10–12), pe care s-au scris toate
# patch-urile de mai jos; recenzia 11 înlocuiește coperta, iar patch-urile vechi caută coperta veche
git show 004d4b6:atelierul-hunilor.html > atelierul-hunilor.html || exit 1
# splice-aur și splice-atelier ating și index.html (vechiul flux); build-web îl reface oricum la final
cp atelierul-hunilor.html index.html
# jocurile se iau din sursă (scripturi-build/jocuri), ca modificările lor să intre la fiecare refacere
node scripturi-build/splice-jocuri.js atelierul-hunilor.html > /dev/null || { echo "EROARE la splice-jocuri"; exit 1; }
for x in splice-aur splice-atelier patch-acasa patch-module patch-recenzie-6 patch-recenzie-7 patch-recenzie-8 patch-recenzie-9 patch-recenzie-10 patch-recenzie-11 patch-recenzie-12 patch-efecte patch-tipografie patch-design patch-predare patch-detalii-fotografii patch-drumul-hunilor patch-ordine-spatiere patch-domino-prezentare patch-retusuri patch-fise patch-ux-hunilor patch-editorial patch-miscare patch-revizie patch-runda2 patch-runda3 patch-runda4 patch-runda5 patch-runda6 patch-runda9 patch-runda10 patch-runda11 patch-runda12 patch-runda13 patch-runda14 patch-runda15 patch-runda16 patch-runda17 patch-runda18 patch-runda19 patch-runda20 patch-runda21 patch-runda22 patch-runda23 patch-runda24 build-web; do
  node scripturi-build/$x.js > /dev/null || { echo "EROARE la $x"; exit 1; }
done
echo "gata"
