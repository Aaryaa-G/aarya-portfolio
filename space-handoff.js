/* space-handoff.js
   State machine: decoding -> complete -> handoff -> live
   Wires the SSTV opening into the rest of the space page.
   Loaded last in space.html so all other scripts are already set up.
*/
(() => {
  'use strict';

  /* -- Constants ------------------------------------------------- */
  const SAFETY_TIMEOUT = 12000;
  const WIPE_DUR_FULL  = 1200;
  const WIPE_DUR_SKIP  = 600;
  const COMPLETE_HOLD  = 1200;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- State ----------------------------------------------------- */
  let state = 'idle';
  let safetyTimer = 0;
  let observer = null;
  let wipeOverlay = null;

  /* -- Elements -------------------------------------------------- */
  const opening    = document.getElementById('sstv-opening');
  const siteHeader = document.querySelector('.site-header');
  const siteMain   = document.querySelector('main');
  const hudEl      = document.querySelector('.ascent-hud');
  const railEl     = document.querySelector('.ascent-rail');
  const musicEl    = document.querySelector('.music-player');
  const replayBtn  = document.getElementById('replay-opening');
  const heroH1     = document.querySelector('.hero h1');
  const heroCopy   = document.querySelector('.hero-copy');

  const staggerEls = () => heroCopy ? [
    heroCopy.querySelector('.sticker'),
    heroCopy.querySelector('.eyebrow'),
    heroCopy.querySelector('h1'),
    heroCopy.querySelector('.location-chip'),
    heroCopy.querySelector('.hero-intro'),
    heroCopy.querySelector('.hero-actions'),
    heroCopy.querySelector('.terminal-caption'),
  ].filter(Boolean) : [];

  const chromeEls = [hudEl, railEl, musicEl].filter(Boolean);

  /* -- Helpers --------------------------------------------------- */
  function ssRead(key)      { try { return sessionStorage.getItem(key); } catch(_){ return null; } }
  function ssRemove(key)    { try { sessionStorage.removeItem(key); }    catch(_){} }

  function setInert(el, on) {
    if (!el) return;
    if (on) { el.setAttribute('inert',''); el.style.visibility='hidden'; }
    else     { el.removeAttribute('inert'); el.style.visibility=''; }
  }

  function lockSite() {
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('site-loading');
    setInert(siteMain, true);
    setInert(siteHeader, true);
    chromeEls.forEach(el => setInert(el, true));
  }

  function unlockSite() {
    document.documentElement.style.overflow = '';
    document.body.classList.remove('site-loading');
    setInert(siteMain, false);
    setInert(siteHeader, false);
    chromeEls.forEach(el => setInert(el, false));
  }

  /* -- Confirmation tone ----------------------------------------- */
  function playConfirmTone() {
    if (typeof window._sstyIsSoundOn !== 'function') return;
    if (!window._sstyIsSoundOn()) return;
    try {
      const ac = new AudioContext();
      const gain = ac.createGain();
      gain.gain.value = 0.04;
      gain.connect(ac.destination);
      [880, 1108, 1320].forEach((freq, i) => {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ac.currentTime + i * 0.09);
        osc.stop(ac.currentTime + i * 0.09 + 0.22);
      });
      setTimeout(() => ac.close(), 1000);
    } catch(_) {}
  }

  /* -- Wipe overlay ---------------------------------------------- */
  function createWipe(dur) {
    if (wipeOverlay) wipeOverlay.remove();
    wipeOverlay = document.createElement('div');
    wipeOverlay.className = 'sstv-wipe-overlay';
    wipeOverlay.setAttribute('aria-hidden', 'true');
    wipeOverlay.style.setProperty('--wipe-dur', dur + 'ms');
    document.body.appendChild(wipeOverlay);
    return wipeOverlay;
  }

  function skipWipe() {
    if (state !== 'handoff') return;
    if (wipeOverlay) wipeOverlay.style.opacity = '0';
    goLive();
  }

  /* -- goLive ---------------------------------------------------- */
  function goLive() {
    if (state === 'live') return;
    state = 'live';
    clearTimeout(safetyTimer);
    if (observer) { observer.disconnect(); observer = null; }
    unlockSite();
    if (wipeOverlay) {
      setTimeout(() => { if (wipeOverlay) { wipeOverlay.remove(); wipeOverlay = null; } }, 400);
    }
    if (heroH1) {
      heroH1.setAttribute('tabindex', '-1');
      heroH1.focus({ preventScroll: true });
    }
    document.dispatchEvent(new CustomEvent('site:live'));
  }

  /* -- goHandoff ------------------------------------------------- */
  function goHandoff(fast) {
    if (state === 'handoff' || state === 'live') return;
    state = 'handoff';
    clearTimeout(safetyTimer);
    if (observer) { observer.disconnect(); observer = null; }

    const wipeDur = fast ? WIPE_DUR_SKIP : WIPE_DUR_FULL;

    if (REDUCED) {
      unlockSite();
      document.body.classList.add('handoff-nav-hidden', 'handoff-hero-hidden');
      requestAnimationFrame(() => {
        document.body.classList.remove('handoff-nav-hidden', 'handoff-hero-hidden');
        staggerEls().forEach(el => {
          if (!el) return;
          el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          el.style.opacity    = '1';
          el.style.transform  = 'translateY(0)';
        });
      });
      setTimeout(goLive, 450);
      return;
    }

    document.body.classList.add('handoff-nav-hidden', 'handoff-hero-hidden');
    unlockSite();

    const wipe = createWipe(wipeDur);

    const onSkipKey     = () => skipWipe();
    const onSkipPointer = () => skipWipe();
    document.addEventListener('keydown',     onSkipKey,     { once: true });
    document.addEventListener('pointerdown', onSkipPointer, { once: true });

    requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add('wipe-go')));

    setTimeout(() => document.body.classList.remove('handoff-nav-hidden'),  wipeDur * 0.28);
    setTimeout(() => {
      document.body.classList.remove('handoff-hero-hidden');
      staggerEls().forEach((el, i) => {
        if (!el) return;
        el.style.animation = 'handoff-stagger-in 0.5s ' + (i * 80) + 'ms cubic-bezier(.22,1,.36,1) both';
      });
    }, wipeDur * 0.38);

    const cleanup = () => {
      document.removeEventListener('keydown',     onSkipKey);
      document.removeEventListener('pointerdown', onSkipPointer);
      goLive();
    };
    wipe.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, wipeDur + 400);
  }

  /* -- Watch sstv.js completion ---------------------------------- */
  function watchForCompletion() {
    if (!opening) { goLive(); return; }
    if (opening.classList.contains('is-dismissed')) {
      setTimeout(() => goHandoff(false), 50);
      return;
    }
    observer = new MutationObserver(() => {
      if (opening.classList.contains('is-dismissed')) {
        observer.disconnect();
        observer = null;
        setTimeout(() => goHandoff(false), COMPLETE_HOLD);
      }
    });
    observer.observe(opening, { attributes: true, attributeFilter: ['class'] });
  }

  /* -- SKIP listeners -------------------------------------------- */
  function attachSkipListeners() {
    function onSkip() {
      if (state !== 'decoding') return;
      if (typeof window._sstyDismiss === 'function') window._sstyDismiss();
      if (observer) { observer.disconnect(); observer = null; }
      goHandoff(true);
    }
    const skipBtn = document.getElementById('sstv-skip');
    if (skipBtn) skipBtn.addEventListener('click', onSkip);
    document.addEventListener('keydown', e => {
      if (state !== 'decoding') return;
      if (e.key === 'Escape' || e.key === 'Enter') onSkip();
    });
    const canvas = document.getElementById('sstv-canvas');
    if (canvas) canvas.addEventListener('click', onSkip);
  }

  /* -- Replay ---------------------------------------------------- */
  function attachReplayListener() {
    if (!replayBtn) return;
    replayBtn.addEventListener('click', e => {
      e.preventDefault();
      ssRemove('aarya-sstv-seen');
      state = 'decoding';
      lockSite();
      staggerEls().forEach(el => { if (el) { el.style.animation = ''; el.style.transition = ''; } });
      if (typeof window._sstyStart === 'function') window._sstyStart();
      watchForCompletion();
    });
  }

  /* -- Init ------------------------------------------------------ */
  function init() {
    const seen = ssRead('aarya-sstv-seen') === '1';

    if (seen) {
      state = 'live';
      unlockSite();
      document.body.classList.add('site-returning');
      if (heroH1) heroH1.setAttribute('tabindex', '-1');
      document.dispatchEvent(new CustomEvent('site:live'));
      attachReplayListener();
      return;
    }

    state = 'decoding';
    lockSite();

    /* Watch for "TRANSMISSION COMPLETE" to trigger confirmation tone */
    if (opening) {
      const completeObs = new MutationObserver(() => {
        if (opening.classList.contains('is-complete')) {
          completeObs.disconnect();
          playConfirmTone();
        }
      });
      completeObs.observe(opening, { attributes: true, attributeFilter: ['class'] });
    }

    safetyTimer = setTimeout(() => {
      if (state === 'decoding') goHandoff(true);
      else if (state !== 'live') goLive();
    }, SAFETY_TIMEOUT);

    attachSkipListeners();
    attachReplayListener();
    watchForCompletion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
