(() => {
  const data = window.portfolioData;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const sections = [...document.querySelectorAll("main > section")];
  const hud = document.querySelector(".ascent-hud");
  const altitude = document.querySelector("#altitude-readout");
  const stageReadout = document.querySelector("#stage-readout");
  const toast = document.querySelector("#stage-toast");
  let frame = 0, lastStage = -1;

  const showToast = stage => {
    toast.textContent = `${data.launch.stages[stage]}${data.launch.toastSuffix}`;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1200);
  };
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? scrollY / max : 0;
    const stage = Math.min(data.launch.stages.length - 1, Math.floor(progress * data.launch.stages.length));
    root.style.setProperty("--p", progress.toFixed(4));
    root.style.setProperty("--alt", `${Math.round(progress * 400)}px`);
    const palette = progress < .25 ? ["#FFC49B", "#FF6FAE"] : progress < .5 ? ["#9B5DE5", "#4B2A86"] : ["#4B2A86", "#1E1347"];
    root.style.setProperty("--sky-a", palette[0]);
    root.style.setProperty("--sky-b", palette[1]);
    altitude.textContent = `ALT ${Math.round(progress * 400)} km`;
    stageReadout.textContent = data.launch.stages[stage];
    hud.dataset.stage = stage;
    if (stage !== lastStage) {
      if (lastStage >= 0) showToast(stage);
      lastStage = stage;
      document.body.dataset.stage = stage;
    }
    document.querySelector("#rocket-marker").style.transform = `translateY(${progress * 100}vh)`;
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", update);
  update();
})();
