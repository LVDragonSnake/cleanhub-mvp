/* WILDBLOOD SAGA — trailer interattivo. Nessuna dipendenza. */
(function () {
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var cl = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { return t * t * (3 - 2 * t); };   // smoothstep

  /* se una URL trasformata del CDN non risponde, si ricade sull'originale */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.dataset.fallback && el.src !== el.dataset.fallback) {
      el.removeAttribute('srcset'); el.src = el.dataset.fallback;
    }
  }, true);

  /* ================= IL FILM ================= */
  (function () {
    var film = $('.film'); if (!film) return;
    var frames = $$('.frame', film), beats = $$('.beat', film);
    var ticks = $$('.film__ticks i', film), num = $('[data-film-n]', film), flash = $('.flash', film);
    var cue = $('.scrollcue', film);
    var n = frames.length;
    if (n < 2 || RM) { film.classList.add('film--flat'); return; }

    var running = false;
    function paint() {
      var r = film.getBoundingClientRect();
      var total = film.offsetHeight - innerHeight;
      var p = total > 0 ? cl(-r.top / total, 0, 1) : 0;
      var local = p * (n - 1);          // 0 .. n-1

      for (var i = 0; i < n; i++) {
        var d = local - i;              // <0 in arrivo · 0 al centro · >0 passato
        var a = ease(cl(1 - Math.abs(d), 0, 1));
        var f = frames[i];
        f.style.opacity = a.toFixed(3);
        if (a > 0.001) {
          // spinta in avanti continua: ogni fotogramma entra largo e si stringe
          var s = 1 + 0.15 * cl((d + 1) / 2, 0, 1);
          f.style.transform = 'scale(' + s.toFixed(4) + ') translate3d(0,' + (d * -1.6).toFixed(2) + '%,0)';
          f.style.visibility = 'visible';
        } else { f.style.visibility = 'hidden'; }

        if (beats[i]) {
          var ba = ease(cl(1 - Math.abs(d) / 0.62, 0, 1));
          beats[i].style.opacity = ba.toFixed(3);
          beats[i].style.transform = 'translate3d(0,' + (d * -34).toFixed(1) + 'px,0)';
          beats[i].style.visibility = ba > 0.001 ? 'visible' : 'hidden';
        }
      }

      if (flash) {
        var t = local - Math.floor(local);
        var k = Math.sin(t * Math.PI);
        flash.style.opacity = (0.085 * k * k * k).toFixed(4);
      }
      if (cue) cue.style.opacity = cl(1 - local / 0.35, 0, 1).toFixed(2);
      for (var j = 0; j < ticks.length; j++) ticks[j].classList.toggle('done', local >= j - 0.02);
      if (num) num.textContent = String(Math.min(n, Math.floor(local + 1.02))).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
      running = false;
    }
    addEventListener('scroll', function () { if (!running) { running = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', paint, { passive: true });
    addEventListener('load', paint);
    paint();

    var skip = $('.film__skip');
    if (skip) skip.addEventListener('click', function (e) {
      e.preventDefault();
      scrollTo({ top: film.offsetTop + film.offsetHeight - innerHeight * 0.02, behavior: 'smooth' });
    });
  })();

  /* ================= NAV ================= */
  (function () {
    var nav = $('.nav'), bg = $('.burger'), lk = $('.links');
    if (bg && lk) {
      bg.addEventListener('click', function () {
        var o = lk.classList.toggle('open');
        bg.classList.toggle('on', o); bg.setAttribute('aria-expanded', String(o));
        document.body.classList.toggle('lock', o);
      });
      $$('a', lk).forEach(function (a) {
        a.addEventListener('click', function () {
          lk.classList.remove('open'); bg.classList.remove('on'); document.body.classList.remove('lock');
        });
      });
    }
    var secs = $$('section[id]'), links = $$('.links a[href^="#"]');
    function upd() {
      if (nav) nav.classList.toggle('stuck', scrollY > 40);
      var cur = '';
      secs.forEach(function (s) { if (s.offsetTop - 160 <= scrollY) cur = s.id; });
      links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
    }
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  /* ================= RIVELAZIONI ================= */
  (function () {
    var els = $$('[data-r]');
    function show(el) {
      if (el.classList.contains('in')) return;
      el.classList.add('in');
      var i = els.indexOf(el); if (i > -1) els.splice(i, 1);
    }
    if (!('IntersectionObserver' in window) || RM) { els.slice().forEach(show); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) show(x.target); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
    var t;
    function sweep() {
      for (var i = els.length - 1; i >= 0; i--) if (els[i].getBoundingClientRect().top < innerHeight * 0.94) show(els[i]);
    }
    addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sweep, 110); }, { passive: true });
    addEventListener('resize', sweep, { passive: true });
    addEventListener('load', sweep);
    setTimeout(sweep, 800);
  })();

  /* ================= PARALLASSE SEZIONI ================= */
  (function () {
    if (RM) return;
    var items = $$('[data-para]'); if (!items.length) return;
    var t = false;
    function run() {
      var vh = innerHeight;
      items.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * (parseFloat(el.dataset.para) || 0.1)).toFixed(1) + 'px,0)';
      });
      t = false;
    }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true });
    addEventListener('resize', run, { passive: true }); run();
  })();

  /* ================= TILT COVER ================= */
  if (FINE && !RM) {
    $$('[data-tilt]').forEach(function (h) {
      var f = h.querySelector('figure'); if (!f) return;
      h.addEventListener('mousemove', function (e) {
        var r = h.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        f.style.transform = 'rotateY(' + (x * 16).toFixed(1) + 'deg) rotateX(' + (-y * 16).toFixed(1) + 'deg) translateZ(30px)';
      });
      h.addEventListener('mouseleave', function () { f.style.transform = ''; });
    });
  }

  /* ================= FORM ================= */
  $$('.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if ((f.getAttribute('action') || '').indexOf('http') === 0) return;
      e.preventDefault();
      var inp = f.querySelector('input[type=email]'), msg = f.parentElement.querySelector('.form__msg');
      if (!inp || !inp.value) return;
      if (f.dataset.mailto) location.href = 'mailto:' + f.dataset.mailto
        + '?subject=' + encodeURIComponent(f.dataset.subject || '') + '&body=' + encodeURIComponent(inp.value);
      if (msg) msg.textContent = f.dataset.ok || '';
      inp.value = '';
    });
  });

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
