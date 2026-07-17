(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- hero video: desktop only, never on mobile data ---- */
  var vid = document.querySelector('[data-hero-video]');
  if (vid && !reduce && window.matchMedia('(min-width: 1001px)').matches) {
    var src = vid.getAttribute('data-src');
    if (src) {
      vid.setAttribute('src', src);
      vid.play().catch(function () { /* autoplay blocked — poster stays */ });
    }
  }

  /* ---- tracer + counting readouts ---- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () { hero.classList.add('is-ready'); });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toFixed(dec) + suffix; return; }
    var start = null, dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    setTimeout(function () { requestAnimationFrame(tick); }, 300);
  }
  document.querySelectorAll('[data-to]').forEach(countUp);

  /* ---- scroll reveal ---- */
  var rv = document.querySelectorAll('.rv');
  if (!rv.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var ioFired = false;
  var io = new IntersectionObserver(function (entries) {
    ioFired = true;
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  rv.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
    io.observe(el);
  });
  /* Failsafe: a real browser fires an initial callback as soon as anything is
     observed. If the observer stays silent (some embedded/headless renderers),
     every .rv section would sit at opacity 0 forever — reveal instead. */
  setTimeout(function () {
    if (!ioFired) rv.forEach(function (el) { el.style.transitionDelay = ''; el.classList.add('in'); });
  }, 2000);
})();
