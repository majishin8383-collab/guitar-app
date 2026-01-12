// backing.js — YouTube-first backing-track engine (legal + simple)
// - Supports in-app embed via track.youtubeEmbed (no new tab)
// - Otherwise opens YouTube link/search externally
// - Keeps deterministic UI state
//
// Track format supported:
//   track.youtubeEmbed: "https://www.youtube.com/embed/VIDEO_ID"  (in-app iframe)
//   track.youtubeUrl:   "https://www.youtube.com/watch?v=..."     (external)
//   track.youtubeQuery: "12 bar blues shuffle backing track key A 92 bpm" (external search)
//
// Legacy support (optional):
//   track.generator: { ... }   // ignored here unless you still have older generator code elsewhere
//   track.audioUrl: "..."      // ignored here

export function createBackingPlayer() {
  const state = {
    trackId: null,
    isPlaying: false,  // means "selected/active" (not actual YouTube playback control)
    isLoop: false,
    volume: 0.85,
    muted: false
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

  function stop() {
    state.isPlaying = false;
    state.trackId = null;
  }

  function pause() {
    // For YouTube tracks, pause = clear selection (simple + stable)
    stop();
  }

  function safeEmbed(url) {
    if (!url || typeof url !== "string") return null;
    const ok =
      url.startsWith("https://www.youtube.com/embed/") ||
      url.startsWith("https://youtube.com/embed/") ||
      url.startsWith("https://www.youtube-nocookie.com/embed/");
    return ok ? url : null;
  }

  function openExternal(url) {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // fallback: same-tab
      window.location.href = url;
    }
  }

  function openYoutubeQuery(q) {
    const query = String(q || "").trim();
    if (!query) return;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    openExternal(url);
  }

  function playTrack(track) {
    if (!track) return;

    // If switching tracks, reset prior selection
    if (state.trackId && state.trackId !== track.id) stop();

    // In-app embed path: DO NOT open a new tab
    const embed = safeEmbed(track.youtubeEmbed);
    if (embed) {
      state.trackId = track.id;
      state.isPlaying = true;
      return;
    }

    // External direct link
    if (track.youtubeUrl) {
      state.trackId = track.id;
      state.isPlaying = true;
      openExternal(track.youtubeUrl);
      return;
    }

    // External search
    if (track.youtubeQuery) {
      state.trackId = track.id;
      state.isPlaying = true;
      openYoutubeQuery(track.youtubeQuery);
      return;
    }

    // Legacy/unsupported sources (kept non-crashy)
    if (track.generator || track.audioUrl) {
      console.warn("[Backing] Legacy track source present but YouTube-first backing.js is active:", track.id);
      state.trackId = track.id;
      state.isPlaying = true;
      return;
    }

    console.warn("[Backing] Track has no playable source:", track.id);
  }

  function toggle(track) {
    if (!track) return;
    const same = state.trackId === track.id;

    // If currently active → clear
    if (same && state.isPlaying) {
      pause();
      return;
    }

    // Otherwise activate + open (or embed)
    playTrack(track);
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
