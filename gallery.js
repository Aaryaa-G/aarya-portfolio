/**
 * gallery.js
 * Interactive controller for the Art Gallery
 * - Renders masonry artwork tiles from gallery-data.js
 * - Category filter chips
 * - Clothesline visuals row with SVG clips
 * - Accessible Lightbox modal with keyboard navigation (Arrows, Esc)
 * - Scroll-triggered entrance animations
 */

(function () {
  'use strict';

  // Wait for data
  const data = window.galleryData;
  if (!data) {
    console.warn("galleryData not found. Ensure gallery-data.js is loaded first.");
    return;
  }

  const { artworks, visuals } = data;
  let activeFilter = "ALL";
  let currentModalIndex = 0;
  let lastFocusedElement = null;
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // DOM Elements
  const gridContainer = document.getElementById("ag-masonry-grid");
  const filterContainer = document.getElementById("ag-filter-bar");
  const visualsTrack = document.getElementById("ag-visuals-track");
  const lightbox = document.getElementById("ag-lightbox");
  const modalImg = document.getElementById("ag-modal-img");
  const modalTitle = document.getElementById("ag-modal-title");
  const modalBadge = document.getElementById("ag-modal-badge");
  const modalYear = document.getElementById("ag-modal-year");
  const modalDim = document.getElementById("ag-modal-dim");
  const modalDesc = document.getElementById("ag-modal-desc");
  const modalCounter = document.getElementById("ag-modal-counter");
  const btnClose = document.getElementById("ag-btn-close");
  const btnPrev = document.getElementById("ag-btn-prev");
  const btnNext = document.getElementById("ag-btn-next");

  /* -------------------------------------------------------------------------
     1. RENDER MASONRY GRID
     ------------------------------------------------------------------------- */
  function renderArtworks(filter = "ALL") {
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    const filtered = filter === "ALL" 
      ? artworks 
      : artworks.filter(item => item.tag === filter);

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-family: var(--ag-mono); padding: 3rem;">No artworks found for this category.</p>`;
      return;
    }

    filtered.forEach((art, index) => {
      // Determine orientation class
      let spanClass = "";
      if (index === 0 && filter === "ALL") {
        spanClass = "is-hero";
      } else if (art.orientation === "tall") {
        spanClass = "is-tall";
      } else if (art.orientation === "wide") {
        spanClass = "is-wide";
      }

      const tile = document.createElement("article");
      tile.className = `ag-art-tile ${spanClass} ${!isReduced ? "ag-reveal" : ""}`;
      tile.tabIndex = 0;
      tile.setAttribute("role", "button");
      tile.setAttribute("aria-label", `View artwork: ${art.title}, ${art.medium}`);
      tile.dataset.id = art.id;

      // Optional washi tape on some items
      const hasTape = (index % 3 === 0);
      const tapeHtml = hasTape ? `<div class="ag-tile-tape" aria-hidden="true"></div>` : "";

      tile.innerHTML = `
        ${tapeHtml}
        <span class="ag-tile-badge">${art.tag}</span>
        <div class="ag-tile-media">
          <img src="${art.image}" alt="${art.title} - ${art.medium} (${art.year})" loading="lazy" decoding="async">
          <div class="ag-tile-caption">
            <h3>${art.title}</h3>
            <p>${art.medium} · ${art.year}</p>
          </div>
        </div>
      `;

      // Open Lightbox on click or Enter/Space
      tile.addEventListener("click", () => openLightbox(art.id));
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(art.id);
        }
      });

      gridContainer.appendChild(tile);
    });

    // Wire up scroll animations
    setupScrollReveals();
  }

  /* -------------------------------------------------------------------------
     2. RENDER FILTER BAR
     ------------------------------------------------------------------------- */
  function renderFilterBar() {
    if (!filterContainer) return;
    
    // Extract unique tags
    const tags = ["ALL", ...new Set(artworks.map(a => a.tag))];

    filterContainer.innerHTML = tags.map(tag => `
      <button type="button" class="ag-filter-btn ${tag === activeFilter ? "is-active" : ""}" data-tag="${tag}">
        ${tag === "ALL" ? "✦ ALL WORKS" : tag}
      </button>
    `).join("");

    filterContainer.querySelectorAll(".ag-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.tag;
        filterContainer.querySelectorAll(".ag-filter-btn").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderArtworks(activeFilter);
      });
    });
  }

  /* -------------------------------------------------------------------------
     3. RENDER VISUALS STRIP (HANGING STRING LINE)
     ------------------------------------------------------------------------- */
  function renderVisuals() {
    if (!visualsTrack || !visuals) return;

    visualsTrack.innerHTML = visuals.map((item, idx) => `
      <div class="ag-photo-pin" style="transform: rotate(${item.rotation || '0deg'});" data-vis-id="${item.id}" tabindex="0" role="button" aria-label="Visual snapshot: ${item.title}">
        <!-- SVG Binder Clip -->
        <svg class="ag-clip-icon" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7 16V6C7 3.5 9 1.5 11.5 1.5H16.5C19 1.5 21 3.5 21 6V16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M9 16V9C9 7.5 10.5 6 12 6H16C17.5 6 19 7.5 19 9V16" stroke="#222222" stroke-width="2"/>
          <rect x="2" y="14" width="24" height="22" rx="3" fill="${item.clipColor || '#b5587f'}" stroke="#141115" stroke-width="2"/>
          <circle cx="14" cy="25" r="4" fill="#ffffff" opacity="0.4"/>
        </svg>
        <figure class="ag-photo-card">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <figcaption>${item.title}</figcaption>
          <small>${item.caption}</small>
        </figure>
      </div>
    `).join("");
  }

  /* -------------------------------------------------------------------------
     4. LIGHTBOX MODAL & KEYBOARD NAV
     ------------------------------------------------------------------------- */
  function openLightbox(artId) {
    lastFocusedElement = document.activeElement;
    currentModalIndex = artworks.findIndex(a => a.id === artId);
    if (currentModalIndex === -1) currentModalIndex = 0;

    updateLightboxContent();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus close button for accessibility
    setTimeout(() => btnClose.focus(), 50);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function updateLightboxContent() {
    const art = artworks[currentModalIndex];
    if (!art) return;

    modalImg.src = art.image;
    modalImg.alt = `${art.title} - ${art.medium}`;
    modalTitle.textContent = art.title;
    modalBadge.textContent = art.tag;
    modalYear.textContent = art.year;
    modalDim.textContent = art.dimensions || "Dimensions variable";
    modalDesc.textContent = art.description;
    modalCounter.textContent = `${currentModalIndex + 1} / ${artworks.length}`;
  }

  function nextArtwork() {
    currentModalIndex = (currentModalIndex + 1) % artworks.length;
    updateLightboxContent();
  }

  function prevArtwork() {
    currentModalIndex = (currentModalIndex - 1 + artworks.length) % artworks.length;
    updateLightboxContent();
  }

  // Event Listeners for Lightbox
  if (btnClose) btnClose.addEventListener("click", closeLightbox);
  if (btnNext) btnNext.addEventListener("click", nextArtwork);
  if (btnPrev) btnPrev.addEventListener("click", prevArtwork);

  // Click outside panel to close
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Global Keyboard Navigation (Escape, ArrowLeft, ArrowRight)
  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextArtwork();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevArtwork();
    }
  });

  /* -------------------------------------------------------------------------
     5. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ------------------------------------------------------------------------- */
  function setupScrollReveals() {
    if (isReduced || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("ag-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.15
    });

    document.querySelectorAll(".ag-reveal").forEach(el => observer.observe(el));
  }

  /* -------------------------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------------------------- */
  renderFilterBar();
  renderArtworks("ALL");
  renderVisuals();

})();
