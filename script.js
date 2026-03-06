let poems = [];

fetch("./poems/poems.json")
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
let favorites = {}; // Favoris restent locaux

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
  const index = poems.findIndex(p => p.id === currentPoem.id);
  if (index < poems.length - 1) {
    openPoem(poems[index + 1].id);
    immersiveBtn.click();
    }
});

/* --- Copier et Partager --- */
copyBtn.addEventListener("click", async () => {
  const text = `${currentPoem.titre}\n\n${currentPoem.contenu}`;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copié ✔";
  setTimeout(() => (copyBtn.textContent = "Copier"), 1500);
});

shareBtn.addEventListener("click", async () => {
  const text = `${currentPoem.titre}\n\n${currentPoem.contenu}`;
  if (navigator.share) {
    await navigator.share({ title: currentPoem.titre, text });
  } else {
    await navigator.clipboard.writeText(text);
    shareBtn.textContent = "Copié ✔";
    setTimeout(() => (shareBtn.textContent = "Partager"), 1500);
  }
});

/* --- Thème clair/sombre --- */
(function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
    toggleThemeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.add(prefersDark ? "dark" : "light");
    toggleThemeBtn.textContent = prefersDark ? "☀️" : "🌙";
  }
})();

toggleThemeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    localStorage.setItem("theme", "light");
    toggleThemeBtn.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    toggleThemeBtn.textContent = "☀️";
  }
});

/* --- Fond animé (canvas) --- */
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 3 + 1,
  dx: (Math.random() - 0.5) * 1,
  dy: (Math.random() - 0.5) * 1
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,200,255,0.5)";
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

