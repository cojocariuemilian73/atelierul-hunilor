

(function(){
  function get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  var bar = document.querySelector('.chap-bar'), links = bar ? Array.prototype.slice.call(bar.querySelectorAll('a[data-sec]')) : [];
  // 1. capitolele citite: bifă în cuprins, iar la mouse, timpul de citire
  var seen = []; try { seen = JSON.parse(get('ah-citit') || '[]'); } catch (e) {}
  var secs = links.map(function(a){ return document.getElementById(a.getAttribute('data-sec')); });
  links.forEach(function(a, k){
    var s = secs[k]; if (!s || a.getAttribute('data-sec') === 'acasa') return;
    // același timp ca în caseta „Pe scurt”, unde există
    var ps = s.querySelector('.pe-scurt small'), m = ps ? parseInt(ps.textContent.replace(/[^0-9]+/, ''), 10) : Math.max(1, Math.round((s.textContent || '').split(/\s+/).length / 200));
    a.title = 'Cam ' + m + (m === 1 ? ' minut' : ' minute') + ' de citit';
    if (seen.indexOf(s.id) >= 0) a.classList.add('seen');
  });
  var raf = 0;
  window.addEventListener('scroll', function(){
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      secs.forEach(function(s, k){
        if (!s || !s.offsetHeight || seen.indexOf(s.id) >= 0 || links[k].getAttribute('data-sec') === 'acasa') return;
        var r = s.getBoundingClientRect();
        if (r.top < 0 && r.bottom < window.innerHeight * 0.9) { seen.push(s.id); set('ah-citit', JSON.stringify(seen)); links[k].classList.add('seen'); }
      });
    });
  }, { passive: true });

  // 2. după fiecare capitol: „↑ Cuprins” (aduce bara de capitole) și capitolul următor
  Array.prototype.forEach.call(document.querySelectorAll('.ch-orn'), function(o){
    var nx = o.nextElementSibling, id = nx && nx.id, a = links.filter(function(l){ return l.getAttribute('data-sec') === id; })[0];
    if (!a || o.nextElementSibling.classList.contains('ch-next')) return;
    var p = document.createElement('p'); p.className = 'ch-next';
    p.innerHTML = '<button type="button" class="ch-up">↑ Cuprins</button><a href="#' + id + '">Următorul: ' + a.textContent.replace(/^(\d+)/, '$1 ') + ' →</a>';
    o.insertAdjacentElement('afterend', p);
  });
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.ch-up'); if (!b || !bar) return;
    bar.classList.remove('chap-hide'); bar.classList.add('flash');
    setTimeout(function(){ bar.classList.remove('flash'); }, 900);
    var act = bar.querySelector('a.active') || links[0]; if (act) act.focus({ preventScroll: true });
  });

  // 3. jocurile terminate: bifă în meniul de sus
  function marks(){
    var joc = document.querySelector('.site-nav a[href="#mod-migratie"]'), masa = document.querySelector('.site-nav a[href="#mod-atelier"]');
    if (joc) { joc.classList.toggle('done', !!get('ah-joc')); if (get('ah-joc')) joc.title = 'Ai terminat jocul'; }
    if (masa) { masa.classList.toggle('done', !!get('ah-masa')); if (get('ah-masa')) masa.title = 'Ai terminat Jocul izvoarelor: ' + get('ah-masa'); }
  }
  marks();
  document.addEventListener('ah-progres', marks);
  window.addEventListener('storage', marks);
})();
