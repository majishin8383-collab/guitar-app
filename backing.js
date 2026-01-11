// backing.js
// Simple backing track engine using HTMLAudioElement.
// Plays only when a track has `audioUrl`.

export function createBackingPlayer() {
  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false
  };

  let audio = null;

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      state.isPlaying = false;
      if (state.isLoop) {
        try {
          audio.currentTime = 0;
          audio.play();
          state.isPlaying = true;
        } catch (_) {}
      }
    });
    return audio;
  }

  function stop() {
    if (!audio) {
      state.trackId = null;
      state.isPlaying = false;
      return;
    }
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}
    state.trackId = null;
    state.isPlaying = false;
  }

  function setLoop(on) {
    state.isLoop = !!on;
    if (audio) audio.loop = false; // we handle looping ourselves on "ended"
  }

  function toggle(track) {
    // Guard
    if (!track || !track.id) return;
    if (!track.audioUrl) return;

    const a = ensureAudio();

    // Same track: toggle play/pause
    if (state.trackId === track.id) {
      if (state.isPlaying) {
        a.pause();
        state.isPlaying = false;
      } else {
        a.play();
        state.isPlaying = true;
      }
      return;
    }

    // Different track: stop old, load new
    try {
      a.pause();
    } catch (_) {}

    state.trackId = track.id;
    a.src = track.audioUrl;

    try {
      a.currentTime = 0;
      a.play();
      state.isPlaying = true;
    } catch (_) {
      state.isPlaying = false;
    }
  }

  return {
    state,
    toggle,
    stop,
    setLoop
  };
}
