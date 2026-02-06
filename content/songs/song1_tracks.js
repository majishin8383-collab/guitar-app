// content/songs/song1_tracks.js
// Must load BEFORE content/songs/song1.js

(function () {
  // Ensure CONTENT exists
  window.CONTENT = (window.CONTENT && typeof window.CONTENT === "object") ? window.CONTENT : {};
  window.CONTENT.backingTracks = window.CONTENT.backingTracks || {};

  function addTrack(t) {
    if (!t || !t.id) return;
    window.CONTENT.backingTracks[t.id] = t;
  }

  // ✅ IDs MUST MATCH song1.js variants backingTrackId exactly
  addTrack({
    id: "bt_song1_easy",
    name: "Song 1 — Easy (Key A) ~80 bpm",
    key: "A",
    recommendedBpm: 80,
    // MUST be an embed URL (not watch, not youtu.be)
    youtubeEmbed: "https://www.youtube.com/embed/PASTE_VIDEO_ID_FOR_EASY"
  });

  addTrack({
    id: "bt_song1_medium",
    name: "Song 1 — Medium (Key A) ~95 bpm",
    key: "A",
    recommendedBpm: 95,
    youtubeEmbed: "https://www.youtube.com/embed/PASTE_VIDEO_ID_FOR_MEDIUM"
  });

  addTrack({
    id: "bt_song1_hard",
    name: "Song 1 — Hard (Key A) ~110 bpm",
    key: "A",
    recommendedBpm: 110,
    youtubeEmbed: "https://www.youtube.com/embed/PASTE_VIDEO_ID_FOR_HARD"
  });
})();
