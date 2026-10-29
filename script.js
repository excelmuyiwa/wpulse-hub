/* WPulse Player Hub - script.js
   Progressive enhancement only: the page works fully without this file.
   No libraries, no network requests, no storage or cookies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- 1. Next duel countdown ---------- */
  function setupCountdown() {
    var card = doc.querySelector('.next-duel[data-start]');
    if (!card) return;
    var start = new Date(card.getAttribute('data-start')).getTime();
    if (isNaN(start)) return;

    // Visitor's local time next to the WAT time (skipped when they are already on UTC+1).
    try {
      var when = new Date(start);
      var tz = card.querySelector('.duel-tz');
      if (tz && when.getTimezoneOffset() !== -60) {
        var fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
        var local = doc.createElement('span');
        local.className = 'duel-local';
        local.textContent = 'Your local time: ' + fmt.format(when);
        tz.parentNode.appendChild(local);
      }
    } catch (e) { /* no local time line */ }

    var line = doc.createElement('p');
    line.className = 'countdown';
    var timer = null;

    function text(ms) {
      var mins = Math.floor(ms / 60000);
      var d = Math.floor(mins / 1440);
      var h = Math.floor((mins % 1440) / 60);
      var m = mins % 60;
      if (d > 0) return 'Starts in ' + d + 'd ' + h + 'h ' + m + 'm';
      if (h > 0) return 'Starts in ' + h + 'h ' + m + 'm';
      if (m > 0) return 'Starts in ' + m + 'm';
      return 'Starts in less than 1m';
    }

    function tick() {
      var left = start - Date.now();
      if (left <= 0) {
        if (timer) clearInterval(timer);
        if (line.parentNode) line.parentNode.removeChild(line);
        return;
      }
      line.textContent = text(left);
    }

    if (start - Date.now() <= 0) return;
    var anchor = card.querySelector('.duel-details');
    card.insertBefore(line, anchor || null);
    tick();
    timer = setInterval(tick, 60000);
  }

  /* ---------- 2. Copy buttons in Contact ---------- */
  function setupCopy() {
    if (!(navigator.clipboard && typeof navigator.clipboard.writeText === 'function')) return;
    var cards = doc.querySelectorAll('.contact-cards .contact-card');
    var labels = { Email: 'Copy email address', Discord: 'Copy Discord username' };

    Array.prototype.forEach.call(cards, function (card) {
      var nameEl = card.querySelector('.cc-name');
      var handleEl = card.querySelector('.cc-handle');
      if (!nameEl || !handleEl) return;
      var name = nameEl.textContent.trim();
      if (!labels[name]) return;
      var value = handleEl.textContent.trim();

      var wrap = doc.createElement('div');
      wrap.className = 'contact-item has-copy';
      card.parentNode.insertBefore(wrap, card);
      wrap.appendChild(card);

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', labels[name]);
      btn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-copy"/></svg>';

      var msg = doc.createElement('span');
      msg.className = 'copy-msg';
      msg.setAttribute('role', 'status');
      msg.setAttribute('aria-live', 'polite');

      var hideTimer = null;
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(value).then(function () {
          msg.textContent = 'Copied';
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(function () { msg.textContent = ''; }, 1600);
        }, function () { /* copy refused: stay silent */ });
      });

      wrap.appendChild(msg);
      wrap.appendChild(btn);
    });
  }

  /* ---------- 3. Scroll reveal ---------- */
  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var sel = '.section-head, .box, .card, .step, .point, .callout, .note, .faq details, .contact-cards > *, .shot-ph, img.shot, .apply-grid li, .theme-tabs';
    var all = Array.prototype.slice.call(doc.querySelectorAll('main ' + sel.split(', ').join(', main ') + ', footer .contact-cards > *'));
    // Skip nested targets so a parent and its child never animate separately.
    var els = all.filter(function (el, i) {
      return all.indexOf(el) === i && !(el.parentElement && el.parentElement.closest(sel));
    });
    if (!els.length) return;

    try {
      var io = new IntersectionObserver(function (entries) {
        var i = 0;
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          io.unobserve(el);
          var delay = Math.min(i++ * 70, 280);
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-in');
          setTimeout(function () {
            el.classList.remove('reveal', 'is-in');
            el.style.transitionDelay = '';
          }, 700 + delay);
        });
      }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

      root.classList.add('js');
      els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
    } catch (e) {
      root.classList.remove('js');
      els.forEach(function (el) { el.classList.remove('reveal', 'is-in'); });
    }
  }

  /* ---------- 4. Nav scroll-spy ---------- */
  function setupSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(doc.querySelectorAll('.nav a[href^="#"], .toc a[href^="#"]'));
    var byId = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id && doc.getElementById(id)) (byId[id] = byId[id] || []).push(a);
    });
    var current = null;

    // Bring the active link into view inside the horizontally scrolling menu only.
    // This scrolls the menu container itself and never the page (no scrollIntoView, no focus).
    function revealInNav(link) {
      var nav = link.closest('.nav');
      if (!nav || nav.scrollWidth <= nav.clientWidth) return;
      var nr = nav.getBoundingClientRect();
      var lr = link.getBoundingClientRect();
      var scale = nav.offsetWidth ? nr.width / nav.offsetWidth : 1; // copes with CSS zoom
      if (!scale) scale = 1;
      var left = (lr.left - nr.left) / scale;
      var width = link.offsetWidth;
      if (left >= 0 && left + width <= nav.clientWidth) return; // already fully visible
      var target = nav.scrollLeft + left - (nav.clientWidth - width) / 2;
      nav.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function setActive(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) {
        var on = !!id && !!byId[id] && byId[id].indexOf(a) > -1;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          revealInNav(a);
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }

    // Track which section(s) cross a thin band near the top-middle of the screen, plus whether the
    // footer is mostly visible, and derive the active link from that. No scroll listeners, and
    // nothing here ever scrolls the page.
    var sections = Array.prototype.slice.call(doc.querySelectorAll('main > section'));
    var inBand = {};
    var footVisible = false;
    function keyOf(s) { return s.id || 'hero'; }

    function update() {
      if (footVisible) { setActive('contact'); return; }
      var pick = null;
      sections.forEach(function (s) {
        if (inBand[keyOf(s)]) pick = s.classList.contains('hero') ? null : s.id;
      });
      setActive(pick);
    }

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var k = keyOf(en.target);
        if (en.isIntersecting) inBand[k] = true; else delete inBand[k];
      });
      update();
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });

    var foot = doc.getElementById('contact');
    if (foot && byId.contact) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { footVisible = en.isIntersecting; });
        update();
      }, { threshold: 0.6 }).observe(foot);
    }
  }

  function init() {
    setupCountdown();
    setupCopy();
    setupReveal();
    setupSpy();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
