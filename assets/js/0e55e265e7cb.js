

(function(){
  'use strict';

  // ============================================================
  // DATE: locurile marcate pe hartă (conținut istoric real)
  // ============================================================

  /**
   * @typedef {Object} MapMarkerData
   * @property {'city'|'camp'|'battle'} type
   * @property {number} year - anul de la care marker-ul devine vizibil pe cronologie
   * @property {string} tag
   * @property {string} title
   * @property {string} desc
   * @property {{text:string, author:string, src:string}} quote
   */
  /** @type {MapMarkerData[]} */
  var DATA = window.AH_ATLAS_DATA = [
    { type: 'city', year: 0,   tag: 'Capitală simbolică a Imperiului de Apus', title: 'Roma', desc: 'Reședința imperială se mutase la Mediolanum (Milano) încă din 286, iar din 402 la Ravenna; Roma nu mai era capitală de facto. Rămâne însă premiul simbolic suprem: jefuită de vizigoți în 410, nu este niciodată atacată direct de Attila.', quote: null },
    { type: 'city', year: 402, tag: 'Noua reședință imperială · din 402 d.Hr.', title: 'Ravenna', desc: 'Împăratul Honorius mută reședința imperială de la Mediolanum la Ravenna în 402 d.Hr., oraș greu accesibil, apărat de mlaștini și cu ieșire la mare.', source: 'Codex Theodosianus VII.13.15 (Ravenna, 6 decembrie 402); S. Cosentino, The Structural Features of Ravenna’s Socioeconomic History in Late Antiquity, pp. 59–60, n. 2', quote: null },
    { type: 'city', year: 452, tag: 'Distrusă de Attila · 452 d.Hr.', title: 'Aquileia', desc: 'Attila asediază și distruge Aquileia în timpul invaziei Italiei (452 d.Hr.), deschizând drumul spre câmpia Padului.', quote: { text: 'atât de temeinic distrusă încât abia mai putea fi găsită urma ei', author: 'Iordanes (tradiție ulterioară)', src: 'Getica §§219–222, în special §221 (traducere adaptată)' } },
    { type: 'city', year: 441, tag: 'Devastat în campaniile hunice din anii 440', title: 'Naissus (Niš)', desc: 'Ambasada romană din 449, condusă de Maximinus și descrisă de însoțitorul său Priscus, găsește orașul aproape pustiit, la ani după campania hunică.', quote: { text: 'malul râului era plin de oasele celor uciși în luptă, iar orașul era pustiit, cu excepția câtorva bolnavi adăpostiți într-o biserică', author: 'Priscus din Panium', src: 'Fr. 8, partea 1 (Müller; traducere adaptată)' } },
    { type: 'city', year: 0,   tag: 'Capitala Imperiului de Răsărit', title: 'Constantinopol', desc: 'Ținta finală a campaniilor lui Attila din 441–447: orașul nu este niciodată cucerit, dar Imperiul de Răsărit acceptă un tribut anual uriaș.', source: 'Priscus, fr. 5 (Müller), pentru pace și tribut; Marcellinus Comes, Chronicon, anul 447, pentru cutremur', quote: null },
    { type: 'camp', year: 434, tag: 'Reședința lui Attila · localizare incertă', title: 'Reședința lui Attila', desc: 'Priscus descrie o mare așezare de lemn, undeva în Câmpia Panonică, la nord de Dunăre. Localizarea exactă nu este cunoscută: poziția de pe hartă e o estimare convențională, nu un sit identificat arheologic.', quote: { text: 'în timp ce oaspeților li se serveau bucate pe farfurii de argint, lui Attila i se aducea carne pe o tavă de lemn', author: 'Priscus din Panium', src: 'Fr. 8, partea 9 (Müller; traducere adaptată)' } },
    { type: 'battle', year: 378, tag: 'Dezastru roman · 9 august 378 d.Hr.', title: 'Bătălia de la Adrianopol', desc: 'Tervingii (viitorii vizigoți), împinși de huni peste Dunăre, zdrobesc armata romană de răsărit; împăratul Valens moare pe câmpul de luptă.', quote: { text: 'un asemenea măcel al romanilor nu s-a mai văzut de la dezastrul de la Cannae', author: 'Ammianus Marcellinus', src: 'Res Gestae, 31.13' } },
    { type: 'battle', year: 451, tag: 'Apogeul confruntării · 451 d.Hr.', title: 'Câmpiile Catalaunice', desc: 'O coaliție condusă de Aetius și de regele vizigot Teodoric I, incluzând și franci, burgunzi și alani, îl oprește pe Attila. Rezultatul e mai degrabă nedecis: Attila se retrage, dar armata sa nu e distrusă.', quote: { text: 'atrox, multiplex, immane, pertinax', author: 'Iordanes', src: 'Getica, 207: „o bătălie cruntă, complexă, monstruoasă, încrâncenată”' } }
  ];

  var markers = Array.prototype.slice.call(document.querySelectorAll('.marker'));
  var routes = Array.prototype.slice.call(document.querySelectorAll('.route'));
  var routeLabels = Array.prototype.slice.call(document.querySelectorAll('.route-label'));

  // ============================================================
  // CRONOLOGIE: sliderul de ani controlează ce e vizibil pe hartă
  // ============================================================

  function initTimeline(){
    var slider = document.getElementById('time-slider');
    var yearBadge = document.getElementById('year-badge');
    var eraLabel = document.getElementById('era-label');
    var yearTicks = slider.closest('.timebar').querySelectorAll('.time-tick');
    var zoneEarly = document.getElementById('zone-early');
    var zoneMax = document.getElementById('zone-max');
    var zoneLate = document.getElementById('zone-late');
    var zoneMaxOutline = document.getElementById('zone-max-outline');

    routes.forEach(function(r){
      var len = r.getTotalLength();
      r.style.strokeDasharray = len;
      r.style.strokeDashoffset = len;
      r.style.transition = 'stroke-dashoffset 0.5s ease, opacity 0.4s ease';
      r.dataset.len = len;
    });

    function setSliderFill(){
      var min = parseInt(slider.min, 10), max = parseInt(slider.max, 10);
      var pct = (slider.value - min) / (max - min) * 100;
      slider.style.setProperty('--fill', pct + '%');
    }

    function eraText(year){
      if (year < 375) return 'Înaintea expansiunii hunice: stepa pontică sub alte popoare.';
      if (year < 434) return 'Expansiunea: alanii și greutungii (viitorii ostrogoți) sunt supuși; tervingii (viitorii vizigoți) trec Dunărea în 376, iar hunii se așază treptat în Câmpia Panonică.';
      if (year < 441) return 'Rua, apoi Bleda și Attila (din 434): tratatul de la Margus și tributul plătit de Constantinopol.';
      if (year < 450) return 'Campaniile din Balcani (441–447): Naissus cade, iar armata hunică ajunge până aproape de zidurile Constantinopolului. Attila conduce singur din c. 445.';
      if (year < 453) return 'Attila se întoarce spre Apus: Galia și Câmpiile Catalaunice (451), apoi Italia și Aquileia (452).';
      return 'Prăbușirea: după moartea lui Attila (453) și Nedao (c. 454), hegemonia hunică se destramă.';
    }

    function update(){
      var year = parseInt(slider.value, 10);
      yearBadge.textContent = year + ' d.Hr.';
      slider.setAttribute('aria-valuetext', year + ' după Hristos');
      yearTicks.forEach(function(tick){ tick.setAttribute('aria-pressed', String(Number(tick.dataset.year) === year)); });
      eraLabel.textContent = eraText(year);
      setSliderFill();

      zoneEarly.style.opacity = (year >= 375 && year < 434) ? 0.55 : 0;
      zoneMax.style.opacity = (year >= 434 && year < 454) ? 0.6 : 0;
      zoneLate.style.opacity = (year >= 454) ? 0.35 : 0;
      zoneMaxOutline.classList.add('show');

      routes.forEach(function(r){
        var ry = parseInt(r.getAttribute('data-year'), 10);
        var ryEnd = r.hasAttribute('data-year-end') ? parseInt(r.getAttribute('data-year-end'), 10) : ry + 25;
        var len = parseFloat(r.dataset.len);
        if (year < ry) { r.style.opacity = 0; r.style.strokeDashoffset = len; return; }
        r.style.opacity = 1;
        var span = Math.max(1, ryEnd - ry);
        var t = Math.min(1, (year - ry) / span);
        r.style.strokeDashoffset = len * (1 - t);
      });
      routeLabels.forEach(function(l){ l.style.opacity = 1; });

      markers.forEach(function(m){
        var my = parseInt(m.getAttribute('data-year'), 10);
        m.classList.toggle('visible', year >= my);
      });
    }

    slider.addEventListener('input', update);
    yearTicks.forEach(function(tick){
      tick.addEventListener('click', function(){ slider.value = tick.dataset.year; update(); });
    });
    update();

  }

  // ============================================================
  // ZOOM / PAN pe hartă
  // ============================================================

  function initZoomPan(){
    var zoomGroup = document.getElementById('zoom-group');
    var mapArea = document.getElementById('map-area');
    var svgEl = document.getElementById('map-svg');
    var vb = (svgEl.getAttribute('data-vb') || '0 0 1248 832').split(' ').map(Number);
    var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
    var zt = { scale: 1, x: 0, y: 0 };
    function applyZoom(){
      var maxX = vb[2] * (zt.scale - 1) / 2, maxY = vb[3] * (zt.scale - 1) / 2;
      zt.x = Math.max(-maxX, Math.min(maxX, zt.x)); zt.y = Math.max(-maxY, Math.min(maxY, zt.y));
      zoomGroup.setAttribute('transform', 'translate(' + (cx + zt.x) + ',' + (cy + zt.y) + ') scale(' + zt.scale + ') translate(' + (-cx) + ',' + (-cy) + ')');
    }
    function unitsPerPx(){ var w = svgEl.getBoundingClientRect().width; return w ? vb[2] / w : 1; }

    document.getElementById('zoom-in').addEventListener('click', function(){ zt.scale = Math.min(3, zt.scale * 1.25); applyZoom(); });
    document.getElementById('zoom-out').addEventListener('click', function(){ zt.scale = Math.max(1, zt.scale / 1.25); if (zt.scale === 1) { zt.x = 0; zt.y = 0; } applyZoom(); });
    document.getElementById('zoom-reset').addEventListener('click', function(){ zt = { scale: 1, x: 0, y: 0 }; applyZoom(); });

    var dragging = false, lastX = 0, lastY = 0;
    mapArea.addEventListener('pointerdown', function(e){
      if (zt.scale <= 1) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      mapArea.setPointerCapture(e.pointerId);
    });
    mapArea.addEventListener('pointermove', function(e){
      if (!dragging) return;
      var k = unitsPerPx();
      zt.x += (e.clientX - lastX) * k; zt.y += (e.clientY - lastY) * k;
      lastX = e.clientX; lastY = e.clientY;
      applyZoom();
    });
    mapArea.addEventListener('pointerup', function(){ dragging = false; });
    mapArea.addEventListener('pointercancel', function(){ dragging = false; });
  }

  // ============================================================
  // MODAL de detaliu pentru fiecare marker
  // ============================================================

  // Images for some places, reused from the rest of the site when it is on the page.
  var MARKER_ART = {
    0: { id: 'hero-img', alt: 'Fresca lui Rafael: papa Leon cel Mare și Attila, cu Roma în fundal.', cap: 'Rafael, <i>Întâlnirea lui Leon cel Mare cu Attila</i> (1514). Pictorul plasează scena sub zidurile Romei; în realitate, întâlnirea a avut loc în nordul Italiei, pe Mincio. Domeniu public.' },
    2: { id: 'img-aquileia', cap: 'Attila asediază Aquileia, în <i>Cronica pictată de la Viena</i> (c. 1360). Domeniu public.' },
    4: { id: 'img-ziduri', cap: 'Zidurile lui Teodosie ale Constantinopolului. Foto: <a href="https://commons.wikimedia.org/wiki/File:Theodosian_Walls_of_Constantinople%2C_Istanbul_%2837905571151%29.jpg">Carole Raddato</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a>.' },
    7: { id: 'img-catalaunice', cap: 'Bătălia de la Câmpiile Catalaunice în <i>Spieghel Historiael</i> (c. 1330). Domeniu public.' }
  };
  function markerArt(i){
    var a = MARKER_ART[i];
    if (!a) return null;
    if (a.id) { var img = document.getElementById(a.id); return img ? { src: img.src, alt: img.alt, cap: a.cap } : null; }
    var el = document.querySelector(a.bg);
    var m = el && (el.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)$/);
    return m ? { src: m[1], alt: a.alt, cap: a.cap } : null;
  }

  function initMarkerModal(){
    var overlay = document.getElementById('modal-overlay');

    function showInfo(i){
      var d = DATA[i];
      if (!d) return;
      markers.forEach(function(m){ m.classList.toggle('active', parseInt(m.getAttribute('data-i'), 10) === i); });
      document.getElementById('mt-tag').textContent = d.tag;
      document.getElementById('mt-title').textContent = d.title;
      document.getElementById('mt-desc').textContent = d.desc;
      var art = markerArt(i), mtFig = document.getElementById('mt-fig');
      if (art) { document.getElementById('mt-img').src = art.src; document.getElementById('mt-img').alt = art.alt; document.getElementById('mt-cap').innerHTML = art.cap; mtFig.hidden = false; }
      else { mtFig.hidden = true; }
      if (d.quote && d.quote.text) {
        document.getElementById('mt-quote-wrap').style.display = 'block';
        document.getElementById('mt-quote').textContent = '“' + d.quote.text + '”';
        document.getElementById('mt-cite').textContent = d.quote.author + (d.quote.src ? ', ' + d.quote.src : '');
      } else {
        document.getElementById('mt-quote-wrap').style.display = d.source ? 'block' : 'none';
        document.getElementById('mt-quote').textContent = '';
        document.getElementById('mt-cite').textContent = d.source || '';
      }
      overlay.classList.add('show');
    }

    document.getElementById('modal-close').addEventListener('click', function(){ overlay.classList.remove('show'); });
    overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.classList.remove('show'); });

    markers.forEach(function(m){
      var i = parseInt(m.getAttribute('data-i'), 10);
      m.addEventListener('click', function(){ showInfo(i); });
      m.setAttribute('tabindex', '0');
      m.setAttribute('role', 'button');
      m.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showInfo(i); }
      });
    });
  }

  // ============================================================
  // Pornire
  // ============================================================

  initTimeline();
  initZoomPan();
  initMarkerModal();
})();

