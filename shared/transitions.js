/* shared/transitions.js
   Themed OUT/IN page transitions for hub ↔ space/art/nature.
   
   OUT (~500ms): plays on the current page before navigating.
   IN  (~500ms): plays on the arriving page after load.

   Session storage key: "aarya-next-tx" = "space"|"art"|"nature"|"hub"
   Back/forward (pageshow persisted): skip all animation.
   Any keypress or click during transition: skip immediately.
   3s safety: navigate regardless if load is slow.
   prefers-reduced-motion: 200ms cross-fade only.
*/
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────── */
  var OUT_DUR    = 500;   // ms
  var IN_DUR     = 500;   // ms
  var NAV_TIMEOUT= 3000;  // ms safety before forced navigate

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Helpers ─────────────────────────────────────────────────── */
  function ssGet(k)    { try { return sessionStorage.getItem(k); }    catch(e){ return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); }        catch(e){} }
  function ssDel(k)    { try { sessionStorage.removeItem(k); }        catch(e){} }

  function currentSide() {
    return document.body.dataset.side || 'hub';
  }

  /* Determine which transition theme a link leads to */
  function themeFor(href) {
    if (!href) return 'hub';
    var h = href.toString();
    if (h.includes('gallery'))    return 'art';
    if (h.includes('index'))      return 'hub';
    if (h.includes('space'))      return 'space';
    return 'hub';
  }

  /* ── Create the overlay DOM ──────────────────────────────────── */
  function buildOverlay(theme) {
    var wrap = document.createElement('div');
    wrap.className  = 'tx-overlay tx-' + theme;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.setAttribute('role', 'presentation');

    if (REDUCED) return wrap;

    if (theme === 'art') {
      var left  = document.createElement('div');
      var right = document.createElement('div');
      var glow  = document.createElement('div');
      left.className  = 'tx-art-left';
      right.className = 'tx-art-right';
      glow.className  = 'tx-art-glow';
      wrap.appendChild(left);
      wrap.appendChild(right);
      wrap.appendChild(glow);
    }

    return wrap;
  }

  /* ── Animate OUT (current page) ─────────────────────────────── */
  function animateOut(theme, overlay, done) {
    document.body.appendChild(overlay);

    if (REDUCED) {
      overlay.classList.add('tx-fade-out');
      var t = setTimeout(done, 220);
      overlay.addEventListener('animationend', function() { clearTimeout(t); done(); }, { once: true });
      return;
    }

    /* Skip on any keypress or click */
    var skipped = false;
    function doSkip() {
      if (skipped) return;
      skipped = true;
      clearTimeout(safeNav);
      done();
    }
    document.addEventListener('keydown',     doSkip, { once: true });
    document.addEventListener('pointerdown', doSkip, { once: true });
    var safeNav = setTimeout(done, NAV_TIMEOUT);

    if (theme === 'space') {
      overlay.classList.add('tx-out');
      overlay.addEventListener('animationend', function() {
        clearTimeout(safeNav);
        document.removeEventListener('keydown',     doSkip);
        document.removeEventListener('pointerdown', doSkip);
        done();
      }, { once: true });
      return;
    }

    if (theme === 'art') {
      var left  = overlay.querySelector('.tx-art-left');
      var right = overlay.querySelector('.tx-art-right');
      left.classList.add('tx-out');
      right.classList.add('tx-out');
      /* Wait for both panels */
      var count = 0;
      function onPanel() { if (++count >= 2) { clearTimeout(safeNav); document.removeEventListener('keydown', doSkip); document.removeEventListener('pointerdown', doSkip); done(); } }
      left.addEventListener('animationend',  onPanel, { once: true });
      right.addEventListener('animationend', onPanel, { once: true });
      return;
    }



    /* hub or unknown: simple fade */
    overlay.style.background = '#fffaf3';
    overlay.classList.add('tx-fade-out');
    var t2 = setTimeout(done, 220);
    overlay.addEventListener('animationend', function() { clearTimeout(t2); document.removeEventListener('keydown', doSkip); document.removeEventListener('pointerdown', doSkip); done(); }, { once: true });
  }

  /* ── Animate IN (arriving page) ─────────────────────────────── */
  function animateIn(theme, overlay) {
    document.body.appendChild(overlay);

    /* Move focus to main h1 on arrival */
    function focusHeading() {
      var h = document.querySelector('main h1, .ag-main-heading, .hub-heading h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }

    /* Skip on any keypress or click */
    var skipped = false;
    function doSkip() {
      if (skipped) return;
      skipped = true;
      overlay.remove();
      focusHeading();
    }
    document.addEventListener('keydown',     doSkip, { once: true });
    document.addEventListener('pointerdown', doSkip, { once: true });
    var safety = setTimeout(doSkip, IN_DUR + 400);

    function onDone() {
      clearTimeout(safety);
      document.removeEventListener('keydown',     doSkip);
      document.removeEventListener('pointerdown', doSkip);
      overlay.remove();
      focusHeading();
    }

    if (REDUCED) {
      overlay.style.opacity = '1';
      overlay.classList.add('tx-fade-in');
      overlay.addEventListener('animationend', onDone, { once: true });
      return;
    }

    if (theme === 'space') {
      /* Scanline sweeps up off screen */
      overlay.classList.add('tx-in');
      overlay.addEventListener('animationend', onDone, { once: true });
      return;
    }

    if (theme === 'art') {
      var left  = overlay.querySelector('.tx-art-left');
      var right = overlay.querySelector('.tx-art-right');
      var glow  = overlay.querySelector('.tx-art-glow');
      /* Panels start closed (open state set in CSS tx-in) */
      left.classList.add('tx-in');
      right.classList.add('tx-in');
      /* Fade in golden glow while curtains part */
      if (glow) {
        requestAnimationFrame(function() { glow.classList.add('glow-in'); });
        setTimeout(function() { if (glow) glow.classList.remove('glow-in'); }, IN_DUR * 0.7);
      }
      var count = 0;
      function onPanel() { if (++count >= 2) onDone(); }
      left.addEventListener('animationend',  onPanel, { once: true });
      right.addEventListener('animationend', onPanel, { once: true });
      return;
    }



    /* hub or unknown: simple fade out */
    overlay.style.background = '#fffaf3';
    overlay.style.opacity = '1';
    overlay.classList.add('tx-fade-in');
    overlay.addEventListener('animationend', onDone, { once: true });
  }

  /* ── Click handler: intercept .html links ────────────────────── */
  function handleLinkClick(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (!href.endsWith('.html')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target === '_blank') return;

    /* plain hash links (#...) or same-page links pass through */
    if (href.startsWith('#')) return;

    e.preventDefault();

    var dest  = link.href;
    var theme = themeFor(dest);

    /* Store which transition the destination page should IN-animate */
    ssSet('aarya-next-tx', theme);

    /* Build overlay for OUT animation */
    var overlay = buildOverlay(theme);

    animateOut(theme, overlay, function() {
      window.location.href = dest;
    });
  }

  /* ── On arrival: play the IN animation ──────────────────────── */
  function onArrival() {
    /* Never animate on back/forward cache restore */
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        ssDel('aarya-next-tx');
      }
    });

    var theme = ssGet('aarya-next-tx');
    ssDel('aarya-next-tx');

    if (!theme) return; /* direct navigation or back button */

    /* For space: SSTV opening will play — just ensure overlay is gone */
    if (theme === 'space') {
      /* Don't play IN on space.html; the SSTV opening IS the arrival experience.
         But do build a thin overlay so the page doesn't flash bare. */
      var spaceOverlay = buildOverlay('space');
      spaceOverlay.style.clipPath = 'inset(0 0 0% 0)'; /* fully visible */
      document.body.appendChild(spaceOverlay);
      /* Dissolve it quickly once the page has rendered */
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          spaceOverlay.classList.add('tx-in');
          spaceOverlay.addEventListener('animationend', function() {
            spaceOverlay.remove();
          }, { once: true });
          setTimeout(function() { spaceOverlay.remove(); }, IN_DUR + 200);
        });
      });
      return;
    }

    var overlay = buildOverlay(theme);
    /* Start with overlay fully covering the page */
    if (theme === 'art') {
      var l = overlay.querySelector('.tx-art-left');
      var r = overlay.querySelector('.tx-art-right');
      if (l) l.style.transform = 'translateX(0)';
      if (r) r.style.transform = 'translateX(0)';
    } else if (theme === 'nature') {
      overlay.style.opacity = '1';
    }

    animateIn(theme, overlay);
  }

  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('click', handleLinkClick);
  onArrival();

})();
