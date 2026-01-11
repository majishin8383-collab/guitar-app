// backing.js — backing track audio engine (hardened)
// Fixes: URL resolution, ensures volume/mute are correct, adds error logging.

export function createBackingPlayer() {
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 1;
  audio.muted = false;

  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false,
    lastError: null
  };

  function absUrl(url) {
    try {
      // Make relative paths robust (works with hash routing)
      return new URL(url, window.location.href).toString();
    } catch {
      return url;
    }
  }

  function setLoop(on) {
    state.isLoop = !!on;
    audio.loop = state.isLoop;
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

  audio.addEventListener("ended", () => {
    if (!state.isLoop) state.isPlaying = false;
  });

  audio.addEventListener("error", () => {
    // This fires for 404, decode errors, unsupported formats, etc.
    const err = audio.error ? `AudioError code ${audio.error.code}` : "Unknown audio error";
    state.lastError = err;
    state.isPlaying = false;
    console.warn("[Backing] audio error:", err, "src:", audio.src);
  });

  function playTrack(track) {
    if (!track || !track.audioUrl) return;

    state.lastError = null;

    // Always ensure audible
    audio.muted = false;
    audio.volume = 1;

    const url = absUrl(track.audioUrl);

    // New track → load source
    if (state.trackId !== track.id) {
      audio.src = url;
      try { audio.currentTime = 0; } catch {}
      state.trackId = track.id;
    }

    // Flip state immediately for UI
    state.isPlaying = true;

    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        // ok
      }).catch((e) => {
        state.isPlaying = false;
        state.lastError = String(e?.message || e);
        console.warn("[Backing] play() failed:", e, "src:", audio.src);
      });
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
