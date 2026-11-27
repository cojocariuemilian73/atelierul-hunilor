/* Jocul Attila, la final: profilul de decizie + Cronica deciziilor + paralele cu istoria și legături spre site.
   Ascultă evenimentul „ah-mig-end” trimis de jocuri/migratie.js; nu schimbă logica jocului. Prefix: jc-. */
(function () {
  // ce a cântărit fiecare variantă din Actul II (aur, renume, loialitate, cai), în ordinea opțiunilor A, B, C
  var AXIS = {
    r1: ['aur', 'loial', 'renume'], r2: ['renume', 'cai', 'aur'], r3: ['renume', 'loial', 'loial'],
    r4: ['renume', 'aur', 'cai'], r5: ['renume', 'renume', 'aur'], r6: ['renume', 'aur', 'cai'],
    r7: ['renume', 'cai', 'aur'], r8: ['renume', 'aur', 'loial']
  };
  // atitudinea în rolurile romane și în rolul lui Ardaric: înțelegere, forță sau așteptare
  var STANCE = {
    d1: ['pact', 'astept', 'forta'], d2: ['forta', 'forta'], dh: ['forta', 'pact', 'astept'],
    d5: ['forta', 'pact', 'astept'], dl: ['forta', 'pact', 'astept']
  };
  var NAMES = { aur: 'Aur', renume: 'Renume', loial: 'Loialitate', cai: 'Cai' };
  var PROFILES = {
    aur: { n: 'Strângătorul de tribut', d: 'Ai pus aurul pe primul loc: tribut, pradă, despăgubiri.',
      h: 'Așa au domnit Rua și Attila între 422 și 447: aurul de la Constantinopol plătea darurile care țineau căpeteniile alături.' },
    renume: { n: 'Flagelul temut', d: 'Ai ales mereu varianta care îți crește renumele, chiar cu prețul cailor și al loialității.',
      h: 'Frica de numele lui Attila a fost o armă diplomatică: orașe din Balcani și din Italia au cedat înainte de asediu.' },
    loial: { n: 'Ctitorul de alianțe', d: 'Ai cheltuit pentru loialitate și ai împărțit puterea, ca imperiul să nu depindă doar de tine.',
      h: 'Attila nu a făcut asta. Aetius, în schimb, a ținut Apusul prin aliați: huni, vizigoți, franci, burgunzi.' },
    cai: { n: 'Călărețul prudent', d: 'Ai cruțat oastea și caii: ai negociat sau te-ai retras când lupta costa prea mult.',
      h: 'Attila a făcut la fel în 451, în cercul de căruțe, și în 452, când s-a retras din Italia după solia papei Leon.' }
  };
  var STANCES = {
    pact: 'În rolurile romane și ca Ardaric ai căutat mai des înțelegerea decât lupta.',
    forta: 'În rolurile romane și ca Ardaric ai mers mai des pe forță și fermitate.',
    astept: 'În rolurile romane și ca Ardaric ai preferat să aștepți și să eviți riscul.'
  };
  // unde poate aprofunda cititorul fiecare decizie
  var LINK = {
    d1: ['#sec-migratie', 'Marea Migrație'], d2: ['#sec-atlas', 'Atlas'], dh: ['#sec-cronologie', 'Cronologie'],
    r1: ['#sec-migratie', 'Tributul în aur'], r2: ['#sec-cronologie', 'Cronologie'], r3: ['#sec-personalitati', 'Personalități'],
    r4: ['#sec-migratie', 'Tributul în aur'], r5: ['#sec-personalitati', 'Personalități'], r6: ['#sec-atlas', 'Atlas'],
    r7: ['#sec-atlas', 'Atlas'], r8: ['#sec-cronologie', 'Cronologie'], d5: ['#sec-cronologie', 'Cronologie'], dl: ['#sec-cronologie', 'Cronologie']
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function strip(s) { var d = document.createElement('div'); d.innerHTML = s || ''; return d.textContent.trim(); }

  function profile(log) {
    var w = { aur: 0, renume: 0, loial: 0, cai: 0 }, n = 0, st = { pact: 0, forta: 0, astept: 0 }, real = 0;
    log.forEach(function (l) {
      if (l.real) real++;
      if (AXIS[l.id] && AXIS[l.id][l.ix]) { w[AXIS[l.id][l.ix]]++; n++; }
      if (STANCE[l.id] && STANCE[l.id][l.ix]) st[STANCE[l.id][l.ix]]++;
    });
    var order = Object.keys(w).sort(function (a, b) { return w[b] - w[a]; });
    var top = order[0], second = w[order[1]] > 0 ? order[1] : null;
    var stance = Object.keys(st).sort(function (a, b) { return st[b] - st[a]; })[0];
    return { w: w, n: n, top: n ? top : null, second: second, stance: (st.pact + st.forta + st.astept) ? stance : null, real: real, total: log.length };
  }

  function render(ev) {
    var x = ev.detail || {}, box = x.box; if (!box || box.querySelector('.jc')) return;
    var log = (x.log || []).filter(function (l) { return l.id && l.id.charAt(0) !== 'a'; });
    if (!log.length) return;
    var byId = {}; (x.decisions || []).forEach(function (d) { byId[d.id] = d; });
    var p = profile(log), P = p.top ? PROFILES[p.top] : null;

    var nuance = [];
    if (P) nuance.push(P.d);
    if (p.second && p.second !== p.top) nuance.push('Pe locul doi: ' + NAMES[p.second].toLowerCase() + '.');
    if (p.stance) nuance.push(STANCES[p.stance]);
    nuance.push('Ai ales ca în istorie în ' + p.real + ' din ' + p.total + ' decizii.');

    var bars = P ? '<dl class="jc-weights">' + Object.keys(NAMES).map(function (k) {
      var v = p.n ? Math.round(p.w[k] / p.n * 100) : 0;
      return '<div class="jc-w' + (k === p.top ? ' is-top' : '') + '"><dt>' + NAMES[k] + '</dt><dd><span class="jc-w-line" style="--v:' + (v / 100) + '"></span><b>' + v + '%</b></dd></div>';
    }).join('') + '</dl>' : '';

    var rows = log.map(function (l) {
      var d = byId[l.id] || {}, hist = strip(d.real || d.real2 || ''), lk = LINK[l.id];
      return '<li class="jc-row' + (l.real ? ' is-real' : '') + '">' +
        '<span class="jc-yr">' + esc(l.y) + '</span>' +
        '<div class="jc-txt"><h5>' + esc(l.title) + '</h5>' +
        '<p class="jc-you"><span>Tu:</span> ' + esc(l.t) + (l.real ? ' <em>ca în istorie</em>' : '') + '</p>' +
        (hist && !l.real ? '<p class="jc-hist"><span>În istorie:</span> ' + esc(hist) + '</p>' : '') +
        (lk ? '<a class="jc-link" href="' + lk[0] + '">' + esc(lk[1]) + ' →</a>' : '') + '</div></li>';
    }).join('');

    var plain = 'Cronica mea din jocul „Attila și Marea Migrație” (Atelierul Hunilor)\n' +
      (P ? 'Profil: ' + P.n + '. ' + nuance.join(' ') + '\n' : '') +
      (x.title ? 'Titlu: ' + x.title.n + '\n' : '') + '\n' +
      log.map(function (l) { var d = byId[l.id] || {}, h = strip(d.real || d.real2 || ''); return l.y + ' · ' + l.title + ': ' + l.t + (l.real ? ' (ca în istorie)' : (h ? '\n   În istorie: ' + h : '')); }).join('\n');

    var sec = document.createElement('section');
    sec.className = 'jc'; sec.setAttribute('aria-labelledby', 'jc-h');
    sec.innerHTML =
      '<div class="jc-profile">' +
        '<p class="jc-kicker">Stilul tău de decizie</p>' +
        '<h4 id="jc-h">' + (P ? esc(P.n) : 'Cronicarul') + '</h4>' +
        '<p class="jc-nuance">' + esc(nuance.join(' ')) + '</p>' +
        (P ? '<p class="jc-parallel"><span>Paralela istorică</span>' + esc(P.h) + '</p>' : '') +
      '</div>' + bars +
      '<div class="jc-chron"><div class="jc-chron-h"><h4>Cronica deciziilor</h4>' +
        '<button type="button" class="jc-copy">Copiază cronica</button><span class="jc-status" role="status" aria-live="polite"></span></div>' +
        '<ol class="jc-list">' + rows + '</ol>' +
        '<p class="jc-more">Aprofundează: <a href="#sec-atlas">Atlas</a> · <a href="#sec-cronologie">Cronologie</a> · <a href="#sec-personalitati">Personalități</a> · <a href="#biblio">Surse</a> · <a href="#mod-atelier">Jocul izvoarelor</a></p>' +
        '<textarea class="jc-plain" readonly aria-label="Cronica în text simplu, pentru copiere" rows="6"></textarea>' +
      '</div>';
    sec.querySelector('.jc-plain').value = plain;
    var btns = box.querySelector('.mig-end-btns');
    box.insertBefore(sec, btns || null);

    var status = sec.querySelector('.jc-status'), ta = sec.querySelector('.jc-plain');
    sec.querySelector('.jc-copy').addEventListener('click', function () {
      var done = function () { status.textContent = 'Copiată.'; setTimeout(function () { status.textContent = ''; }, 2400); };
      var fallback = function () { ta.classList.add('is-open'); ta.focus(); ta.select(); try { if (document.execCommand('copy')) return done(); } catch (e) {} status.textContent = 'Selectează textul de mai jos și copiază-l.'; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(plain).then(done, fallback); else fallback();
    });
    // legăturile duc în articol: închidem jocul pe ecran complet, dacă e cazul
    sec.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      if (document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen(); } catch (err) {} }
    });
  }
  document.addEventListener('ah-mig-end', render);
})();
