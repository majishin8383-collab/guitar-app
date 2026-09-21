// Titles, BPM and embed eligibility checked against YouTube on 2026-09-20.
// Drums avoid pitched changes conflicting with Song 1's A/A/D/A loop.
(function () {
  const sources = [["easy",80,"nm7neHuVuic"],["medium",95,"7QdfK0Vs1nM"],["hard",110,"dYzQfWD8bGk"]];
  const tracks = {};
  for (const [level, bpm, id] of sources) {
    const trackId = `bt_song1_${level}`;
    tracks[trackId] = {
      id: trackId, name: `Blues shuffle drums · ${bpm} BPM`, key: "A", keyAppliesTo: "exercise",
      recommendedBpm: bpm, accompaniment: "drums-only", youtubeEmbed: `https://www.youtube.com/embed/${id}`
    };
  }
  tracks.bt_song1_full_band = {
    id: "bt_song1_full_band", genre: "blues", name: "Fat Funky Blues · A · 80 BPM",
    key: "A", recommendedBpm: 80, mix: "both", feel: "funky blues",
    note: "Full-band jam. Follow the changes in the video; this is a different progression from First Groove. For lead, start with a short A minor pentatonic phrase.",
    youtubeEmbed: "https://www.youtube.com/embed/QUZOJF_czqU"
  };
  window.CONTENT_ADD({ backingTracks: tracks });
})();
