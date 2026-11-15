/* Nara Putri, Essential demo. Progressive enhancement only: the page reads fine without this file. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Page-load moment: the hero note draws in once, ~600ms after load. */
  var heroNote = document.getElementById('hero-note');
  if (heroNote) {
    if (reduceMotion) {
      heroNote.classList.add('is-drawn');
    } else {
      var draw = function () { setTimeout(function () { heroNote.classList.add('is-drawn'); }, 600); };
      if (document.readyState === 'complete') draw(); else window.addEventListener('load', draw, { once: true });
    }
  }

  /* Interaction 1: the table still life. */
  var meja = document.getElementById('meja');
  if (meja) {
    var markerGroup = meja.querySelector('.markers');
    var listGroup = meja.querySelector('.meja__list');
    var notes = Array.prototype.slice.call(meja.querySelectorAll('.tnote'));
    var groups = [markerGroup, listGroup];
    var current = 0;

    markerGroup.hidden = false;
    listGroup.hidden = false;

    var buttonsIn = function (group) {
      return Array.prototype.slice.call(group.querySelectorAll('button[data-item]'));
    };

    var select = function (index) {
      current = index;
      groups.forEach(function (group) {
        buttonsIn(group).forEach(function (btn) {
          var on = Number(btn.getAttribute('data-item')) === index;
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          btn.tabIndex = on ? 0 : -1;
        });
      });
      notes.forEach(function (note) {
        note.hidden = Number(note.getAttribute('data-item')) !== index;
      });
    };

    groups.forEach(function (group) {
      group.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-item]');
        if (btn) select(Number(btn.getAttribute('data-item')));
      });
      group.addEventListener('keydown', function (e) {
        var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'first', End: 'last' };
        if (!(e.key in keys)) return;
        e.preventDefault();
        var count = notes.length;
        var step = keys[e.key];
        var next = step === 'first' ? 0 : step === 'last' ? count - 1 : (current + step + count) % count;
        select(next);
        var target = group.querySelector('button[data-item="' + next + '"]');
        if (target) target.focus();
      });
    });

    select(0);
  }

  /* Interaction 2: three questions, Nara answers in the margin. */
  var form = document.getElementById('tanya-form');
  var answers = ['', '', ''];
  var answerLabels = [
    'Yang makan dari penghasilan saya',
    'Waktu gajian, uangnya mampir dulu ke',
    'Amplop Jaga-jaga di rumah'
  ];

  if (form) {
    var fieldsets = Array.prototype.slice.call(form.querySelectorAll('.q'));
    var end = form.querySelector('.tanya__end');
    var hint = document.getElementById('tanya-hint');
    var done = document.getElementById('tanya-done');
    end.hidden = false;

    var refresh = function () {
      fieldsets.forEach(function (fs, i) {
        fs.classList.toggle('is-quiet', i > 0 && !answers[i - 1] && !answers[i]);
      });
      var all = answers.every(Boolean);
      hint.hidden = all;
      done.hidden = !all;
    };

    fieldsets.forEach(function (fs, i) {
      fs.addEventListener('change', function (e) {
        var input = e.target;
        if (!input || input.type !== 'radio') return;
        answers[i] = input.value;
        var reply = fs.querySelector('.reply');
        reply.textContent = input.getAttribute('data-reply');
        reply.classList.remove('is-new');
        void reply.offsetWidth;
        reply.classList.add('is-new');
        refresh();
      });
    });

    form.addEventListener('submit', function (e) { e.preventDefault(); });
    refresh();
  }

  /* Contact simulation. */
  var contact = document.getElementById('contact');
  if (contact) {
    var nama = document.getElementById('f-nama');
    var topik = document.getElementById('f-topik');
    var pesan = document.getElementById('f-pesan');
    var preview = document.getElementById('preview');
    var edited = false;
    var includeAnswers = false;

    var topicPhrase = {
      'Belum tahu, mau ngobrol dulu': 'keuangan keluarga',
      'Kalau ada yang sakit': 'persiapan kalau ada yang sakit',
      'Penghasilan keluarga': 'penghasilan keluarga',
      'Sekolah anak': 'biaya sekolah anak',
      'Dana darurat': 'dana darurat'
    };

    var compose = function () {
      var name = nama.value.trim();
      var phrase = topicPhrase[topik.value] || 'keuangan keluarga';
      var text = name
        ? 'Halo Nara, saya ' + name + '. Saya mau ngobrol dulu soal ' + phrase + '.'
        : 'Halo Nara, saya mau ngobrol dulu soal ' + phrase + '.';
      if (includeAnswers && answers.every(Boolean)) {
        text += '\n\nJawaban saya tadi:';
        answers.forEach(function (a, i) { text += '\n' + answerLabels[i] + ': ' + a.toLowerCase() + '.'; });
      }
      return text;
    };

    var recompose = function () { if (!edited) pesan.value = compose(); };
    nama.addEventListener('input', recompose);
    topik.addEventListener('change', recompose);
    pesan.addEventListener('input', function () { edited = pesan.value.trim() !== ''; });

    var bawa = document.getElementById('bawa');
    if (bawa) {
      bawa.addEventListener('click', function () {
        includeAnswers = true;
        edited = false;
        pesan.value = compose();
        var section = document.getElementById('ngobrol');
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        pesan.focus({ preventScroll: true });
      });
    }

    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = pesan.value.trim() || compose();
      preview.textContent = '';

      var label = document.createElement('p');
      label.className = 'preview__label';
      label.textContent = 'Pratinjau pesan. Belum terkirim ke mana pun.';

      var bubble = document.createElement('p');
      bubble.className = 'bubble';
      bubble.tabIndex = -1;
      bubble.textContent = text;

      var row = document.createElement('div');
      row.className = 'preview__row';
      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn';
      copyBtn.textContent = 'Salin pesan';
      var status = document.createElement('p');
      status.className = 'copy-status';
      status.setAttribute('role', 'status');
      row.appendChild(copyBtn);
      row.appendChild(status);

      preview.appendChild(label);
      preview.appendChild(bubble);
      preview.appendChild(row);
      bubble.focus({ preventScroll: true });
      bubble.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });

      var resetTimer;
      var manual = function () {
        try {
          var range = document.createRange();
          range.selectNodeContents(bubble);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (err) { /* selection unavailable */ }
        status.textContent = 'Pilih lalu salin teksnya secara manual.';
      };

      copyBtn.addEventListener('click', function () {
        status.textContent = '';
        try {
          if (!navigator.clipboard || !navigator.clipboard.writeText) { manual(); return; }
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Pesan disalin';
            status.textContent = 'Pesan disalin. Tidak ada yang terkirim.';
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function () { copyBtn.textContent = 'Salin pesan'; }, 3000);
          }, manual);
        } catch (err) {
          manual();
        }
      });
    });
  }
})();
