(function () {
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* ---------- notebook index: mark the chapter in view ---------- */
  var tabLinks = $$('.tabs a');
  var seen = {};
  function setCurrent(id) {
    tabLinks.forEach(function (a) {
      var on = a.getAttribute('data-tab') === id;
      a.classList.toggle('is-current', on);
      if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        var id = e.target.getAttribute('data-chapter');
        setCurrent(id);
        if (id === 'tiga-meja') { $('#back-amplop').hidden = !!seen.amplop; }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-chapter]').forEach(function (el) { io.observe(el); });
  }
  setCurrent('sampul');

  /* ---------- amplop Ibu ---------- */
  var envs = $$('.env');
  function openEnv(key, byUser) {
    if (byUser) { seen.amplop = true; }
    envs.forEach(function (b) { b.setAttribute('aria-expanded', String(b.getAttribute('data-env') === key)); });
    $$('.slip__item').forEach(function (s) { s.classList.toggle('is-open', s.getAttribute('data-slip') === key); });
  }
  envs.forEach(function (b, i) {
    b.addEventListener('click', function () { openEnv(b.getAttribute('data-env'), true); });
    b.addEventListener('keydown', function (e) {
      var to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (to < 0 || to >= envs.length) { return; }
      e.preventDefault(); envs[to].focus(); openEnv(envs[to].getAttribute('data-env'), true);
    });
  });
  openEnv('sekolah');

  /* ---------- mejamu ---------- */
  var seatNames = { kamu: 'kamu', pasangan: 'pasangan', balita: 'anak kecil', sekolah: 'anak sekolah atau kuliah', ortu: 'orang tua', usaha: 'usaha sendiri' };
  var boxes = $$('.chips input');
  var sum = $('#note-sum');
  var savedTable = null;
  function chosen() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.getAttribute('data-seat'); }); }
  function renderTable(changed) {
    var on = chosen();
    $$('.seat').forEach(function (s) { s.classList.toggle('is-on', on.indexOf(s.getAttribute('data-chair')) > -1); });
    $$('#notes li').forEach(function (li) {
      var key = li.getAttribute('data-note');
      var show = on.indexOf(key) > -1;
      li.hidden = !show;
      li.classList.toggle('is-new', show && key === changed);
    });
    sum.textContent = on.length === 1
      ? 'Meja untuk satu orang memang paling sederhana, dan justru karena itu paling sering ditunda.'
      : on.length <= 3
        ? 'Mejamu mulai ramai. Biasanya di tahap inilah orang mulai bertanya-tanya apakah persiapannya sudah cukup.'
        : 'Mejamu cukup ramai, jadi kita bahas pelan-pelan, satu orang dulu baru yang berikutnya.';
    $('#save-status').textContent = '';
  }
  boxes.forEach(function (b) { b.addEventListener('change', function () { renderTable(b.getAttribute('data-seat')); }); });
  renderTable();

  function joinId(list) {
    if (list.length === 1) { return list[0]; }
    return list.slice(0, -1).join(', ') + ' dan ' + list[list.length - 1];
  }
  var pesan = $('#pesan');
  var nama = $('#nama');
  var touched = false;
  pesan.addEventListener('input', function () { touched = true; });
  function composeMsg() {
    if (touched) { return; }
    var n = nama.value.trim();
    var msg = 'Halo Nara, ' + (n ? 'saya ' + n + '. Saya' : 'saya') + ' mau ngobrol dulu soal keuangan keluarga.';
    if (savedTable) {
      var others = savedTable.filter(function (k) { return k !== 'kamu'; }).map(function (k) { return seatNames[k]; });
      msg += others.length
        ? ' Yang duduk di meja saya: saya, ' + joinId(others) + '.'
        : ' Untuk sekarang, saya masih sendiri di meja ini.';
      var qs = $$('#notes li').filter(function (li) { return !li.hidden; }).map(function (li) { return '- ' + li.textContent; });
      msg += '\n\nPertanyaan yang Nara catat untuk meja saya:\n' + qs.join('\n');
    }
    pesan.value = msg;
  }
  nama.addEventListener('input', composeMsg);

  $('#save-table').addEventListener('click', function () {
    savedTable = chosen();
    var others = savedTable.filter(function (k) { return k !== 'kamu'; }).map(function (k) { return seatNames[k]; });
    var line = $('#saved-line');
    line.textContent = 'Mejamu sudah saya catat: kamu' + (others.length ? ', ' + joinId(others) : ' sendiri') + '.';
    line.hidden = false;
    touched = false; composeMsg();
    $('#save-status').innerHTML = 'Sudah saya simpan. Catatan ini akan ikut masuk ke <a href="#kursi">pesan di bagian terakhir</a>.';
  });

  /* ---------- tiga meja (tabs) ---------- */
  var ctabs = $$('.ctab');
  function selectCase(tab, focus) {
    ctabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) { tab.focus(); }
  }
  ctabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectCase(t); });
    t.addEventListener('keydown', function (e) {
      var to = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { to = (i + 1) % ctabs.length; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { to = (i - 1 + ctabs.length) % ctabs.length; }
      if (e.key === 'Home') { to = 0; }
      if (e.key === 'End') { to = ctabs.length - 1; }
      if (to > -1) { e.preventDefault(); selectCase(ctabs[to], true); }
    });
  });
  selectCase(ctabs[0]);

  /* ---------- ngobrol: simulated message ---------- */
  $('#compose').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = pesan.value.trim() || 'Halo Nara, saya mau ngobrol dulu soal keuangan keluarga.';
    $('#preview-text').textContent = text;
    $('#preview').hidden = false;
    $('#copy-status').textContent = '';
    $('#copy').focus();
  });
  $('#copy').addEventListener('click', function () {
    var text = $('#preview-text').textContent;
    var status = $('#copy-status');
    function manual() { pesan.focus(); pesan.select(); status.textContent = 'Tombol salin tidak bisa dipakai di sini. Silakan blok teksnya, lalu salin sendiri.'; }
    try {
      navigator.clipboard.writeText(text).then(function () {
        status.textContent = 'Pesan sudah disalin. Tidak ada yang terkirim.';
      }, manual);
    } catch (err) { manual(); }
  });
})();
