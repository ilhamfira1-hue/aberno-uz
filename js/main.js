/* Aberno Group — umumiy skriptlar */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var burger = document.querySelector('.burger');

  /* ---------- Faol menyu bandi ---------- */
  var file = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
  var productPages = ['products.html', 'margaritto.html', 'smaylo.html', 'bulut.html'];

  document.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === file) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    } else if (href === 'products.html' && productPages.indexOf(file) !== -1) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Header soyasi ---------- */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobil menyu ---------- */
  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    document.body.classList.toggle('nav-open', open);
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
  }

  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setNav(false);
      closeDrops();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) setNav(false);
  });

  /* ---------- Mahsulotlar ochiladigan menyusi ---------- */
  var drops = document.querySelectorAll('.nav__item--drop');

  function closeDrops(except) {
    drops.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var btn = item.querySelector('.nav__drop-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  drops.forEach(function (item) {
    var btn = item.querySelector('.nav__drop-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !item.classList.contains('is-open');
      closeDrops(item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item--drop')) closeDrops();
  });

  /* ---------- Paydo bo'lish animatsiyasi ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Raqamlar hisoblagichi ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || isNaN(target)) return;
    var start = target > 1000 ? target - 30 : 0;
    var duration = 1400;
    var t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Joriy yil ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Aloqa formasi ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var success = document.getElementById('form-success');

    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 9; },
      message: function (v) { return v.trim().length >= 10; }
    };

    function validateField(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var ok = rule(input.value);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    }

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field && field.classList.contains('is-invalid')) validateField(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (input && !validateField(input)) {
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!valid) {
        firstInvalid.focus();
        return;
      }

      /*
       * Bu yerda forma ma'lumotlari serverga yuboriladi.
       * Masalan: fetch('/api/contact', { method: 'POST', body: new FormData(form) })
       * Hozircha backend yo'q — foydalanuvchiga tasdiq xabari ko'rsatiladi.
       */
      form.reset();
      if (success) {
        success.classList.add('is-visible');
        success.focus();
      }
    });
  }
})();
