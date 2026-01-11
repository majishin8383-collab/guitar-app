// backing.js — tiny backing track audio engine (Dose 1.3)
// Plays audioUrl if present. Supports loop + stop.

export function createBackingPlayer() {
  const audio = new Audio();
  audio.preload = "none";

  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false
  };

  audio.addEventListener("ended", () => {
    if (!audio.loop) state.isPlaying = false;
  });

  function setLoop(on) {
    state.isLoop = !!on;
    audio.loop = state.isLoop;
  }

  function stop() {
    try { audio.pause(); } catch {}
    audio.currentTime = 0;
    state.isPlaying = false;
    // keep trackId so UI can still show which track was last selected
  }

  async function playTrack(track) {
    if (!track || !track.audioUrl) return;

    if (state.trackId !== track.id) {
      audio.src = track.audioUrl;
      audio.loop = state.isLoop;
      state.trackId = track.id;
    }

    try {
      await audio.play();
      state.isPlaying = true;
    } catch (e) {
      // Autoplay restrictions: user must click (we only call from button click anyway)
      state.isPlaying = false;
      console.warn("Audio play blocked:", e);
    }
  }

  function pause() {
    try { audio.pause(); } catch {}
    state.isPlaying = false;
  }

  function toggle(track) {
    if (!track || !track.audioUrl) return;

    const isSame = state.trackId === track.id;
    if (isSame && state.isPlaying) pause();
    else playTrack(track);
  }

  return { state, toggle, stop, setLoop };
}
