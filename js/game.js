/* =========================================================
   game.js
   "Save the Birthday Hearts" — a custom canvas mini-game.
   Catch falling love/cake/sparkle items, avoid gussa bombs,
   nakhre clouds and "3 months salary" warnings.
   Supports mouse, keyboard, and touch/drag controls.
   ========================================================= */

(function () {
  "use strict";

  const stage = document.getElementById("gameStage");
  const canvas = document.getElementById("gameCanvas");
  if (!stage || !canvas) return;

  const ctx = canvas.getContext("2d");
  const basket = document.getElementById("gameBasket");
  const scoreEl = document.getElementById("gameScore");
  const comboEl = document.getElementById("gameCombo");
  const livesEl = document.getElementById("gameLives");
  const toastEl = document.getElementById("gameToast");
  const overlayStart = document.getElementById("gameOverlay");
  const overlayEnd = document.getElementById("gameOverOverlay");
  const overlayEndText = document.getElementById("gameOverText");
  const startBtn = document.getElementById("gameStartBtn");
  const restartBtn = document.getElementById("gameRestartBtn");
  const codeBox = document.getElementById("gameCode");
  const highScoreEl = document.getElementById("gameHighScore");
  const highNameEl = document.getElementById("gameHighName");
  const nameForm = document.getElementById("gameNameForm");
  const nameInput = document.getElementById("gameNameInput");
  const nameError = document.getElementById("gameNameError");
  const changePlayerBtn = document.getElementById("gameChangePlayerBtn");

  /* ---------- High score record (shared online, no database setup) ----------
     The record is one small JSON file kept on jsonblob.com (free, no account).
     Paste your blob ID below (one-time setup steps are in the chat). While
     the ID is empty, or if the network is down, the game falls back to this
     browser's localStorage so it keeps working. */
  const JSONBLOB_ID = ""; // e.g. "1234567890123456789"
  const RECORD_URL = JSONBLOB_ID
    ? "https://jsonblob.com/api/jsonBlob/" + encodeURIComponent(JSONBLOB_ID)
    : "";
  const JSON_HEADERS = { "Content-Type": "application/json", "Accept": "application/json" };
  const STORAGE_KEY = "vishiiGameRecord";
  const DEFAULT_HIGH_SCORE = 0;
  const DEFAULT_PLAYER_NAME = "\u2014"; // em dash = nobody yet
  const MAX_NAME_LENGTH = 12;
  const NET_TIMEOUT_MS = 4000;

  let highScore = DEFAULT_HIGH_SCORE;
  let gameUserName = DEFAULT_PLAYER_NAME;
  let currentPlayer = ""; // whoever is playing right now

  function applyRecord(rec) {
    if (rec && Number.isFinite(rec.highScore) && typeof rec.gameUserName === "string") {
      highScore = rec.highScore;
      gameUserName = rec.gameUserName.slice(0, MAX_NAME_LENGTH) || DEFAULT_PLAYER_NAME;
      return true;
    }
    return false;
  }

  function loadLocalRecord() {
    try {
      applyRecord(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (e) { /* storage blocked or corrupted: keep defaults */ }
  }

  function saveLocalRecord() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore, gameUserName }));
    } catch (e) { /* storage unavailable: ignore */ }
  }

  function fetchWithTimeout(url, options) {
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), NET_TIMEOUT_MS);
    return fetch(url, Object.assign({ cache: "no-store", signal: ctrl ? ctrl.signal : undefined }, options))
      .finally(() => clearTimeout(timer));
  }

  async function fetchRemote() {
    const res = await fetchWithTimeout(RECORD_URL, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  // Pull the shared record from the server (no-op if not configured/offline).
  async function refreshRecord() {
    if (!RECORD_URL) return;
    try {
      if (applyRecord(await fetchRemote())) saveLocalRecord();
      updateHUD();
    } catch (e) { /* offline: keep what we have */ }
  }

  // Push a new record. This service has no rules engine, so we re-read the
  // latest record right before writing and only overwrite it if we're higher.
  async function saveRecord() {
    saveLocalRecord();
    if (!RECORD_URL) return;
    const mine = { highScore, gameUserName };
    try {
      const latest = await fetchRemote();
      if (latest && Number.isFinite(latest.highScore) && latest.highScore >= mine.highScore) {
        applyRecord(latest); // someone beat us in the meantime: show theirs
        saveLocalRecord();
        updateHUD();
        return;
      }
      await fetchWithTimeout(RECORD_URL, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(mine)
      });
    } catch (e) { /* offline: record stays local until next win */ }
  }

  const GOOD = [
    { emoji: "❤️", points: 10, message: "+1 Love ❤️" },
    { emoji: "💗", points: 10, message: "+1 Love 💗" },
    { emoji: "🎂", points: 15, message: "Birthday calories don't count today. 🎂" },
    { emoji: "✨", points: 5, message: "+Sparkle ✨" }
  ];
  const BAD = [
    { emoji: "😂", message: "OH NO. RUN. 😂", type: "gussa" },
    { emoji: "😤", message: "Nakhre incoming... 😤", type: "nakhre" },
    { emoji: "💢", message: "3 MONTHS SALARY 💢", type: "salary" }
  ];

  const lowPower = window.VishiiEffects && window.VishiiEffects.isLowPower;

  let w, h, dpr;
  let items = [];
  let basketX = 0.5; // 0..1 fraction of width
  let score = 0;
  let combo = 1;
  let lives = 3;
  let level = 1;
  let spawnTimer = 0;
  let spawnInterval = 70; // frames
  let running = false;
  let rafId = null;
  let keysDown = {};
  let typedBuffer = "";
  let eggUnlocked = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = stage.clientWidth;
    h = stage.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function resetState() {
    items = [];
    score = 0;
    combo = 1;
    lives = 3;
    level = 1;
    spawnTimer = 0;
    spawnInterval = 70;
    basketX = 0.5;
    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    comboEl.textContent = "x" + combo;
    livesEl.textContent = lives;
    highScoreEl.textContent = highScore;
    highNameEl.textContent = gameUserName;
    highNameEl.title = gameUserName;
  }

  loadLocalRecord();
  updateHUD();
  refreshRecord();
  // keep the HUD fresh while the page is open and no game is running
  setInterval(() => { if (!running && !document.hidden) refreshRecord(); }, 30000);

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("is-visible"), 900);
  }

  function spawnItem() {
    const isBad = Math.random() < Math.min(0.2 + level * 0.03, 0.4);
    const pool = isBad ? BAD : GOOD;
    const def = pool[Math.floor(Math.random() * pool.length)];
    items.push({
      x: Math.random() * (w - 40) + 20,
      y: -30,
      vy: (1.4 + level * 0.18) * (lowPower ? 0.85 : 1),
      size: 30 + Math.random() * 10,
      def,
      isBad,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 4
    });
  }

  function collide(item) {
    const bx = basketX * w;
    const by = h * 0.92;
    const dx = item.x - bx;
    const dy = item.y - by;
    return Math.sqrt(dx * dx + dy * dy) < item.size * 0.6 + 26;
  }

  function screenShake() {
    stage.style.transform = "translateX(-6px)";
    setTimeout(() => (stage.style.transform = "translateX(6px)"), 60);
    setTimeout(() => (stage.style.transform = ""), 120);
  }

  function update() {
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnItem();
    }

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.vy;
      it.rotation += it.rotSpeed;

      if (collide(it)) {
        items.splice(i, 1);
        if (it.isBad) {
          lives--;
          combo = 1;
          screenShake();
          showToast(it.def.message);
          if (lives <= 0) {
            endGame();
            return;
          }
        } else {
          score += it.def.points * combo;
          combo = Math.min(combo + 1, 9);
          showToast(it.def.message);
        }
        updateHUD();
        continue;
      }

      if (it.y > h + 40) {
        items.splice(i, 1);
        if (!it.isBad) combo = 1; // missed love item resets combo
        updateHUD();
      }
    }

    // difficulty ramps with score
    level = 1 + Math.floor(score / 120);
    spawnInterval = Math.max(28, 70 - level * 4);

    basket.style.left = (basketX * 100) + "%";
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    items.forEach((it) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate((it.rotation * Math.PI) / 180);
      ctx.font = it.size + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(it.def.emoji, 0, 0);
      ctx.restore();
    });
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    refreshRecord(); // grab the latest shared record in the background
    resetState();
    overlayStart.hidden = true;
    overlayEnd.hidden = true;
    codeBox.hidden = true;
    running = true;
    loop();
  }

  async function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    const finalScore = score;
    const enoughLove = finalScore >= 150;

    overlayEndText.textContent = "Checking the leaderboard\u2026 \u23f3";
    overlayEnd.hidden = false;

    await refreshRecord(); // compare against the newest shared record

    const isNewRecord = finalScore > highScore;
    if (isNewRecord) {
      highScore = finalScore;
      gameUserName = currentPlayer;
      updateHUD();
      saveRecord(); // fire and forget
    }
    overlayEndText.textContent = (isNewRecord ? "\ud83c\udfc6 NEW HIGH SCORE, " + currentPlayer + "! " : "") + (enoughLove
      ? "Congratulations! You have successfully collected enough love for MANITA. ❤️  Score: " + finalScore
      : "Hmm... clearly you need more practice loving the birthday girl. 😂  Score: " + finalScore);
  }

  function cleanName(raw) {
    // collapse whitespace, strip control chars, cap length
    return raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
  }

  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = cleanName(nameInput.value);
    if (!name) {
      nameError.textContent = "Please enter your name first. \ud83d\ude0a";
      nameInput.focus();
      return;
    }
    nameError.textContent = "";
    currentPlayer = name;
    startGame();
  });
  nameInput.addEventListener("input", () => { nameError.textContent = ""; });

  // Play Again keeps the same player; Change player returns to name entry.
  restartBtn.addEventListener("click", startGame);
  changePlayerBtn.addEventListener("click", () => {
    overlayEnd.hidden = true;
    overlayStart.hidden = false;
    nameInput.value = "";
    nameInput.focus();
  });

  /* ---------- Controls: mouse ---------- */
  stage.addEventListener("mousemove", (e) => {
    if (!running) return;
    const rect = stage.getBoundingClientRect();
    basketX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  });

  /* ---------- Controls: touch / drag ---------- */
  stage.addEventListener("touchmove", (e) => {
    if (!running) return;
    const rect = stage.getBoundingClientRect();
    const touch = e.touches[0];
    basketX = Math.min(1, Math.max(0, (touch.clientX - rect.left) / rect.width));
    e.preventDefault();
  }, { passive: false });

  /* ---------- Controls: keyboard ---------- */
  window.addEventListener("keydown", (e) => {
    // typing a name must not move the basket or feed the birthday-code buffer
    if (e.target === nameInput) return;
    if (e.key === "ArrowLeft") keysDown.left = true;
    if (e.key === "ArrowRight") keysDown.right = true;

    // Easter egg: typing the birthday code anywhere unlocks an animation
    if (/^[0-9]$/.test(e.key)) {
      typedBuffer = (typedBuffer + e.key).slice(-8);
      if (typedBuffer === "13102003" && !eggUnlocked) {
        eggUnlocked = true;
        unlockBirthdayCode();
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keysDown.left = false;
    if (e.key === "ArrowRight") keysDown.right = false;
  });

  function keyboardLoop() {
    if (running) {
      if (keysDown.left) basketX = Math.max(0, basketX - 0.015);
      if (keysDown.right) basketX = Math.min(1, basketX + 0.015);
    }
    requestAnimationFrame(keyboardLoop);
  }
  requestAnimationFrame(keyboardLoop);

  function unlockBirthdayCode() {
    codeBox.hidden = false;
    if (window.VishiiEffects && window.VishiiEffects.fireFinaleBurst) {
      // small confetti moment reusing finale burst visuals if available
    }
    if (window.showEggToast) {
      window.showEggToast("Birthday code accepted! 🎉");
    }
  }
})();
