/* WILDBLOOD SAGA — interactions. No dependencies. */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Wix image fallback: if a transformed URL 404s, use the original ---------- */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.dataset.fallback && el.src !== el.dataset.fallback) {
      el.removeAttribute('srcset');
      el.src = el.dataset.fallback;
    }
  }, true);

  /* ---------- Preloader ---------- */
  (function () {
    var pre = $('.preload');
    if (!pre) return;
    var bar = $('.preload__bar i', pre);
    var imgs = $$('img').filter(function (i) { return !i.complete; });
    var total = imgs.length, done = 0, finished = false;

    function tick() {
      done++;
      if (bar) bar.style.right = Math.max(0, 100 - (done / Math.max(total, 1)) * 100) + '%';
      if (done >= total) end();
    }
    function end() {
      if (finished) return;
      finished = true;
      if (bar) bar.style.right = '0%';
      setTimeout(function () {
        pre.classList.add('is-done');
        document.body.classList.remove('is-locked');
        document.documentElement.classList.add('is-ready');
      }, 260);
    }
    if (!total) { setTimeout(end, 420); }
    else {
      imgs.slice(0, 14).forEach(function (i) {
        i.addEventListener('load', tick, { once: true });
        i.addEventListener('error', tick, { once: true });
      });
      total = Math.min(total, 14);
    }
    setTimeout(end, 3600); // hard cap
    window.addEventListener('load', function () { setTimeout(end, 200); });
  })();

  /* ---------- Cursor ---------- */
  if (FINE && !RM) {
    var ring = document.createElement('div'); ring.className = 'cursor';
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.appendChild(ring); document.body.appendChild(dot);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest('a,button,input,.file,.vol,.char');
      ring.classList.toggle('is-hot', !!hot);
    });
  } else {
    document.documentElement.classList.add('no-cursor');
  }

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var els = $$('[data-rise],[data-wipe],[data-reveal],.char,.slashes');
    if (!('IntersectionObserver' in window) || RM) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      $$('.split').forEach(function (s) { s.closest('[data-reveal],[data-rise]') || s.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });

    function show(el) {
      el.classList.add('is-in');
      io.unobserve(el);
      var i = els.indexOf(el);
      if (i > -1) els.splice(i, 1);
    }

    // Rete di sicurezza: uno scroll molto rapido (o il trascinamento della barra)
    // puo' far saltare le callback dell'observer e lasciare blocchi invisibili.
    var sweepT;
    function sweep() {
      for (var i = els.length - 1; i >= 0; i--) {
        var r = els[i].getBoundingClientRect();
        if (r.top < innerHeight * 0.92) show(els[i]);
      }
    }
    addEventListener('scroll', function () {
      clearTimeout(sweepT);
      sweepT = setTimeout(sweep, 120);
    }, { passive: true });
    addEventListener('resize', sweep, { passive: true });
    addEventListener('load', sweep);
    setTimeout(sweep, 700);
  })();

  /* ---------- Split headline letters ---------- */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var idx = 0;
    words.forEach(function (w, wi) {
      var wrap = document.createElement('span');
      wrap.className = 'split';
      wrap.style.display = 'inline-block';
      w.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.textContent = ch;
        s.style.setProperty('--i', idx++);
        wrap.appendChild(s);
      });
      el.appendChild(wrap);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Nav ---------- */
  (function () {
    var nav = $('.nav'), burger = $('.burger'), links = $('.nav__links');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
      });
      $$('a', links).forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('is-open'); burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('is-locked');
        });
      });
    }
    var secs = $$('section[id]');
    var navLinks = $$('.nav__links a[href^="#"]');
    function onScroll() {
      var y = scrollY;
      if (nav) nav.classList.toggle('is-stuck', y > 40);
      var cur = '';
      secs.forEach(function (s) { if (s.offsetTop - 140 <= y) cur = s.id; });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur);
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- Scroll progress + buy bar ---------- */
  (function () {
    var fill = $('.progress__fill'), drip = $('.progress__drip'), bar = $('.buybar');
    var hero = $('.hero');
    function upd() {
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, scrollY / h) : 0;
      if (fill) fill.style.height = (p * 100) + '%';
      if (drip) drip.style.top = (p * 100) + '%';
      if (bar && hero) bar.classList.toggle('is-up', scrollY > hero.offsetHeight * 0.85);
    }
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd, { passive: true });
    upd();
  })();

  /* ---------- Parallax ---------- */
  (function () {
    if (RM) return;
    var items = $$('[data-para]');
    if (!items.length) return;
    var ticking = false;
    function run() {
      var vh = innerHeight;
      items.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.dataset.para) || 0.12;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * speed).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    addEventListener('resize', run, { passive: true });
    run();
  })();

  /* ---------- 3D tilt ---------- */
  (function () {
    if (!FINE || RM) return;
    $$('[data-tilt]').forEach(function (host) {
      var fig = host.querySelector('figure') || host.firstElementChild;
      if (!fig) return;
      host.addEventListener('mousemove', function (e) {
        var r = host.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        fig.style.transform = 'rotateY(' + (x * 15).toFixed(2) + 'deg) rotateX(' + (-y * 15).toFixed(2) + 'deg) translateZ(24px)';
      });
      host.addEventListener('mouseleave', function () { fig.style.transform = ''; });
    });
  })();

  /* ---------- Hero embers ---------- */
  (function () {
    var host = $('.hero__embers');
    if (!host || RM) return;
    var cv = document.createElement('canvas');
    cv.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), ps = [], running = true;

    function size() {
      W = host.offsetWidth; H = host.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(78, W / 16));
      ps = [];
      for (var i = 0; i < n; i++) ps.push(mk(Math.random() * H));
    }
    function mk(y) {
      return { x: Math.random() * W, y: y, r: Math.random() * 1.7 + 0.4,
        vy: -(Math.random() * 0.34 + 0.09), vx: (Math.random() - 0.5) * 0.22,
        a: Math.random() * 0.55 + 0.12, t: Math.random() * 6.28 };
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y += p.vy; p.t += 0.02; p.x += p.vx + Math.sin(p.t) * 0.24;
        if (p.y < -12) { ps[i] = mk(H + 12); continue; }
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(232,140,74,' + p.a + ')');
        g.addColorStop(0.4, 'rgba(192,40,26,' + (p.a * 0.5) + ')');
        g.addColorStop(1, 'rgba(192,40,26,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.284); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); frame();
    addEventListener('resize', size, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var vis = e[0].isIntersecting;
        if (vis && !running) { running = true; frame(); }
        running = vis;
      }, { threshold: 0 }).observe(host);
    }
  })();

  /* ---------- Heartbeat line (hero) ---------- */
  (function () {
    var svg = $('.pulse');
    if (!svg || RM) return;
    var path = svg.querySelector('path');
    var W = 1200, H = 60, mid = H / 2, t = 0;
    function beat(x, phase) {
      // returns y for a stylised ECG spike
      var d = x - phase;
      if (d < 0 || d > 60) return mid;
      if (d < 12) return mid - Math.sin((d / 12) * Math.PI) * 3;
      if (d < 20) return mid + (d - 12) * 1.1;
      if (d < 28) return mid - (d - 20) * 3.4 + 8.8;
      if (d < 36) return mid + (d - 28) * 2.6 - 18.4;
      if (d < 46) return mid + 2.4 - (d - 36) * 0.24;
      return mid;
    }
    function draw() {
      t = (t + 1.6) % 400;
      var d = 'M0 ' + mid;
      for (var x = 0; x <= W; x += 4) {
        var y = mid;
        for (var k = -1; k < 6; k++) {
          var phase = k * 200 + t;
          var yy = beat(x, phase);
          if (yy !== mid) { y = yy; break; }
        }
        d += ' L' + x + ' ' + y.toFixed(1);
      }
      path.setAttribute('d', d);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ---------- Declassify toggle ---------- */
  $$('[data-declassify]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var host = btn.closest('[data-declassify-scope]') || document.body;
      var on = host.classList.toggle('is-declassified');
      btn.setAttribute('aria-pressed', String(on));
      var l = btn.querySelector('[data-declassify-label]');
      if (l) l.textContent = on ? btn.dataset.labelOn : btn.dataset.labelOff;
    });
  });

  /* ---------- Newsletter form ---------- */
  $$('.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var action = f.getAttribute('action') || '';
      if (action && action.indexOf('http') === 0) return; // real provider endpoint: let it post
      e.preventDefault();
      var input = f.querySelector('input[type=email]');
      var msg = f.parentElement.querySelector('.form__msg');
      if (!input || !input.value) return;
      var to = f.dataset.mailto;
      if (to) {
        location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(f.dataset.subject || 'Newsletter')
          + '&body=' + encodeURIComponent(input.value);
      }
      if (msg) msg.textContent = f.dataset.ok || '';
      input.value = '';
    });
  });

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
