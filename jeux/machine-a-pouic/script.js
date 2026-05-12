const audioBank = [
  { title: "Bozo Boeing 747", src: "assets/audio/bozo-boeing-747.wav", kind: "son rigolo" },
  { title: "Cot Cot Cot", src: "assets/audio/cot-cot-cot.wav", kind: "poule" },
  { title: "Cui Cui Cuicui", src: "assets/audio/cui-cui.wav", kind: "oiseau" },
  { title: "Guouiguouiguoui!", src: "assets/audio/guouiguouiguoui.wav", kind: "mystere" },
  { title: "MHEUUU Cow", src: "assets/audio/mheuuu-cow.wav", kind: "vache" },
  { title: "Gros chat tigre gourmand", src: "assets/audio/miaou-gros-chat.wav", kind: "chat" },
  { title: "Miaou Miaou", src: "assets/audio/miaou-miaou.wav", kind: "chat" },
  { title: "Patatame l'hippopotame", src: "assets/audio/pata-pata-hippopotame.wav", kind: "hippo" },
  { title: "Raisin Pepins", src: "assets/audio/raisin-pepins.wav", kind: "fruit" },
  { title: "Wouaf Cantina Bark 1", src: "assets/audio/wouaf-cantina-bark-1.wav", kind: "chien" },
  { title: "Wouaf Cantina Bark", src: "assets/audio/wouaf-cantina-bark.wav", kind: "chien" },
  { title: "Boulbou", src: "assets/audio/boulbou.wav", kind: "chanson" },
  { title: "Poulpossa", src: "assets/audio/poulpossa.wav", kind: "chanson" },
  { title: "Petite mouche", src: "assets/audio/petite-mouche.wav", kind: "chanson" },
  { title: "Ma ptite fee", src: "assets/audio/ma-ptite-fee.wav", kind: "chanson" },
];

const imageBank = [
  { title: "Piscine tomate", src: "assets/images/tomato-pool.png" },
  { title: "Atelier machine magique", src: "assets/images/magic-toy-machine.png" },
  { title: "Pinouille machine", src: "assets/images/pinouille-machine.png" },
  { title: "Petit mouton timide", src: "assets/images/shy-sheep.png" },
  { title: "Gateau des copains", src: "assets/images/cake-party.png" },
  { title: "Chat gateau citron", src: "assets/images/cat-cake.png" },
  { title: "Pouic pouic rose", src: "assets/images/pink-pouic.png" },
  { title: "Bain des jouets", src: "assets/images/bath-toys.png" },
  { title: "DJ araignee", src: "assets/images/dj-spider.png" },
  { title: "Poisson du chef", src: "assets/images/beaver-fish.png" },
  { title: "Tourbillon peluche", src: "assets/images/rainbow-plush.png" },
  { title: "Cabane noisettes", src: "assets/images/squirrel-nuts.png" },
  { title: "Danse de la ferme", src: "assets/images/farm-dance.png" },
  { title: "Faon aux fruits", src: "assets/images/berry-deer.png" },
  { title: "Vache et poussin", src: "assets/images/cow-duck.png" },
  { title: "Wouf jardin", src: "assets/images/garden-dog.png" },
  { title: "Coccinelle fleur", src: "assets/images/ladybug-flower.png" },
  { title: "Sanglier renifleur", src: "assets/images/boar-flower.png" },
];

const buttonRecipes = [
  { label: "Coeur pouic", icon: "♥", shape: "heart", color: "pink", size: "big", audio: "Guouiguouiguoui!", image: "Pouic pouic rose" },
  { label: "Lune chat", icon: "☾", shape: "moon", color: "blue", audio: "Miaou Miaou", image: "Chat gateau citron" },
  { label: "Soleil ferme", icon: "☀", shape: "sun", color: "yellow", audio: "Cot Cot Cot", image: "Danse de la ferme" },
  { label: "Mouton doux", icon: "☁", shape: "blob", color: "mint", audio: "Ma ptite fee", image: "Petit mouton timide" },
  { label: "Vache miam", icon: "●", shape: "circle", color: "green", audio: "MHEUUU Cow", image: "Vache et poussin" },
  { label: "Chien cantina", icon: "◆", shape: "diamond", color: "orange", audio: "Wouaf Cantina Bark", image: "Wouf jardin" },
  { label: "Oiseau bleu", icon: "♪", shape: "flower", color: "blue", audio: "Cui Cui Cuicui", image: "Piscine tomate" },
  { label: "Raisin pepin", icon: "●", shape: "pill", color: "violet", audio: "Raisin Pepins", image: "Faon aux fruits" },
  { label: "Hippo pata", icon: "■", shape: "blob", color: "red", audio: "Patatame l'hippopotame", image: "Piscine tomate" },
  { label: "DJ nuit", icon: "★", shape: "star", color: "orange", size: "wide", audio: "Poulpossa", image: "DJ araignee" },
  { label: "Mouche mini", icon: "✿", shape: "flower", color: "green", audio: "Petite mouche", image: "Coccinelle fleur" },
  { label: "Boulbou boom", icon: "●", shape: "circle", color: "red", size: "big", audio: "Boulbou", image: "Tourbillon peluche" },
  { label: "Poisson chef", icon: "◐", shape: "pill", color: "mint", audio: "Bozo Boeing 747", image: "Poisson du chef" },
  { label: "Noisette tip", icon: "▲", shape: "diamond", color: "yellow", audio: "Raisin Pepins", image: "Cabane noisettes" },
  { label: "Bain plouf", icon: "☂", shape: "blob", color: "blue", audio: "Guouiguouiguoui!", image: "Bain des jouets" },
  { label: "Gateau fiesta", icon: "●", shape: "circle", color: "pink", audio: "Gros chat tigre gourmand", image: "Gateau des copains" },
  { label: "Sanglier snif", icon: "♣", shape: "flower", color: "orange", audio: "Bozo Boeing 747", image: "Sanglier renifleur" },
  { label: "Surprise roi", icon: "?", shape: "star", color: "violet", size: "wide", random: true },
  { label: "Double tintouin", icon: "!!", shape: "pill", color: "green", double: true },
  { label: "Image magique", icon: "◉", shape: "heart", color: "red", imageOnly: true },
  { label: "Chat gourmand", icon: "●", shape: "blob", color: "yellow", audio: "Gros chat tigre gourmand", image: "Chat gateau citron" },
  { label: "Wouaf bis", icon: "♦", shape: "diamond", color: "blue", audio: "Wouaf Cantina Bark 1", image: "Wouf jardin" },
  { label: "Machine folle", icon: "✦", shape: "sun", color: "pink", size: "big", random: true, double: true },
  { label: "Carotte splash", icon: "▲", shape: "pill", color: "orange", audio: "Cot Cot Cot", image: "Piscine tomate" },
];

const screen = document.querySelector(".screen");
const imageElement = document.querySelector("#surpriseImage");
const titleElement = document.querySelector("#surpriseTitle");
const modeElement = document.querySelector("#surpriseMode");
const buttonField = document.querySelector("#buttonField");
const volumeControl = document.querySelector("#volumeControl");
const volumeReadout = document.querySelector("#volumeReadout");
const megaButton = document.querySelector("#megaButton");
const stopButton = document.querySelector("#stopButton");
const sparkles = document.querySelector("#sparkles");

let currentAudio = [];
let lastImageIndex = 1;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function findAudio(title) {
  return audioBank.find((item) => item.title === title) || pick(audioBank);
}

function findImage(title) {
  return imageBank.find((item) => item.title === title) || pick(imageBank);
}

function getRealVolume() {
  const fakeVolume = Number(volumeControl.value);
  if (fakeVolume <= 0) return 0;
  return Math.min(1, Math.max(0.04, fakeVolume / 3000));
}

function updateVolume() {
  volumeReadout.textContent = `${volumeControl.value}%`;
  currentAudio.forEach((audio) => {
    audio.volume = getRealVolume();
  });
}

function stopAudio() {
  currentAudio.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  currentAudio = [];
}

function playAudio(item, keepOthers = false) {
  if (!keepOthers) stopAudio();
  const audio = new Audio(item.src);
  audio.volume = getRealVolume();
  audio.addEventListener("ended", () => {
    currentAudio = currentAudio.filter((entry) => entry !== audio);
  });
  currentAudio.push(audio);
  audio.play().catch(() => {
    modeElement.textContent = "clique encore";
  });
}

function showImage(item) {
  imageElement.src = item.src;
  imageElement.alt = `Illustration surprise: ${item.title}`;
  screen.classList.remove("is-flashing");
  window.requestAnimationFrame(() => {
    screen.classList.add("is-flashing");
  });
  lastImageIndex = imageBank.indexOf(item);
  window.setTimeout(() => screen.classList.remove("is-flashing"), 520);
}

function nextDifferentImage() {
  let index = Math.floor(Math.random() * imageBank.length);
  if (imageBank.length > 1 && index === lastImageIndex) {
    index = (index + 1) % imageBank.length;
  }
  return imageBank[index];
}

function burst() {
  sparkles.replaceChildren();
  const colors = ["#ffe24d", "#ff4fa3", "#43c95f", "#39aaf8", "#ff8b21", "#ffffff"];
  for (let i = 0; i < 20; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${8 + Math.random() * 84}%`;
    spark.style.top = `${12 + Math.random() * 78}%`;
    spark.style.background = colors[Math.floor(Math.random() * colors.length)];
    spark.style.animationDelay = `${Math.random() * 150}ms`;
    sparkles.appendChild(spark);
  }
}

function performSurprise(recipe = {}) {
  const randomRule = recipe.random || Math.random() < 0.28;
  const audioItem = recipe.imageOnly ? null : randomRule ? pick(audioBank) : findAudio(recipe.audio);
  const imageItem = randomRule || recipe.imageOnly || Math.random() < 0.72 ? nextDifferentImage() : findImage(recipe.image);
  const shouldLayer = recipe.double || Math.random() < 0.12;

  if (audioItem) {
    playAudio(audioItem, false);
    if (shouldLayer) {
      window.setTimeout(() => playAudio(pick(audioBank), true), 180 + Math.random() * 320);
    }
  } else if (Math.random() < 0.45) {
    stopAudio();
  }

  showImage(imageItem);
  burst();

  const soundName = audioItem ? audioItem.title : "image secrete";
  titleElement.textContent = `${recipe.label || "Mega surprise"}: ${soundName}`;
  modeElement.textContent = randomRule ? "hasard royal" : shouldLayer ? "double bazar" : imageItem.title;
}

function createButton(recipe) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "fun-button",
    `shape-${recipe.shape}`,
    `color-${recipe.color}`,
    recipe.size === "big" ? "fun-button--big" : "",
    recipe.size === "wide" ? "fun-button--wide" : "",
  ].filter(Boolean).join(" ");
  button.innerHTML = `<span class="fun-button__icon" aria-hidden="true">${recipe.icon}</span><span class="fun-button__label">${recipe.label}</span>`;
  button.addEventListener("click", () => {
    button.classList.remove("is-bouncing");
    window.requestAnimationFrame(() => button.classList.add("is-bouncing"));
    performSurprise(recipe);
  });
  button.addEventListener("animationend", () => button.classList.remove("is-bouncing"));
  return button;
}

buttonRecipes.forEach((recipe) => {
  buttonField.appendChild(createButton(recipe));
});

volumeControl.addEventListener("input", updateVolume);
megaButton.addEventListener("click", () => performSurprise({ label: "Mega pouic", random: true, double: true }));
stopButton.addEventListener("click", () => {
  stopAudio();
  titleElement.textContent = "Chut doux active";
  modeElement.textContent = "pause magique";
});

updateVolume();
