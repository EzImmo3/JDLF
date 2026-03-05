let poems = [];

fetch("poems/poems.json")
  .then(r => r.json())
  .then(data => {
    poems = data.sort((a, b) => a.ordre - b.ordre);
    renderList();
  });

const listSection = document.getElementById("list-section");
const poemSection = document.getElementById("poem-section");
const favSection = document.getElementById("fav-section");
const topSection = document.getElementById("top-section");
const authorSection = document.getElementById("author-section");

const poemListEl = document.getElementById("poemList");
const favListEl = document.getElementById("favList");
const topListEl = document.getElementById("topList");

const poemTitleEl = document.getElementById("poemTitle");
const poemMetaEl = document.getElementById("poemMeta");
const poemContentEl = document.getElementById("poemContent");
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const viewCountEl = document.getElementById("viewCount");
const favBtn = document.getElementById("favBtn");
const favCountEl = document.getElementById("favCount");
const backBtn = document.getElementById("backBtn");

const immersiveOverlay = document.getElementById("immersive-overlay");
const immTitleEl = document.getElementById("immTitle");
const immContentEl = document.getElementById("immContent");
const immersiveBtn = document.getElementById("immersiveBtn");
const closeImmersiveBtn = document.getElementById("closeImmersive");
const immPrev = document.getElementById("immPrev");
const immNext = document.getElementById("immNext");

const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

const goFavBtn = document.getElementById("goFav");
const goTopBtn = document.getElementById("goTop");
const goAuthorBtn = document.getElementById("goAuthor");
const backFavBtn = document.getElementById("backFav");
const backTopBtn = document.getElementById("backTop");
const backAuthorBtn = document.getElementById("backAuthor");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentPoem = null;
let favorites = {}; // Favoris restent locaux pour l'instant

/* --- Firebase helpers --- */
function incrementViews(poemId) {
  const ref = db.ref("poems/" + poemId + "/views");
  ref.transaction(v => (v || 0) + 1);
}

function incrementLikes(poemId) {
  const ref = db.ref("poems/" + poemId + "/likes");
  ref.transaction(v => (v || 0) + 1);
}

function loadStats(poemId) {
  db.ref("poems/" + poemId).on("value", snapshot => {
    const data = snapshot.val() || {};
    likeCountEl.textContent = data.likes || 0;
    viewCountEl.textContent = data.views || 0;
  });
}

/* --- Rendering --- */
function renderList() {
  poemListEl.innerHTML = "";
  poems.forEach(p => {
    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `<h3>${p.titre}</h3>`;
    card.addEventListener("click", () => openPoem(p.id));
    poemListEl.appendChild(card);
  });
}

function showScreen(section) {
  [listSection, poemSection, favSection, topSection, authorSection].forEach(s =>
    s.classList.remove("active")
  );
  section.classList.add("active");
}

/* --- Navigation --- */
backBtn.addEventListener("click", () => showScreen(listSection));
backFavBtn.addEventListener("click", () => showScreen(listSection));
backTopBtn.addEventListener("click", () => showScreen(listSection));
backAuthorBtn.addEventListener("click", () => showScreen(listSection));

goFavBtn.addEventListener("click", () => {
  renderFavorites();
  showScreen(favSection);
});

goTopBtn.addEventListener("click", () => {
  renderTopPoems();
  showScreen(topSection);
});

goAuthorBtn.addEventListener("click", () => showScreen(authorSection));

/* --- Poem opening --- */
function openPoem(id) {
  const poem = poems.find(p => p.id === id);
  if (!poem) return;
  currentPoem = poem;

  poemTitleEl.textContent = poem.titre;
  poemMetaEl.textContent = `Poème ${poem.ordre}`;
  poemContentEl.textContent = poem.contenu;

  // 🔥 Firebase
  incrementViews(id);
  loadStats(id);

  showScreen(poemSection);
}

/* --- Likes --- */
likeBtn.addEventListener("click", () => {
  const id = currentPoem.id;
  incrementLikes(id);
});

/* --- Favorites (local) --- */
function updateFavButton() {
  const state = favorites[currentPoem.id];
  favBtn.style.background = state.saved ? "gold" : "var(--accent-soft)";
  favBtn.style.color = state.saved ? "#000" : "var(--accent)";
}

favBtn.addEventListener("click", () => {
  const id = currentPoem.id;
  if (!favorites[id]) favorites[id] = { count: 0, saved: false };

  const state = favorites[id];
  state.saved = !state.saved;
  state.count += state.saved ? 1 : -1;

  favCountEl.textContent = state.count;
  updateFavButton();
});

function renderFavorites() {
  favListEl.innerHTML = "";
  const favIds = Object.keys(favorites).filter(id => favorites[id].saved);

  if (favIds.length === 0) {
    favListEl.innerHTML = "<p>Aucun poème en favori pour le moment.</p>";
    return;
  }

  favIds.forEach(id => {
    const poem = poems.find(p => p.id === id);
    if (!poem) return;

    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `<h3>${poem.titre}</h3>`;
    card.addEventListener("click", () => openPoem(poem.id));

    favListEl.appendChild(card);
  });
}

/* --- Top Poèmes (likes Firebase) --- */
function renderTopPoems() {
  topListEl.innerHTML = "";

  poems.forEach(poem => {
    const card = document.createElement("article");
    card.className = "poem-card-mini";
    card.innerHTML = `
      <h3>${poem.titre}</h3>
      <p class="meta">❤️ <span id="top-${poem.id}">0</span> likes</p>
    `;
    card.addEventListener("click", () => openPoem(poem.id));
    topListEl.appendChild(card);

    // 🔥 Charger les likes en temps réel
    db.ref("poems/" + poem.id + "/likes").on("value", snapshot => {
      document.getElementById("top-" + poem.id).textContent = snapshot.val() || 0;
    });
  });
}

/* --- Navigation entre poèmes --- */
prevBtn.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index > 0) openPoem(poems[index - 1].id);
});

nextBtn.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index < poems.length - 1) openPoem(poems[index + 1].id);
});

/* --- Immersive mode --- */
immersiveBtn.addEventListener("click", () => {
  immTitleEl.textContent = currentPoem.titre;
  immContentEl.textContent = currentPoem.contenu;
  immersiveOverlay.classList.add("active");
});

closeImmersiveBtn.addEventListener("click", () => {
  immersiveOverlay.classList.remove("active");
});

immPrev.addEventListener("click", () => {
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index > 0) {
    openPoem(poems[index - 1].id);
    immersiveBtn.click();
  }
});

immNext.addEventListener("click", () => {
  const index = poems.findIndex(p => p)
})