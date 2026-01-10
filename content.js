// content.js
// Dose 0.2 — Content Model v1
// Keep this simple. Expand later.

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
    // ---- BLUES STARTER SKILLS ----

    blues_timing_shuffle: {
      id: "blues_timing_shuffle",
      genre: "blues",
      name: "Shuffle Timing (Foundation)",
      levelBand: "beginner",
      summary: "Lock in a blues shuffle feel with clean right-hand consistency.",
      drills: [
        {
          id: "d_shuffle_1",
          name: "Muted shuffle strum",
          durationSec: 120,
          instructions: [
            "Lightly mute strings with fretting hand.",
            "Strum a steady shuffle: long-short, long-short.",
            "Focus on evenness — not speed."
          ],
          suggestedBpm: { start: 60, target: 90, step: 5 }
        },
        {
          id: "d_shuffle_2",
          name: "12-bar rhythm hits",
          durationSec: 180,
          instructions: [
            "Play a simple 12-bar rhythm (even just on one chord).",
            "Count bars out loud if needed.",
            "Goal: no rushing on bar transitions."
          ],
          suggestedBpm: { start: 60, target: 100, step: 5 }
        }
      ]
    },

    blues_pentatonic_box1: {
      id: "blues_pentatonic_box1",
      genre: "blues",
      name: "Minor Pentatonic (Box 1)",
      levelBand: "beginner",
      summary: "Learn the core shape you’ll use for riffs, licks, and solos.",
      drills: [
        {
          id: "d_penta_1",
          name: "Box 1 ascent/descent",
          durationSec: 180,
          instructions: [
            "Play Box 1 up and down clean.",
            "Use alternate picking.",
            "Keep fingers close to the fretboard."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 }
        },
        {
          id: "d_penta_2",
          name: "Two-note-per-string accuracy",
          durationSec: 180,
          instructions: [
            "Play only two notes per string slowly.",
            "Listen for buzzes and uneven volume.",
            "Stay relaxed."
          ],
          suggestedBpm: { start: 50, target: 100, step: 5 }
        }
      ]
    },

    blues_bends_vibrato: {
      id: "blues_bends_vibrato",
      genre: "blues",
      name: "Bends + Vibrato (Core Voice)",
      levelBand: "beginner",
      summary: "Blues lead lives or dies by bend pitch and vibrato control.",
      drills: [
        {
          id: "d_bend_1",
          name: "Quarter/half-step bend checks",
          durationSec: 180,
          instructions: [
            "Pick target note first (destination pitch).",
            "Then bend up to match it.",
            "Hold pitch steady for 2 seconds."
          ],
          suggestedBpm: { start: 40, target: 70, step: 5 }
        },
        {
          id: "d_vib_1",
          name: "Slow wide vibrato",
          durationSec: 180,
          instructions: [
            "Hold a note.",
            "Rock wrist slowly for wide vibrato.",
            "Keep pitch centered — don’t drift sharp."
          ],
          suggestedBpm: { start: 40, target: 80, step: 5 }
        }
      ]
    }
  },

  backingTracks: {
    // Metadata only in Dose 0.2. Audio comes later.
    bt_blues_shuffle_A: {
      id: "bt_blues_shuffle_A",
      genre: "blues",
      name: "Shuffle Groove in A",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 90
    },
    bt_blues_slow_12bar_E: {
      id: "bt_blues_slow_12bar_E",
      genre: "blues",
      name: "Slow 12-Bar in E",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 65
    }
  }
};
