// backing.js — backing track audio engine (FIXED state sync)
// Ensures UI Play/Pause state is correct immediately after click

export function createBackingPlayer() {
  const audio = new Audio();
  audio.preload = "auto";

  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false
  };

  audio.addEventListener("ended", () => {
    if (!state.isLoop) {
      state.isPlaying = false;
    }
  });

  function setLoop(on) {
    state.isLoop = !!on;
    audio.loop = state.isLoop;
  }

  function stop() {
    try { audio.pause(); } catch {}
    audio.currentTime = 0;
    state.isPlaying = false;
    state.trackId = null;
  }

  function pause() {
    try { audio.pause(); } catch {}
    state.isPlaying = false;
  }

  function playTrack(track) {
    if (!track || !track.audioUrl) return;

    // New track → load source
    if (state.trackId !== track.id) {
      audio.src = track.audioUrl;
      audio.currentTime = 0;
      state.trackId = track.id;
    }

    // IMPORTANT: flip state immediately for UI
    state.isPlaying = true;

    try {
      audio.play();
    } catch (e) {
      console.warn("Audio play failed:", e);
      state.isPlaying = false;
    }
  }

  function toggle(track) {
    if (!track || !track.audioUrl) return;

    const sameTrack = state.trackId === track.id;

    if (sameTrack && state.isPlaying) {
      pause();
    } else {
      playTrack(track);
    }
  }

  return {
    state,
    toggle,
    stop,
    setLoop
  };
}
