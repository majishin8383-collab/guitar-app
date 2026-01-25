// content/genres/rock.js
// Rock pack (v1) — power chords, timing, basic lead
// Requires: content/base.js loaded first (window.CONTENT_ADD exists)

window.CONTENT_ADD({
  genres: {
    rock: {
      id: "rock",
      name: "Rock",
      description: "Power chords, tight timing, classic rock rhythm, and simple lead phrasing.",
      starterSkillIds: [
        "rock_power_chords",
        "rock_tight_rhythm",
        "rock_minor_pentatonic"
      ],
      backingTrackIds: [
        "bt_rock_A_rhythm",
        "bt_rock_A_lead",
        "bt_rock_E_rhythm",
        "bt_rock_E_lead"
      ]
    }
  },

  skills: {
    rock_power_chords: {
      id: "rock_power_chords",
      genre: "rock",
      name: "Power Chords (Foundation)",
      levelBand: "beginner",
      summary: "Build clean, punchy power chords with controlled muting.",
      drills: [
        {
          id: "d_power_1",
          name: "Two-finger power chords",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Use your index finger on the root note.",
            "Add your ring finger for the fifth.",
            "Mute unused strings with both hands.",
            "Strum evenly with confidence."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },

          // ✅ matches render.js (pickOneVideoUrl reads d.media.*)
          media: {
            demoUrl: "https://www.youtube.com/embed/gH6cCY-UA3Y"
          }
        }
      ]
    },

    rock_tight_rhythm: {
      id: "rock_tight_rhythm",
      genre: "rock",
      name: "Tight Rhythm Playing",
      levelBand: "beginner",
      summary: "Lock in with the beat and eliminate sloppy transitions.",
      drills: [
        {
          id: "d_rhythm_1",
          name: "Downstroke control",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Use steady downstrokes only.",
            "Keep the picking hand relaxed.",
            "Stay perfectly in time with the beat.",
            "Focus on consistent attack."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },

          // ✅ matches render.js
          media: {
            demoUrl: "https://www.youtube.com/embed/fBzYD2cpUGg"
          }
        }
      ]
    },

    rock_minor_pentatonic: {
      id: "rock_minor_pentatonic",
      genre: "rock",
      name: "Minor Pentatonic (Rock Lead)",
      levelBand: "beginner",
      summary: "Use the minor pentatonic for classic rock solos.",
      drills: [
        {
          id: "d_rock_penta_1",
          name: "Box 1 rock phrasing",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play the scale slowly and evenly.",
            "Use alternate picking.",
            "Add simple bends for expression.",
            "Leave space between phrases."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },

          // ✅ this one was already known-working in your Blues pack
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0"
          }
        }
      ]
    }
  },

  backingTracks: {
    // STRAIGHT ROCK — YouTube (REAL embed IDs)
    bt_rock_A_rhythm: {
      id: "bt_rock_A_rhythm",
      genre: "rock",
      name: "Straight Rock Groove (A) — Rhythm",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 100,
      note: "Use YouTube controls in the player.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/X6-EPuO69RE"
    },
    bt_rock_A_lead: {
      id: "bt_rock_A_lead",
      genre: "rock",
      name: "Straight Rock Groove (A) — Lead",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 100,
      note: "Use YouTube controls in the player.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/X6-EPuO69RE"
    },

    bt_rock_E_rhythm: {
      id: "bt_rock_E_rhythm",
      genre: "rock",
      name: "Straight Rock Groove (E) — Rhythm",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 105,
      note: "Use YouTube controls in the player.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/ksjeW0QBUoU"
    },
    bt_rock_E_lead: {
      id: "bt_rock_E_lead",
      genre: "rock",
      name: "Straight Rock Groove (E) — Lead",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 105,
      note: "Use YouTube controls in the player.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/ksjeW0QBUoU"
    }
  }
});
