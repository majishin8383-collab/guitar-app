// content/base.js
// Content registry + safe merge (keeps window.CONTENT stable)
// Load this BEFORE any genre content scripts.

(function () {
  // ✅ MIN UPDATE: add songs bucket
  const empty = { genres: {}, skills: {}, backingTracks: {}, songs: {} };

  // If something already created CONTENT, keep it; otherwise initialize.
  window.CONTENT = (window.CONTENT && typeof window.CONTENT === "object")
    ? window.CONTENT
    : { ...empty };

  // Ensure all top-level buckets exist
  window.CONTENT.genres = window.CONTENT.genres || {};
  window.CONTENT.skills = window.CONTENT.skills || {};
  window.CONTENT.backingTracks = window.CONTENT.backingTracks || {};
  // ✅ MIN UPDATE: ensure songs bucket exists
  window.CONTENT.songs = window.CONTENT.songs || {};

  // Merge helper used by genre files
  window.CONTENT_ADD = function addContent(part) {
    if (!part || typeof part !== "object") return;

    if (part.genres) Object.assign(window.CONTENT.genres, part.genres);
    if (part.skills) Object.assign(window.CONTENT.skills, part.skills);
    if (part.backingTracks) Object.assign(window.CONTENT.backingTracks, part.backingTracks);
    // ✅ MIN UPDATE: allow merging songs via CONTENT_ADD({ songs: {...} })
    if (part.songs) Object.assign(window.CONTENT.songs, part.songs);
  };

  // ✅ MIN UPDATE: helper used by content/songs/song*.js
  window.CONTENT_ADD_SONG = function addSong(song) {
    if (!song || typeof song !== "object") return;
    if (!song.id) return;
    window.CONTENT.songs[song.id] = song;
  };
})();
