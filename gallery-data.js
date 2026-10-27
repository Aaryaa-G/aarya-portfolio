/**
 * gallery-data.js
 * Art Gallery Artwork and Visuals Data
 * 
 * To add or replace artwork:
 * 1. Place your image in assets/paintings/ (or any URL/path).
 * 2. Update or add an entry in the `artworks` array below with:
 *    - title: Title of your piece
 *    - medium: Materials used (e.g., "Acrylic on canvas", "Oil & pastel")
 *    - year: Year created (e.g., "2024")
 *    - dimensions: Physical size (e.g., "50 × 70 cm")
 *    - description: Short story or concept behind the piece
 *    - image: Path to your image file
 *    - orientation: "tall" | "wide" | "square" (determines masonry tile sizing)
 *    - tag: Category tag (e.g., "PAINTING", "MIXED MEDIA", "BOTANICAL", "GLITCH ART")
 */

const galleryData = {
  header: {
    handle: "@aaryagojare",
    name: "Aarya Gojare",
    role: "engineer · artist · wanderer",
    kicker: "welcome to my",
    title: "ART GALLERY",
    quote: "the act of creating something is always more important than the result",
    verticalLabel: "EXHIBITION 2024",
    bio: "Where satellite orbits meet wet paint. A quiet corner of acrylic washes, gouache skies, botanical presses, and paper collages made between firmware commits."
  },
  artworks: [
    {
      id: "art-01",
      title: "After the Rain",
      medium: "Acrylic & Gouache on Canvas",
      year: "2024",
      dimensions: "50 × 70 cm",
      description: "A soft study of colour returning to rain-washed Mumbai streets — lilac reflections in asphalt puddles and warm sodium lamp glows.",
      image: "assets/paintings/01.svg",
      orientation: "tall",
      tag: "PAINTING",
      palette: ["#B5587F", "#F7DCE5", "#34204F", "#FFC49B"]
    },
    {
      id: "art-02",
      title: "Lavender Orbit",
      medium: "Gouache on Archival Paper",
      year: "2024",
      dimensions: "60 × 40 cm",
      description: "Lilac skies, a crescent moon, and the quiet sensation of tuning into distant satellite telemetry on a cool terrace.",
      image: "assets/paintings/02.svg",
      orientation: "wide",
      tag: "GOUACHE",
      palette: ["#9B5DE5", "#FFC2E2", "#1E1347", "#FFE3F4"]
    },
    {
      id: "art-03",
      title: "Quiet Geometry",
      medium: "Mixed Media & Paper Collage",
      year: "2023",
      dimensions: "45 × 45 cm",
      description: "Architectural paper cutouts, graphite grid lines, and muted blush washes holding an unexpected amount of stillness.",
      image: "assets/paintings/03.svg",
      orientation: "square",
      tag: "COLLAGE",
      palette: ["#F9CC7C", "#B6D59F", "#4B2A86", "#FAF3EC"]
    },
    {
      id: "art-04",
      title: "Pink Noise & Frequencies",
      medium: "Watercolour & Indian Ink",
      year: "2023",
      dimensions: "42 × 59 cm",
      description: "A pastel audio spectrum painted during late-night receiver tests when static felt warmer than silence.",
      image: "assets/paintings/04.svg",
      orientation: "tall",
      tag: "WATERCOLOUR",
      palette: ["#FF6FAE", "#FFC2E2", "#7B4FC0", "#120A24"]
    },
    {
      id: "art-05",
      title: "Sunroom at Midday",
      medium: "Oil on Linen Board",
      year: "2023",
      dimensions: "70 × 50 cm",
      description: "Warm amber sunlight cutting across terracotta pots, monstera leaves, and an open sketchbook on a wooden table.",
      image: "assets/paintings/05.svg",
      orientation: "wide",
      tag: "OIL",
      palette: ["#D49A45", "#5F9A68", "#FFF8ED", "#8C5638"]
    },
    {
      id: "art-06",
      title: "Tide Notes & Shorelines",
      medium: "Ink, Charcoal & Chalk",
      year: "2022",
      dimensions: "40 × 40 cm",
      description: "A shoreline remembered in plum, cream and salt spray. Fluid textures borrowed from receding Arabian Sea foam.",
      image: "assets/paintings/06.svg",
      orientation: "square",
      tag: "MIXED MEDIA",
      palette: ["#4A1A60", "#A891E8", "#FFF3FA", "#6F9C68"]
    },
    {
      id: "art-07",
      title: "The Long Way Home",
      medium: "Acrylic & Pastel on Raw Canvas",
      year: "2022",
      dimensions: "55 × 75 cm",
      description: "A winding forest road for anyone who intentionally takes the scenic detour over the straight highway.",
      image: "assets/paintings/07.svg",
      orientation: "tall",
      tag: "PAINTING",
      palette: ["#3D7049", "#B6D59F", "#FFC49B", "#263B32"]
    },
    {
      id: "art-08",
      title: "First Light (Dawn Over Takeoff)",
      medium: "Gouache & Coloured Pencil",
      year: "2022",
      dimensions: "75 × 55 cm",
      description: "Peach, gold, and cold morning shadows caught in the fleeting twenty minutes before the city wakes up.",
      image: "assets/paintings/08.svg",
      orientation: "wide",
      tag: "GOUACHE",
      palette: ["#FFC49B", "#FF6FAE", "#4B2A86", "#FFE3C2"]
    },
    {
      id: "art-09",
      title: "Botanical Specimen No. 4",
      medium: "Pressed Flora & Linocut Print",
      year: "2024",
      dimensions: "35 × 50 cm",
      description: "Bougainvillea petals and delicate fern fronds pressed between heavy engineering textbooks and ink-printed.",
      image: "assets/paintings/09.svg",
      orientation: "tall",
      tag: "BOTANICAL",
      palette: ["#B5587F", "#8FB996", "#FAF3EC", "#5A1E38"]
    },
    {
      id: "art-10",
      title: "Cosmic Static & Radio Waves",
      medium: "SSTV Glitch Art & Oil Pastel",
      year: "2024",
      dimensions: "40 × 50 cm",
      description: "Decoded audio signals from amateur satellite passes layered with vibrant neon oil pastel gestures and scanlines.",
      image: "assets/paintings/10.svg",
      orientation: "tall",
      tag: "GLITCH ART",
      palette: ["#9B5DE5", "#FF6FAE", "#1E1347", "#FFD6F0"]
    },
    {
      id: "art-11",
      title: "Studio Corner at 2 AM",
      medium: "Charcoal & Gouache on Kraft",
      year: "2023",
      dimensions: "60 × 45 cm",
      description: "Copper antenna wire, half-drunk chai cups, loose sketches, and breadboards glowing under the warm anglepoise lamp.",
      image: "assets/paintings/11.svg",
      orientation: "wide",
      tag: "SKETCH",
      palette: ["#B98646", "#34204F", "#FAF3EC", "#D875A1"]
    },
    {
      id: "art-12",
      title: "Night Bloom",
      medium: "Acrylic on Circular Wood Panel",
      year: "2023",
      dimensions: "50 × 50 cm",
      description: "Deep velvet midnight petals radiating under an ultraviolet wash — a study in quiet nocturnal energy.",
      image: "assets/paintings/12.svg",
      orientation: "square",
      tag: "PAINTING",
      palette: ["#6B2D8B", "#FF6FAE", "#120A24", "#FFC2E2"]
    }
  ],
  visuals: [
    {
      id: "journey-01",
      title: "Mission Briefing",
      caption: "Research presentation & seminar",
      image: "assets/photos/journey-01.jpg",
      rotation: "-1.5deg",
      badge: "🛰 Briefing"
    },
    {
      id: "journey-02",
      title: "Ground Station & Lab",
      caption: "OBC telemetry debugging",
      image: "assets/photos/journey-02.jpg",
      rotation: "1.2deg",
      badge: "📡 Telemetry"
    },
    {
      id: "journey-03",
      title: "Felicitation Ceremony",
      caption: "Stage honors & certificate",
      image: "assets/photos/journey-03.jpg",
      rotation: "-0.8deg",
      badge: "🏆 Felicitation"
    },
    {
      id: "journey-04",
      title: "IN-SPACe Recognition",
      caption: "Ceremony with IN-SPACe official",
      image: "assets/photos/journey-04.jpg",
      rotation: "1.8deg",
      badge: "✦ IN-SPACe"
    },
    {
      id: "journey-05",
      title: "Star Party & Telescope",
      caption: "Astronomical observation field day",
      image: "assets/photos/journey-05.jpg",
      rotation: "-1.2deg",
      badge: "🔭 Astronomy"
    },
    {
      id: "journey-06",
      title: "Team Satellite Award",
      caption: "Stage recognition with faculty",
      image: "assets/photos/journey-06.jpg",
      rotation: "1.2deg",
      badge: "🏅 Team Excellence"
    },
    {
      id: "journey-07",
      title: "Avionics Guidance",
      caption: "Mentoring session with space scientist",
      image: "assets/photos/journey-07.jpg",
      rotation: "-1.6deg",
      badge: "🚀 Mentorship"
    },
    {
      id: "journey-08",
      title: "Workbench Traces",
      caption: "Logic analyzer & circuit testing",
      image: "assets/photos/journey-08.jpg",
      rotation: "1.0deg",
      badge: "⚡ Debugging"
    },
    {
      id: "journey-09",
      title: "Innovari Team",
      caption: "Innovari Team",
      image: "assets/photos/journey-09.jpg",
      rotation: "-1.4deg",
      badge: "★ Innovari Team"
    },
    {
      id: "journey-10",
      title: "Memento Reception",
      caption: "Stage memento & felicitation",
      image: "assets/photos/journey-10.jpg",
      rotation: "1.8deg",
      badge: "🎖 Stage Honor"
    }
  ]
};

// Expose globally
if (typeof window !== "undefined") {
  window.galleryData = galleryData;
}
