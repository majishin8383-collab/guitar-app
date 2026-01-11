// backing.js — backing track audio engine (small + stable)
// - Deterministic UI state (play/pause flips immediately)
// - Loop + Stop
// - Volume + Mute (engine only; UI later if desired)

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

  async function playTrack(track) {
    if (!track || !track.audioUrl) return;

    if (state.trackId !== track.id) {
      audio.src = track.audioUrl;
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
      console.warn("Audio play failed:", e);
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
