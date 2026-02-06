// content/songs/song1.tracks.js
// Song 1 backing tracks (Key of A)

CONTENT_ADD({
  backingTracks: {
    bt_song1_easy: {
      id: "bt_song1_easy",
      name: "Midnight Blues (A Major) — 80 BPM",
      key: "A",
      recommendedBpm: 80,
      // watch URL is fine; ui/songs.js normalizes to embed
      youtubeEmbed: "https://www.youtube.com/watch?v=edHpcXRLk4A"
    },

    bt_song1_medium: {
      id: "bt_song1_medium",
      name: "Bass Jam Track (A Major) — 95 BPM",
      key: "A",
      recommendedBpm: 95,
      youtubeEmbed: "https://www.youtube.com/watch?v=-fvmZAXJydY"
    },

    bt_song1_hard: {
      id: "bt_song1_hard",
      name: "Jazzy Hendrix Blues Jam (A) — 110 BPM",
      key: "A",
      recommendedBpm: 110,
      youtubeEmbed: "https://www.youtube.com/watch?v=sjOUFMasOQs"
    }
  }
});
