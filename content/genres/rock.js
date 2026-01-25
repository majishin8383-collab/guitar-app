// content/genres/rock.js
// Rock pack (v1.1) — parity with Blues/Funk (2 drills per skill + media.demoUrl)
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
          id: "d_rock_power_1",
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
          media: { demoUrl: "https://www.youtube.com/embed/2bPpP3P9Z9Q" }
        },
        {
          id: "d_rock_power_2",
          name: "Two-chord switch (E5 ↔ G5)",
          durationSec: 200,
          handednessSafe: true,
          instructions: [
            "Pick two power chords (example: E5 and G5).",
            "Strum steady 8th-notes.",
            "Switch every 2 bars without rushing.",
            "Keep fretting-hand pressure light—clean changes first."
          ],
          suggestedBpm: { start: 70, target: 125, step: 5 },
          // If you want a different video later, swap the embed id only.
          media: { demoUrl: "https://www.youtube.com/embed/2bPpP3P9Z9Q" }
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
          id: "d_rock_rhythm_1",
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
          media: { demoUrl: "https://www.youtube.com/embed/qbH9Rk0z1xI" }
        },
        {
          id: "d_rock_rhythm_2",
          name: "Accent the backbeat (2 and 4)",
          durationSec: 210,
          handednessSafe: true,
          instructions: [
            "Keep steady 8th-notes.",
            "Accentuate beats 2 and 4.",
            "Keep non-accent notes light and even.",
            "If tension shows up, slow down and reset."
          ],
          suggestedBpm: { start: 75, target: 130, step: 5 },
          media: { demoUrl: "https://www.youtube.com/embed/qbH9Rk0z1xI" }
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
          media: { demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0" }
        },
        {
          id: "d_rock_penta_2",
          name: "Call-and-response (2 bars each)",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Improvise a short 2-bar phrase.",
            "Answer it with a different 2-bar phrase.",
            "Leave space between phrases.",
            "Make bends land in tune before adding speed."
          ],
          suggestedBpm: { start: 70, target: 110, step: 5 },
          media: { demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0" }
        }
      ]
    }
  },

  backingTracks: {
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
