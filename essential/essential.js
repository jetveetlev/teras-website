/* Nara Putri, Essential demo. Progressive enhancement only: the page reads fine without this file. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slice = function (list) { return Array.prototype.slice.call(list); };

  /* Page-load moment: the hero note draws in once, about 600ms after load. */
  var heroNote = document.getElementById('hero-note');
  if (heroNote) {
    if (reduceMotion) {
      heroNote.classList.add('is-drawn');
    } else {
      var draw = function () { setTimeout(function () { heroNote.classList.add('is-drawn'); }, 600); };
      if (document.readyState === 'complete') draw(); else window.addEventListener('load', draw, { once: true });
    }
  }

  /* The four envelopes, keyed by the block ids in #kerja. Titles match the form topics. */
  var envelopes = {
    sakit: 'Kalau ada yang sakit',
    penghasilan: 'Kalau penghasilan berhenti',
    sekolah: 'Sekolah anak',
    darurat: 'Dana darurat'
  };

  /* First match wins (05-essential-v2, Tanya). */
  var firstEnvelope = function (a) {
    if (a[2] === 'Belum ada' || a[2] === 'Ada, tapi tipis') return 'darurat';
    if (a[2] === 'Ada asuransi dari kantor') return 'sakit';
    if (a[0] === 'Ada anak') return 'sekolah';
    if (a[0] === 'Saya dan pasangan' || a[0] === 'Ada orang tua juga') return 'penghasilan';
    return 'sakit';
  };

  /* Three questions, Nara answers under each. */
  var form = document.getElementById('tanya-form');
  var answers = ['', '', ''];
  var answerLabels = [
    'Yang hidup dari penghasilan saya',
    'Waktu gajian, uang saya mampir dulu ke',
    'Amplop Jaga-jaga di rumah saya'
  ];

  if (form) {
    var fieldsets = slice(form.querySelectorAll('.q'));
    var end = form.querySelector('.tanya__end');
    var hint = document.getElementById('tanya-hint');
    var doneLine = document.getElementById('tanya-doneline');
    var result = document.getElementById('tanya-result');
    var bawa = document.getElementById('bawa');
    var shownKey = '';
    end.hidden = false;

    /* Reserve room for the longest reply of each question at the current width,
       so answering never pushes the next question down. */
    var reserve = function () {
      fieldsets.forEach(function (fs) {
        var reply = fs.querySelector('.reply');
        var probe = reply.cloneNode(false);
        probe.removeAttribute('aria-live');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;min-height:0;width:' + reply.clientWidth + 'px';
        fs.appendChild(probe);
        var tallest = 0;
        slice(fs.querySelectorAll('input[data-reply]')).forEach(function (input) {
          probe.textContent = input.getAttribute('data-reply');
          tallest = Math.max(tallest, probe.offsetHeight);
        });
        fs.removeChild(probe);
        reply.style.minHeight = Math.ceil(window.innerWidth < 700 ? Math.min(tallest, 72) : tallest) + 'px';
      });
    };
    reserve();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
    var resizeTimer;
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reserve, 120);
    });

    var refresh = function () {
      fieldsets.forEach(function (fs, i) {
        fs.classList.toggle('is-quiet', i > 0 && !answers[i - 1] && !answers[i]);
      });
      var all = answers.every(Boolean);
      hint.hidden = all;
      doneLine.hidden = !all;
      bawa.hidden = !all;
      if (!all) { result.textContent = ''; shownKey = ''; return; }
      var key = firstEnvelope(answers);
      if (key === shownKey) return;
      shownKey = key;
      result.textContent = '';
      result.appendChild(document.createTextNode('Dari jawabanmu, amplop yang mungkin kita buka lebih dulu: '));
      var link = document.createElement('a');
      link.href = '#amplop-' + key;
      link.textContent = envelopes[key];
      result.appendChild(link);
      result.appendChild(document.createTextNode('.'));
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
      'Kalau ada yang sakit': 'persiapan biaya kalau ada yang sakit',
      'Kalau penghasilan berhenti': 'persiapan kalau penghasilan keluarga berhenti',
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

    var bawaBtn = document.getElementById('bawa');
    if (bawaBtn) {
      bawaBtn.addEventListener('click', function () {
        if (!answers.every(Boolean)) return;
        includeAnswers = true;
        edited = false;
        topik.value = envelopes[firstEnvelope(answers)];
        pesan.value = compose();
        pesan.style.height = 'auto';
        pesan.style.height = (pesan.scrollHeight + 4) + 'px';
        contact.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        pesan.focus({ preventScroll: true });
      });
    }

    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = pesan.value.trim() || compose();
      preview.textContent = '';

      var label = document.createElement('p');
      label.className = 'preview__label';
      label.textContent = 'Begini pesanmu nanti. Belum ada yang terkirim.';

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
        status.textContent = 'Tombol salin tidak bisa dipakai di sini. Silakan blok teksnya, lalu salin sendiri.';
      };

      copyBtn.addEventListener('click', function () {
        status.textContent = '';
        try {
          if (!navigator.clipboard || !navigator.clipboard.writeText) { manual(); return; }
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Pesan disalin';
            status.textContent = 'Pesan sudah disalin. Tidak ada yang terkirim.';
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
