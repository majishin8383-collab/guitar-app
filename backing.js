// backing.js — backing track audio engine (small + stable)
// - Deterministic UI state (play/pause flips immediately)
// - Loop + Stop
// - Volume + Mute (engine only; UI later if desired)
// - AUDIO FIX: resolve audioUrl against current location (hash-safe) + log load errors

export function createBackingPlayer() {
  const audio = new Audio();
  audio.preload = "auto";

  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false,
    volume: 0.85,
    muted: false
  };

  function apply() {
    audio.loop = !!state.isLoop;
    audio.volume = clamp01(state.volume);
    audio.muted = !!state.muted;
  }

  audio.addEventListener("ended", () => {
    if (!state.isLoop) state.isPlaying = false;
  });

  // NEW: log real audio loading/decoding errors (404, bad path, unsupported format, etc.)
  audio.addEventListener("error", () => {
    const code = audio.error ? audio.error.code : "unknown";
    console.warn("[Backing] audio error:", code, "src:", audio.src);
    state.isPlaying = false;
  });

  function setLoop(on) {
    state.isLoop = !!on;
    apply();
  }

  function setVolume(v) {
    state.volume = clamp01(v);
    apply();
  }

  function setMuted(on) {
    state.muted = !!on;
    apply();
  }

  function stop() {
    try { audio.pause(); } catch {}
    try { audio.currentTime = 0; } catch {}
    state.isPlaying = false;
    state.trackId = null;
  }

  function pause() {
    try { audio.pause(); } catch {}
    state.isPlaying = false;
  }

  function resolveUrl(url) {
    try {
      return new URL(url, window.location.href).toString();
    } catch {
      return url;
    }
  }

  async function playTrack(track) {
    if (!track || !track.audioUrl) return;

    if (state.trackId !== track.id) {
      audio.src = resolveUrl(track.audioUrl); // NEW: hash-safe resolution
      try { audio.currentTime = 0; } catch {}
      state.trackId = track.id;
    }

    apply();

    // flip immediately so UI can show Pause right away
    state.isPlaying = true;

    try {
      const p = audio.play();
      if (p && typeof p.then === "function") await p;
      state.isPlaying = true;
    } catch (e) {
      console.warn("[Backing] audio play failed:", e, "src:", audio.src);
      state.isPlaying = false;
    }
  }

  function toggle(track) {
    if (!track || !track.audioUrl) return;

    const same = state.trackId === track.id;
    if (same && state.isPlaying) pause();
    else playTrack(track);
  }

  apply();

  return {
    state,
    toggle,
    stop,
    pause,
    setLoop,
    setVolume,
    setMuted
  };
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0.85;
  return Math.max(0, Math.min(1, x));
}
