(() => {
  const data = window.portfolioData;
  const opening = document.querySelector("#sstv-opening");
  const canvas = document.querySelector("#sstv-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const finalFrame = document.createElement("canvas");
  finalFrame.width = 320;
  finalFrame.height = 240;
  const finalCtx = finalFrame.getContext("2d", { alpha: false });
  const skip = document.querySelector("#sstv-skip");
  const sound = document.querySelector("#sstv-sound");
  const caption = document.querySelector("#sstv-caption");
  const status = document.querySelector("#sstv-status");
  const replay = document.querySelector("#replay-opening");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = 9000;
  let startedAt = 0;
  let animationFrame = 0;
  let finished = false;
  let hiddenAt = 0;
  let audioContext;
  let audioGain;
  let audioTimer;

  const today = () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const setCopy = () => {
    status.textContent = data.sstv.status;
    skip.textContent = data.sstv.skip;
    sound.textContent = data.sstv.soundOff;
    caption.textContent = `${data.sstv.receiver} | ${data.sstv.mode} | ${today()}`;
    replay.textContent = data.sstv.replay;
  };
  const pixelText = (context, text, x, y, size, color, align = "left") => {
    context.font = `bold ${size}px "Courier New", monospace`;
    context.textAlign = align;
    context.textBaseline = "top";
    context.fillStyle = color;
    context.fillText(text, x, y);
  };
  const drawFinalFrame = () => {
    const gradient = finalCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "#4B2A86");
    gradient.addColorStop(.58, "#9B5DE5");
    gradient.addColorStop(1, "#FF6FAE");
    finalCtx.fillStyle = gradient;
    finalCtx.fillRect(0, 0, 320, 240);
    finalCtx.fillStyle = "#FFF3FA";
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 47) % 320;
      const y = (i * 23) % 128;
      finalCtx.fillRect(x, y, i % 7 ? 1 : 2, i % 7 ? 1 : 2);
    }
    finalCtx.fillStyle = "#FFC49B";
    finalCtx.beginPath();
    finalCtx.arc(240, 106, 28, 0, Math.PI * 2);
    finalCtx.fill();
    finalCtx.strokeStyle = "#FFC2E2";
    finalCtx.lineWidth = 1;
    const stars = [[55, 62], [94, 95], [142, 73], [185, 108], [232, 58]];
    finalCtx.beginPath();
    stars.forEach(([x, y], index) => {
      finalCtx.moveTo(x, y);
      if (index < stars.length - 1) finalCtx.lineTo(stars[index + 1][0], stars[index + 1][1]);
    });
    finalCtx.stroke();
    stars.forEach(([x, y]) => finalCtx.fillRect(x - 2, y - 2, 4, 4));
    finalCtx.fillStyle = "#1E1347";
    finalCtx.fillRect(0, 190, 320, 50);
    finalCtx.fillRect(270, 165, 5, 25);
    finalCtx.strokeStyle = "#1E1347";
    finalCtx.beginPath();
    finalCtx.arc(272, 163, 20, Math.PI, Math.PI * 2);
    finalCtx.moveTo(272, 163);
    finalCtx.lineTo(272, 145);
    finalCtx.stroke();
    finalCtx.fillStyle = "#FF6FAE";
    finalCtx.fillRect(135, 125, 22, 18);
    finalCtx.fillStyle = "#FFC2E2";
    finalCtx.fillRect(128, 128, 7, 12);
    finalCtx.fillRect(157, 128, 7, 12);
    finalCtx.fillStyle = "#1E1347";
    finalCtx.fillRect(143, 143, 6, 8);
    pixelText(finalCtx, data.name.toUpperCase(), 160, 12, 22, "#FFF3FA", "center");
    pixelText(finalCtx, data.sstv.subtitle, 160, 39, 6, "#FFF3FA", "center");
    data.sstv.details.forEach((detail, index) => pixelText(finalCtx, detail, 8, 198 + index * 8, 6, "#FFC2E2"));
    for (let y = 0; y < 240; y += 4) {
      finalCtx.fillStyle = "rgba(30,19,71,.12)";
      finalCtx.fillRect(0, y, 320, 1);
    }
  };
  const noise = (progress) => {
    ctx.fillStyle = "#1E1347";
    ctx.fillRect(0, 0, 320, 240);
    const amount = Math.max(12, Math.floor(130 * (1 - progress)));
    for (let i = 0; i < amount; i += 1) {
      ctx.fillStyle = i % 3 ? "#9B5DE5" : "#FF6FAE";
      ctx.fillRect(Math.random() * 320, Math.random() * 240, 1 + Math.random() * 3, 1 + Math.random() * 2);
    }
    if (Math.random() < .08) {
      ctx.fillStyle = Math.random() < .5 ? "#FF6FAE" : "#FFC2E2";
      ctx.fillRect(0, Math.random() * 240, 320, 2 + Math.random() * 5);
    }
  };
  const render = (line, progress) => {
    noise(progress);
    if (line > 0) {
      ctx.globalAlpha = .9;
      ctx.drawImage(finalFrame, 0, 0, 320, line, 0, 0, 320, line);
      ctx.globalAlpha = .28;
      ctx.drawImage(finalFrame, 0, 0, 320, line, -3, 0, 320, line);
      ctx.drawImage(finalFrame, 0, 0, 320, line, 3, 0, 320, line);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#FFF3FA";
    ctx.fillRect(0, Math.min(239, line), 320, 1);
    if (Math.random() < .035) {
      ctx.fillStyle = Math.random() < .5 ? "#FF6FAE" : "#FFF3FA";
      ctx.fillRect(0, Math.max(0, line - 2), 320, 2);
    }
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    ctx.drawImage(finalFrame, 0, 0);
    opening.classList.add("is-complete");
    status.textContent = data.sstv.complete;
    setTimeout(() => {
      opening.classList.add("is-dismissed");
      document.body.classList.remove("sstv-active");
      try { sessionStorage.setItem("aarya-sstv-seen", "1"); } catch (error) {}
    }, reduced ? 500 : 1500);
  };
  const tick = now => {
    animationFrame = 0;
    if (document.hidden) return;
    const elapsed = now - startedAt;
    const progress = Math.min(1, elapsed / duration);
    const line = Math.floor(progress * 240);
    render(line, progress);
    status.textContent = `${data.sstv.progress} ${Math.round(progress * 100)}%`;
    if (progress >= 1) finish();
    else animationFrame = requestAnimationFrame(tick);
  };
  const stopAudio = () => {
    if (audioTimer) clearInterval(audioTimer);
    audioTimer = 0;
    if (audioGain) audioGain.disconnect();
    audioGain = null;
  };
  const startAudio = () => {
    audioContext = audioContext || new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    stopAudio();
    audioGain = audioContext.createGain();
    audioGain.gain.value = .025;
    audioGain.connect(audioContext.destination);
    const playTone = () => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(420, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1250, audioContext.currentTime + .32);
      oscillator.connect(audioGain);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + .34);
    };
    playTone();
    audioTimer = setInterval(playTone, 620);
  };
  const toggleSound = () => {
    const enabled = sound.getAttribute("aria-pressed") !== "true";
    sound.setAttribute("aria-pressed", String(enabled));
    sound.textContent = enabled ? data.sstv.soundOn : data.sstv.soundOff;
    if (enabled) startAudio(); else stopAudio();
  };
  const dismiss = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(animationFrame);
    ctx.drawImage(finalFrame, 0, 0);
    opening.classList.add("is-complete");
    setTimeout(() => {
      opening.classList.add("is-dismissed");
      document.body.classList.remove("sstv-active");
      try { sessionStorage.setItem("aarya-sstv-seen", "1"); } catch (error) {}
    }, reduced ? 400 : 650);
  };
  const start = () => {
    finished = false;
    opening.classList.remove("is-dismissed", "is-complete");
    document.body.classList.add("sstv-active");
    startedAt = performance.now();
    animationFrame = requestAnimationFrame(tick);
    skip.focus({ preventScroll: true });
  };
  setCopy();
  drawFinalFrame();
  canvas.addEventListener("click", dismiss);
  skip.addEventListener("click", dismiss);
  sound.addEventListener("click", toggleSound);
  replay.addEventListener("click", event => { event.preventDefault(); start(); });
  document.addEventListener("keydown", event => {
    if (!opening.classList.contains("is-dismissed") && (event.key === "Escape" || event.key === "Enter")) dismiss();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenAt = performance.now();
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      return;
    }
    if (!finished && !animationFrame) {
      if (hiddenAt) startedAt += performance.now() - hiddenAt;
      animationFrame = requestAnimationFrame(tick);
    }
  });
  let seen = false;
  try { seen = sessionStorage.getItem("aarya-sstv-seen") === "1"; } catch (error) {}
  if (seen) {
    ctx.drawImage(finalFrame, 0, 0);
    opening.classList.add("is-dismissed");
  } else {
    document.body.classList.add("sstv-active");
    if (reduced) {
      ctx.drawImage(finalFrame, 0, 0);
      opening.classList.add("is-complete");
      setTimeout(dismiss, 500);
    } else start();
  }
  // Expose hooks for space-handoff.js — never call these from within sstv.js itself.
  window._sstyDismiss = dismiss;
  window._sstyStart = start;
  window._sstyIsSoundOn = () => sound.getAttribute("aria-pressed") === "true";
})();
