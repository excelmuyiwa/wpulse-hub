/* WPulse Player Hub - script.js
   Progressive enhancement only: the page works fully without this file.
   No libraries, no network requests, no storage or cookies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- 1. Contact cards: the whole card copies (Email, Discord) ---------- */
  // Without this script the Email card is a plain mailto link and Discord is static text.
  function setupCopy() {
    var cards = doc.querySelectorAll('.contact-card[data-copy]');
    Array.prototype.forEach.call(cards, function (card) {
      var value = card.getAttribute('data-copy');
      var label = card.querySelector('.cc-action-label');
      var shown = card.querySelector('.cc-value');
      var action = card.querySelector('.cc-action');
      if (!label || !shown || !action) return;
      var idle = label.textContent;
      var timer = null;

      card.setAttribute('role', 'button');
      if (card.tagName !== 'A') card.tabIndex = 0;
      card.classList.add('copy-ready');
      action.classList.add('cc-action-on');

      function say(text) {
        label.textContent = text;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = idle; }, 1500);
      }
      // Clipboard API unavailable or refused: select the text (and try the old copy command) so it can be copied by hand.
      function manual() {
        var ok = false;
        try {
          var range = doc.createRange();
          range.selectNodeContents(shown);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          ok = doc.execCommand('copy');
        } catch (e) { /* leave the text selected */ }
        say(ok ? 'Copied' : 'Press Ctrl+C');
      }
      function run(e) {
        e.preventDefault();
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(value).then(function () { say('Copied'); }, manual);
        } else {
          manual();
        }
      }
      card.addEventListener('click', run);
      card.addEventListener('keydown', function (e) {
        if (e.key === ' ' || (e.key === 'Enter' && card.tagName !== 'A')) run(e);
      });
    });
  }
  /* ---------- 2. Scroll reveal ---------- */
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

  /* ---------- 3. Nav scroll-spy ---------- */
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

    // Menu targets that are not top-level sections (an accordion inside a section, e.g. #recording):
    // while one is in the band it wins over its parent section.
    var sectionIds = {};
    sections.forEach(function (s) { sectionIds[keyOf(s)] = true; });
    var extras = Object.keys(byId).map(function (id) { return doc.getElementById(id); })
      .filter(function (el) { return el && !sectionIds[el.id] && el.closest('main'); });

    function update() {
      if (footVisible) { setActive('contact'); return; }
      var pick = null;
      sections.forEach(function (s) {
        if (inBand[keyOf(s)]) pick = s.classList.contains('hero') ? null : s.id;
      });
      extras.forEach(function (el) { if (inBand[el.id]) pick = el.id; });
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
    extras.forEach(function (el) { spy.observe(el); });

    var foot = doc.getElementById('contact');
    if (foot && byId.contact) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { footVisible = en.isIntersecting; });
        update();
      }, { threshold: 0.6 }).observe(foot);
    }
  }

  /* ---------- 4. Open the accordion(s) a link points into ---------- */
  function setupHashOpen() {
    function targetOf(hash) {
      if (!hash || hash.length < 2) return null;
      var id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch (e) { /* use as is */ }
      return doc.getElementById(id);
    }
    // Opens the target (if it is a <details>) and every <details> around it. True if anything was opened.
    function openAround(el) {
      var opened = false;
      for (var n = el; n; n = n.parentElement) {
        if (n.tagName === 'DETAILS' && !n.open) { n.open = true; opened = true; }
      }
      return opened;
    }
    function go(hash) {
      var el = targetOf(hash);
      if (!el) return;
      openAround(el);
      el.scrollIntoView();
    }
    // Clicks: open first, so the browser's own jump lands on the final layout (also works for a repeated hash).
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      var el = a && targetOf(a.getAttribute('href'));
      if (el) openAround(el);
    });
    // Every accordion starts closed, and stays closed after a reload or back/forward (browsers can restore
    // the old open/closed state). Only a URL hash that targets an accordion (or something inside one) opens it.
    function syncOpenState(scroll) {
      var el = targetOf(location.hash);
      // The hash target's accordion (and its ancestors) are left alone, so reopening never shifts the page.
      var keep = [];
      for (var n = el; n; n = n.parentElement) if (n.tagName === 'DETAILS') keep.push(n);
      Array.prototype.forEach.call(doc.querySelectorAll('details'), function (d) { d.open = keep.indexOf(d) > -1; });
      if (el && scroll) el.scrollIntoView();
    }
    doc.addEventListener('DOMContentLoaded', function () { syncOpenState(false); });
    // pageshow also fires when a page comes back from the back/forward cache (persisted); the browser restores
    // its own scroll position there, so do not scroll again.
    window.addEventListener('pageshow', function () { syncOpenState(false); });
    window.addEventListener('hashchange', function () { go(location.hash); });
    syncOpenState(true);
    // Images load after the first jump and can move the target: settle once more.
    window.addEventListener('load', function () { if (targetOf(location.hash)) go(location.hash); });
  }

  /* ---------- 5. Phone menu (hamburger) ---------- */
  // Adds .js-nav to <html> only when it can run, so without script the old scrolling nav stays visible.
  function setupMenu() {
    var header = doc.querySelector('.topbar');
    var btn = header && header.querySelector('.nav-toggle');
    var nav = header && header.querySelector('.nav');
    if (!header || !btn || !nav) return;
    root.classList.add('js-nav');
    function isOpen() { return header.classList.contains('is-open'); }
    function setOpen(open) {
      header.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { setOpen(!isOpen()); });
    // Tapping a link closes the menu (the link itself still navigates).
    nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setOpen(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); }
    });
    // Tapping anywhere outside the header closes it.
    doc.addEventListener('click', function (e) { if (isOpen() && !header.contains(e.target)) setOpen(false); });
    // Back to a wide window: close it so the desktop header starts clean.
    var wide = window.matchMedia ? window.matchMedia('(min-width: 720px)') : null;
    if (wide) {
      var onWide = function (m) { if (m.matches) setOpen(false); };
      if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
    }
    window.addEventListener('resize', function () {
      if (isOpen() && (wide ? wide.matches : window.innerWidth > 719)) setOpen(false);
    });
  }

  function init() {
    setupCopy();
    setupReveal();
    setupSpy();
    setupHashOpen();
    setupMenu();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
