/* Teras hub: builds a stacked, one-package-per-block view of the comparison
   table for narrow screens. Without JS the table stays as a horizontally
   scrollable table with a sticky first column. */
(function () {
  var section = document.getElementById('paket');
  if (!section) return;
  var table = section.querySelector('table.compare');
  var wrap = section.querySelector('[data-compare]');
  if (!table || !wrap) return;

  var heads = table.querySelectorAll('thead th[scope="col"]');
  var rows = table.querySelectorAll('tbody tr');
  var stack = document.createElement('div');
  stack.className = 'stack';

  heads.forEach(function (th, i) {
    var col = i + 1;
    var pkg = document.createElement('section');
    pkg.className = 'stack__pkg stack__pkg--' + th.getAttribute('data-pkg');
    var name = th.querySelector('.th-name').textContent;
    var id = 'stack-' + th.getAttribute('data-pkg');
    pkg.setAttribute('aria-labelledby', id);

    var h = document.createElement('h3');
    h.className = 'stack__name';
    h.id = id;
    h.textContent = name;
    var price = document.createElement('p');
    price.className = 'stack__price';
    price.textContent = th.querySelector('.th-price').textContent;

    var dl = document.createElement('dl');
    rows.forEach(function (tr) {
      var dt = document.createElement('dt');
      dt.textContent = tr.querySelector('th').textContent;
      var cell = tr.children[col];
      var dd = document.createElement('dd');
      dd.className = cell.className;
      Array.prototype.forEach.call(cell.childNodes, function (n) {
        dd.appendChild(n.cloneNode(true));
      });
      dl.appendChild(dt);
      dl.appendChild(dd);
    });

    pkg.appendChild(h);
    pkg.appendChild(price);
    pkg.appendChild(dl);
    stack.appendChild(pkg);
  });

  /* the scroll region only needs a tab stop when it actually scrolls */
  var scroller = wrap.querySelector('.tablescroll');
  function syncTabStop() {
    if (!scroller) return;
    if (scroller.scrollWidth > scroller.clientWidth + 1) scroller.setAttribute('tabindex', '0');
    else scroller.removeAttribute('tabindex');
  }
  syncTabStop();
  window.addEventListener('resize', syncTabStop);

  wrap.parentNode.insertBefore(stack, wrap.nextSibling);
  section.classList.add('has-stack');
})();

/* Pause control for the opening reel (motion longer than 5 seconds). */
(function () {
  var reel = document.querySelector('.reel');
  var btn = reel && reel.querySelector('.reel__pause');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var paused = reel.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.textContent = paused ? 'Putar animasi' : 'Jeda animasi';
  });
})();
