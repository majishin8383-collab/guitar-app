// js/content/genres/rock.js
// Rock pack (v2.1) — FIX: backing tracks use explicit /embed/ URLs (no converters)
// Requires: js/content/base.js loaded first (window.CONTENT_ADD exists)

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
          media: {
            demoUrl: "https://www.youtube.com/embed/2bPpP3P9Z9Q",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
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
          media: {
            demoUrl: "https://www.youtube.com/embed/qbH9Rk0z1xI",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
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
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        }
      ]
    }
  },

  backingTracks: {
    // STRAIGHT ROCK — YouTube (MUST be /embed/ URLs or render.js rejects them)
    bt_rock_A_rhythm: {
      id: "bt_rock_A_rhythm",
      genre: "rock",
      name: "Straight Rock Groove (A) — Rhythm",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 100,
      note: "Use YouTube controls in the player.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
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
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
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
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
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
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
    }
  }
});
