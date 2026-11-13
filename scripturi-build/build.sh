#!/bin/sh
# Refacerea completă: fișierul unic pornește de la versiunea din git, apoi toate scripturile, în ordine.
cd "$(dirname "$0")/.." || exit 1
git checkout -q atelierul-hunilor.html || exit 1
# jocurile se iau din sursă (scripturi-build/jocuri), ca modificările lor să intre la fiecare refacere
node scripturi-build/splice-jocuri.js atelierul-hunilor.html > /dev/null || { echo "EROARE la splice-jocuri"; exit 1; }
for x in splice-aur splice-atelier patch-acasa patch-module patch-recenzie-6 patch-recenzie-7 patch-recenzie-8 patch-recenzie-9 patch-recenzie-10 patch-recenzie-11 patch-recenzie-12 patch-efecte patch-tipografie build-web; do
  node scripturi-build/$x.js > /dev/null || { echo "EROARE la $x"; exit 1; }
done
echo "gata"
