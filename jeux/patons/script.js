const DESKTOP_SLOTS = [
  { x: 17, y: 28, w: 27, h: 38 },
  { x: 50, y: 28, w: 27, h: 38 },
  { x: 83, y: 28, w: 27, h: 38 },
  { x: 17, y: 61, w: 27, h: 38 },
  { x: 50, y: 61, w: 27, h: 38 },
  { x: 83, y: 61, w: 27, h: 38 }
];

const MOBILE_SLOTS = [
  { x: 29, y: 17, w: 43, h: 27 },
  { x: 71, y: 17, w: 43, h: 27 },
  { x: 29, y: 48, w: 43, h: 27 },
  { x: 71, y: 48, w: 43, h: 27 },
  { x: 29, y: 78, w: 43, h: 27 },
  { x: 71, y: 78, w: 43, h: 27 }
];

const DEFAULT_STARTS = [
  { x: 120, y: 118, r: 40 },
  { x: 120, y: 118, r: 41 },
  { x: 120, y: 118, r: 39 },
  { x: 120, y: 118, r: 42 },
  { x: 120, y: 118, r: 40 },
  { x: 120, y: 118, r: 41 }
];

function levelShape(slot, id, label, successLabel, kind) {
  return {
    id,
    label,
    successLabel,
    kind,
    position: DESKTOP_SLOTS[slot],
    mobilePosition: MOBILE_SLOTS[slot],
    start: DEFAULT_STARTS[slot]
  };
}

const LEVELS = [
  {
    id: "level1",
    name: "Niveau 1",
    completeText: "Le niveau 1 est tout doré !",
    shapes: [
      levelShape(0, "star", "Étoile", "l'étoile", "star"),
      levelShape(1, "square", "Carré", "le carré", "square"),
      levelShape(2, "diamond", "Losange", "le losange", "diamond"),
      levelShape(3, "bird", "Oiseau", "l'oiseau", "bird"),
      levelShape(4, "rabbit", "Lapin", "le lapin", "rabbit"),
      levelShape(5, "bear", "Ours", "l'ours", "bear")
    ]
  },
  {
    id: "level2",
    name: "Niveau 2",
    completeText: "Le niveau 2 sent la brioche magique !",
    shapes: [
      levelShape(0, "heart", "Cœur", "le cœur", "heart"),
      levelShape(1, "dog", "Chien", "le chien", "dog"),
      levelShape(2, "giraffe", "Girafe", "la girafe", "giraffe"),
      levelShape(3, "brioche", "Brioche", "la brioche soufflée", "brioche"),
      levelShape(4, "long-rectangle", "Rectangle", "le rectangle long", "longRectangle"),
      levelShape(5, "oval-tart", "Tarte ovale", "la tarte ovale", "ovalTart")
    ]
  },
  {
    id: "level3",
    name: "Niveau 3",
    completeText: "Le niveau 3 fait une danse de victoire !",
    shapes: [
      levelShape(0, "hourglass", "Sablier", "le sablier", "hourglass"),
      levelShape(1, "clover", "Trèfle", "le trèfle", "clover"),
      levelShape(2, "headphones", "Casque", "le casque", "headphones"),
      levelShape(3, "spade", "Pique", "le pique", "spade"),
      levelShape(4, "crown", "Couronne", "la couronne", "crown"),
      levelShape(5, "victory-v", "Victoire", "le V de victoire", "victoryV")
    ]
  }
];

const SAMPLE_COUNT = 76;
const DONE_AT = 0.92;
const SNAP_AT = 0.82;
const ELASTIC_BACK = 0.14;
const VIEWBOX = { width: 240, height: 205 };
const board = document.querySelector("#board");
const doneCount = document.querySelector("#done-count");
const doneTotal = document.querySelector("#done-total");
const statusMessage = document.querySelector("#status-message");
const menuScreen = document.querySelector("#menu-screen");
const levelCompleteScreen = document.querySelector("#level-complete-screen");
const levelCompleteKicker = document.querySelector("#level-complete-kicker");
const levelCompleteTitle = document.querySelector("#level-complete-title");
const victoryScreen = document.querySelector("#victory-screen");
const startButton = document.querySelector("#start-button");
const nextLevelButton = document.querySelector("#next-level-button");
const replayButton = document.querySelector("#replay-button");
const levelName = document.querySelector("#level-name");
const cards = new Map();
let currentLevelIndex = 0;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function polarPoint(cx, cy, radius, angle) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function circlePoints(cx, cy, radius, count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    return polarPoint(cx, cy, radius, angle);
  });
}

function ellipsePoints(cx, cy, rx, ry, count, startAngle = -Math.PI / 2) {
  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / count;
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry
    };
  });
}

function starPoints(cx, cy, outer, inner, arms) {
  const points = [];
  const total = arms * 2;
  for (let index = 0; index < total; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    points.push(polarPoint(cx, cy, index % 2 === 0 ? outer : inner, angle));
  }
  return points;
}

function rectPoints(left, top, width, height) {
  return [
    { x: left, y: top },
    { x: left + width, y: top },
    { x: left + width, y: top + height },
    { x: left, y: top + height }
  ];
}

function diamondPoints(cx, cy, width, height) {
  return [
    { x: cx, y: cy - height / 2 },
    { x: cx + width / 2, y: cy },
    { x: cx, y: cy + height / 2 },
    { x: cx - width / 2, y: cy }
  ];
}

function heartPoints(cx = 120, cy = 112, scale = 4.7) {
  return Array.from({ length: 72 }, (_, index) => {
    const t = (Math.PI * 2 * index) / 72;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: cx + x * scale, y: cy + y * scale };
  });
}

function cloverPoints() {
  return Array.from({ length: 84 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 84;
    const radius = 46 + 18 * Math.cos(4 * angle);
    return {
      x: 120 + Math.cos(angle) * radius,
      y: 112 + Math.sin(angle) * radius
    };
  });
}

function briochePoints() {
  return Array.from({ length: 84 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 84;
    const radius = 48 + 16 * Math.cos(2 * angle);
    return {
      x: 120 + Math.cos(angle) * radius * 1.18,
      y: 118 + Math.sin(angle) * radius * 0.9 + Math.sin(2 * angle) * 6
    };
  });
}

function birdPoints() {
  return [
    { x: 56, y: 111 },
    { x: 80, y: 86 },
    { x: 111, y: 78 },
    { x: 142, y: 90 },
    { x: 166, y: 82 },
    { x: 156, y: 109 },
    { x: 187, y: 120 },
    { x: 151, y: 131 },
    { x: 132, y: 154 },
    { x: 108, y: 133 },
    { x: 76, y: 142 }
  ];
}

function rabbitPoints() {
  return [
    { x: 79, y: 111 },
    { x: 72, y: 74 },
    { x: 88, y: 44 },
    { x: 104, y: 85 },
    { x: 118, y: 78 },
    { x: 133, y: 39 },
    { x: 151, y: 69 },
    { x: 143, y: 112 },
    { x: 161, y: 132 },
    { x: 146, y: 158 },
    { x: 119, y: 168 },
    { x: 90, y: 158 },
    { x: 70, y: 134 }
  ];
}

function bearPoints() {
  return [
    { x: 65, y: 102 },
    { x: 53, y: 76 },
    { x: 72, y: 56 },
    { x: 97, y: 66 },
    { x: 119, y: 59 },
    { x: 143, y: 66 },
    { x: 169, y: 56 },
    { x: 188, y: 77 },
    { x: 176, y: 105 },
    { x: 181, y: 130 },
    { x: 160, y: 157 },
    { x: 121, y: 169 },
    { x: 82, y: 157 },
    { x: 60, y: 130 }
  ];
}

function dogPoints() {
  return [
    { x: 48, y: 124 },
    { x: 62, y: 91 },
    { x: 86, y: 82 },
    { x: 99, y: 55 },
    { x: 116, y: 82 },
    { x: 144, y: 81 },
    { x: 160, y: 55 },
    { x: 177, y: 84 },
    { x: 198, y: 104 },
    { x: 184, y: 129 },
    { x: 160, y: 139 },
    { x: 151, y: 162 },
    { x: 123, y: 169 },
    { x: 99, y: 158 },
    { x: 80, y: 168 },
    { x: 62, y: 146 }
  ];
}

function giraffePoints() {
  return [
    { x: 64, y: 146 },
    { x: 74, y: 98 },
    { x: 90, y: 82 },
    { x: 94, y: 48 },
    { x: 110, y: 68 },
    { x: 125, y: 47 },
    { x: 137, y: 78 },
    { x: 165, y: 84 },
    { x: 188, y: 104 },
    { x: 176, y: 132 },
    { x: 150, y: 139 },
    { x: 141, y: 166 },
    { x: 106, y: 166 },
    { x: 93, y: 144 }
  ];
}

function hourglassPoints() {
  return [
    { x: 70, y: 50 },
    { x: 172, y: 50 },
    { x: 146, y: 86 },
    { x: 126, y: 112 },
    { x: 149, y: 144 },
    { x: 174, y: 174 },
    { x: 68, y: 174 },
    { x: 93, y: 144 },
    { x: 116, y: 112 },
    { x: 94, y: 86 }
  ];
}

function headphonesPoints() {
  return [
    { x: 62, y: 154 },
    { x: 52, y: 154 },
    { x: 52, y: 112 },
    { x: 64, y: 102 },
    { x: 70, y: 84 },
    { x: 92, y: 62 },
    { x: 120, y: 55 },
    { x: 148, y: 62 },
    { x: 170, y: 84 },
    { x: 176, y: 102 },
    { x: 188, y: 112 },
    { x: 188, y: 154 },
    { x: 178, y: 154 },
    { x: 166, y: 130 },
    { x: 161, y: 105 },
    { x: 144, y: 86 },
    { x: 120, y: 80 },
    { x: 96, y: 86 },
    { x: 79, y: 105 },
    { x: 74, y: 130 }
  ];
}

function spadePoints() {
  return [
    { x: 120, y: 44 },
    { x: 154, y: 74 },
    { x: 181, y: 105 },
    { x: 170, y: 140 },
    { x: 139, y: 143 },
    { x: 151, y: 169 },
    { x: 90, y: 169 },
    { x: 102, y: 143 },
    { x: 70, y: 140 },
    { x: 59, y: 105 },
    { x: 86, y: 74 }
  ];
}

function crownPoints() {
  return [
    { x: 55, y: 158 },
    { x: 61, y: 86 },
    { x: 91, y: 120 },
    { x: 119, y: 56 },
    { x: 148, y: 120 },
    { x: 179, y: 86 },
    { x: 185, y: 158 }
  ];
}

function victoryVPoints() {
  return [
    { x: 51, y: 58 },
    { x: 86, y: 58 },
    { x: 120, y: 144 },
    { x: 154, y: 58 },
    { x: 189, y: 58 },
    { x: 136, y: 174 },
    { x: 104, y: 174 }
  ];
}

function baseShapePoints(kind) {
  const map = {
    star: starPoints(120, 112, 74, 35, 5),
    square: rectPoints(58, 54, 124, 124),
    diamond: diamondPoints(120, 116, 140, 140),
    bird: birdPoints(),
    rabbit: rabbitPoints(),
    bear: bearPoints(),
    heart: heartPoints(),
    dog: dogPoints(),
    giraffe: giraffePoints(),
    brioche: briochePoints(),
    longRectangle: rectPoints(36, 78, 168, 74),
    ovalTart: ellipsePoints(120, 116, 82, 53, 72),
    hourglass: hourglassPoints(),
    clover: cloverPoints(),
    headphones: headphonesPoints(),
    spade: spadePoints(),
    crown: crownPoints(),
    victoryV: victoryVPoints()
  };

  return map[kind];
}

function polygonLength(points) {
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const next = points[(index + 1) % points.length];
    total += Math.hypot(next.x - point.x, next.y - point.y);
  }
  return total;
}

function sampleClosedPolygon(points, count) {
  const perimeter = polygonLength(points);
  const samples = [];
  let edgeIndex = 0;
  let edgeStartDistance = 0;

  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const targetDistance = (perimeter * sampleIndex) / count;

    while (edgeIndex < points.length) {
      const current = points[edgeIndex];
      const next = points[(edgeIndex + 1) % points.length];
      const edgeLength = Math.hypot(next.x - current.x, next.y - current.y);

      if (edgeStartDistance + edgeLength >= targetDistance) {
        const progress = (targetDistance - edgeStartDistance) / edgeLength;
        samples.push({
          x: lerp(current.x, next.x, progress),
          y: lerp(current.y, next.y, progress)
        });
        break;
      }

      edgeStartDistance += edgeLength;
      edgeIndex += 1;
    }
  }

  return samples;
}

function pointsToPath(points) {
  return `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} Z`;
}

function doughPath(startPoints, targetPoints, progress, wobble, pull, center) {
  const eased = 1 - Math.pow(1 - progress, 2);
  const pullAngle = Math.atan2(pull.y, pull.x);
  const pullDistance = Math.hypot(pull.x, pull.y);
  const pullStrength = clamp(pullDistance / 72, 0, 1) * (1 - progress * 0.55);
  const points = startPoints.map((point, index) => {
    const target = targetPoints[index];
    const wiggle = Math.sin(wobble + index * 0.55) * (1 - progress) * 3;
    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    const directionalPull = Math.max(0, Math.cos(angle - pullAngle));
    const localPull = Math.pow(directionalPull, 1.7) * pullStrength;
    const oppositePull = Math.max(0, -Math.cos(angle - pullAngle)) * pullStrength * 0.18;

    return {
      x: lerp(point.x, target.x, eased) + pull.x * localPull - pull.x * oppositePull + wiggle,
      y: lerp(point.y, target.y, eased) + pull.y * localPull - pull.y * oppositePull - wiggle * 0.45
    };
  });

  return pointsToPath(points);
}

function facePosition(progress, center) {
  const y = lerp(center.y + 3, center.y + 14, progress);
  const scale = lerp(1, 0.88, progress);
  const smileY = center.y + 20;
  const smile = progress >= DONE_AT
    ? `M ${center.x - 14} ${smileY - 1} Q ${center.x} ${smileY + 10} ${center.x + 14} ${smileY - 1}`
    : `M ${center.x - 12} ${smileY} Q ${center.x} ${smileY + 6} ${center.x + 12} ${smileY}`;

  return { y, scale, smile };
}

function makeFlourDots(card) {
  const dots = [
    [20, 20, -30, -32],
    [72, 16, 4, -46],
    [86, 48, 42, -28],
    [26, 64, -38, 24],
    [62, 78, 18, 38]
  ];

  dots.forEach(([left, top, flyX, flyY]) => {
    const dot = document.createElement("span");
    dot.className = "flour-dot";
    dot.style.left = `${left}%`;
    dot.style.top = `${top}%`;
    dot.style.setProperty("--fly-x", `${flyX}px`);
    dot.style.setProperty("--fly-y", `${flyY}px`);
    card.append(dot);
  });
}

function updateCard(state) {
  const path = doughPath(state.startPoints, state.targetPoints, state.progress, state.wobble, state.pull, state.center);
  const face = facePosition(state.progress, state.center);

  state.dough.setAttribute("d", path);
  state.leftEye.setAttribute("cx", lerp(state.center.x - 14, state.center.x - 18, state.progress));
  state.leftEye.setAttribute("cy", face.y);
  state.rightEye.setAttribute("cx", lerp(state.center.x + 14, state.center.x + 18, state.progress));
  state.rightEye.setAttribute("cy", face.y);
  state.mouth.setAttribute("d", face.smile);
  state.face.setAttribute("transform", `scale(${face.scale} ${face.scale}) translate(${(state.center.x / face.scale - state.center.x).toFixed(2)} 0)`);
  state.card.classList.toggle("is-almost", state.progress >= 0.62 && !state.done);
}

function stopAnimation(state) {
  if (state.animationFrame) {
    window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
}

function animateDough(state, targetProgress, targetPull, duration, onDone) {
  stopAnimation(state);

  const startTime = performance.now();
  const startProgress = state.progress;
  const startPull = { ...state.pull };

  function tick(now) {
    const time = clamp((now - startTime) / duration, 0, 1);
    const eased = easeOutCubic(time);

    state.progress = lerp(startProgress, targetProgress, eased);
    state.pull = {
      x: lerp(startPull.x, targetPull.x, eased),
      y: lerp(startPull.y, targetPull.y, eased)
    };
    state.wobble += 0.08 * (1 - time);
    updateCard(state);

    if (time < 1) {
      state.animationFrame = window.requestAnimationFrame(tick);
      return;
    }

    state.animationFrame = null;
    onDone?.();
  }

  state.animationFrame = window.requestAnimationFrame(tick);
}

function snapToTarget(state) {
  if (state.snapping || state.done) {
    return;
  }

  state.snapping = true;
  state.dragging = false;
  state.card.classList.remove("is-dragging");
  statusMessage.textContent = "Hop, la pâte trouve son contour toute seule !";

  animateDough(state, 1, { x: 0, y: 0 }, 520, () => {
    state.snapping = false;
    completeCard(state);
  });
}

function showLevelComplete(level) {
  levelCompleteKicker.textContent = `${level.name} réussi`;
  levelCompleteTitle.textContent = level.completeText;
  levelCompleteScreen.classList.remove("is-hidden");
}

function completeCard(state) {
  if (state.done) {
    return;
  }

  stopAnimation(state);
  state.done = true;
  state.progress = 1;
  state.pull = { x: 0, y: 0 };
  state.card.classList.add("is-complete");
  state.card.classList.add("is-success");
  state.card.classList.remove("is-almost");
  state.card.setAttribute("aria-label", `${state.label} validé`);
  updateCard(state);
  doneCount.textContent = String([...cards.values()].filter((card) => card.done).length);
  statusMessage.textContent = `Bravo, ${state.successLabel} fait pouf dans la farine !`;

  window.setTimeout(() => {
    state.card.classList.remove("is-complete");
  }, 760);

  if ([...cards.values()].every((card) => card.done)) {
    const level = LEVELS[currentLevelIndex];
    window.setTimeout(() => {
      if (currentLevelIndex < LEVELS.length - 1) {
        statusMessage.textContent = `${level.name} terminé !`;
        showLevelComplete(level);
        return;
      }

      statusMessage.textContent = "Fifi applaudit : tous les pâtons magiques sont prêts !";
      victoryScreen.classList.remove("is-hidden");
    }, 620);
  }
}

function pointerInSvg(event, state) {
  const box = state.svg.getBoundingClientRect();

  return {
    x: ((event.clientX - box.left) / box.width) * VIEWBOX.width,
    y: ((event.clientY - box.top) / box.height) * VIEWBOX.height
  };
}

function updatePullFromPointer(event, state) {
  const point = pointerInSvg(event, state);
  const dx = point.x - state.center.x;
  const dy = point.y - state.center.y;
  const distance = Math.hypot(dx, dy);
  const maxPull = 34;
  const scale = distance > maxPull ? maxPull / distance : 1;

  state.pull = {
    x: dx * scale,
    y: dy * scale
  };
}

function onPointerDown(event, state) {
  if (state.done || state.snapping) {
    return;
  }

  stopAnimation(state);
  state.dragging = true;
  state.pointerId = event.pointerId;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  updatePullFromPointer(event, state);
  updateCard(state);
  state.card.classList.add("is-dragging");
  state.card.setPointerCapture(event.pointerId);
}

function onPointerMove(event, state) {
  if (!state.dragging || state.pointerId !== event.pointerId || state.done || state.snapping) {
    return;
  }

  const dx = event.clientX - state.lastX;
  const dy = event.clientY - state.lastY;
  const pull = Math.hypot(dx, dy);
  const directionBonus = Math.abs(dx) > Math.abs(dy) ? 1.05 : 0.95;

  updatePullFromPointer(event, state);
  state.progress = clamp(state.progress + (pull * directionBonus) / 610, 0, 1);
  state.wobble += pull / 32;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  updateCard(state);

  if (state.progress >= SNAP_AT) {
    snapToTarget(state);
  }
}

function onPointerEnd(event, state) {
  if (state.pointerId !== event.pointerId) {
    return;
  }

  state.dragging = false;
  state.card.classList.remove("is-dragging");

  try {
    state.card.releasePointerCapture(event.pointerId);
  } catch (error) {
    // Some browsers release capture automatically when a pointer is canceled.
  }

  if (!state.done && !state.snapping) {
    if (state.progress >= SNAP_AT) {
      snapToTarget(state);
      return;
    }

    const elasticProgress = Math.max(0, state.progress - ELASTIC_BACK);
    animateDough(state, elasticProgress, { x: 0, y: 0 }, 360);
  }
}

function applyPosition(card, shape) {
  const position = shape.position;
  const mobilePosition = shape.mobilePosition || position;

  card.style.setProperty("--x", `${position.x}%`);
  card.style.setProperty("--y", `${position.y}%`);
  card.style.setProperty("--w", `${position.w}%`);
  card.style.setProperty("--h", `${position.h}%`);
  card.style.setProperty("--mx", `${mobilePosition.x}%`);
  card.style.setProperty("--my", `${mobilePosition.y}%`);
  card.style.setProperty("--mw", `${mobilePosition.w}%`);
  card.style.setProperty("--mh", `${mobilePosition.h}%`);
}

function createCard(shape) {
  const card = document.createElement("article");
  card.className = "dough-card is-idle";
  card.setAttribute("aria-label", `${shape.label} à étirer`);
  applyPosition(card, shape);

  const label = document.createElement("span");
  label.className = "shape-name";
  label.textContent = shape.label;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("shape-svg");
  svg.setAttribute("viewBox", "0 0 240 205");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-hidden", "true");

  const start = shape.start || { x: 120, y: 118, r: 42 };
  const targetBase = baseShapePoints(shape.kind);
  const targetPoints = sampleClosedPolygon(targetBase, SAMPLE_COUNT);
  const startPoints = circlePoints(start.x, start.y, start.r, SAMPLE_COUNT);

  const target = document.createElementNS("http://www.w3.org/2000/svg", "path");
  target.classList.add("target-shape");
  target.setAttribute("d", pointsToPath(targetBase));

  const dough = document.createElementNS("http://www.w3.org/2000/svg", "path");
  dough.classList.add("dough-shape");

  const face = document.createElementNS("http://www.w3.org/2000/svg", "g");
  face.classList.add("face");

  const leftEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  leftEye.classList.add("face-eye");
  leftEye.setAttribute("r", "4.5");

  const rightEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rightEye.classList.add("face-eye");
  rightEye.setAttribute("r", "4.5");

  const mouth = document.createElementNS("http://www.w3.org/2000/svg", "path");
  mouth.classList.add("face-mouth");

  face.append(leftEye, rightEye, mouth);
  svg.append(target, dough, face);
  card.append(label, svg);
  makeFlourDots(card);

  const state = {
    id: shape.id,
    label: shape.label,
    successLabel: shape.successLabel,
    card,
    svg,
    dough,
    face,
    leftEye,
    rightEye,
    mouth,
    center: { x: start.x, y: start.y },
    targetPoints,
    startPoints,
    progress: 0,
    pull: { x: 0, y: 0 },
    wobble: 0,
    dragging: false,
    snapping: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    animationFrame: null,
    done: false
  };

  card.addEventListener("pointerdown", (event) => onPointerDown(event, state));
  card.addEventListener("pointermove", (event) => onPointerMove(event, state));
  card.addEventListener("pointerup", (event) => onPointerEnd(event, state));
  card.addEventListener("pointercancel", (event) => onPointerEnd(event, state));
  updateCard(state);
  cards.set(shape.id, state);

  return card;
}

function renderLevel(levelIndex) {
  currentLevelIndex = levelIndex;
  const level = LEVELS[currentLevelIndex];

  cards.forEach((card) => stopAnimation(card));
  cards.clear();
  board.replaceChildren(...level.shapes.map(createCard));
  doneCount.textContent = "0";
  doneTotal.textContent = String(level.shapes.length);
  levelName.textContent = level.name;
  statusMessage.textContent = "Attrape un pâton rond, puis tire doucement pour guider la pâte.";
  levelCompleteScreen.classList.add("is-hidden");
  victoryScreen.classList.add("is-hidden");
}

function showMenu() {
  menuScreen.classList.remove("is-hidden");
  levelCompleteScreen.classList.add("is-hidden");
  victoryScreen.classList.add("is-hidden");
  renderLevel(0);
}

renderLevel(0);

startButton.addEventListener("click", () => {
  menuScreen.classList.add("is-hidden");
  renderLevel(0);
});

nextLevelButton.addEventListener("click", () => {
  const nextLevel = Math.min(currentLevelIndex + 1, LEVELS.length - 1);
  renderLevel(nextLevel);
});

replayButton.addEventListener("click", () => {
  showMenu();
});
