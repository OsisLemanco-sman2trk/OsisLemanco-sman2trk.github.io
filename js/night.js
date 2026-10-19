/*
  Perjalanan waktu halaman, diadaptasi dari situs Rohis: pagi di atas, senja di tengah,
  malam di footer. Logo OSIS menjadi "bulan" yang terbit di langit malam.
  Hanya CSS variable yang diubah saat scroll (opacity/transform), tanpa mengubah konten.
  Tanpa JS: langit malam tampil statis. prefers-reduced-motion: tanpa gerak, malam penuh.
*/
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ['morning', 'evening'].forEach(function (n) {
    var d = document.createElement('div');
    d.className = 'journey-tint journey-' + n; d.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(d, document.body.firstChild);
  });
  root.classList.add('journey-on');

  var scene = null;
  function initScene() {
    scene = document.querySelector('.night');
    if (!scene) return;
    {
    var stars = scene.querySelector('.stars');
    if (stars) {
      var n = window.innerWidth < 640 ? 38 : 70, html = '';
      for (var i = 0; i < n; i++) {
        var s = (Math.random() * 2 + 1).toFixed(1);
        html += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (22 + Math.random() * 62).toFixed(1) + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:-' + (Math.random() * 6).toFixed(1) + 's;animation-duration:' + (3 + Math.random() * 4).toFixed(1) + 's"></i>';
      }
      stars.innerHTML = html;
    }
    }
    update();
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, max = Math.max(1, root.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty('--journey', p.toFixed(3));
    if (scene) {
      var r = scene.getBoundingClientRect();
      var night = reduce ? 1 : Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.25)));
      root.style.setProperty('--night', night.toFixed(3));
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  document.addEventListener('osis:layout', initScene);
  initScene();
  update();
})();
