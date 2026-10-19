(function () {
  'use strict';

  const U = {
    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    safeUrl(u) {
      if (!u) return '';
      try { const x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; }
    },
    date(d) {
      if (!d) return '';
      const x = new Date(d + 'T00:00:00');
      return isNaN(x) ? d : x.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    initials(n) {
      return String(n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },
    paragraphs(t) {
      return String(t || '').split(/\n{2,}/).map(p => '<p>' + U.esc(p).replace(/\n/g, '<br>') + '</p>').join('');
    }
  };

  async function load(name) {
    try {
      const r = await fetch('data/' + name + '.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) { return null; }
  }

  const sampleTag = i => (i.sample ? '<span class="sample">Contoh</span>' : '');
  const empty = msg => '<div class="empty-state">' + U.esc(msg) + '</div>';
  const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

  /* ---------- layout ---------- */
  const NAV = [
    ['index.html', 'Beranda', ''],
    ['pengumuman.html', 'Pengumuman', 'cat-red'],
    ['program.html', 'Program kerja', 'cat-yellow'],
    ['kegiatan.html', 'Kegiatan', 'cat-green'],
    ['pengurus.html', 'Pengurus', 'cat-sky']
  ];

  function layout(site) {
    const page = document.body.dataset.page;
    const h = document.getElementById('site-header');
    if (h) {
      h.className = 'site-header';
      h.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><img src="assets/logo.png" alt="" width="40" height="40"><span>' + U.esc(site.name) + '</span></a>' +
        '<button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>' +
        '<nav class="nav" id="nav" aria-label="Menu utama">' +
        NAV.map(n => '<a class="' + n[2] + '" href="' + n[0] + '"' + (n[0] === page + '.html' ? ' aria-current="page"' : '') + '>' + n[1] + '</a>').join('') +
        '</nav></div>';
      const btn = h.querySelector('.menu-btn'), nav = h.querySelector('.nav');
      btn.addEventListener('click', () => { const o = nav.classList.toggle('is-open'); btn.setAttribute('aria-expanded', o); });
    }
    const f = document.getElementById('site-footer');
    if (f) {
      f.className = 'site-footer';
      const links = [['Situs ' + site.school, site.schoolUrl], ['YouTube', site.youtube], ['Instagram', site.instagram], ['TikTok', site.tiktok]]
        .filter(l => U.safeUrl(l[1])).map(l => '<li><a href="' + U.esc(U.safeUrl(l[1])) + '" target="_blank" rel="noopener">' + U.esc(l[0]) + '</a></li>').join('');
      f.innerHTML = '<div class="wrap"><div><strong>' + U.esc(site.name) + '</strong><p>' + U.esc(site.school) + '</p><p>' + U.esc(site.address) + '</p></div>' +
        '<ul>' + links + '</ul><p class="legal">Situs resmi OSIS ' + U.esc(site.school) + '. Dikelola oleh pengurus OSIS.</p></div>';
    }
  }

  /* ---------- renderers ---------- */
  function annHtml(a) {
    return '<li class="ann"><time datetime="' + U.esc(a.date) + '">' + U.esc(U.date(a.date)) + '</time><div>' +
      (a.pinned ? '<span class="chip pin cat-red">Disematkan</span>' : '') +
      '<h3><a href="pengumuman.html?s=' + encodeURIComponent(a.slug) + '">' + U.esc(a.title) + '</a>' + sampleTag(a) + '</h3>' +
      '<p>' + U.esc(a.summary) + '</p></div></li>';
  }
  const sortAnn = (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || byDateDesc(a, b);

  const STATUS = { rencana: 'Rencana', berjalan: 'Berjalan', selesai: 'Selesai' };
  function progHtml(p) {
    return '<article class="prog"><span class="status ' + U.esc(p.status) + '">' + U.esc(STATUS[p.status] || p.status) + '</span>' +
      '<h3>' + U.esc(p.title) + sampleTag(p) + '</h3><p>' + U.esc(p.summary) + '</p>' +
      '<div class="meta">' + U.esc(p.division || '') + '</div></article>';
  }

  function kegHtml(k) {
    const img = U.safeUrl(k.cover);
    return '<a class="keg" href="kegiatan.html?s=' + encodeURIComponent(k.slug) + '"><div class="cover">' +
      (img ? '<img src="' + U.esc(img) + '" alt="" loading="lazy">' : '<img class="ph" src="assets/logo.png" alt="">') + '</div>' +
      '<div class="body"><time datetime="' + U.esc(k.date) + '">' + U.esc(U.date(k.date)) + (k.place ? ' · ' + U.esc(k.place) : '') + '</time>' +
      '<h3>' + U.esc(k.title) + sampleTag(k) + '</h3><p>' + U.esc(k.summary) + '</p></div></a>';
  }

  function periodChips(items, container, onChange) {
    const periods = [...new Set(items.map(i => i.period).filter(Boolean))].sort().reverse();
    if (periods.length < 2) { onChange(periods[0] || null); return; }
    container.innerHTML = periods.map((p, i) => '<button type="button" aria-pressed="' + (i === 0) + '" data-p="' + U.esc(p) + '">Periode ' + U.esc(p) + '</button>').join('');
    container.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      container.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      onChange(b.dataset.p);
    });
    onChange(periods[0]);
  }

  async function home(site) {
    const [ann, prog, keg] = await Promise.all([load('pengumuman'), load('program'), load('kegiatan')]);
    const a = (ann || []).filter(x => x.published).sort(sortAnn).slice(0, 3);
    document.getElementById('home-ann').innerHTML = a.length ? a.map(annHtml).join('') : '<li>' + empty('Belum ada pengumuman.') + '</li>';
    const p = (prog || []).filter(x => x.status !== 'selesai').slice(0, 4);
    document.getElementById('home-prog').innerHTML = p.length ? p.map(progHtml).join('') : empty('Program kerja akan segera ditambahkan.');
    const k = (keg || []).filter(x => x.published).sort(byDateDesc).slice(0, 3);
    document.getElementById('home-keg').innerHTML = k.length ? k.map(kegHtml).join('') : empty('Kegiatan akan segera ditambahkan.');
    document.getElementById('home-period').textContent = site.period;
  }

  async function announcements() {
    const all = ((await load('pengumuman')) || []).filter(x => x.published);
    const s = new URLSearchParams(location.search).get('s');
    const root = document.getElementById('content');
    if (s) {
      const a = all.find(x => x.slug === s);
      if (a) {
        document.title = a.title + ' – OSIS Lemanco';
        document.getElementById('list-view').hidden = true;
        root.innerHTML = '<div class="wrap article cat-red"><span class="chip">Pengumuman</span><h1>' + U.esc(a.title) + sampleTag(a) + '</h1><time datetime="' + U.esc(a.date) + '">' + U.esc(U.date(a.date)) + '</time><div class="text">' + U.paragraphs(a.body) + '</div><a class="back" href="pengumuman.html">Kembali ke semua pengumuman</a></div>';
        return;
      }
      root.innerHTML = '<div class="wrap article">' + empty('Pengumuman tidak ditemukan.') + '<a class="back" href="pengumuman.html">Lihat semua pengumuman</a></div>';
      document.getElementById('list-view').hidden = true;
      return;
    }
    const list = document.getElementById('list');
    const filters = document.getElementById('filters');
    periodChips(all, filters, p => {
      const items = all.filter(x => !p || x.period === p).sort(sortAnn);
      list.innerHTML = items.length ? items.map(annHtml).join('') : '<li>' + empty('Belum ada pengumuman.') + '</li>';
    });
  }

  async function programs() {
    const all = (await load('program')) || [];
    const grid = document.getElementById('grid');
    periodChips(all, document.getElementById('filters'), p => {
      const items = all.filter(x => !p || x.period === p);
      grid.innerHTML = items.length ? items.map(progHtml).join('') : empty('Program kerja belum ditambahkan.');
    });
  }

  async function kegiatan() {
    const all = ((await load('kegiatan')) || []).filter(x => x.published).sort(byDateDesc);
    const s = new URLSearchParams(location.search).get('s');
    const root = document.getElementById('content');
    if (s) {
      const k = all.find(x => x.slug === s);
      document.getElementById('list-view').hidden = true;
      if (!k) { root.innerHTML = '<div class="wrap article">' + empty('Kegiatan tidak ditemukan.') + '<a class="back" href="kegiatan.html">Lihat semua kegiatan</a></div>'; return; }
      document.title = k.title + ' – OSIS Lemanco';
      const img = U.safeUrl(k.cover);
      root.innerHTML = '<div class="wrap article cat-green"><span class="chip">Kegiatan</span><h1>' + U.esc(k.title) + sampleTag(k) + '</h1><time datetime="' + U.esc(k.date) + '">' + U.esc(U.date(k.date)) + (k.place ? ' · ' + U.esc(k.place) : '') + '</time>' +
        (img ? '<img src="' + U.esc(img) + '" alt="" style="margin-top:1rem;border-radius:16px">' : '') +
        '<div class="text">' + U.paragraphs(k.body || k.summary) + '</div><a class="back" href="kegiatan.html">Kembali ke semua kegiatan</a></div>';
      return;
    }
    const grid = document.getElementById('grid');
    periodChips(all, document.getElementById('filters'), p => {
      const items = all.filter(x => !p || x.period === p);
      grid.innerHTML = items.length ? items.map(kegHtml).join('') : empty('Kegiatan belum ditambahkan.');
    });
  }

  async function pengurus() {
    const all = ((await load('pengurus')) || []).slice().sort((a, b) => String(b.period).localeCompare(String(a.period)));
    const root = document.getElementById('groups');
    const render = per => {
      if (!per) { root.innerHTML = empty('Data pengurus belum ditambahkan.'); return; }
      const groups = [];
      per.members.forEach(m => { let g = groups.find(x => x.name === m.group); if (!g) groups.push(g = { name: m.group, items: [] }); g.items.push(m); });
      root.innerHTML = groups.map(g => '<section class="group"><h2>' + U.esc(g.name) + '</h2><div class="people">' +
        g.items.map(m => {
          const img = U.safeUrl(m.photo);
          return '<div class="person"><div class="avatar">' + (img ? '<img src="' + U.esc(img) + '" alt="" loading="lazy">' : U.esc(U.initials(m.name) || '?')) + '</div><div>' +
            (m.name ? '<strong>' + U.esc(m.name) + '</strong>' : '<strong class="empty">Nama menyusul</strong>') + '<span>' + U.esc(m.role) + '</span></div></div>';
        }).join('') + '</div></section>').join('');
    };
    const filters = document.getElementById('filters');
    if (all.length > 1) {
      filters.innerHTML = all.map((p, i) => '<button type="button" aria-pressed="' + (i === 0) + '" data-p="' + U.esc(p.period) + '">Periode ' + U.esc(p.period) + '</button>').join('');
      filters.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
        render(all.find(p => p.period === b.dataset.p));
      });
    }
    render(all[0]);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const site = (await load('site')) || { name: 'OSIS Lemanco', school: 'SMA Negeri 2 Tarakan', period: '', address: '' };
    layout(site);
    const page = document.body.dataset.page;
    const fn = { index: home, pengumuman: announcements, program: programs, kegiatan: kegiatan, pengurus: pengurus }[page];
    if (fn) fn(site);
  });
})();
