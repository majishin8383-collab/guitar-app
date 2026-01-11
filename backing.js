// backing.js — YouTube-only "backing track" opener (LEGAL + EASY)
// - Keeps the same public API + deterministic UI state
// - No audio hosting, no WebAudio, no generator sessions
// - Opens YouTube in a new tab/app via direct link OR search query
//
// Track format supported (minimal):
//   track.youtubeUrl: "https://www.youtube.com/watch?v=..."
//   track.youtubeQuery: "12 bar blues shuffle backing track key A 92 bpm"
// Optional (for UI display only):
//   track.title, track.key, track.bpm
//
// Notes:
// - Loop/Volume/Mute remain as UI controls but do not affect YouTube playback.
// - "Playing" means: last opened track. (We cannot control external playback.)

export function createBackingPlayer() {
  // Public state (UI reads this)
  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false,   // UI-only (external playback can't be controlled)
    volume: 0.85,    // UI-only
    muted: false     // UI-only
  };

  const clamp01 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0.85;
    return Math.max(0, Math.min(1, x));
  };

  function setLoop(on) {
    state.isLoop = !!on;
  }

  function setVolume(v) {
    state.volume = clamp01(v);
  }

  function setMuted(on) {
    state.muted = !!on;
  }

  function pause() {
    // External playback cannot be paused from here (legal/safe).
    // We treat pause as "stop tracking playing state".
    stop();
  }

  function stop() {
    state.isPlaying = false;
    state.trackId = null;
  }

  function buildYouTubeUrl(track) {
    if (!track) return null;

    // Best: direct YouTube URL
    if (typeof track.youtubeUrl === "string" && track.youtubeUrl.trim()) {
      return track.youtubeUrl.trim();
    }

    // Fallback: search query
    const q =
      (typeof track.youtubeQuery === "string" && track.youtubeQuery.trim())
        ? track.youtubeQuery.trim()
        : (typeof track.title === "string" && track.title.trim())
          ? track.title.trim()
          : "";

    if (!q) return null;

    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  }

  function openExternal(url) {
    // Safest: user-initiated open in new tab. On mobile, usually opens the YouTube app.
    try {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    } catch (e) {
      console.warn("[Backing] window.open failed:", e);
      return false;
    }
  }

  async function playTrack(track) {
    if (!track) return;

    const url = buildYouTubeUrl(track);
    if (!url) {
      console.warn("[Backing] No youtubeUrl or youtubeQuery for track:", track);
      stop();
      return;
    }

    // Flip immediately for UI
    state.trackId = track.id || track.trackId || track.title || "track";
    state.isPlaying = true;

    const ok = openExternal(url);

    // If open failed, revert UI state (deterministic + honest)
    if (!ok) stop();
  }

  function toggle(track) {
    if (!track) return;

    const same = state.trackId === (track.id || track.trackId || track.title || "track");
    if (same && state.isPlaying) {
      pause();
    } else {
      playTrack(track);
    }
  }

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
