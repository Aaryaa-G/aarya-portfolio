const data = window.portfolioData;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
document.title = `${data.name} | Space Systems & AI`;
const tickerGroup = data.tickerItems.map(item => `${item} ✦`).join(" ");
const marqueeTrack = $(".marquee-track");
marqueeTrack.innerHTML = `<span class="marquee-group">${tickerGroup}</span><span class="marquee-group" aria-hidden="true">${tickerGroup}</span>`;
const marquee = $(".marquee");
const marqueeGroups = $$(".marquee-group", marquee);
const fitTickerGroups = () => {
  const firstGroup = marqueeGroups[0];
  const minimumWidth = marquee.clientWidth + 1;
  while (firstGroup.scrollWidth < minimumWidth) firstGroup.insertAdjacentHTML("beforeend", ` ${tickerGroup}`);
  marqueeGroups[1].innerHTML = firstGroup.innerHTML;
  const seconds = Math.max(60, Math.min(80, firstGroup.scrollWidth / 60));
  marqueeTrack.style.setProperty("--marquee-duration", `${seconds}s`);
};
fitTickerGroups();
window.addEventListener("resize", fitTickerGroups);
$$("[data-bind='location']").forEach(el => el.textContent = data.location);
$$("[data-bind='summary']").forEach(el => el.textContent = data.summary);
$$("[data-bind='tagline']").forEach(el => {
  el.innerHTML = data.tagline.replace("satellite firmware", "<mark>satellite firmware</mark>").replace("AI for space", "<mark>AI for space</mark>");
});
$$("[data-bind='photo-caption']").forEach(el => el.textContent = data.photoCaption);
const [firstName, ...lastName] = data.name.toUpperCase().split(" ");
$("#first-name").textContent = firstName;
$("#last-name").textContent = lastName.join(" ");
$$("[data-link='linkedin']").forEach(el => el.href = data.links.linkedin);
$$("[data-link='github']").forEach(el => el.href = data.links.github);
$$("[data-link='email']").forEach(el => el.href = `mailto:${data.email}`);

$("#mission-grid").innerHTML = data.missions.map(([title, status, description, tags], index) => `<article class="mission-card"><span class="corner"></span><div class="mission-meta"><span class="mission-id">MSN-${String(index + 1).padStart(3, "0")}</span><span class="status-led ${status.startsWith("LAUNCHED") ? "status-led-dim" : ""}"></span><span class="status">${status}</span></div><h3>${title}</h3><p>${description}</p><div class="telemetry-readout">TX / ${index % 2 ? "437.2480" : "145.8000"} MHz · PACKET ${String(index + 12).padStart(2, "0")} · ${status.startsWith("LAUNCHED") ? "ARCHIVED" : "LIVE"}</div><div class="tech-chips">${tags.map(tag => `<span>${tag}</span>`).join("")}</div><a class="mission-link" href="#contact">OPEN DOSSIER ↗</a></article>`).join("");
$("#education-list").innerHTML = data.education.map(item => `<div class="edu-item"><strong>${item[0]}</strong><small>${item[1]}</small><small>${item[2]}</small></div>`).join("");
$("#skills-list").innerHTML = Object.entries(data.skills).map(([group, values]) => `<div class="skill-group"><strong>${group}</strong>${values.split(", ").map(value => `<span class="skill-chip">${value}</span>`).join("")}</div>`).join("");
$("#stats-strip").innerHTML = [["4+", "satellite projects"], ["437.2480", "MHz downlink"], ["8.80", "CGPA"], ["1", "publication"]].map(item => `<div class="stat"><strong>${item[0]}</strong><small>${item[1]}</small></div>`).join("");

const labelPositions = [
  { left: "11%", top: "84%" }, { left: "34%", top: "57%" }, { left: "48%", top: "73%" },
  { left: "62%", top: "47%" }, { left: "81%", top: "22%" }, { left: "24%", top: "8%" }
];
$("#taurus-labels").innerHTML = data.orbit.map((item, index) => `<span class="taurus-label" data-label-id="${item.id}" style="left:${labelPositions[index].left};top:${labelPositions[index].top}">${item.title}</span>`).join("");
const taurusScene = $(".taurus-scene");
const dateTooltip = $("#taurus-date-tooltip");
const hideDateTooltip = () => { dateTooltip.hidden = true; dateTooltip.classList.remove("tooltip-below"); };
const showDateTooltip = star => {
  const item = data.orbit.find(entry => String(entry.id) === star.dataset.starId);
  if (!item) return;
  $$(".taurus-star").forEach(entry => entry.removeAttribute("aria-describedby"));
  star.setAttribute("aria-describedby", "taurus-date-tooltip");
  dateTooltip.textContent = item.date;
  dateTooltip.hidden = false;
  dateTooltip.classList.add("tooltip-enter");
  requestAnimationFrame(() => dateTooltip.classList.remove("tooltip-enter"));
  dateTooltip.classList.remove("tooltip-below");
  const sceneRect = taurusScene.getBoundingClientRect();
  const starRect = star.getBoundingClientRect();
  const label = $(`[data-label-id="${item.id}"]`);
  const labelRect = label.getBoundingClientRect();
  const tooltipRect = dateTooltip.getBoundingClientRect();
  const starX = starRect.left + starRect.width / 2 - sceneRect.left;
  const starY = starRect.top + starRect.height / 2 - sceneRect.top;
  const left = Math.max(4, Math.min(taurusScene.clientWidth - tooltipRect.width - 4, starX - tooltipRect.width / 2));
  let top = starRect.top - sceneRect.top - tooltipRect.height - 14;
  const labelOverlap = top < labelRect.bottom - sceneRect.top && top + tooltipRect.height > labelRect.top - sceneRect.top && left < labelRect.right - sceneRect.left && left + tooltipRect.width > labelRect.left - sceneRect.left;
  if (top < 4 || labelOverlap) {
    top = starY + starRect.height / 2 + 14;
    dateTooltip.classList.add("tooltip-below");
  }
  dateTooltip.style.left = `${left}px`;
  dateTooltip.style.top = `${Math.min(taurusScene.clientHeight - tooltipRect.height - 4, top)}px`;
};
$$(".taurus-star").forEach(star => {
  const id = star.dataset.starId;
  const item = data.orbit.find(entry => String(entry.id) === id);
  star.setAttribute("tabindex", "0");
  star.setAttribute("role", "button");
  star.setAttribute("aria-label", item.title.replace(" · ", ", ") + `, ${item.date.replace(" – ", " to ")}`);
  const setActive = active => {
    star.classList.toggle("star-active", active);
    $(`[data-label-id="${id}"]`).classList.toggle("label-active", active);
  };
  star.addEventListener("mouseenter", () => { setActive(true); showDateTooltip(star); });
  star.addEventListener("mouseleave", () => { setActive(false); if (document.activeElement !== star) hideDateTooltip(); });
  star.addEventListener("focus", () => { setActive(true); showDateTooltip(star); });
  star.addEventListener("blur", () => { setActive(false); hideDateTooltip(); });
  star.addEventListener("click", event => { event.stopPropagation(); setActive(true); showDateTooltip(star); });
});
document.addEventListener("pointerdown", event => { if (!event.target.closest(".taurus-star")) hideDateTooltip(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") hideDateTooltip(); });

const navToggle = $(".nav-toggle");
navToggle.addEventListener("click", () => { const open = $(".site-nav").classList.toggle("open"); navToggle.setAttribute("aria-expanded", String(open)); });
$$(".site-nav a").forEach(link => link.addEventListener("click", () => $(".site-nav").classList.remove("open")));

const backdrop = $(".modal-backdrop");
const closeModal = () => { backdrop.hidden = true; document.body.style.overflow = ""; };
$$("[data-modal]").forEach(button => button.addEventListener("click", () => { const [title, content] = data.modals[button.dataset.modal]; $("#modal-title").textContent = title; $("#modal-content").innerHTML = content; backdrop.hidden = false; document.body.style.overflow = "hidden"; }));
$(".modal-close").addEventListener("click", closeModal);
backdrop.addEventListener("click", event => { if (event.target === backdrop) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

const restartOrbitAnimation = section => {
  section.classList.remove("visible");
  void section.offsetWidth;
  requestAnimationFrame(() => section.classList.add("visible"));
};
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.target.id === "log") {
    if (entry.isIntersecting) restartOrbitAnimation(entry.target);
    else entry.target.classList.remove("visible");
    return;
  }
  if (entry.isIntersecting) {
    entry.target.classList.add("visible", "decode-wipe");
    setTimeout(() => entry.target.classList.remove("decode-wipe"), 650);
  }
}), { threshold: .12 });
$$(".reveal").forEach(element => observer.observe(element));

const playToggle = $("#play-toggle");
const heroPlayToggle = $("#hero-play-toggle");
let playing = false;
let audioContext;
let audioNodes = [];
const setPlaying = nextPlaying => {
  playing = nextPlaying;
  playToggle.textContent = playing ? "Ⅱ" : "▶";
  playToggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  playToggle.setAttribute("aria-pressed", String(playing));
  heroPlayToggle.textContent = playing ? "Ⅱ" : "▶";
  heroPlayToggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  heroPlayToggle.setAttribute("aria-pressed", String(playing));
  $(".music-player").classList.toggle("is-playing", playing);
  $(".record-player").classList.toggle("is-playing", playing);
};
const startMusic = () => {
  audioContext = audioContext || new AudioContext();
  const gain = audioContext.createGain();
  gain.gain.value = .035;
  gain.connect(audioContext.destination);
  [220, 277.18, 329.63].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start();
    audioNodes.push(oscillator);
  });
  audioNodes.push(gain);
};
const stopMusic = () => {
  audioNodes.forEach(node => { if (typeof node.stop === "function") node.stop(); node.disconnect(); });
  audioNodes = [];
};
const toggleMusic = () => {
  if (playing) {
    stopMusic();
    setPlaying(false);
    return;
  }
  startMusic();
  setPlaying(true);
};
playToggle.addEventListener("click", toggleMusic);
heroPlayToggle.addEventListener("click", toggleMusic);
const cursorMedia = window.matchMedia("(min-width: 800px) and (hover: hover) and (pointer: fine)");
const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
let glitterIndex = 0;
document.addEventListener("mousemove", event => {
  const cursor = $(".cursor-star");
  if (!cursor || !cursorMedia.matches) return;
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  if (motionMedia.matches || ++glitterIndex % 2) return;
  const glitter = document.createElement("span");
  const colors = ["pink", "white", "purple"];
  glitter.className = `cursor-glitter cursor-glitter-${colors[glitterIndex % colors.length]}`;
  glitter.style.left = `${event.clientX + (Math.random() * 12 - 6)}px`;
  glitter.style.top = `${event.clientY + (Math.random() * 12 - 6)}px`;
  document.body.appendChild(glitter);
  setTimeout(() => glitter.remove(), 700);
});

const groundReadout = $("#ground-readout");
const groundStations = ["AOS 12:04 · Elevation 38° · Doppler +2.1 kHz", "AOS 12:05 · Elevation 41° · Doppler +1.8 kHz", "AOS 12:06 · Elevation 35° · Doppler +2.4 kHz"];
let groundIndex = 0;
setInterval(() => { groundIndex = (groundIndex + 1) % groundStations.length; groundReadout.textContent = groundStations[groundIndex]; }, 3200);
