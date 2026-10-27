(function () {
  const page = document.body.dataset.side || "hub";
  const sides = [
    { id: "space", label: "Space", href: "space.html", icon: "✦" },
    { id: "art", label: "Art", href: "gallery.html", icon: "▱" }
  ];
  const storedSound = (() => {
    try { return localStorage.getItem("aarya-sound") === "on"; } catch (error) { return false; }
  })();
  const nav = document.createElement("header");
  nav.className = "side-nav";
  nav.innerHTML = `<div class="side-nav-left">
      <a class="side-home-btn" href="index.html" title="Go to Home page">⌂ HOME</a>
      <a class="side-brand" href="index.html">${(window.portfolioData && window.portfolioData.name || "Aarya").split(" ")[0].toUpperCase()} <span>✦</span></a>
    </div>
    <nav class="side-switcher" aria-label="Switch side">
      <span class="switch-label">SWITCH SIDE:</span>
      ${sides.map(side => `<a class="side-tab ${page === side.id ? "is-current" : ""}" href="${side.href}" aria-label="${side.label}" title="${side.label}">${side.icon} <span>${side.label}</span></a>`).join("")}
    </nav>
    <div class="side-nav-right">
      <button class="sound-toggle" type="button" aria-pressed="${storedSound}" aria-label="${storedSound ? "Mute sound" : "Enable sound"}">${storedSound ? "🔊" : "🔇"}</button>
    </div>`;
  document.body.prepend(nav);
  document.documentElement.style.setProperty("--side-accent", page === "art" ? "#b5587f" : "#e95d9d");
  const toggle = nav.querySelector(".sound-toggle");
  toggle.addEventListener("click", () => {
    const enabled = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute("aria-label", enabled ? "Mute sound" : "Enable sound");
    toggle.textContent = enabled ? "🔊" : "🔇";
    try { localStorage.setItem("aarya-sound", enabled ? "on" : "off"); } catch (error) { /* storage is optional */ }
  });
  document.querySelectorAll("a[href$='.html']").forEach(link => {
    link.addEventListener("click", event => {
      // transitions.js handles all .html link transitions
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      // No-op here — transitions.js intercepts these events
    });
  });
})();

