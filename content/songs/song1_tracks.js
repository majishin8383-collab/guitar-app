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

  // EASY — Key A — ~80 bpm (blues)
  addTrack({
    id: "bt_song1_easy",
    name: "Song 1 — Easy (Key A) ~80 bpm — Blues",
    key: "A",
    recommendedBpm: 80,
    youtubeEmbed: "https://www.youtube.com/embed/QUZOJF_czqU"
  });

  // MEDIUM — Key A — ~95 bpm (blues/rock feel)
  addTrack({
    id: "bt_song1_medium",
    name: "Song 1 — Medium (Key A) ~95 bpm — Blues/Rock",
    key: "A",
    recommendedBpm: 95,
    youtubeEmbed: "https://www.youtube.com/embed/5Iq-IA2KDJE"
  });

  // HARD — A7-D7-E7 — 110 bpm (blues changes; fits A/D song vibe)
  addTrack({
    id: "bt_song1_hard",
    name: "Song 1 — Hard (A7-D7-E7) 110 bpm — Blues",
    key: "A",
    recommendedBpm: 110,
    youtubeEmbed: "https://www.youtube.com/embed/5eKtiKg5vBQ"
  });
})();
