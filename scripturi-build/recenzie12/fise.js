// Recenzia 12: datele fișelor de verdict (citite de patch-recenzie-12.js; mitul și sursa vin din MYTHS).
// verdict (un cuvânt), explicația (izv) și de unde vine mitul (from) sunt scrise pentru fișe: DE VERIFICAT.
// img: selectorul unei imagini deja existente pe site; pos: ce parte din imagine se vede (object-position).
// src (opțional) înlocuiește sursa din MYTHS.
module.exports = {
  3: { verdict: 'Pripit', // DE VERIFICAT
    izv: 'Analizele de ADN vechi leagă o parte din oamenii veniți cu hunii de stepele Mongoliei, unde trăiau Xiongnu. Rămâne nedovedit doar că elita hunică ar coborî direct din ei.', // DE VERIFICAT
    from: 'Ideea apare în secolul al XVIII-lea; cei care au respins-o mai târziu au mers prea departe.', // DE VERIFICAT
    img: 'img[alt^="Coroană de aur cu un vultur"]', cap: 'Coroana de aur de la Aluchaideng, piesă Xiongnu, sec. IV–III î.Hr.' }, // DE VERIFICAT
  0: { verdict: 'Simplist', // DE VERIFICAT
    izv: 'În mormintele din Bazinul Carpatic, oamenii din epoca hunică au origini amestecate, din Asia de Est și din Europa. Hunii erau o alianță de neamuri, nu un singur popor.', // DE VERIFICAT
    from: 'Gravurile și manualele din secolul al XIX-lea îi arătau ca o hoardă venită toată odată.', // DE VERIFICAT
    img: '#img-neuville', cap: 'Neuville, 1869: hoarda „unitară”, așa cum o imagina secolul al XIX-lea.' }, // DE VERIFICAT
  2: { verdict: 'Greșit', // DE VERIFICAT
    izv: 'Craniul alungit era o modă pe care au preluat-o și alte neamuri, printre ele unii germanici. Spune ceva despre obiceiuri, nu despre originea omului.', // DE VERIFICAT
    from: 'Apare des în mormintele din epocă, așa că în cărți a ajuns „semnul” hunilor.', // DE VERIFICAT
    img: '#img-craniu', cap: 'Craniu deformat artificial, sec. V.' }, // DE VERIFICAT
  1: { verdict: 'Exagerat', // DE VERIFICAT
    izv: 'Ammianus scrie după tiparul roman al „barbarului”: cu cât mai sălbatic, cu atât mai bine pentru poveste. Oasele din morminte nu arată nimic din trăsăturile pe care le descrie.', // DE VERIFICAT
    from: 'A trăit chiar în anii în care au sosit hunii, așa că a fost crezut multă vreme pe cuvânt.', // DE VERIFICAT
    img: '#img-ms-ammianus', pos: '50% 20%', cap: 'Res Gestae 31.2, despre huni, într-o copie din secolul al IX-lea.' }, // DE VERIFICAT
  6: { verdict: 'Fals', // DE VERIFICAT
    izv: 'Priscus povestește cum Kreka, soția lui Attila, a primit solia romană în casa ei, iar văduva lui Bleda le-a dat găzduire în satul pe care îl conducea.', // DE VERIFICAT
    from: 'Cronicile de război povestesc mai ales bătălii, iar acolo apar doar războinici.', // DE VERIFICAT
    img: 'img[alt^="Diademă ovală cu granate roșii"]', cap: 'Diadema de la Verhne-Pogromnoe, sf. sec. IV–V: podoaba unei femei din elită.' }, // DE VERIFICAT
  8: { verdict: 'Nu chiar', // DE VERIFICAT
    izv: 'Solia papei a avut loc. Dar Hydatius scrie că armata hunică era lovită de foame și de boli, iar trupele lui Marcian atacau între timp dincolo de Dunăre.', // DE VERIFICAT
    from: 'Prosper pomenește doar solia; restul poveștii s-a adăugat în Evul Mediu.', // DE VERIFICAT
    src: 'Prosper Tiro și <a class="mx-note" href="#izv-hydatius">Hydatius</a>, anul 452',
    img: '#hero-img', pos: '30% 45%', cap: 'Rafael, 1514: mitul, pictat la peste o mie de ani după întâlnire.' }, // DE VERIFICAT
  7: { verdict: 'Necunoscut', // DE VERIFICAT
    izv: 'Iordanes scrie că Attila a fost îngropat noaptea, iar cei care au săpat groapa au fost uciși, ca locul să rămână secret. Mormântul nu a fost găsit nici astăzi.', // DE VERIFICAT
    from: 'Povestea râului abătut peste mormânt se spune des, dar ea vine de la înmormântarea lui Alaric.', // DE VERIFICAT
    img: '#img-moartea', cap: 'Paczka, 1884: o scenă pe care n-a văzut-o nimeni.' } // DE VERIFICAT
};
