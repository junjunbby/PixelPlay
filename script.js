/* ================================================================
   PIXELPLAY – SCRIPT
   Struktur:
   1. Spieldaten (Platzhalter – hier eigene Spiele eintragen)
   2. Kategorie-Definitionen (Label + Emoji fürs Filter-UI)
   3. State
   4. Render-Funktionen (Hero, Filter-Leiste, Grid)
   5. Filter-/Such-Logik
   6. Toast-Helper
   7. Init
================================================================= */


/* ---------- 1. Spieldaten ----------
   Jedes Spiel-Objekt kann folgende Felder haben:
   - id           : eindeutiger String
   - title        : Titel
   - category     : muss zu einem "value" aus CATEGORIES passen
   - description  : kurzer Text (1 Satz), wird im Hero genutzt
   - emoji        : Platzhalter-Icon fürs Cover (bis echte Bilder da sind)
   - accentA/B    : zwei Hex-Farben für den Gradient-Platzhalter & Glow
   - rating       : Zahl 0–5
   - plays        : Anzeige-Text, z.B. "1.2M"
   - featured     : true = wird im Hero-Banner als "Spiel des Tages" gezeigt
   - image        : OPTIONAL – Pfad zu einem echten Cover-Bild.
                    Ist "image" gesetzt, wird automatisch ein <img> statt
                    des Emoji-Platzhalters gerendert (siehe buildThumbHTML).
                    Beispiel: image: "images/void-raiders.jpg"
*/
const games = [
  {
    id: "void-raiders",
    title: "Void Raiders",
    category: "multiplayer",
    description: "Kämpfe mit bis zu 32 Spielern um die letzte Raumstation im Void-Sektor.",
    emoji: "🚀",
    accentA: "#2563ff",
    accentB: "#23d9e8",
    rating: 4.8,
    plays: "2.1M",
    featured: true,
  },
  {
    id: "neon-drift",
    title: "Neon Drift",
    category: "auto",
    description: "Drifte durch eine Cyberpunk-Metropole und jage die Bestzeit.",
    emoji: "🏎️",
    accentA: "#7c5cfc",
    accentB: "#ff4d9d",
    rating: 4.6,
    plays: "128K",
  },
  {
    id: "pixel-dungeon-quest",
    title: "Pixel Dungeon Quest",
    category: "adventure",
    description: "Erkunde zufällig generierte Dungeons im 16-Bit-Look – stirb, lerne, versuch's nochmal.",
    emoji: "🗝️",
    accentA: "#ff8a3d",
    accentB: "#ff4d4d",
    rating: 4.4,
    plays: "87K",
  },
  {
    id: "block-blitz",
    title: "Block Blitz",
    category: "puzzle",
    description: "Räume Blöcke, bevor der Stapel die Decke erreicht. Schnell, bunt, süchtig machend.",
    emoji: "🧩",
    accentA: "#c6f135",
    accentB: "#23d9a8",
    rating: 4.5,
    plays: "340K",
  },
  {
    id: "shadow-strike",
    title: "Shadow Strike",
    category: "action",
    description: "Schleiche, springe und schlage dich als Ninja durch feindliche Festungen.",
    emoji: "🥷",
    accentA: "#ff3d6e",
    accentB: "#2a1b5d",
    rating: 4.7,
    plays: "512K",
  },
  {
    id: "turbo-kart-arena",
    title: "Turbo Kart Arena",
    category: "auto",
    description: "Items, Abkürzungen, Chaos: Kart-Rennen für bis zu 8 Spieler.",
    emoji: "🏁",
    accentA: "#ffc93d",
    accentB: "#ff8a3d",
    rating: 4.3,
    plays: "95K",
  },
  {
    id: "sumo-smash",
    title: "Sumo Smash",
    category: "multiplayer",
    description: "Physik-Duelle in der Arena – wirf deine Gegner aus dem Ring.",
    emoji: "🤼",
    accentA: "#ff6b6b",
    accentB: "#ffc93d",
    rating: 4.6,
    plays: "210K",
  },
  {
    id: "galaxy-defenders",
    title: "Galaxy Defenders",
    category: "action",
    description: "Verteidige dein Sonnensystem in diesem Tower-Defense im Weltraum.",
    emoji: "🛸",
    accentA: "#7c5cfc",
    accentB: "#23d9e8",
    rating: 4.5,
    plays: "176K",
  },
];


/* ---------- 2. Kategorie-Definitionen ----------
   "value" muss exakt zu games[].category passen.
   Neue Kategorie hinzufügen = hier einen Eintrag ergänzen, fertig. */
const CATEGORIES = [
  { value: "alle", label: "Alle", emoji: "🎮" },
  { value: "action", label: "Action", emoji: "⚔️" },
  { value: "auto", label: "Auto", emoji: "🏎️" },
  { value: "multiplayer", label: "Multiplayer", emoji: "👥" },
  { value: "puzzle", label: "Puzzle", emoji: "🧩" },
  { value: "adventure", label: "Adventure", emoji: "🗺️" },
];


/* ---------- 3. State ---------- */
const state = {
  category: "alle",
  search: "",
};


/* ---------- 4. Render-Funktionen ---------- */

// Baut das Innere einer Cover-Kachel: echtes Bild falls vorhanden,
// sonst Farbverlauf + Emoji als Platzhalter.
function buildThumbHTML(game) {
  if (game.image) {
    return `<img src="${game.image}" alt="${game.title}" loading="lazy" />`;
  }
  return `<span aria-hidden="true">${game.emoji}</span>`;
}

function renderFeatured() {
  const hero = document.getElementById("featuredHero");
  const game = games.find((g) => g.featured) || games[0];
  if (!game) return;

  // Blob-Farben im Hero an das Spiel des Tages anpassen
  hero.style.setProperty("--blob-a", game.accentA);
  hero.style.setProperty("--blob-b", game.accentB);

  hero.innerHTML = `
    <div class="hero-inner">
      <div>
        <span class="hero-badge">🔥 Spiel des Tages</span>
        <h1 class="hero-title">${game.title}</h1>
        <p class="hero-desc">${game.description}</p>
        <div class="hero-meta">
          <span>⭐ ${game.rating.toFixed(1)}</span>
          <span>👁️ ${game.plays} gespielt</span>
          <span>🏷️ ${categoryLabel(game.category)}</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" data-play="${game.id}">
            ▶ Jetzt spielen
          </button>
          <button class="btn btn-secondary" type="button" data-info="${game.id}">
            Mehr erfahren
          </button>
        </div>
      </div>
      <div class="hero-cover" style="--blob-a:${game.accentA}; --blob-b:${game.accentB};">
        ${buildThumbHTML(game)}
      </div>
    </div>
  `;

  hero.querySelector("[data-play]").addEventListener("click", () => {
    showToast(`🎮 ${game.title} wird geladen … (Platzhalter-Link)`);
  });
  hero.querySelector("[data-info]").addEventListener("click", () => {
    showToast(`ℹ️ ${game.description}`);
  });
}

function renderFilterBar() {
  const bar = document.getElementById("filterBar");
  bar.innerHTML = CATEGORIES.map(
    (cat) => `
      <button
        class="filter-btn${cat.value === state.category ? " is-active" : ""}"
        type="button"
        data-category="${cat.value}"
      >
        <span aria-hidden="true">${cat.emoji}</span> ${cat.label}
      </button>
    `
  ).join("");

  bar.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      renderFilterBar(); // aktiven Button neu markieren
      renderGrid();
    });
  });
}

function renderGrid() {
  const grid = document.getElementById("gamesGrid");
  const noResults = document.getElementById("noResults");
  const gridTitle = document.getElementById("gridTitle");
  const gameCount = document.getElementById("gameCount");

  const filtered = getFilteredGames();

  gridTitle.textContent =
    state.category === "alle" ? "Alle Spiele" : categoryLabel(state.category);
  gameCount.textContent = `${filtered.length} Spiel${filtered.length === 1 ? "" : "e"}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;

  grid.innerHTML = filtered
    .map(
      (game) => `
      <button
        class="game-card"
        type="button"
        data-play="${game.id}"
        style="--card-accent:${game.accentA}; --thumb-a:${game.accentA}; --thumb-b:${game.accentB};"
      >
        <div class="card-thumb">
          ${buildThumbHTML(game)}
          <div class="card-play">
            <span class="card-play-icon">▶</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${game.title}</h3>
          <div class="card-meta">
            <span class="card-badge">${categoryLabel(game.category)}</span>
            <span class="card-stats">⭐ ${game.rating.toFixed(1)}</span>
          </div>
        </div>
      </button>
    `
    )
    .join("");

  grid.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const game = games.find((g) => g.id === card.dataset.play);
      showToast(`🎮 ${game.title} wird geladen … (Platzhalter-Link)`);
    });
  });
}


/* ---------- 5. Filter-/Such-Logik ---------- */
function getFilteredGames() {
  return games.filter((game) => {
    const matchesCategory =
      state.category === "alle" || game.category === state.category;
    const matchesSearch = game.title
      .toLowerCase()
      .includes(state.search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function categoryLabel(value) {
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}


/* ---------- 6. Toast-Helper ---------- */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}


/* ---------- 7. Init ---------- */
function init() {
  renderFeatured();
  renderFilterBar();
  renderGrid();

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderGrid();
  });
}

document.addEventListener("DOMContentLoaded", init);
