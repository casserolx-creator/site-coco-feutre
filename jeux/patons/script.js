const LEVELS = [
  {
    id: 1,
    name: "Niveau 1",
    shapes: [
      { id: "star", label: "Étoile", successLabel: "l'étoile", kind: "star" },
      { id: "square", label: "Carré", successLabel: "le carré", kind: "square" },
      { id: "diamond", label: "Losange", successLabel: "le losange", kind: "diamond" },
      { id: "bird", label: "Oiseau", successLabel: "l'oiseau", kind: "bird" },
      { id: "rabbit", label: "Lapin", successLabel: "le lapin", kind: "rabbit" },
      { id: "bear", label: "Ours", successLabel: "l'ours", kind: "bear" }
    ]
  }
];

const SAMPLE_COUNT = 76;
const DONE_AT = 0.92;
const SNAP_AT = 0.82;
const ELASTIC_BACK = 0.14;
const VIEWBOX = { width: 240, height: 205 };
const DOUGH_CENTER = { x: 120, y: 118 };
const board = document.querySelector("#board");
const doneCount = document.querySelector("#done-count");
const statusMessage = document.querySelector("#status-message");
const menuScreen = document.querySelector("#menu-screen");
const victoryScreen = document.querySelector("#victory-screen");
const startButton = document.querySelector("#start-button");
const replayButton = document.querySelector("#replay-button");
const currentLevel = LEVELS[0];
const cards = new Map();

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

function baseShapePoints(kind) {
  const map = {
    star: starPoints(120, 112, 74, 35, 5),
    square: rectPoints(58, 54, 124, 124),
    diamond: diamondPoints(120, 116, 140, 140),
    bird: birdPoints(),
    rabbit: rabbitPoints(),
    bear: bearPoints()
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

function doughPath(startPoints, targetPoints, progress, wobble, pull) {
  const eased = 1 - Math.pow(1 - progress, 2);
  const pullAngle = Math.atan2(pull.y, pull.x);
  const pullDistance = Math.hypot(pull.x, pull.y);
  const pullStrength = clamp(pullDistance / 72, 0, 1) * (1 - progress * 0.55);
  const points = startPoints.map((point, index) => {
    const target = targetPoints[index];
    const wiggle = Math.sin(wobble + index * 0.55) * (1 - progress) * 3;
    const angle = Math.atan2(point.y - DOUGH_CENTER.y, point.x - DOUGH_CENTER.x);
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

function facePosition(progress) {
  const y = lerp(121, 132, progress);
  const scale = lerp(1, 0.88, progress);
  const smile = progress >= DONE_AT ? "M 106 137 Q 120 148 134 137" : "M 108 138 Q 120 144 132 138";

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
  const wobble = state.wobble;
  const path = doughPath(state.startPoints, state.targetPoints, state.progress, wobble, state.pull);
  const face = facePosition(state.progress);

  state.dough.setAttribute("d", path);
  state.leftEye.setAttribute("cx", lerp(106, 102, state.progress));
  state.leftEye.setAttribute("cy", face.y);
  state.rightEye.setAttribute("cx", lerp(134, 138, state.progress));
  state.rightEye.setAttribute("cy", face.y);
  state.mouth.setAttribute("d", face.smile);
  state.face.setAttribute("transform", `scale(${face.scale} ${face.scale}) translate(${(120 / face.scale - 120).toFixed(2)} 0)`);
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
    window.setTimeout(() => {
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
  const dx = point.x - DOUGH_CENTER.x;
  const dy = point.y - DOUGH_CENTER.y;
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

function createCard(shape) {
  const card = document.createElement("article");
  card.className = "dough-card is-idle";
  card.setAttribute("aria-label", `${shape.label} à étirer`);

  const label = document.createElement("span");
  label.className = "shape-name";
  label.textContent = shape.label;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("shape-svg");
  svg.setAttribute("viewBox", "0 0 240 205");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-hidden", "true");

  const targetBase = baseShapePoints(shape.kind);
  const targetPoints = sampleClosedPolygon(targetBase, SAMPLE_COUNT);
  const startPoints = circlePoints(120, 118, 42, SAMPLE_COUNT);

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

function renderLevel(level) {
  cards.forEach((card) => stopAnimation(card));
  cards.clear();
  board.replaceChildren(...level.shapes.map(createCard));
  doneCount.textContent = "0";
  statusMessage.textContent = "Attrape un pâton rond, puis tire doucement pour guider la pâte.";
  victoryScreen.classList.add("is-hidden");
}

renderLevel(currentLevel);

startButton.addEventListener("click", () => {
  menuScreen.classList.add("is-hidden");
});

replayButton.addEventListener("click", () => {
  renderLevel(currentLevel);
});
