/* Comutatorul „Animații”: dacă vizitatorul a ales explicit animațiile (localStorage ah-motion = on sau ?animatii=1),
   site-ul se poartă ca pe un sistem fără „mișcare redusă”. Rulează primul, ca toate scripturile să vadă alegerea. */
(function () {
  var on = false;
  try {
    if (/[?&]animatii=1\b/.test(location.search)) localStorage.setItem('ah-motion', 'on');
    if (/[?&]animatii=0\b/.test(location.search)) localStorage.removeItem('ah-motion');
    on = localStorage.getItem('ah-motion') === 'on';
  } catch (e) {}
  var real = window.matchMedia;
  window.AH_MOTION = { forced: on, systemReduce: !!(real && real.call(window, '(prefers-reduced-motion: reduce)').matches) };
  if (!on || !real) return;
  document.documentElement.classList.add('ah-motion-on');
  // scripturile primesc „fără mișcare redusă”
  window.matchMedia = function (q) {
    if (/prefers-reduced-motion\s*:\s*reduce/.test(q)) {
      return { matches: false, media: q, onchange: null, addListener: function () {}, removeListener: function () {},
        addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return false; } };
    }
    if (/prefers-reduced-motion\s*:\s*no-preference/.test(q)) {
      return { matches: true, media: q, onchange: null, addListener: function () {}, removeListener: function () {},
        addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return false; } };
    }
    return real.call(window, q);
  };
  // stilurile: blocurile pentru „mișcare redusă” se dezactivează, cele pentru „fără preferință” se activează
  function flip(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.media && r.cssRules) {
        var t = r.media.mediaText;
        if (/prefers-reduced-motion\s*:\s*reduce/.test(t)) r.media.mediaText = 'not all';
        else if (/prefers-reduced-motion\s*:\s*no-preference/.test(t)) r.media.mediaText = 'all';
        else flip(r.cssRules);
      } else if (r.cssRules) flip(r.cssRules);
    }
  }
  function all() {
    for (var i = 0; i < document.styleSheets.length; i++) { try { flip(document.styleSheets[i].cssRules); } catch (e) {} }
  }
  document.addEventListener('DOMContentLoaded', all);
  window.addEventListener('load', all);
})();
