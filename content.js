// content.js
// Dose 0.2 — Content Model v1 (+ handedness-safe language)
// Dose 0.2.2 — Video hooks per drill (demo / mistake / fix)
//
// IMPORTANT RULE:
// - Avoid "left hand / right hand" in instruction text.
// - Always say "fretting hand" and "picking hand".
// - Videos can be mirrored for left-handed players.

window.CONTENT = {
  genres: {
    blues: {
      id: "blues",
      name: "Blues",
      description: "Phrasing, bends, vibrato, groove, and the 12-bar language.",
      starterSkillIds: ["blues_timing_shuffle", "blues_pentatonic_box1", "blues_bends_vibrato"],
      backingTrackIds: ["bt_blues_shuffle_A", "bt_blues_slow_12bar_E"]
    }
  },

  skills: {
    blues_timing_shuffle: {
      id: "blues_timing_shuffle",
      genre: "blues",
      name: "Shuffle Timing (Foundation)",
      levelBand: "beginner",
      summary: "Lock in a blues shuffle feel with clean picking-hand consistency.",
      drills: [
        {
          id: "d_shuffle_1",
          name: "Muted shuffle strum",
          durationSec: 120,
          handednessSafe: true,
          instructions: [
            "Lightly mute strings with your fretting hand.",
            "Strum a steady shuffle: long-short, long-short.",
            "Keep the picking hand relaxed and consistent.",
            "Focus on evenness — not speed."
          ],
          suggestedBpm: { start: 60, target: 90, step: 5 },
          media: {
            // Replace these with your friend’s videos later.
            demoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            dontUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            fixUrl:  "https://www.youtube.com/embed/dQw4w9WgXcQ"
          }
        },
        {
          id: "d_shuffle_2",
          name: "12-bar rhythm hits",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play a simple 12-bar rhythm (even just on one chord).",
            "Count bars out loud if needed.",
            "Goal: no rushing on bar transitions.",
            "Keep fretting-hand pressure light to avoid fatigue."
          ],
          suggestedBpm: { start: 60, target: 100, step: 5 }
        }
      ]
    },

    blues_pentatonic_box1: {
      id: "blues_pentatonic_box1",
      genre: "blues",
      name: "Minor Pentatonic (Box 1)",
      levelBand: "beginne
