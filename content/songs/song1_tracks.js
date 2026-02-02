// content/songs/song1_tracks.js
// Backing tracks for song1 variants (must match backingTrackId in song1.js)

CONTENT_ADD({
  backingTracks: {
    bt_song1_easy: {
      id: "bt_song1_easy",
      name: "Blues in A — 80 bpm (easy)",
      key: "A",
      recommendedBpm: 80,
      youtubeEmbed: "https://www.youtube.com/embed/y6ssAMKXPog"
    },

    // NOTE: This one is a temporary “A groove” at ~95bpm so Medium is not pop/acoustic.
    // If you want STRICT A↔D blues harmony only, we can swap this ID once you pick the exact track.
    bt_song1_medium: {
      id: "bt_song1_medium",
      name: "Groove in A — ~95 bpm (medium)",
      key: "A",
      recommendedBpm: 95,
      youtubeEmbed: "https://www.youtube.com/embed/MEX1mOyvTQA"
    },

    bt_song1_hard: {
      id: "bt_song1_hard",
      name: "Blues in A — 110 bpm (hard)",
      key: "A",
      recommendedBpm: 110,
      youtubeEmbed: "https://www.youtube.com/embed/gT_HLlEDwwg"
    }
  }
});
