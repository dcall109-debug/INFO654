(function () {
  var d = document, r = d.documentElement;
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = d.querySelector('.progress'), hdr = d.querySelector('.site-header');

  function onScroll() {
    var m = r.scrollHeight - innerHeight;
    bar.style.setProperty('--p', m > 0 ? Math.min(1, scrollY / m) : 0);
    hdr.classList.toggle('is-scrolled', scrollY > 30);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var els = [].slice.call(d.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    // observe each element's parent: clipped elements never report as visible themselves
    var map = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (map.get(e.target) || []).forEach(function (el) { el.classList.add('in'); });
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
    els.forEach(function (el) {
      var p = el.parentElement;
      if (!map.has(p)) { map.set(p, []); io.observe(p); }
      map.get(p).push(el);
    });
  } else els.forEach(function (e) { e.classList.add('in'); });

  d.querySelectorAll('[data-count]').forEach(function (el) {
    if (rm || !('IntersectionObserver' in window)) return;
    var to = +el.dataset.count, from = 1900;
    el.textContent = from;
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now();
      (function f(t) {
        var k = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    });
    o.observe(el);
  });

  var car = d.querySelector('[data-carousel]');
  if (car && !rm) {
    var next = car.querySelector('[data-next]'), hold = false;
    car.querySelector('.slides').setAttribute('aria-live', 'off');
    ['mouseenter', 'focusin'].forEach(function (n) { car.addEventListener(n, function () { hold = true; }); });
    ['mouseleave', 'focusout'].forEach(function (n) { car.addEventListener(n, function () { hold = false; }); });
    setInterval(function () { if (!hold && !d.hidden) next.click(); }, 6000);
    car.addEventListener('mousemove', function (e) {
      var b = car.getBoundingClientRect();
      car.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * 6 + 'deg');
      car.style.setProperty('--rx', (.5 - (e.clientY - b.top) / b.height) * 6 + 'deg');
    });
    car.addEventListener('mouseleave', function () { car.style.setProperty('--rx', '0deg'); car.style.setProperty('--ry', '0deg'); });
  }

  var tb = d.querySelector('.chart tbody');
  if (tb) {
    var rows = [].slice.call(tb.rows), chips = [].slice.call(d.querySelectorAll('.chip'));
    var q = d.getElementById('q'), cnt = d.querySelector('.count'), empty = d.querySelector('.empty'), f = 'all';
    rows.forEach(function (row) {
      var c = row.cells[2].textContent;
      row.dataset.b = /Bronx/.test(c) ? 'Bronx' : /New York, NY/.test(c) ? 'Manhattan' : 'Brooklyn';
    });
    function apply() {
      var s = q.value.trim().toLowerCase(), vis = [];
      rows.forEach(function (row) {
        var ok = (f === 'all' || row.dataset.b === f) && (!s || row.textContent.toLowerCase().indexOf(s) > -1);
        row.hidden = !ok; row.classList.remove('is-first', 'is-last');
        if (ok) vis.push(row);
      });
      if (vis.length) { vis[0].classList.add('is-first'); vis[vis.length - 1].classList.add('is-last'); }
      cnt.textContent = vis.length + (vis.length === 1 ? ' location' : ' locations');
      empty.hidden = vis.length > 0;
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        f = c.dataset.f;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
      });
    });
    q.addEventListener('input', apply);
    apply();
  }
})();
