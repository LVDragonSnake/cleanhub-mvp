/* WILDBLOOD SAGA — ARGOS TERMINAL. Nessuna dipendenza. */
(function () {
  'use strict';

  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* Se una URL trasformata del CDN non risponde, si ricade sull'originale */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.dataset.fallback && el.src !== el.dataset.fallback) {
      el.removeAttribute('srcset'); el.src = el.dataset.fallback;
    }
  }, true);

  /* ============ BOOT SEQUENCE ============ */
  (function () {
    // sull'area riservata .boot e' la schermata di accesso: non va auto-chiusa
    var boot = $('.boot:not(#gate)'); if (!boot) return;
    var lines = $$('.boot__l', boot), bar = $('.boot__bar i', boot), pct = $('[data-pct]', boot);
    var i = 0, done = false;
    var step = RM ? 40 : 190;

    function next() {
      if (i < lines.length) {
        lines[i].classList.add('on');
        i++;
        var p = Math.round((i / lines.length) * 100);
        if (bar) bar.style.right = (100 - p) + '%';
        if (pct) pct.textContent = String(p).padStart(3, '0') + '%';
        setTimeout(next, i === lines.length ? step * 1.6 : step);
      } else { end(); }
    }
    function end() {
      if (done) return; done = true;
      boot.classList.add('done');
      document.body.classList.remove('lock');
      document.documentElement.classList.add('ready');
      document.dispatchEvent(new CustomEvent('wb:ready'));
    }
    setTimeout(next, 240);
    setTimeout(end, 4200); // tetto massimo
  })();

  /* ============ TESTO CHE SI DECODIFICA ============ */
  var GLYPH = '▚▞█▓▒░/\\<>{}[]#*+=-_~^0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function decode(el, dur) {
    var txt = el.dataset.txt || el.textContent;
    el.dataset.txt = txt;
    if (RM) { el.textContent = txt; return; }
    var chars = txt.split(''), start = performance.now(), D = dur || 780;
    el.classList.add('scr');
    (function tick(now) {
      var t = clamp((now - start) / D, 0, 1);
      var reveal = Math.floor(t * chars.length * 1.35);
      var out = '';
      for (var k = 0; k < chars.length; k++) {
        var c = chars[k];
        if (c === ' ' || k < reveal) out += c;
        else out += GLYPH[(Math.floor(now / 26) + k * 7) % GLYPH.length];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
      else { el.textContent = txt; el.classList.remove('scr'); }
    })(start);
  }

  /* ============ REVEAL ============ */
  (function () {
    var els = $$('[data-r],[data-clip],.dos,.sh');
    function show(el) {
      if (el.classList.contains('in')) return;
      el.classList.add('in');
      var i = els.indexOf(el); if (i > -1) els.splice(i, 1);
      $$('[data-dec]', el).forEach(function (d, n) { setTimeout(function () { decode(d); }, n * 80); });
      if (el.hasAttribute('data-dec')) decode(el);
    }
    if (!('IntersectionObserver' in window) || RM) { els.slice().forEach(show); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) show(x.target); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });

    // rete di sicurezza: uno scroll rapidissimo puo' far saltare le callback
    var t;
    function sweep() {
      for (var i = els.length - 1; i >= 0; i--) {
        if (els[i].getBoundingClientRect().top < innerHeight * 0.94) show(els[i]);
      }
    }
    addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sweep, 110); }, { passive: true });
    addEventListener('resize', sweep, { passive: true });
    addEventListener('load', sweep);
    document.addEventListener('wb:ready', function () { setTimeout(sweep, 60); });
    setTimeout(sweep, 900);
  })();

  /* ============ MIRINO ============ */
  if (FINE && !RM) {
    var cx = document.createElement('div');
    cx.className = 'cx'; cx.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
    var cd = document.createElement('div'); cd.className = 'cxd';
    document.body.appendChild(cx); document.body.appendChild(cd);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cd.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      cx.classList.add('on'); cd.classList.add('on');
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.19; ry += (my - ry) * 0.19;
      cx.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      cx.classList.toggle('hot', !!e.target.closest('a,button,input,.file,.vol,.dos,.loc,.pin'));
    });
  }

  /* ============ BOTTONI MAGNETICI ============ */
  if (FINE && !RM) {
    $$('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px,'
          + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ============ NAV ============ */
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
          lk.classList.remove('open'); bg.classList.remove('on');
          bg.setAttribute('aria-expanded', 'false'); document.body.classList.remove('lock');
        });
      });
    }
    var secs = $$('section[id]'), links = $$('.links a[href^="#"]');
    var hudSec = $('[data-hud-sec]'), hudPct = $('[data-hud-pct]');
    function upd() {
      var y = scrollY;
      if (nav) nav.classList.toggle('stuck', y > 30);
      var cur = secs[0];
      secs.forEach(function (s) { if (s.offsetTop - 150 <= y) cur = s; });
      links.forEach(function (a) { a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id); });
      if (hudSec && cur) hudSec.textContent = (cur.dataset.name || cur.id).toUpperCase();
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.round((y / h) * 100) : 0;
      if (hudPct) hudPct.textContent = String(p).padStart(3, '0');
      var buy = $('.buy'), hero = $('.hero');
      if (buy && hero) buy.classList.toggle('up', y > hero.offsetHeight * 0.82);
    }
    addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd, { passive: true });
    upd();
  })();

  /* ============ HERO: riflettore + parallasse ============ */
  (function () {
    var hero = $('.hero'); if (!hero) return;
    var lens = $('.hero__lens', hero), ph = $('.hero__ph', hero);
    if (lens && FINE && !RM) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
        var y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
        var m = 'radial-gradient(circle 220px at ' + x + '% ' + y + '%, #000 0%, rgba(0,0,0,.55) 45%, transparent 72%)';
        lens.style.webkitMaskImage = m; lens.style.maskImage = m;
        hero.classList.add('lens');
      });
      hero.addEventListener('mouseleave', function () { hero.classList.remove('lens'); });
    }
    if (RM) return;
    var tick = false;
    function run() {
      var y = scrollY;
      if (y < innerHeight * 1.3) {
        if (ph) ph.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0) scale(' + (1 + y / innerHeight * 0.06).toFixed(3) + ')';
        var inr = $('.hero__in', hero);
        if (inr) { inr.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0)'; inr.style.opacity = String(clamp(1 - y / (innerHeight * 0.7), 0, 1)); }
      }
      tick = false;
    }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  })();

  /* ============ BRACI ============ */
  (function () {
    var host = $('.hero__em'); if (!host || RM) return;
    var cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 2), ps = [], live = true;
    function size() {
      W = host.offsetWidth; H = host.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = []; var n = Math.round(Math.min(84, W / 15));
      for (var i = 0; i < n; i++) ps.push(mk(Math.random() * H));
    }
    function mk(y) {
      return { x: Math.random() * W, y: y, r: Math.random() * 1.6 + .35,
        vy: -(Math.random() * .32 + .08), vx: (Math.random() - .5) * .2,
        a: Math.random() * .55 + .1, t: Math.random() * 6.3 };
    }
    function frame() {
      if (!live) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y += p.vy; p.t += .02; p.x += p.vx + Math.sin(p.t) * .22;
        if (p.y < -10) { ps[i] = mk(H + 10); continue; }
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(255,140,74,' + p.a + ')');
        g.addColorStop(.4, 'rgba(192,40,26,' + p.a * .5 + ')');
        g.addColorStop(1, 'rgba(192,40,26,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.284); ctx.fill();
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

  /* ============ BATTITO ============ */
  (function () {
    var svg = $('.pulse'); if (!svg || RM) return;
    var path = svg.querySelector('path'), W = 1200, H = 54, mid = H / 2, t = 0;
    function beat(x, ph) {
      var d = x - ph; if (d < 0 || d > 58) return mid;
      if (d < 12) return mid - Math.sin(d / 12 * Math.PI) * 2.6;
      if (d < 20) return mid + (d - 12) * 1;
      if (d < 28) return mid - (d - 20) * 3.1 + 8;
      if (d < 36) return mid + (d - 28) * 2.4 - 16.8;
      if (d < 46) return mid + 2.4 - (d - 36) * .24;
      return mid;
    }
    (function draw() {
      t = (t + 1.7) % 400;
      var d = 'M0 ' + mid;
      for (var x = 0; x <= W; x += 4) {
        var y = mid;
        for (var k = -1; k < 6; k++) { var v = beat(x, k * 200 + t); if (v !== mid) { y = v; break; } }
        d += ' L' + x + ' ' + y.toFixed(1);
      }
      path.setAttribute('d', d);
      requestAnimationFrame(draw);
    })();
  })();

  /* ============ RAIL ORIZZONTALE DEI VOLUMI ============ */
  (function () {
    var rail = $('.rail'); if (!rail) return;
    var track = $('.rail__track', rail), prog = $('.rail__prog i', rail), cnt = $('[data-rail-n]', rail);
    var flat = false;

    function layout() {
      // sotto i 900px, o con reduced-motion, si impila in verticale
      flat = innerWidth < 900 || RM;
      rail.classList.toggle('rail--flat', flat);
      if (flat) { track.style.transform = ''; rail.style.height = ''; return; }
      var dist = track.scrollWidth - track.clientWidth;
      rail.dataset.dist = String(Math.max(0, dist));
      rail.style.height = (innerHeight + Math.max(0, dist) * 1.25) + 'px';
      move();
    }
    function move() {
      if (flat) return;
      var r = rail.getBoundingClientRect();
      var total = rail.offsetHeight - innerHeight;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      var dist = parseFloat(rail.dataset.dist) || 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (prog) prog.style.right = ((1 - p) * 100).toFixed(1) + '%';
      if (cnt) {
        var vols = $$('.vol', track);
        cnt.textContent = String(clamp(Math.round(p * (vols.length - 1)) + 1, 1, vols.length)).padStart(2, '0')
          + ' / ' + String(vols.length).padStart(2, '0');
      }
    }
    var tk = false;
    addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(function () { move(); tk = false; }); } }, { passive: true });
    addEventListener('resize', layout, { passive: true });
    addEventListener('load', layout);
    layout();
  })();

  /* ============ TILT COVER ============ */
  if (FINE && !RM) {
    $$('[data-tilt]').forEach(function (h) {
      var f = h.querySelector('figure') || h.firstElementChild; if (!f) return;
      h.addEventListener('mousemove', function (e) {
        var r = h.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        f.style.transform = 'rotateY(' + (x * 17).toFixed(1) + 'deg) rotateX(' + (-y * 17).toFixed(1) + 'deg) translateZ(28px)';
      });
      h.addEventListener('mouseleave', function () { f.style.transform = ''; });
    });
  }

  /* ============ MAPPA ANOMALIE ============ */
  (function () {
    var map = $('.map'); if (!map) return;
    var pins = $$('.pin', map), rows = $$('.loc');
    function sel(i) {
      pins.forEach(function (p, n) { p.classList.toggle('on', n === i); });
      rows.forEach(function (r, n) { r.classList.toggle('on', n === i); });
    }
    pins.forEach(function (p, i) { p.addEventListener('mouseenter', function () { sel(i); }); p.addEventListener('click', function () { sel(i); }); });
    rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { sel(i); }); r.addEventListener('click', function () { sel(i); }); });
    if (!RM) {
      var i = 0, auto = setInterval(function () { sel(i % pins.length); i++; }, 3200);
      map.addEventListener('mouseenter', function () { clearInterval(auto); });
    }
  })();

  /* ============ CONTATORI ============ */
  (function () {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.textContent = e.dataset.count; }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target, to = parseFloat(el.dataset.count), t0 = performance.now(), D = 1100;
        if (RM) { el.textContent = to; io.unobserve(el); return; }
        (function run(now) {
          var t = clamp((now - t0) / D, 0, 1), e = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(to * e);
          if (t < 1) requestAnimationFrame(run);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: .5 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ============ DECLASSIFICA ============ */
  $$('[data-decl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var host = b.closest('[data-decl-scope]') || document.body;
      var on = host.classList.toggle('decl');
      b.setAttribute('aria-pressed', String(on));
      var l = b.querySelector('[data-decl-l]');
      if (l) { l.dataset.txt = on ? b.dataset.on : b.dataset.off; decode(l, 480); }
    });
  });

  /* ============ FORM ============ */
  $$('.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if ((f.getAttribute('action') || '').indexOf('http') === 0) return;
      e.preventDefault();
      var inp = f.querySelector('input[type=email]'), msg = f.parentElement.querySelector('.form__msg');
      if (!inp || !inp.value) return;
      if (f.dataset.mailto) {
        location.href = 'mailto:' + f.dataset.mailto + '?subject=' + encodeURIComponent(f.dataset.subject || '')
          + '&body=' + encodeURIComponent(inp.value);
      }
      if (msg) { msg.dataset.txt = f.dataset.ok || ''; decode(msg, 600); }
      inp.value = '';
    });
  });

  /* ============ OROLOGIO HUD + ANNO ============ */
  (function () {
    $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    var c = $('[data-clock]'); if (!c) return;
    (function t() {
      var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
      c.textContent = p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + ' UTC';
      setTimeout(t, 1000);
    })();
  })();
})();

/* ================= VISORE FASCICOLI ================= */
(function () {
  var raw = document.getElementById('argos-docs');
  var vw = document.getElementById('viewer');
  if (!raw || !vw) return;
  var DATA;
  try { DATA = JSON.parse(raw.textContent); } catch (e) { return; }

  var q = function (s) { return vw.querySelector(s); };
  var stage = q('[data-vw-stage]'), image = q('[data-vw-img]'), strip = q('[data-vw-strip]');
  var elCode = q('[data-vw-code]'), elTitle = q('[data-vw-title]'), elN = q('[data-vw-n]'), elDl = q('[data-vw-dl]');
  var sec = null, idx = 0, lastFocus = null;
  var DL = (window.__WB_DL || { download: 'Download', preview: 'Preview' });

  function show(i) {
    if (!sec || !sec.docs.length) return;
    idx = (i + sec.docs.length) % sec.docs.length;
    var d = sec.docs[idx];
    image.classList.remove('on');
    stage.classList.remove('zoom');
    var pre = new Image();
    pre.onload = function () { image.src = d.u; image.alt = d.t; image.classList.add('on'); };
    pre.onerror = function () { image.src = d.raw; image.alt = d.t; image.classList.add('on'); };
    pre.src = d.u;
    elCode.textContent = d.c;
    elTitle.textContent = d.t;
    elN.textContent = (idx + 1) + ' / ' + sec.docs.length;
    // il pulsante punta al PDF vero quando c'e'; altrimenti all'immagine originale
    var dlL = vw.querySelector('[data-vw-dl-l]'), dlS = vw.querySelector('[data-vw-dl-s]');
    elDl.href = d.pdf || d.raw;
    elDl.classList.toggle('vw__dl--pdf', !!d.pdf);
    if (dlL) dlL.textContent = d.pdf ? DL.download : DL.preview;
    if (dlS) dlS.textContent = d.pdf ? ' · PDF ' + d.size : '';
    if (d.pdf) elDl.setAttribute('download', ''); else elDl.removeAttribute('download');
    [].forEach.call(strip.children, function (b, n) { b.classList.toggle('on', n === idx); });
    var act = strip.children[idx];
    if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    // precarica il successivo
    var nx = sec.docs[(idx + 1) % sec.docs.length]; if (nx) { var p2 = new Image(); p2.src = nx.u; }
  }

  function open(i) {
    sec = DATA[i];
    if (!sec || !sec.docs.length) return;
    lastFocus = document.activeElement;
    strip.innerHTML = '';
    sec.docs.forEach(function (d, n) {
      var b = document.createElement('button');
      b.type = 'button'; b.title = d.t;
      var im = document.createElement('img');
      im.src = d.th; im.alt = ''; im.loading = 'lazy';
      im.onerror = function () { im.src = d.raw; };
      b.appendChild(im);
      b.addEventListener('click', function () { show(n); });
      strip.appendChild(b);
    });
    vw.hidden = false;
    requestAnimationFrame(function () { vw.classList.add('on'); });
    document.body.classList.add('lock');
    show(0);
    q('[data-vw-close]').focus();
  }

  function close() {
    vw.classList.remove('on');
    document.body.classList.remove('lock');
    setTimeout(function () { vw.hidden = true; image.removeAttribute('src'); }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [].forEach.call(document.querySelectorAll('[data-open]'), function (b) {
    b.addEventListener('click', function () { open(+b.dataset.open); });
  });
  q('[data-vw-close]').addEventListener('click', close);
  q('[data-vw-prev]').addEventListener('click', function () { show(idx - 1); });
  q('[data-vw-next]').addEventListener('click', function () { show(idx + 1); });
  stage.addEventListener('click', function (e) {
    if (e.target === stage) { close(); return; }
    if (e.target === image) stage.classList.toggle('zoom');
  });
  document.addEventListener('keydown', function (e) {
    if (vw.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
  // scorrimento col dito
  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 55 && !stage.classList.contains('zoom')) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
