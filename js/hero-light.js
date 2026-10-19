/*
  Cahaya di hero beranda (enhancement progresif), diadaptasi dari situs Rohis.
  - Berkas sinar lembut memancar dari belakang logo (conic-gradient, mode "screen").
  - Debu cahaya berwarna logo (merah, kuning, hijau, biru) melayang pelan ke atas.
  Tanpa JS / canvas: hero tetap tampil normal.
  prefers-reduced-motion: sinar diam, debu digambar sekali tanpa gerak.
*/
(function () {
  'use strict';
  var hero = document.getElementById('hero');
  var logo = hero && hero.querySelector('.hero-logo');
  if (!hero || !logo) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;

  var COLORS = ['218,64,59', '245,200,66', '63,155,91', '90,170,225'];
  var rays, sprites = [], dust = [];
  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, running = false, visible = true, raf = 0, last = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function sprite(rgb) {
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var g = c.getContext('2d'), grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(' + rgb + ',1)');
    grd.addColorStop(0.35, 'rgba(' + rgb + ',0.6)');
    grd.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32);
    return c;
  }

  function raysGradient(x, y) {
    var stops = [], a = 0;
    while (a < 360) {
      var w = rnd(1.4, 4), gap = rnd(4, 11), alpha = rnd(0.12, 0.34).toFixed(2);
      stops.push('rgba(200,230,255,0) ' + a.toFixed(1) + 'deg');
      stops.push('rgba(200,230,255,' + alpha + ') ' + (a + w / 2).toFixed(1) + 'deg');
      stops.push('rgba(200,230,255,0) ' + (a + w).toFixed(1) + 'deg');
      a += w + gap;
    }
    return 'conic-gradient(from 0deg at ' + x.toFixed(0) + 'px ' + y.toFixed(0) + 'px, ' + stops.join(', ') + ')';
  }

  function spawn(anywhere) {
    var ang = rnd(0, Math.PI * 2), rad = rnd(0.55, 1.5) * (logo.offsetWidth / 2);
    var life = rnd(12, 22);
    return {
      x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad,
      r: rnd(1.2, W < 640 ? 2.4 : 3.2), vx: rnd(-2, 2), vy: rnd(-5, -1.5),
      a: rnd(0.4, 0.85), ph: rnd(0, 6.28), sp: rnd(0.5, 1),
      c: sprites[(Math.random() * sprites.length) | 0], life: life, age: anywhere ? rnd(0, life) : 0
    };
  }

  function measure() {
    var hr = hero.getBoundingClientRect(), lr = logo.getBoundingClientRect();
    W = hr.width; H = hr.height;
    if (!W || !H) return;
    cx = lr.left - hr.left + lr.width / 2; cy = lr.top - hr.top + lr.height / 2;
    rays.style.backgroundImage = raysGradient(cx, cy);
    var m = 'radial-gradient(' + (W * 0.7).toFixed(0) + 'px ' + (H * 0.78).toFixed(0) + 'px at ' + cx.toFixed(0) + 'px ' + cy.toFixed(0) + 'px, #000 0%, rgba(0,0,0,.5) 35%, rgba(0,0,0,0) 72%)';
    rays.style.webkitMaskImage = m; rays.style.maskImage = m;
    rays.style.transformOrigin = cx.toFixed(0) + 'px ' + cy.toFixed(0) + 'px';
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    dust = []; for (var i = 0, n = W < 640 ? 16 : 30; i < n; i++) dust.push(spawn(true));
    draw(performance.now(), 0);
  }

  function draw(t, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      if (dt) {
        d.age += dt;
        d.x += (d.vx + Math.sin(t * 0.0003 * d.sp + d.ph) * 1.2) * dt; d.y += d.vy * dt;
        if (d.age >= d.life) dust[i] = d = spawn(false);
      }
      var life = reduce ? 1 : Math.sin(Math.PI * Math.min(1, d.age / d.life));
      var tw = reduce ? 1 : 0.8 + 0.2 * Math.sin(t * 0.0006 * d.sp + d.ph);
      ctx.globalAlpha = Math.min(1, d.a * tw * life);
      var s = d.r * 4; ctx.drawImage(d.c, d.x - s / 2, d.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
    draw(t, dt); raf = requestAnimationFrame(loop);
  }
  function start() { if (reduce || running || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  rays = document.createElement('div'); rays.className = 'hero-rays'; rays.setAttribute('aria-hidden', 'true');
  canvas.className = 'hero-dust'; canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(rays, hero.firstChild); hero.insertBefore(canvas, rays.nextSibling);
  COLORS.forEach(function (c) { sprites.push(sprite(c)); });
  hero.classList.add('light-on');
  measure(); start();

  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); else stop(); }).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(hero);
})();
