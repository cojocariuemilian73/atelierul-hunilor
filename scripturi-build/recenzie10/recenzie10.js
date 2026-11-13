(function(){
  // miturile: textul fiecărui mit stă într-un <span>, ca linia granat să-l taie pe toate rândurile
  function wrap(){
    Array.prototype.forEach.call(document.querySelectorAll('.mx-inline .mx-myth:not(.r10-w)'), function(p){
      p.classList.add('r10-w');
      var sp = document.createElement('span');
      sp.className = 'r10-s';
      while (p.firstChild) sp.appendChild(p.firstChild);
      p.appendChild(sp);
    });
  }
  wrap();
  document.addEventListener('DOMContentLoaded', wrap);
  window.addEventListener('load', wrap);
})();
