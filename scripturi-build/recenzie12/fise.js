// Recenzia 12: datele fișelor de verdict (citite de patch-recenzie-12.js; mitul și sursa vin din MYTHS).
// verdict (un cuvânt), explicația (izv) și de unde vine mitul (from) sunt scrise pentru fișe.
// img: selectorul unei imagini deja existente pe site; pos: ce parte din imagine se vede (object-position).
// src (opțional) înlocuiește sursa din MYTHS.
module.exports = {
  3: { verdict: 'Pripit',
    izv: 'Studiul din 2025 a găsit legături genealogice directe între unii indivizi din Bazinul Carpatic și membri ai elitei Xiongnu târzii.',
    from: 'Asemănarea numelor a fost invocată încă din secolul al XVIII-lea. Studiul ADN-ului vechi permite astăzi verificarea unor legături de familie.',
    img: 'img[alt^="Coroană de aur cu un vultur"]', cap: 'Coroana de aur de la Aluchaideng, piesă Xiongnu, sec. IV–III î.Hr.' },
  0: { verdict: 'Simplist',
    izv: 'Indivizii analizați din Bazinul Carpatic au ascendențe diverse. Iordanes enumeră mai multe grupuri care au luptat în armata lui Attila.',
    from: 'Gravura lui de Neuville înfățișează călăreții ca un grup uniform, cu arme și veșminte asemănătoare.',
    img: '#img-neuville', cap: 'Neuville, 1869: o imagine a călăreților huni dintr-o carte de istorie a Franței.' },
  2: { verdict: 'Greșit',
    izv: 'Craniile alungite prin bandajare apar în comunități diferite. La Mözs, practica a fost preluată și de oameni crescuți în regiune.',
    from: 'Craniile alungite apar în morminte din epoca hunică, inclusiv în cimitirul de la Mözs, în Ungaria.',
    img: '#img-craniu', cap: 'Craniu deformat artificial, sec. V.' },
  1: { verdict: 'Exagerat',
    izv: 'Ammianus îi compară pe huni cu animale și cu figuri cioplite grosolan. Oasele din morminte nu pot confirma portretul pe care îl face.',
    from: 'Portretul scris de Ammianus este una dintre primele descrieri ample păstrate despre huni.',
    img: '#img-ms-ammianus', pos: '50% 20%', cap: 'Res Gestae 31.2, despre huni, într-o copie din secolul al IX-lea.' },
  6: { verdict: 'Fals',
    izv: 'Priscus povestește cum Kreka, soția lui Attila, a primit solia romană în casa ei, iar văduva lui Bleda le-a dat găzduire în satul pe care îl conducea.',
    from: 'Relatarea unei solii arată și viața de la curte. Priscus descrie două episoade de găzduire.',
    img: 'img[alt^="Diademă ovală cu granate roșii"]', cap: 'Diadema de la Verhne-Pogromnoe, sf. sec. IV–V: podoaba unei femei din elită.' },
  8: { verdict: 'Nu chiar',
    izv: 'Solia papei a avut loc. Dar Hydatius scrie că armata hunică era lovită de foame și de boli, iar trupele lui Marcian atacau între timp dincolo de Dunăre.',
    from: 'Prosper consemnează întâlnirea cu solii. În fresca lui Rafael apar și apostolii Petru și Pavel.',
    src: 'Prosper Tiro și <a class="mx-note" href="#izv-hydatius">Hydatius</a>, anul 452',
    img: '#hero-img', pos: '30% 45%', cap: 'Rafael, 1514: mitul, pictat la peste o mie de ani după întâlnire.' },
  7: { verdict: 'Necunoscut',
    izv: 'Iordanes scrie că Attila a fost îngropat noaptea, iar cei care au săpat groapa au fost uciși, ca locul să rămână secret. Mormântul nu a fost găsit nici astăzi.',
    from: 'Povestea râului abătut peste mormânt se spune des, dar ea vine de la înmormântarea lui Alaric.',
    img: '#img-moartea', cap: 'Paczka, 1884: o interpretare a morții lui Attila.' }
};
