(function () {
  "use strict";

  const STORAGE_KEY = "dindin-audio-muted";
  const AUDIO_PATHS = {
    click: "./public/audio/click.mp3",
    cotcot1: "./public/audio/cotcot1.mp3",
    cotcot2: "./public/audio/cotcot2.mp3",
    debut: "./public/audio/debut.mp3",
    frotte1: "./public/audio/frotte1.mp3",
    frotte2: "./public/audio/frotte2.mp3",
    frotte3: "./public/audio/frotte3.mp3",
    frotte4: "./public/audio/frotte4.mp3",
    minichansonFin: "./public/audio/minichanson-fin.mp3",
    musiquejeu: "./public/audio/musiquejeu.mp3",
  };
  // Reglages des sons de brosse : effets courts, doux, sans superposition.
  const BRUSH_SOUND_COOLDOWN = 1400;
  const BRUSH_SOUND_MAX_DURATION = 180;
  const BRUSH_SOUND_VOLUME = 0.08;
  const BRUSH_SOUND_START_TIME = 0.06;
  const BRUSH_SOUND_NAMES = ["frotte1", "frotte3"];

  const sounds = new Map();
  const activeEffects = new Set();
  let currentMusic = null;
  let currentMusicName = "";
  let currentBrushSound = null;
  let brushStopTimer = null;
  let lastBrushSoundAt = 0;
  let unlocked = false;
  let muted = false;
  let globalVolume = 0.75;

  try {
    muted = localStorage.getItem(STORAGE_KEY) === "true";
  } catch (error) {
    muted = false;
  }

  function createAudio(name, path) {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = globalVolume;
    audio.dataset.ready = "true";
    audio.addEventListener("error", () => {
      audio.dataset.ready = "false";
    });
    sounds.set(name, audio);
  }

  Object.entries(AUDIO_PATHS).forEach(([name, path]) => createAudio(name, path));

  function canPlay(name) {
    return sounds.has(name) && sounds.get(name).dataset.ready !== "false";
  }

  function applyVolume(audio, multiplier = 1) {
    audio.volume = muted ? 0 : clamp(globalVolume * multiplier, 0, 1);
    audio.muted = muted;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function safePlay(audio) {
    if (!audio || muted || !unlocked) return;
    try {
      const promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    } catch (error) {
      // Browser audio errors should never stop the game.
    }
  }

  function unlock() {
    unlocked = true;
  }

  function playSound(name, options = {}) {
    if (!canPlay(name) || muted || !unlocked) return;

    const base = sounds.get(name);
    const audio = options.clone === false ? base : base.cloneNode(true);
    const isClone = audio !== base;
    applyVolume(audio, options.volume === undefined ? 1 : options.volume);

    try {
      audio.currentTime = 0;
    } catch (error) {
      // Some browsers may reject currentTime before metadata is ready.
    }

    if (isClone) {
      activeEffects.add(audio);
      audio.addEventListener("ended", () => activeEffects.delete(audio), { once: true });
    }

    safePlay(audio);
  }

  function playRandomSound(names, options = {}) {
    if (!Array.isArray(names) || names.length === 0) return;
    const playable = names.filter(canPlay);
    if (playable.length === 0) return;
    const name = playable[Math.floor(Math.random() * playable.length)];
    playSound(name, options);
  }

  function stopBrushSound() {
    if (brushStopTimer) {
      clearTimeout(brushStopTimer);
      brushStopTimer = null;
    }

    if (!currentBrushSound) return;
    try {
      currentBrushSound.pause();
      currentBrushSound.currentTime = 0;
    } catch (error) {
      // Keep brush sound cleanup silent.
    }
    currentBrushSound = null;
  }

  function playBrushSound(options = {}) {
    const cooldown = options.cooldown === undefined ? BRUSH_SOUND_COOLDOWN : options.cooldown;
    const maxDuration = options.maxDuration === undefined ? BRUSH_SOUND_MAX_DURATION : options.maxDuration;
    const volume = options.volume === undefined ? BRUSH_SOUND_VOLUME : options.volume;
    const now = Date.now();

    if (muted || !unlocked || now - lastBrushSoundAt < cooldown) return;

    const playable = BRUSH_SOUND_NAMES.filter(canPlay);
    if (playable.length === 0) return;

    lastBrushSoundAt = now;
    stopBrushSound();

    const name = playable[Math.floor(Math.random() * playable.length)];
    const audio = sounds.get(name);
    currentBrushSound = audio;
    applyVolume(audio, volume);

    try {
      audio.currentTime = BRUSH_SOUND_START_TIME;
    } catch (error) {
      // Some browsers may reject currentTime before metadata is ready.
    }

    safePlay(audio);

    brushStopTimer = setTimeout(() => {
      if (currentBrushSound === audio) stopBrushSound();
    }, maxDuration);
  }

  function stopMusic() {
    if (!currentMusic) return;
    try {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    } catch (error) {
      // Keep audio failure silent.
    }
    currentMusic = null;
    currentMusicName = "";
  }

  function stopEffects() {
    activeEffects.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // Safe no-op.
      }
    });
    activeEffects.clear();
    stopBrushSound();
  }

  function playMusic(name, options = {}) {
    unlock();
    if (!canPlay(name) || muted) {
      stopMusic();
      return;
    }

    if (currentMusicName === name && currentMusic && !currentMusic.paused) return;

    stopMusic();
    currentMusic = sounds.get(name);
    currentMusicName = name;
    currentMusic.loop = options.loop !== false;
    applyVolume(currentMusic, options.volume === undefined ? 0.72 : options.volume);

    try {
      currentMusic.currentTime = 0;
    } catch (error) {
      // Safe no-op.
    }

    safePlay(currentMusic);
  }

  function playMenuMusic() {
    playMusic("debut", { loop: true, volume: 0.55 });
  }

  function playGameMusic() {
    playMusic("musiquejeu", { loop: true, volume: 0.62 });
  }

  function playFinalMusic() {
    playMusic("minichansonFin", { loop: false, volume: 0.78 });
  }

  function setVolume(value) {
    globalVolume = clamp(Number(value) || 0, 0, 1);
    sounds.forEach((audio) => applyVolume(audio));
    if (currentMusic) applyVolume(currentMusic, 0.62);
    if (currentBrushSound) applyVolume(currentBrushSound, BRUSH_SOUND_VOLUME);
  }

  function setMuted(value) {
    muted = Boolean(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch (error) {
      // localStorage can be unavailable in strict file contexts.
    }

    sounds.forEach((audio) => {
      audio.muted = muted;
      if (muted) {
        try {
          audio.pause();
        } catch (error) {
          // Safe no-op.
        }
      }
    });

    if (muted) {
      stopEffects();
    }

    if (muted) {
      stopMusic();
      stopBrushSound();
    }
  }

  function toggleMuted() {
    unlock();
    setMuted(!muted);
    return muted;
  }

  window.DindinAudio = {
    unlock,
    playSound,
    playRandomSound,
    playBrushSound,
    playMenuMusic,
    playGameMusic,
    playFinalMusic,
    playMusic,
    stopMusic,
    stopEffects,
    setVolume,
    setMuted,
    toggleMuted,
    isMuted: () => muted,
    isUnlocked: () => unlocked,
    canPlay,
  };
}());
