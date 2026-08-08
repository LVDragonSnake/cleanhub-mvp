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

  /* ================= HERO: pulviscolo e braci su canvas ================= */
  (function () {
    var host = document.querySelector('.cine__dust'); if (!host || RM) return;
    var cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), ps = [], live = true;
    function mk(y) {
      var ember = Math.random() < 0.34;
      return { x: Math.random() * W, y: y, r: (ember ? 1.5 : 0.9) * (Math.random() * 1.4 + 0.5),
        vy: -(Math.random() * (ember ? 0.34 : 0.16) + 0.05), vx: (Math.random() - 0.5) * 0.22,
        a: Math.random() * (ember ? 0.6 : 0.3) + 0.08, t: Math.random() * 6.3, e: ember };
    }
    function size() {
      W = host.offsetWidth; H = host.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = []; var n = Math.round(Math.min(120, W / 11));
      for (var i = 0; i < n; i++) ps.push(mk(Math.random() * H));
    }
    function frame() {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y += p.vy; p.t += 0.016; p.x += p.vx + Math.sin(p.t) * 0.26;
        if (p.y < -12) { ps[i] = mk(H + 12); continue; }
        var fl = p.e ? (0.72 + 0.28 * Math.sin(p.t * 3.1)) : 1;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4.5);
        if (p.e) {
          g.addColorStop(0, 'rgba(255,206,150,' + p.a * fl + ')');
          g.addColorStop(0.35, 'rgba(255,128,60,' + p.a * 0.55 * fl + ')');
          g.addColorStop(1, 'rgba(255,110,50,0)');
        } else {
          g.addColorStop(0, 'rgba(255,240,215,' + p.a * 0.7 + ')');
          g.addColorStop(1, 'rgba(255,240,215,0)');
        }
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4.5, 0, 6.284); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); frame();
    addEventListener('resize', size, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var v = e[0].isIntersecting;
        if (v && !live) { live = true; frame(); } else live = v;
      }, { threshold: 0 }).observe(host);
    }
  })();

  /* ================= HERO: la camera segue il puntatore ================= */
  (function () {
    var hero = document.querySelector('.cine'); if (!hero || RM) return;
    var ken = hero.querySelector('.cine__ken'), haze = hero.querySelector('.cine__haze'),
        rays = hero.querySelector('.cine__rays'), inn = hero.querySelector('.cine__in');
    if (FINE) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        if (ken)  ken.style.translate  = (x * -22).toFixed(1) + 'px ' + (y * -14).toFixed(1) + 'px';
        if (haze) haze.style.translate = (x * -34).toFixed(1) + 'px ' + (y * -20).toFixed(1) + 'px';
        if (rays) rays.style.translate = (x * 40).toFixed(1) + 'px 0';
      }, { passive: true });
      hero.addEventListener('mouseleave', function () {
        [ken, haze, rays].forEach(function (el) { if (el) el.style.translate = '0 0'; });
      });
    }
    var t = false;
    function run() {
      var y = scrollY;
      if (y < innerHeight * 1.2 && inn) {
        inn.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
        inn.style.opacity = String(cl(1 - y / (innerHeight * 0.62), 0, 1));
      }
      t = false;
    }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true });
    run();
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
