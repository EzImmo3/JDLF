let poems = [];

fetch("poems/poems.json")
  .then(r => r.json())
  .then(data => {
    poems = data.sort((a, b) => a.ordre - b.ordre);
    renderList();
  });

const listSection = document.getElementById("list-section");
const poemSection = document.getElementById("poem-section");
const poemListEl = document.getElementById("poemList");

const poemTitleEl = document.getElementById("poemTitle");
const poemMetaEl = document.getElementById("poemMeta");
const poemContentEl = document.getElementById("poemContent");
const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const viewCountEl = document.getElementById("viewCount");
const backBtn = document.getElementById("backBtn");

const immersiveOverlay = document.getElementById("immersive-overlay");
const immTitleEl = document.getElementById("immTitle");
const immContentEl = document.getElementById("immContent");
const immersiveBtn = document.getElementById("immersiveBtn");
const closeImmersiveBtn = document.getElementById("closeImmersive");

const copyBtn = document.getElementById("copyBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

const LIKE_KEY = "poem_likes";
const VIEW_KEY = "poem_views";

function loadMap(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function saveMap(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

let likes = loadMap(LIKE_KEY);
let views = loadMap(VIEW_KEY);
let currentPoem = null;

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
  [listSection, poemSection].forEach(s => s.classList.remove("active"));
  section.classList.add("active");
}

backBtn.addEventListener("click", () => showScreen(listSection));

function openPoem(id) {
  const poem = poems.find(p => p.id === id);
  currentPoem = poem;

  poemTitleEl.textContent = poem.titre;
  poemMetaEl.textContent = `Poème ${poem.ordre}`;
  poemContentEl.textContent = poem.contenu;

  views[id] = (views[id] || 0) + 1;
  saveMap(VIEW_KEY, views);
  viewCountEl.textContent = views[id];

  if (!likes[id]) likes[id] = { count: 0, liked: false };
  likeCountEl.textContent = likes[id].count;
  updateLikeButton();

  showScreen(poemSection);
}

function updateLikeButton() {
  const state = likes[currentPoem.id];
  likeBtn.style.background = state.liked ? "var(--accent)" : "var(--accent-soft)";
  likeBtn.style.color = state.liked ? "#fff" : "var(--accent)";
}

likeBtn.addEventListener("click", () => {
  const id = currentPoem.id;
  const state = likes[id];

  state.liked = !state.liked;
  state.count += state.liked ? 1 : -1;

  likeCountEl.textContent = state.count;
  saveMap(LIKE_KEY, likes);
  updateLikeButton();
});

immersiveBtn.addEventListener("click", () => {
  immTitleEl.textContent = currentPoem.titre;
  immContentEl.textContent = currentPoem.contenu;
  immersiveOverlay.classList.add("active");
});

closeImmersiveBtn.addEventListener("click", () => {
  immersiveOverlay.classList.remove("active");
});

copyBtn.addEventListener("click", async () => {
  const text = `${currentPoem.titre}\n\n${currentPoem.contenu}`;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copié ✔";
  setTimeout(() => (copyBtn.textContent = "Copier"), 1500);
});

const THEME_KEY = "poem_theme";
if (localStorage.getItem(THEME_KEY) === "light") {
  document.body.classList.add("light");
  toggleThemeBtn.textContent = "🌙";
}

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  toggleThemeBtn.textContent = isLight ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
});

/* Fond animé */
const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.6 + 0.2
    });
  }
}

function animateParticles() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width) p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(148,163,184,${p.alpha})`;
    bgCtx.fill();
  });

  requestAnimationFrame(animateParticles);
}

createParticles();
animateParticles();
