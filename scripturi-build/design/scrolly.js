/* Drumul hunilor, 370–476: scrollytelling pe hartă. Prefix: sc-.
   Un singur „regizor” calculează progresul t ∈ [0, 1] al pistei și din el: traseul trasat, camera (viewBox) și etapa activă.
   Fiecare etapă: ancorare (lectură, camera stă) → deplasare (camera merge spre etapa următoare, traseul se trasează) → așezare.
   Refolosește harta de bază din Atlas (#shared-img-0) și proiecția din cronologie. */
(function () {
  'use strict';
  // ---------- date ----------
  var STAGES = [
    { id: 'alani', year: 'c. 370', place: 'Între Volga, Don și Caucaz', at: [46.0, 41.5], w: 330, side: 'left',
      title: 'Hunii îi supun pe alani', story: 'Călăreții huni trec Volga și îi înfrâng pe alani. Alanii supuși vor lupta de acum alături de ei.',
      sig: 'Aici începe, după Ammianus, „sămânța tuturor ruinelor”: valul care împinge popoarele spre apus.' },
    { id: 'ermanaric', year: '375', place: 'Stepa nord-pontică', at: [47.4, 33.4], w: 320, side: 'left',
      title: 'Cade regatul lui Ermanaric', story: 'Greutungii, strămoșii ostrogoților, sunt zdrobiți. Regele lor, Ermanaric, își ia viața, după Ammianus.',
      sig: 'Ostrogoții rămân sub stăpânirea hunilor aproape 80 de ani.' },
    { id: 'dunare', year: '376', place: 'Dunărea de Jos', at: [44.6, 28.2], w: 300, side: 'left',
      title: 'Goții trec Dunărea', story: 'Fugind de huni, tervingii cer azil în Imperiu. Valens îi primește, dar îi lasă pe mâna unor comandanți corupți.',
      sig: 'Răscoala goților se termină la Adrianopol, în 378, cu moartea împăratului.' },
    { id: 'panonia', year: 'c. 420', place: 'Câmpia Panonică', at: [47.0, 20.2], w: 300, side: 'right',
      title: 'Hunii se așază în Câmpia Panonică', story: 'Sub regii Uldin, apoi Rua, centrul puterii hunice se mută la Dunărea mijlocie. Constantinopolul plătește primul tribut cunoscut: 350 de livre de aur pe an.',
      sig: 'Din stepa pannonică, hunii pot lovi deopotrivă Răsăritul și Apusul.' },
    { id: 'naissus', year: '441–442', place: 'Naissus (Niš), Balcani', at: [43.32, 21.9], w: 280, side: 'right',
      title: 'Attila și Bleda în Balcani', story: 'Cad Viminacium și Naissus. Trupele romane sunt departe, în Sicilia, împotriva vandalilor, iar Constantinopolul cere pace.',
      sig: 'Campaniile sunt o politică a aurului: prada și tributul țin neamurile supuse alături.' },
    { id: 'const', year: '447', place: 'Constantinopol', at: [41.01, 28.98], w: 270, side: 'left',
      title: 'Zidurile Constantinopolului', story: 'Un cutremur dărâmă o parte din ziduri; sunt refăcute în circa două luni. Attila învinge la râul Utus și ajunge până la Termopile.',
      sig: 'Pacea lui Anatolius urcă tributul la 2.100 de livre pe an, plus 6.000 restanță.' },
    { id: 'catal', year: '451', place: 'Câmpiile Catalaunice, Galia', at: [48.95, 4.4], w: 300, side: 'right',
      title: 'Câmpiile Catalaunice', story: 'Aetius și regele vizigot Teodoric I îl opresc pe Attila. Teodoric moare în luptă; Attila se retrage în cercul de căruțe, cu armata încă întreagă.',
      sig: 'Cea mai vestită bătălie a epocii: hunii luptă de ambele părți, ca aliați ai lui Attila și ca vechi aliați ai lui Aetius.' },
    { id: 'aquileia', year: '452', place: 'Aquileia, nordul Italiei', at: [45.77, 13.37], w: 280, side: 'right',
      title: 'Invazia Italiei', story: 'Attila distruge Aquileia și pustiește Câmpia Padului. Se întoarce după întâlnirea cu o solie din care face parte papa Leon I.',
      sig: 'Foametea, boala și o armată trimisă din Răsărit cântăresc probabil mai mult decât solia.' },
    { id: 'moarte', year: '453–454', place: 'Câmpia Panonică', at: [46.8, 19.6], w: 290, side: 'left',
      title: 'Moartea lui Attila și Nedao', story: 'Attila moare în noaptea nunții cu Ildico. Un an mai târziu, gepizii lui Ardaric îi înving pe fiii lui la Nedao.',
      sig: 'Loialitatea fusese față de Attila, nu față de un stat: imperiul hunic se destramă într-o singură generație.' },
    { id: 'ravenna', year: '476', place: 'Ravenna', at: [44.42, 12.2], w: 300, side: 'right',
      title: 'Sfârșitul Imperiului de Apus', story: 'Odoacru îl depune pe Romulus Augustulus. Tatăl lui, Edeco, fusese probabil unul dintre oamenii de încredere ai lui Attila.',
      sig: 'Hunii nu au cucerit Roma, dar au pus în mișcare popoarele care au destrămat Apusul.' }
  ];
  var MAP = { x: 0, y: 244.6, w: 690, h: 345.4 };   // suprafața imaginii de bază, în unitățile hărții
  var MAXPX = 3.2;                                   // cel mult atâția pixeli CSS pe unitate: harta nu se pixelează
  var ANCHOR = 0.5;                                  // jumătate din fiecare etapă e pentru lectură
  var HYST = 0.03;                                   // histerezis la schimbarea etapei active

  function proj(lat, lon) {
    var r = Math.PI / 180, p = lat * r, l = (lon - 10) * r, p0 = 52 * r;
    var k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
    var x = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
    var y = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
    return [x / 100 * 690, y / 100 * 1351 * 690 / 1580];
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function Scrolly(root) {
    this.root = root; this.on = []; this.raf = 0; this.active = -1; this.t = -1;
    this.mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  }
  Scrolly.prototype.listen = function (target, type, fn, opts) { target.addEventListener(type, fn, opts); this.on.push([target, type, fn, opts]); };

  Scrolly.prototype.init = function () {
    var self = this, root = this.root, N = STAGES.length;
    STAGES.forEach(function (s) { s.p = proj(s.at[0], s.at[1]); });
    // traseul: lungimea fiecărui segment, cumulată
    this.cum = [0];
    for (var i = 1; i < N; i++) this.cum.push(this.cum[i - 1] + Math.hypot(STAGES[i].p[0] - STAGES[i - 1].p[0], STAGES[i].p[1] - STAGES[i - 1].p[1]));
    var xs = STAGES.map(function (s) { return s.p[0]; }), ys = STAGES.map(function (s) { return s.p[1]; });
    this.center = [(Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2];
    var d = 'M' + STAGES.map(function (s) { return s.p[0].toFixed(1) + ' ' + s.p[1].toFixed(1); }).join(' L');

    root.style.setProperty('--sc-n', N);
    root.innerHTML =
      '<div class="sc-scene">' +
        '<div class="sc-map">' +
          '<svg class="sc-svg" role="img" aria-labelledby="sc-svg-t" preserveAspectRatio="xMidYMid slice">' +
            '<title id="sc-svg-t">Harta Europei cu drumul hunilor între 370 și 476, de la Marea Azov la Ravenna</title>' +
            '<use href="#shared-img-0"/><rect class="sc-shade" x="0" y="244.6" width="690" height="345.4"/>' +
            '<path class="sc-route-next" d="' + d + '"/><path class="sc-route-past" d="' + d + '"/>' +
          '</svg>' +
          '<div class="sc-marks" aria-hidden="true">' + STAGES.map(function (s, i) { return '<span class="sc-mk" data-i="' + i + '"></span>'; }).join('') +
            '<span class="sc-here"><span class="sc-here-ring"></span></span><span class="sc-label"></span></div>' +
        '</div>' +
        '<header class="sc-intro"><p class="sc-kicker">Drumul hunilor</p><h2 class="sc-h" id="sc-h">370–476, pas cu pas pe hartă</h2></header>' +
        '<article class="sc-panel" aria-live="polite" aria-atomic="true"></article>' +
        '<nav class="sc-axis" aria-label="Etapele drumului hunilor">' +
          '<span class="sc-axis-line" aria-hidden="true"><span class="sc-axis-prog"></span></span>' +
          '<ol>' + STAGES.map(function (s, i) { return '<li><button type="button" class="sc-yr" data-i="' + i + '" aria-label="' + esc(s.year + ': ' + s.title) + '">' + esc(s.year) + '</button></li>'; }).join('') + '</ol>' +
        '</nav>' +
        '<p class="sc-credit">Hartă de bază: <i>Europe relief laea location map</i>, <a href="https://commons.wikimedia.org/wiki/File:Europe_relief_laea_location_map.jpg">Alexrk2, Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.</p>' +
      '</div>';
    root.setAttribute('aria-labelledby', 'sc-h');

    this.scene = root.querySelector('.sc-scene'); this.mapEl = root.querySelector('.sc-map'); this.svg = root.querySelector('.sc-svg');
    this.past = root.querySelector('.sc-route-past'); this.panel = root.querySelector('.sc-panel');
    this.marks = root.querySelectorAll('.sc-mk'); this.here = root.querySelector('.sc-here'); this.label = root.querySelector('.sc-label');
    this.prog = root.querySelector('.sc-axis-prog'); this.yrs = root.querySelectorAll('.sc-yr');
    var len = 0; try { len = this.past.getTotalLength(); } catch (e) {}
    this.total = len > 0 ? len : this.cum[N - 1];   // rezervă dacă getTotalLength lipsește
    this.past.style.strokeDasharray = this.total + ' ' + this.total;

    // anii: clic sau Enter → derulare lină spre ancora etapei; apoi derularea manuală preia controlul
    root.querySelector('.sc-axis').addEventListener('click', function (e) {
      var b = e.target.closest('.sc-yr'); if (!b) return;
      self.go(+b.getAttribute('data-i'));
    });
    var req = function () { self.request(); };
    this.listen(window, 'scroll', req, { passive: true });
    this.listen(window, 'resize', function () { self.measure(); self.request(true); });
    if (this.mqReduce.addEventListener) { var mq = this.mqReduce, ch = function () { self.measure(); self.request(true); }; mq.addEventListener('change', ch); this.on.push([mq, 'change', ch]); }
    if ('ResizeObserver' in window) { this.ro = new ResizeObserver(function () { self.measure(); self.request(true); }); this.ro.observe(this.scene); }
    this.measure(); this.frame(true);
    return this;
  };

  Scrolly.prototype.destroy = function () {
    this.on.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); }); this.on = [];
    if (this.ro) this.ro.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0;
  };

  Scrolly.prototype.request = function (force) {
    var self = this; if (force) this.force = true;
    if (!this.raf) this.raf = requestAnimationFrame(function () { self.raf = 0; self.frame(self.force); self.force = false; });
  };

  // dimensiuni: zona hărții, panoul, zona liberă unde stă punctul activ (stânga/dreapta pentru fiecare etapă)
  Scrolly.prototype.measure = function () {
    // meniul fix și bara cu călărețul stau peste scenă: tot ce e text începe sub ele
    var top = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.ef-ride, body > header, .site-nav, #site-nav, .ah-nav'), function (el) {
      var cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if ((cs.position === 'fixed' || cs.position === 'sticky') && r.height && r.top < 160 && r.bottom < 220) top = Math.max(top, r.bottom);
    });
    this.top = Math.round(top) || 72;
    this.root.style.setProperty('--sc-vw', document.documentElement.clientWidth + 'px');   // fără bara de derulare
    this.scene.style.setProperty('--sc-top', this.top + 'px');
    var sw = this.scene.clientWidth, sh = this.scene.clientHeight, wide = sw >= 900;
    var mr = this.mapEl.getBoundingClientRect(), sr = this.scene.getBoundingClientRect();
    this.wide = wide; this.sw = sw; this.sh = sh;
    this.m = { x: mr.left - sr.left, y: mr.top - sr.top, w: mr.width || sw, h: mr.height || sh };
    var axisH = wide ? 84 : 0, pw = wide ? Math.min(440, sw * 0.36) : 0, gap = wide ? Math.max(32, sw * 0.04) : 0;
    this.pw = pw; this.gap = gap; this.axisH = axisH;
    // zona liberă: pe ecran lat, partea opusă panoului; pe telefon, toată harta de sus
    this.free = function (side) {
      if (!wide) return [this.m.w / 2, this.m.h * 0.5];
      var x0 = side === 'left' ? pw + gap : 0, x1 = side === 'left' ? sw : sw - pw - gap;
      return [(x0 + x1) / 2, (this.top + sh - axisH) * 0.5];
    };
    var Wmax = Math.min(MAP.w, MAP.h * this.m.w / this.m.h), Wmin = Math.min(this.m.w / MAXPX, Wmax);
    this.Wmax = Wmax; this.Wmin = Wmin;
    // anti-ocluzie: pentru fiecare etapă, partea panoului se alege o singură dată, determinist (fără pâlpâire)
    var self = this;
    STAGES.forEach(function (s) {
      s.sideUse = s.side;
      if (!wide) return;
      var v = self.view(s.p, s.w, s.side), q = self.screen(s.p, v);
      var px0 = s.side === 'left' ? 0 : sw - pw - 24, px1 = s.side === 'left' ? pw + 24 : sw;
      if (q[0] > px0 && q[0] < px1) s.sideUse = s.side === 'left' ? 'right' : 'left';
    });
  };

  // camera: viewBox care pune punctul p în centrul zonei libere, cu lățimea vizibilă W, fără margini goale
  Scrolly.prototype.view = function (p, W, side, f) {
    W = clamp(W, this.Wmin, this.Wmax);
    var s = this.m.w / W, H = this.m.h / s, fc = f || this.free(side);
    var x = clamp(p[0] - fc[0] / s, MAP.x, MAP.x + MAP.w - W);
    var y = clamp(p[1] - fc[1] / s, MAP.y, MAP.y + MAP.h - H);
    return { x: x, y: y, w: W, h: H, s: s };
  };
  Scrolly.prototype.screen = function (p, v) { return [(p[0] - v.x) * v.s, (p[1] - v.y) * v.s]; };

  Scrolly.prototype.progress = function () {
    var r = this.root.getBoundingClientRect(), vh = window.innerHeight;
    return clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
  };

  Scrolly.prototype.go = function (i) {
    var r = this.root.getBoundingClientRect(), vh = window.innerHeight, N = STAGES.length;
    var range = Math.max(1, r.height - vh), t = (i + ANCHOR * 0.45) / N;
    if (i === 0) t = 0.36 / N;
    var y = window.scrollY + r.top + t * range;
    window.scrollTo({ top: y, behavior: this.mqReduce.matches ? 'auto' : 'smooth' });
  };

  Scrolly.prototype.frame = function (force) {
    if (!this.m || !this.m.w || !this.m.h) return;   // pagina ascunsă: nimic de desenat
    var t = this.progress(), N = STAGES.length, reduce = this.mqReduce.matches;
    if (!force && Math.abs(t - this.t) < 1e-5) return;
    this.t = t;
    var pos = t * N, i = Math.min(N - 1, Math.floor(pos)), u = pos - i;
    var k = smooth((u - ANCHOR) / (1 - ANCHOR));   // deplasare + așezare, după faza de ancorare

    // etapa activă: cu prag și histerezis, ca textul să nu pâlpâie la limită
    var thr = ANCHOR + (1 - ANCHOR) * 0.55, act = (i < N - 1 && u > thr) ? i + 1 : i;
    if (this.active >= 0 && act !== this.active && Math.abs(u - thr) < HYST && Math.abs(act - this.active) === 1) act = this.active;

    // textul etapei se schimbă înaintea poziționării, ca eticheta locului să fie măsurată cu textul nou
    if (act !== this.active || force) this.stage(act, force);

    // 1. traseul
    var drawn;
    if (reduce) drawn = this.total;
    else if (i < N - 1) drawn = (this.cum[i] + (this.cum[i + 1] - this.cum[i]) * k) / this.cum[N - 1] * this.total;
    else drawn = this.total;
    this.past.style.strokeDashoffset = (this.total - drawn).toFixed(2);

    // 2. camera
    var v, a = STAGES[i], b = STAGES[Math.min(N - 1, i + 1)];
    if (reduce) {
      v = this.view([MAP.x + MAP.w * 0.5, MAP.y + MAP.h * 0.5], this.Wmax, 'left', [this.m.w / 2, this.m.h / 2]);
    } else {
      var fa = this.free(a.sideUse), fb = this.free(b.sideUse), p, W, f;
      if (i === 0 && u < ANCHOR) {
        // deschiderea: harta largă se strânge pe primul loc
        var o = smooth(u / (ANCHOR * 0.7));
        p = [lerp(MAP.x + MAP.w * 0.5, a.p[0], o), lerp(MAP.y + MAP.h * 0.5, a.p[1], o)];
        W = Math.exp(lerp(Math.log(this.Wmax), Math.log(a.w), o)); f = [lerp(this.wide ? this.sw / 2 : this.m.w / 2, fa[0], o), lerp(this.wide ? (this.top + this.sh - this.axisH) / 2 : this.m.h / 2, fa[1], o)];
      } else if (i === N - 1) {
        // finalul: după lectură, harta se așază pe tot drumul
        var e = smooth((u - ANCHOR) / (1 - ANCHOR));
        p = [lerp(a.p[0], this.center[0], e), lerp(a.p[1], this.center[1], e)];
        W = Math.exp(lerp(Math.log(a.w), Math.log(this.Wmax), e)); f = fa;
      } else {
        p = [lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k)];
        W = Math.exp(lerp(Math.log(a.w), Math.log(b.w), k));
        f = [lerp(fa[0], fb[0], k), lerp(fa[1], fb[1], k)];
      }
      v = this.view(p, W, a.sideUse, f);
    }
    if (!isFinite(v.x + v.y + v.w + v.h)) return;   // dimensiuni încă necunoscute
    this.svg.setAttribute('viewBox', v.x.toFixed(2) + ' ' + v.y.toFixed(2) + ' ' + v.w.toFixed(2) + ' ' + v.h.toFixed(2));
    this.svg.style.setProperty('--sc-k', (1 / v.s).toFixed(4));

    // 3. reperele: cele parcurse rămân ca urme, cel activ e marcat; poziții în pixeli, nu scalate
    var self = this, vw = this.m.w, vh2 = this.m.h;
    Array.prototype.forEach.call(this.marks, function (m, j) {
      var q = self.screen(STAGES[j].p, v), inside = q[0] > -20 && q[0] < vw + 20 && q[1] > -20 && q[1] < vh2 + 20;
      m.style.transform = 'translate3d(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px,0)';
      m.classList.toggle('is-past', j < act || reduce); m.classList.toggle('is-off', !inside);
    });
    var qa = this.screen(STAGES[act].p, v);
    this.here.style.transform = 'translate3d(' + qa[0].toFixed(1) + 'px,' + qa[1].toFixed(1) + 'px,0)';
    // eticheta locului: de partea punctului dinspre centrul hărții, ca să nu iasă din cadru
    var lw = this.labelW || 0, fitsRight = qa[0] + 18 + lw <= vw - 8, fitsLeft = qa[0] - 18 - lw >= 8;
    // eticheta: în dreapta punctului, altfel în stânga, altfel dedesubt, mereu în cadru
    var lx, ly = qa[1] - 14;
    if (fitsRight) lx = qa[0] + 18; else if (fitsLeft) lx = qa[0] - 18 - lw;
    else { lx = clamp(qa[0] - lw / 2, 8, vw - 8 - lw); ly = qa[1] + 16; }
    var outA = qa[0] < -10 || qa[0] > vw + 10 || qa[1] < -10 || qa[1] > vh2 + 10;
    this.here.classList.toggle('is-off', outA); this.label.classList.toggle('is-off', outA);
    this.label.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';

    // axa anilor
    this.prog.style.transform = 'scaleX(' + t.toFixed(4) + ')';

  };

  Scrolly.prototype.stage = function (i, force) {
    var s = STAGES[i], N = STAGES.length, prev = this.active;
    this.active = i;
    this.scene.setAttribute('data-side', this.wide ? s.sideUse : 'bottom');
    this.label.textContent = s.place;
    this.labelW = this.label.offsetWidth;
    this.panel.innerHTML =
      '<p class="sc-count"><span class="sc-year">' + esc(s.year) + '</span><span class="sc-n">' + (i + 1) + ' / ' + N + '</span></p>' +
      '<p class="sc-place">' + esc(s.place) + '</p>' +
      '<h3 class="sc-title">' + esc(s.title) + '</h3>' +
      '<p class="sc-story">' + esc(s.story) + '</p>' +
      '<p class="sc-sig">' + esc(s.sig) + '</p>';
    if (!this.mqReduce.matches && !force && prev !== -1) {
      this.panel.classList.remove('sc-in', 'sc-back'); void this.panel.offsetWidth;
      this.panel.classList.add('sc-in'); this.panel.classList.toggle('sc-back', i < prev);
      this.here.classList.remove('sc-ping'); void this.here.offsetWidth; this.here.classList.add('sc-ping');
    }
    if (!this.wide) {   // pe telefon, axa se derulează în propriul cadru, ca anul activ să rămână la vedere
      var ax = this.root.querySelector('.sc-axis'), btn = this.yrs[i];
      if (ax && btn) ax.scrollLeft = Math.max(0, btn.offsetLeft - ax.clientWidth / 2 + btn.offsetWidth / 2);
    }
    Array.prototype.forEach.call(this.yrs, function (b, j) {
      b.classList.toggle('is-on', j === i); b.classList.toggle('is-past', j < i);
      if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  };

  function boot() {
    var root = document.getElementById('sec-drum'); if (!root || root.__sc) return;
    if (!document.getElementById('shared-img-0')) return;   // fără harta de bază, secțiunea rămâne ascunsă
    root.classList.add('sc-ready');   // întâi vizibilă, ca măsurătorile să fie reale
    root.__sc = new Scrolly(root).init();
    window.AH_SCROLLY = root.__sc;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
