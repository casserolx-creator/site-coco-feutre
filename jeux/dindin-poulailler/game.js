"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const finalScreen = document.getElementById("finalScreen");
const playButton = document.getElementById("playButton");
const menuButton = document.getElementById("menuButton");
const replayButton = document.getElementById("replayButton");
const finalMenuButton = document.getElementById("finalMenuButton");
const soundButton = document.getElementById("soundButton");
const finalSoundButton = document.getElementById("finalSoundButton");
const soundButtons = [soundButton, finalSoundButton].filter(Boolean);
const levelLabel = document.getElementById("levelLabel");
const cleanBar = document.getElementById("cleanBar");
const cleanLabel = document.getElementById("cleanLabel");
const victoryBanner = document.getElementById("victoryBanner");
const padButtons = document.querySelectorAll(".mobile-pad button");

// Reglages principaux faciles a modifier pendant le polish.
const CLEAN_TARGET_PERCENT = 0.85;
const PLAYER_SPEED = 190;
const PLAYER_HITBOX_SIZE = { width: 30, height: 26 };
const CHICKEN_DIRT_INTERVAL = [13, 22];
const BRUSH_SOUND_COOLDOWN = 1700;

// Reglages audio faciles a ajuster pendant les tests.
const BRUSH_SOUNDS_ENABLED = true;
const BRUSH_SOUND_CHANCE = 0.26;
const COTCOT_SOUND_COOLDOWN = 6500;
const COTCOT_SOUND_CHANCE = 0.28;

// Parametres faciles a modifier.
const CONFIG = {
  maxLevels: 5, // nombre total de niveaux
  levelWidthStep: 170, // largeur ajoutee a chaque niveau
  levelHeightStep: 110, // hauteur ajoutee a chaque niveau
  dindinSpeed: PLAYER_SPEED, // vitesse de Dindin en pixels par seconde
  broomReach: 36, // distance de nettoyage devant Dindin
  broomSize: 34, // taille de la zone qui nettoie
  DINDIN_SCALE: 0.72, // taille affichee de Dindin
  DINDIN_HITBOX_WIDTH: PLAYER_HITBOX_SIZE.width, // collision plus petite que le sprite
  DINDIN_HITBOX_HEIGHT: PLAYER_HITBOX_SIZE.height, // collision centree vers les pieds
  CHICKEN_HITBOX_WIDTH: 24, // largeur de collision des poules
  CHICKEN_HITBOX_HEIGHT: 22, // hauteur de collision des poules
  obstacleSpacing: 74, // espace minimal entre gros obstacles
  haySpacing: 50, // espace minimal autour des bottes de foin
  cleanThreshold: CLEAN_TARGET_PERCENT, // seuil de proprete pour gagner le niveau
  baseDirtCount: 24, // quantite de salissures au niveau 1
  dirtPerLevel: 5, // salissures ajoutees a chaque niveau
  baseChickenCount: 4, // nombre de poules au niveau 1
  chickensPerLevel: 1, // poules ajoutees a chaque niveau
  maxChickenCount: 8,
  chickenSpeed: 26,
  chickenDirtDelay: CHICKEN_DIRT_INTERVAL, // delai en secondes avant nouvelle petite salissure
  maxChickenDirtPerLevel: 4,
  tileSize: 96,
};

const WORLD = {
  baseWidth: 960,
  baseHeight: 600,
  width: 960,
  height: 600,
  margin: 28,
};

const ASSETS = {
  dindin: "./assets/dindin-dindin.png",
  ground: makeSheetSprites("./assets/sols-dindin.png", 3, 2, 6),
  hay: makeSheetSprites("./assets/bottefoin-dindin.png", 5, 5, 25),
  coop: makeSheetSprites("./assets/cabane-dindin.png", 4, 4, 16),
  fence: makeSheetSprites("./assets/mur-dindin.png", 4, 5, 20),
  chicken: makeSheetSprites("./assets/poules-dindin.png", 3, 4, 10),
  dirt: makeSheetSprites("./assets/traces-dindin.png", 7, 4, 28),
};

const images = new Map();
let assetsReady = false;
let gameState = "menu";
let lastTime = 0;
let level = 1;
let celebrationTimer = 0;
let nextLevelTimer = 0;
let totalDirtCapacity = 1;
let currentCleanRatio = 0;
let lastCotcotSoundAt = 0;
let ambientCotcotTimer = 5;
const camera = {
  x: 0,
  y: 0,
};

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const player = {
  x: 120,
  y: 300,
  facingX: 1,
  facingY: 0,
  walkTime: 0,
  cleaningTimer: 0,
  isMoving: false,
};

let levelData = null;

function audio() {
  return window.DindinAudio || null;
}

function updateSoundButton() {
  const manager = audio();
  if (!manager) return;
  soundButtons.forEach((button) => {
    button.textContent = manager.isMuted() ? "SON OFF" : "SON ON";
  });
}

function hideAllScreens() {
  titleScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
}

function playRandomSound(names, options) {
  const manager = audio();
  if (manager) manager.playRandomSound(names, options);
}

function playBrushSound() {
  if (!BRUSH_SOUNDS_ENABLED || Math.random() > BRUSH_SOUND_CHANCE) return;
  const manager = audio();
  if (!manager) return;
  manager.playBrushSound({ cooldown: BRUSH_SOUND_COOLDOWN, maxDuration: 180, volume: 0.09 });
}

function maybePlayCotcotSound() {
  const now = Date.now();
  if (now - lastCotcotSoundAt < COTCOT_SOUND_COOLDOWN || Math.random() > COTCOT_SOUND_CHANCE) return;
  lastCotcotSoundAt = now;
  playRandomSound(["cotcot1", "cotcot2"], { volume: 0.18 });
}

function playVictorySound() {
  const manager = audio();
  if (!manager) return;
  manager.playSound("click", { volume: 0.35 });
}

function makeSheetSprites(sheet, columns, rows, count) {
  return Array.from({ length: count }, (_, index) => ({
    sheet,
    columns,
    rows,
    index,
  }));
}

function loadImage(path) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      images.set(path, image);
      resolve();
    };
    image.onerror = () => resolve();
    image.src = path;
  });
}

function loadAssets() {
  const paths = uniquePaths([
    ASSETS.dindin,
    ...ASSETS.ground,
    ...ASSETS.hay,
    ...ASSETS.coop,
    ...ASSETS.fence,
    ...ASSETS.chicken,
    ...ASSETS.dirt,
  ]);

  Promise.all(paths.map(loadImage)).then(() => {
    assetsReady = true;
  });
}

function assetPath(asset) {
  return typeof asset === "string" ? asset : asset.sheet;
}

function uniquePaths(assets) {
  return [...new Set(assets.map(assetPath))];
}

function img(asset) {
  return images.get(assetPath(asset));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function pick(list) {
  return list[randomInt(0, list.length - 1)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function configureWorldForLevel(nextLevel) {
  WORLD.width = WORLD.baseWidth + (nextLevel - 1) * CONFIG.levelWidthStep;
  WORLD.height = WORLD.baseHeight + (nextLevel - 1) * CONFIG.levelHeightStep;
}

function updateCamera() {
  camera.x = clamp(player.x - canvas.width / 2, 0, Math.max(0, WORLD.width - canvas.width));
  camera.y = clamp(player.y - canvas.height / 2, 0, Math.max(0, WORLD.height - canvas.height));
}

function distance(a, b, c, d) {
  const dx = a - c;
  const dy = b - d;
  return Math.hypot(dx, dy);
}

function rectsOverlap(a, b, pad = 0) {
  return !(
    a.x + a.w + pad < b.x ||
    b.x + b.w + pad < a.x ||
    a.y + a.h + pad < b.y ||
    b.y + b.h + pad < a.y
  );
}

function hitboxFor(x, y, width, height, offsetY = 0) {
  return {
    x: x - width / 2,
    y: y + offsetY - height / 2,
    w: width,
    h: height,
  };
}

function rectHitsRect(a, b) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

function hitboxesOverlap(a, b) {
  return rectHitsRect(a, b);
}

function isBlocked(x, y, width, height, ignoreChicken, offsetY = 0, blockChickens = true) {
  const box = hitboxFor(x, y, width, height, offsetY);

  if (
    box.x < WORLD.margin ||
    box.y < WORLD.margin ||
    box.x + box.w > WORLD.width - WORLD.margin ||
    box.y + box.h > WORLD.height - WORLD.margin
  ) {
    return true;
  }

  for (const item of levelData.obstacles) {
    if (rectHitsRect(box, item)) return true;
  }

  if (blockChickens) {
    for (const chicken of levelData.chickens) {
      if (chicken === ignoreChicken) continue;
      if (hitboxesOverlap(box, chickenHitbox(chicken))) return true;
    }
  }

  return false;
}

function findOpenSpot(width, height = width, avoidSpawn = true, offsetY = 0) {
  for (let tries = 0; tries < 700; tries += 1) {
    const x = randomRange(WORLD.margin + width, WORLD.width - WORLD.margin - width);
    const y = randomRange(WORLD.margin + height, WORLD.height - WORLD.margin - height);

    if (avoidSpawn && distance(x, y, player.x, player.y) < 110) continue;
    if (!isBlocked(x, y, width, height, null, offsetY)) return { x, y };
  }

  return { x: WORLD.width / 2, y: WORLD.height / 2 };
}

function tryAddObstacle(obstacles, rect, pad = 36) {
  const forbidden = [
    { x: 70, y: 235, w: 150, h: 132 },
    { x: 750, y: 50, w: 150, h: 120 },
  ];
  const inside =
    rect.x > WORLD.margin &&
    rect.y > WORLD.margin &&
    rect.x + rect.w < WORLD.width - WORLD.margin &&
    rect.y + rect.h < WORLD.height - WORLD.margin;

  if (!inside) return false;
  if (forbidden.some((area) => rectsOverlap(rect, area, 18))) return false;
  if (obstacles.some((item) => rectsOverlap(rect, item, pad))) return false;
  obstacles.push(rect);
  return true;
}

function addGeneratedObstacles() {
  const obstacles = [];
  const coopCount = clamp(4 + Math.floor(level / 2), 4, 6);
  const hayCount = 6 + level;

  for (let i = 0; i < coopCount; i += 1) {
    for (let tries = 0; tries < 80; tries += 1) {
      const rect = {
        x: randomInt(225, WORLD.width - 190),
        y: randomInt(60, WORLD.height - 145),
        w: randomInt(112, 150),
        h: randomInt(88, 118),
        kind: "coop",
        sprite: pick(ASSETS.coop),
      };
      if (tryAddObstacle(obstacles, rect, CONFIG.obstacleSpacing)) break;
    }
  }

  for (let i = 0; i < hayCount; i += 1) {
    for (let tries = 0; tries < 70; tries += 1) {
      const rect = {
        x: randomInt(185, WORLD.width - 120),
        y: randomInt(55, WORLD.height - 92),
        w: randomInt(50, 96),
        h: randomInt(38, 74),
        kind: "hay",
        sprite: pick(ASSETS.hay),
      };
      if (tryAddObstacle(obstacles, rect, CONFIG.haySpacing)) break;
    }
  }

  return obstacles;
}

function createBoundaryFences() {
  const fences = [];
  const horizontalSprites = [ASSETS.fence[0], ASSETS.fence[2], ASSETS.fence[3], ASSETS.fence[12], ASSETS.fence[16], ASSETS.fence[17], ASSETS.fence[18], ASSETS.fence[19]];
  const verticalSprites = [ASSETS.fence[1], ASSETS.fence[9], ASSETS.fence[13]];
  const segment = 138;
  const thickness = 46;
  const topY = 26;
  const bottomY = WORLD.height - 26;
  const leftX = 24;
  const rightX = WORLD.width - 24;

  for (let x = 84; x < WORLD.width - 70; x += 126) {
    fences.push({ x, y: topY, w: segment, h: thickness, sprite: pick(horizontalSprites) });
    fences.push({ x: x + 34, y: bottomY, w: segment, h: thickness, sprite: pick(horizontalSprites) });
  }

  for (let y = 104; y < WORLD.height - 80; y += 126) {
    fences.push({ x: leftX, y, w: thickness, h: segment, sprite: pick(verticalSprites) });
    fences.push({ x: rightX, y: y + 28, w: thickness, h: segment, sprite: pick(verticalSprites) });
  }

  return fences;
}

function createDirtPatch(x, y, radius, amountScale = 1) {
  const amount = radius * amountScale;
  return {
    x,
    y,
    radius,
    maxAmount: amount,
    amount,
    sprite: pick(ASSETS.dirt),
    wiggle: randomRange(-0.25, 0.25),
    cleaned: false,
  };
}

function addCleanEffect(dirt) {
  if (!levelData) return;
  levelData.cleanEffects.push({
    x: dirt.x,
    y: dirt.y,
    radius: dirt.radius,
    age: 0,
    duration: 0.55,
    wiggle: randomRange(-0.2, 0.2),
  });
}

function addNewDirt(fromChicken) {
  const spot = findOpenSpot(22, 22, false);
  const dirt = createDirtPatch(fromChicken ? fromChicken.x : spot.x, fromChicken ? fromChicken.y : spot.y, randomRange(12, 18), 0.65);

  if (isBlocked(dirt.x, dirt.y, 22, 22, fromChicken || null)) {
    dirt.x = spot.x;
    dirt.y = spot.y;
  }

  levelData.dirts.push(dirt);
  totalDirtCapacity += dirt.maxAmount;
}

function spriteForChicken(role, index) {
  if (role === "chick") return ASSETS.chicken[8];
  if (role === "rooster") return ASSETS.chicken[9];
  if (role === "mom") return ASSETS.chicken[7];
  return ASSETS.chicken[index % 7];
}

function createChicken(role, index) {
  const spot = findOpenSpot(CONFIG.CHICKEN_HITBOX_WIDTH, CONFIG.CHICKEN_HITBOX_HEIGHT);
  const angle = randomRange(0, Math.PI * 2);
  return {
    role,
    x: spot.x,
    y: spot.y,
    hitboxWidth: role === "chick" ? CONFIG.CHICKEN_HITBOX_WIDTH * 0.72 : CONFIG.CHICKEN_HITBOX_WIDTH,
    hitboxHeight: role === "chick" ? CONFIG.CHICKEN_HITBOX_HEIGHT * 0.72 : CONFIG.CHICKEN_HITBOX_HEIGHT,
    hitboxOffsetY: role === "chick" ? 8 : 12,
    speed: role === "chick" ? CONFIG.chickenSpeed * 1.12 : CONFIG.chickenSpeed,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    wanderTimer: randomRange(0.7, 2.4),
    pauseTimer: randomRange(0.2, 1.2),
    dirtTimer: randomRange(CONFIG.chickenDirtDelay[0], CONFIG.chickenDirtDelay[1]),
    step: randomRange(0, Math.PI * 2),
    sprite: spriteForChicken(role, index),
  };
}

function playerHitboxAt(x, y) {
  return hitboxFor(x, y, CONFIG.DINDIN_HITBOX_WIDTH, CONFIG.DINDIN_HITBOX_HEIGHT, 12);
}

function chickenHitbox(chicken) {
  return hitboxFor(chicken.x, chicken.y, chicken.hitboxWidth, chicken.hitboxHeight, chicken.hitboxOffsetY);
}

function createGroundTiles() {
  const cols = Math.ceil(WORLD.width / CONFIG.tileSize) + 1;
  const rows = Math.ceil(WORLD.height / CONFIG.tileSize) + 1;
  const tiles = [];
  const levelGround = ASSETS.ground[(level - 1) % ASSETS.ground.length];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      tiles.push({ x: x * CONFIG.tileSize, y: y * CONFIG.tileSize, sprite: levelGround });
    }
  }

  return tiles;
}

function startLevel(nextLevel) {
  level = nextLevel;
  configureWorldForLevel(level);
  levelLabel.textContent = `${level}/${CONFIG.maxLevels}`;
  victoryBanner.classList.add("hidden");
  celebrationTimer = 0;
  nextLevelTimer = 0;

  player.x = 120;
  player.y = WORLD.height / 2;
  player.facingX = 1;
  player.facingY = 0;
  player.walkTime = 0;
  player.cleaningTimer = 0;
  player.isMoving = false;
  updateCamera();

  levelData = {
    groundTiles: createGroundTiles(),
    boundaryFences: createBoundaryFences(),
    obstacles: [],
    dirts: [],
    chickens: [],
    cleanEffects: [],
    addedChickenDirts: 0,
  };

  levelData.obstacles = addGeneratedObstacles();

  const dirtCount = CONFIG.baseDirtCount + (level - 1) * CONFIG.dirtPerLevel;
  for (let i = 0; i < dirtCount; i += 1) {
    const spot = findOpenSpot(40, 40);
    levelData.dirts.push(createDirtPatch(spot.x, spot.y, randomRange(17, 31), 1));
  }

  const chickenCount = clamp(
    CONFIG.baseChickenCount + Math.floor((level - 1) * CONFIG.chickensPerLevel),
    CONFIG.baseChickenCount,
    CONFIG.maxChickenCount
  );
  const roles = ["mom", "chick", "rooster"];
  for (let i = 0; i < chickenCount; i += 1) {
    levelData.chickens.push(createChicken(roles[i] || "hen", i));
  }

  totalDirtCapacity = levelData.dirts.reduce((sum, dirt) => sum + dirt.maxAmount, 0);
  updateCleanHud();
  updateCamera();
}

function showGame() {
  const manager = audio();
  if (manager) {
    manager.unlock();
    manager.stopEffects();
    manager.playSound("click", { volume: 0.75 });
    manager.playGameMusic();
  }
  gameState = "playing";
  hideAllScreens();
  gameScreen.classList.remove("hidden");
  startLevel(1);
}

function showMenu() {
  const manager = audio();
  if (manager) {
    manager.unlock();
    manager.stopEffects();
    manager.playSound("click", { volume: 0.75 });
    manager.playMenuMusic();
  }
  gameState = "menu";
  hideAllScreens();
  titleScreen.classList.remove("hidden");
  victoryBanner.classList.add("hidden");
  updateSoundButton();
}

function showFinalScreen() {
  const manager = audio();
  if (manager) {
    manager.unlock();
    manager.stopEffects();
    manager.playFinalMusic();
  }
  gameState = "final";
  hideAllScreens();
  victoryBanner.classList.add("hidden");
  finalScreen.classList.remove("hidden");
  updateSoundButton();
}

function updateCleanHud() {
  const remaining = levelData.dirts.reduce((sum, dirt) => sum + dirt.amount, 0);
  currentCleanRatio = clamp(1 - remaining / totalDirtCapacity, 0, 1);
  cleanBar.style.width = `${Math.floor(currentCleanRatio * 100)}%`;
  cleanLabel.textContent = String(Math.floor(currentCleanRatio * 100));
}

function vectorFromInput() {
  let x = 0;
  let y = 0;
  if (keys.left) x -= 1;
  if (keys.right) x += 1;
  if (keys.up) y -= 1;
  if (keys.down) y += 1;

  const len = Math.hypot(x, y);
  if (len > 0) {
    x /= len;
    y /= len;
  }

  return { x, y };
}

function moveEntity(entity, dx, dy, width, height, ignoreChicken, offsetY = 0, canNudge = false, blockChickens = true) {
  if (!dx && !dy) return;

  const nextX = entity.x + dx;
  const nextY = entity.y + dy;
  if (!isBlocked(nextX, nextY, width, height, ignoreChicken, offsetY, blockChickens)) {
    entity.x = nextX;
    entity.y = nextY;
    return;
  }

  if (!isBlocked(nextX, entity.y, width, height, ignoreChicken, offsetY, blockChickens)) {
    entity.x = nextX;
  }

  if (!isBlocked(entity.x, nextY, width, height, ignoreChicken, offsetY, blockChickens)) {
    entity.y = nextY;
  }

  if (!canNudge) return;

  const nudge = 10;
  const diagonalX = dx === 0 ? 0 : Math.sign(dx) * nudge;
  const diagonalY = dy === 0 ? 0 : Math.sign(dy) * nudge;
  const candidates = [
    { x: 0, y: -nudge },
    { x: 0, y: nudge },
    { x: -nudge, y: 0 },
    { x: nudge, y: 0 },
    { x: -diagonalX, y: 0 },
    { x: 0, y: -diagonalY },
  ];

  for (const step of candidates) {
    if (!isBlocked(entity.x + step.x, entity.y + step.y, width, height, ignoreChicken, offsetY, blockChickens)) {
      entity.x += step.x;
      entity.y += step.y;
      return;
    }
  }
}

function updatePlayer(dt) {
  const move = vectorFromInput();
  player.isMoving = Boolean(move.x || move.y);
  if (move.x || move.y) {
    player.facingX = move.x;
    player.facingY = move.y;
    player.walkTime += dt * 10;
  }
  player.cleaningTimer = Math.max(0, player.cleaningTimer - dt);

  moveEntity(
    player,
    move.x * CONFIG.dindinSpeed * dt,
    move.y * CONFIG.dindinSpeed * dt,
    CONFIG.DINDIN_HITBOX_WIDTH,
    CONFIG.DINDIN_HITBOX_HEIGHT,
    null,
    12,
    true,
    false
  );

  const broomX = player.x + player.facingX * CONFIG.broomReach;
  const broomY = player.y + player.facingY * CONFIG.broomReach;
  let cleanedThisFrame = false;

  for (const dirt of levelData.dirts) {
    if (dirt.amount <= 0) continue;
    const hitDistance = CONFIG.broomSize + dirt.radius * 0.72;
    if (distance(broomX, broomY, dirt.x, dirt.y) < hitDistance) {
      const before = dirt.amount;
      dirt.amount = Math.max(0, dirt.amount - dt * 23);
      if (before > 0.05) player.cleaningTimer = 0.18;
      if (!dirt.cleaned && dirt.amount <= 0.05) {
        dirt.cleaned = true;
        addCleanEffect(dirt);
      }
      cleanedThisFrame = true;
    }
  }

  if (cleanedThisFrame) playBrushSound();

  levelData.dirts = levelData.dirts.filter((dirt) => dirt.amount > 0.05);
  updateCleanHud();

  if (currentCleanRatio >= CONFIG.cleanThreshold && gameState === "playing") {
    gameState = "celebrating";
    celebrationTimer = 0;
    nextLevelTimer = level >= CONFIG.maxLevels ? 4 : 2.9;
    playVictorySound();
    const title = victoryBanner.querySelector("strong");
    const text = victoryBanner.querySelector("span");
    if (level >= CONFIG.maxLevels) {
      if (title) title.textContent = "Bravo !";
      if (text) text.textContent = "Le poulailler est tout content";
    } else {
      if (title) title.textContent = "Glou-glou !";
      if (text) text.textContent = "Poulailler presque tout propre";
    }
    victoryBanner.classList.remove("hidden");
  }
}

function updateChickens(dt) {
  for (const chicken of levelData.chickens) {
    chicken.wanderTimer -= dt;
    chicken.dirtTimer -= dt;
    chicken.step += dt * 7;

    if (chicken.pauseTimer > 0) {
      chicken.pauseTimer -= dt;
      continue;
    }

    if (chicken.wanderTimer <= 0) {
      if (Math.random() < 0.34) {
        chicken.pauseTimer = randomRange(0.45, 1.35);
      }
      const angle = randomRange(0, Math.PI * 2);
      chicken.vx = Math.cos(angle);
      chicken.vy = Math.sin(angle);
      chicken.wanderTimer = randomRange(1.2, 3.6);
      maybePlayCotcotSound();
    }

    const beforeX = chicken.x;
    const beforeY = chicken.y;
    moveEntity(chicken, chicken.vx * chicken.speed * dt, chicken.vy * chicken.speed * dt, chicken.hitboxWidth, chicken.hitboxHeight, chicken, chicken.hitboxOffsetY);

    if (beforeX === chicken.x && beforeY === chicken.y) {
      chicken.wanderTimer = 0;
    }

    if (hitboxesOverlap(playerHitboxAt(player.x, player.y), chickenHitbox(chicken))) {
      moveEntity(player, -chicken.vx * 10 * dt, -chicken.vy * 10 * dt, CONFIG.DINDIN_HITBOX_WIDTH, CONFIG.DINDIN_HITBOX_HEIGHT, null, 12, true, false);
    }

    if (
      chicken.dirtTimer <= 0 &&
      gameState === "playing" &&
      currentCleanRatio < CONFIG.cleanThreshold * 0.88 &&
      levelData.addedChickenDirts < CONFIG.maxChickenDirtPerLevel
    ) {
      addNewDirt(chicken);
      levelData.addedChickenDirts += 1;
      chicken.dirtTimer = randomRange(CONFIG.chickenDirtDelay[0] + 3, CONFIG.chickenDirtDelay[1] + 5);
    }
  }
}

function update(dt) {
  if (!levelData) return;
  levelData.cleanEffects = levelData.cleanEffects
    .map((effect) => ({ ...effect, age: effect.age + dt }))
    .filter((effect) => effect.age < effect.duration);

  if (gameState === "playing") {
    ambientCotcotTimer -= dt;
    if (ambientCotcotTimer <= 0) {
      maybePlayCotcotSound();
      ambientCotcotTimer = randomRange(7, 14);
    }
    updateChickens(dt);
    updatePlayer(dt);
    updateCamera();
  } else if (gameState === "celebrating") {
    celebrationTimer += dt;
    nextLevelTimer -= dt;
    if (nextLevelTimer <= 0) {
      if (level >= CONFIG.maxLevels) {
        showFinalScreen();
        return;
      }
      gameState = "playing";
      startLevel(level + 1);
    }
  }
}

function drawSprite(path, x, y, w, h, options = {}) {
  const image = img(path);
  const alpha = options.alpha === undefined ? 1 : options.alpha;
  const flipX = Boolean(options.flipX);
  const rotation = options.rotation || 0;
  const sheet = typeof path === "string" ? null : path;

  if (!assetsReady || !image) {
    ctx.fillStyle = options.fallback || "#ffd642";
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    return;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(flipX ? -1 : 1, 1);
  if (sheet) {
    const sourceWidth = image.width / sheet.columns;
    const sourceHeight = image.height / sheet.rows;
    const sourceX = (sheet.index % sheet.columns) * sourceWidth;
    const sourceY = Math.floor(sheet.index / sheet.columns) * sourceHeight;
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = "#f7d56c";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  for (const tile of levelData.groundTiles) {
    const image = img(tile.sprite);
    if (!image) continue;
    const sourceWidth = image.width / tile.sprite.columns;
    const sourceHeight = image.height / tile.sprite.rows;
    const sourceX = (tile.sprite.index % tile.sprite.columns) * sourceWidth;
    const sourceY = Math.floor(tile.sprite.index / tile.sprite.columns) * sourceHeight;
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, tile.x, tile.y, CONFIG.tileSize + 2, CONFIG.tileSize + 2);
  }
}

function drawBoundaryFences() {
  for (const fence of levelData.boundaryFences) {
    drawSprite(fence.sprite, fence.x, fence.y, fence.w, fence.h, { fallback: "#f6d8a4" });
  }
}

function drawObstacle(item) {
  drawSprite(item.sprite, item.x + item.w / 2, item.y + item.h / 2, item.w, item.h, { fallback: "#ffe14d" });
}

function drawDirt(dirt) {
  const scale = clamp(dirt.amount / dirt.maxAmount, 0.16, 1);
  const size = dirt.radius * 2.35 * scale;
  drawSprite(dirt.sprite, dirt.x, dirt.y, size, size, {
    rotation: dirt.wiggle,
    alpha: clamp(0.34 + scale * 0.66, 0.2, 1),
    fallback: "#8b4b22",
  });
}

function drawCleanEffect(effect) {
  const progress = clamp(effect.age / effect.duration, 0, 1);
  const alpha = 1 - progress;
  const radius = effect.radius * (0.8 + progress * 1.25);

  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.rotate(effect.wiggle);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#fff7b6";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI / 2) * i + progress * 0.45;
    const inner = radius * 0.55;
    const outer = radius * 0.82;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChicken(chicken) {
  const bob = Math.sin(chicken.step) * 2;
  const size = chicken.role === "chick" ? 38 : chicken.role === "rooster" ? 66 : 54;
  drawSprite(chicken.sprite, chicken.x, chicken.y + bob, size, size, {
    flipX: chicken.vx < -0.12,
    fallback: "#fff6d2",
  });
}

function drawDindin() {
  const partyBob = gameState === "celebrating" ? Math.sin(celebrationTimer * 18) * 6 : 0;
  const partyWiggle = gameState === "celebrating" ? Math.sin(celebrationTimer * 13) * 0.12 : 0;
  const walkBob = player.isMoving ? Math.sin(player.walkTime) * 2.6 : 0;
  const cleanWiggle = player.cleaningTimer > 0 ? Math.sin(player.cleaningTimer * 70) * 0.08 : 0;
  const flipX = player.facingX < -0.12;
  const size = 92 * CONFIG.DINDIN_SCALE;
  drawSprite(ASSETS.dindin, player.x, player.y - 8 + partyBob + walkBob, size, size, {
    flipX,
    rotation: cleanWiggle + partyWiggle,
    fallback: "#20b9ff",
  });

  if (player.cleaningTimer > 0 && gameState === "playing") {
    drawBroomSwipe();
  }

  if (gameState === "celebrating") {
    ctx.font = "900 22px Trebuchet MS, Arial";
    ctx.fillStyle = "#1d1720";
    ctx.fillText("glou-glou", player.x - 46, player.y - 64 + partyBob);
  }
}

function drawBroomSwipe() {
  const progress = 1 - clamp(player.cleaningTimer / 0.18, 0, 1);
  const x = player.x + player.facingX * CONFIG.broomReach;
  const y = player.y + player.facingY * CONFIG.broomReach;
  const angle = Math.atan2(player.facingY, player.facingX) + Math.sin(progress * Math.PI * 2) * 0.45;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ffd642";
  ctx.beginPath();
  ctx.moveTo(-16, -8);
  ctx.lineTo(14, 8);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ff4b67";
  ctx.beginPath();
  ctx.moveTo(10, -9);
  ctx.lineTo(24, 9);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!levelData) return;

  updateCamera();
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawBackground();
  drawBoundaryFences();

  for (const dirt of levelData.dirts) drawDirt(dirt);
  for (const effect of levelData.cleanEffects) drawCleanEffect(effect);

  const sorted = [
    ...levelData.obstacles.map((item) => ({ type: "obstacle", y: item.y + item.h, item })),
    ...levelData.chickens.map((item) => ({ type: "chicken", y: chickenHitbox(item).y + chickenHitbox(item).h, item })),
    { type: "player", y: playerHitboxAt(player.x, player.y).y + CONFIG.DINDIN_HITBOX_HEIGHT },
  ].sort((a, b) => a.y - b.y);

  for (const entry of sorted) {
    if (entry.type === "obstacle") drawObstacle(entry.item);
    if (entry.type === "chicken") drawChicken(entry.item);
    if (entry.type === "player") drawDindin();
  }

  ctx.restore();
}

function loop(time) {
  const dt = Math.min(0.04, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function setDirection(dir, value) {
  if (dir === "up") keys.up = value;
  if (dir === "down") keys.down = value;
  if (dir === "left") keys.left = value;
  if (dir === "right") keys.right = value;
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "z", "w"].includes(key)) setDirection("up", true);
  if (["arrowdown", "s"].includes(key)) setDirection("down", true);
  if (["arrowleft", "q", "a"].includes(key)) setDirection("left", true);
  if (["arrowright", "d"].includes(key)) setDirection("right", true);

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "z", "q", "s", "d", "w", "a"].includes(key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "z", "w"].includes(key)) setDirection("up", false);
  if (["arrowdown", "s"].includes(key)) setDirection("down", false);
  if (["arrowleft", "q", "a"].includes(key)) setDirection("left", false);
  if (["arrowright", "d"].includes(key)) setDirection("right", false);
});

for (const button of padButtons) {
  const dir = button.dataset.dir;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setDirection(dir, true);
  });
  button.addEventListener("pointerup", () => setDirection(dir, false));
  button.addEventListener("pointercancel", () => setDirection(dir, false));
  button.addEventListener("pointerleave", () => setDirection(dir, false));
}

soundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const manager = audio();
    if (!manager) return;
    manager.unlock();
    const muted = manager.toggleMuted();
    updateSoundButton();
    if (!muted) {
      manager.playSound("click", { volume: 0.75 });
      if (gameState === "playing") {
        manager.playGameMusic();
      } else if (gameState === "final") {
        manager.playFinalMusic();
      } else {
        manager.playMenuMusic();
      }
    }
  });
});

playButton.addEventListener("click", showGame);
menuButton.addEventListener("click", showMenu);
replayButton.addEventListener("click", showGame);
finalMenuButton.addEventListener("click", showMenu);

loadAssets();
updateSoundButton();
requestAnimationFrame(loop);
