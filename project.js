/* Membaca PROJECTS & PROJECT_CATEGORIES dari projects-data.js.
   - index.html          : mengisi kartu di tiap .carousel-track[data-category]
   - project-detail.html : menampilkan detail project dari ?id=... */
(function () {
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var catName = function (slug) {
    var c = PROJECT_CATEGORIES.filter(function (x) { return x.slug === slug; })[0];
    return c ? c.name : slug;
  };
  var detailUrl = function (id) { return 'project-detail.html?id=' + encodeURIComponent(id); };

  /* ---------- 1. Kartu di halaman utama ---------- */
  document.querySelectorAll('.carousel-track[data-category]').forEach(function (track) {
    var slug = track.getAttribute('data-category');
    track.innerHTML = PROJECTS.filter(function (p) { return p.category === slug; }).map(function (p) {
      return '<a class="game-card" href="' + detailUrl(p.id) + '" draggable="false" aria-label="Lihat detail ' + esc(p.title) + '">' +
        '<div class="proj-thumb">' +
          '<span class="game-tag">' + esc(catName(p.category)) + '</span>' +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" class="game-img" draggable="false">' +
        '</div>' +
        '<div class="proj-body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.summary) + '</p></div>' +
      '</a>';
    }).join('');

    // Geser carousel dengan mouse jangan sampai ikut membuka project
    var downX = 0, moved = false;
    track.addEventListener('mousedown', function (e) { downX = e.clientX; moved = false; });
    track.addEventListener('mousemove', function (e) { if (e.buttons && Math.abs(e.clientX - downX) > 6) moved = true; });
    track.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); moved = false; }
    }, true);
  });

  /* ---------- 2. Halaman detail ---------- */
  var root = document.getElementById('projectDetail');
  if (!root) return;

  var id = new URLSearchParams(location.search).get('id');
  var idx = PROJECTS.findIndex(function (p) { return p.id === id; });

  if (idx === -1) {
    document.title = 'Project tidak ditemukan — Meraki Studio';
    root.innerHTML =
      '<div class="pd-missing wrap">' +
        '<h1>Project tidak ditemukan</h1>' +
        '<p>Link yang Anda buka tidak cocok dengan project mana pun. Coba pilih dari daftar Selected Works.</p>' +
        '<a class="pd-back" href="index.html#project">Kembali ke Selected Works</a>' +
      '</div>';
    return;
  }

  var p = PROJECTS[idx];
  document.title = p.title + ' — Meraki Studio';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', p.summary);

  var same = PROJECTS.filter(function (x) { return x.category === p.category; });
  var pos = same.indexOf(p);
  var prev = same[(pos - 1 + same.length) % same.length];
  var next = same[(pos + 1) % same.length];

  var facts = [['Client', p.client], ['Year', p.year], ['Role', p.role], ['Duration', p.duration]]
    .filter(function (f) { return f[1]; })
    .map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');

  var list = function (arr) { return arr.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''); };

  root.innerHTML =
    '<header class="pd-head wrap">' +
      '<a class="pd-back" href="index.html#project">Selected Works</a>' +
      '<p class="pd-cat">' + esc(catName(p.category)) + '</p>' +
      '<h1>' + esc(p.title) + '</h1>' +
      '<p class="pd-summary">' + esc(p.summary) + '</p>' +
      '<dl class="pd-facts">' + facts + '</dl>' +
    '</header>' +

    '<figure class="pd-cover wrap"><img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '"></figure>' +

    '<div class="pd-body wrap">' +
      '<section class="pd-story">' +
        '<h2>Overview</h2>' + (p.overview || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') +
        (p.highlights && p.highlights.length ? '<h2>Highlights</h2><ul class="pd-highlights">' + list(p.highlights) + '</ul>' : '') +
      '</section>' +
      '<aside class="pd-side">' +
        (p.tools && p.tools.length ? '<h2>Tools</h2><ul class="pd-tools">' + list(p.tools) + '</ul>' : '') +
        (p.credits && p.credits.length ? '<h2>Credits</h2><dl class="pd-credits">' +
          p.credits.map(function (c) { return '<div><dt>' + esc(c.role) + '</dt><dd>' + esc(c.name) + '</dd></div>'; }).join('') + '</dl>' : '') +
        (p.link && p.link.url ? '<a class="pd-ext" href="' + esc(p.link.url) + '" target="_blank" rel="noopener">' + esc(p.link.label || 'View project') + '</a>' : '') +
      '</aside>' +
    '</div>' +

    (p.gallery && p.gallery.length ?
      '<section class="pd-gallery wrap" aria-label="Galeri project">' +
        p.gallery.map(function (g) {
          return '<figure><img src="' + esc(g.src) + '" alt="' + esc(g.caption || p.title) + '" loading="lazy">' +
                 (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '') + '</figure>';
        }).join('') +
      '</section>' : '') +

    '<nav class="pd-pager wrap" aria-label="Project lain">' +
      '<a href="' + detailUrl(prev.id) + '"><span>Sebelumnya</span>' + esc(prev.title) + '</a>' +
      '<a href="index.html#project" class="pd-all">Semua project</a>' +
      '<a href="' + detailUrl(next.id) + '"><span>Berikutnya</span>' + esc(next.title) + '</a>' +
    '</nav>';
})();