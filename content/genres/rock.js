// js/content/genres/rock.js
// Rock pack (v1) — power chords, tight timing, basic lead
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
        // Rock keys (rhythm + lead mixes)
        "bt_rock_A_rhythm",
        "bt_rock_A_lead",
        "bt_rock_E_rhythm",
        "bt_rock_E_lead",
        "bt_rock_G_rhythm",
        "bt_rock_G_lead",
        "bt_rock_D_rhythm",
        "bt_rock_D_lead"
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
            "Keep fingertips arched (don’t collapse).",
            "Strum only the strings you need."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/2bPpP3P9Z9Q",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
          }
        },
        {
          id: "d_rock_power_2",
          name: "Power chord changes (2-chord loop)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick two power chords (ex: A5 ↔ D5).",
            "Change on beat 1 every bar (slow + clean).",
            "Mute between changes to kill string noise.",
            "Increase tempo only when changes stay silent."
          ],
          suggestedBpm: { start: 55, target: 105, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/qbH9Rk0z1xI",
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
          id: "d_rock_rhythm_1",
          name: "Downstroke control",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Use steady downstrokes only.",
            "Keep your wrist loose (don’t tense the forearm).",
            "Hit consistent depth on each strum.",
            "Stay locked to the click."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/qbH9Rk0z1xI",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
          }
        },
        {
          id: "d_rock_rhythm_2",
          name: "8th-note groove stamina (down-up)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Strum steady 8th-notes (down-up) for 60 seconds.",
            "Accent beats 2 and 4 slightly.",
            "Keep the motion small—economy wins.",
            "If timing drifts, drop BPM and rebuild."
          ],
          suggestedBpm: { start: 80, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
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
          name: "Box 1 ascent / descent (clean)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play Box 1 up and down clean.",
            "Use alternate picking (down-up).",
            "Keep fingers close to the fretboard.",
            "Match volume across all notes."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        },
        {
          id: "d_rock_penta_2",
          name: "Simple rock licks (timing + space)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play one short lick, then REST for 1 beat.",
            "Repeat: lick → space → lick → space.",
            "Focus on ending notes clean (no accidental noise).",
            "Add a gentle bend or vibrato once it’s steady."
          ],
          suggestedBpm: { start: 55, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/83GZUBdupaI",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl: "https://www.youtube.com/embed/fg1n_i-D7v0"
          }
        }
      ]
    }
  },

  backingTracks: {
    // ---------------------------
    // STRAIGHT ROCK — YouTube (in-app embeds)
    // NOTE: Some YouTube videos block embedding. If you ever see "Video unavailable",
    // swap the VIDEO_ID for a different rock backing track that allows embeds.
    // ---------------------------

    bt_rock_A_rhythm: {
      id: "bt_rock_A_rhythm",
      genre: "rock",
      name: "Rock Backing Track (A) — Rhythm Mix",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
    },
    bt_rock_A_lead: {
      id: "bt_rock_A_lead",
      genre: "rock",
      name: "Rock Backing Track (A) — Lead Mix",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
    },

    bt_rock_E_rhythm: {
      id: "bt_rock_E_rhythm",
      genre: "rock",
      name: "Rock Backing Track (E) — Rhythm Mix",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 110,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
    },
    bt_rock_E_lead: {
      id: "bt_rock_E_lead",
      genre: "rock",
      name: "Rock Backing Track (E) — Lead Mix",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 110,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
    },

    bt_rock_G_rhythm: {
      id: "bt_rock_G_rhythm",
      genre: "rock",
      name: "Rock Backing Track (G) — Rhythm Mix",
      key: "G",
      feel: "straight rock",
      recommendedBpm: 115,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
    },
    bt_rock_G_lead: {
      id: "bt_rock_G_lead",
      genre: "rock",
      name: "Rock Backing Track (G) — Lead Mix",
      key: "G",
      feel: "straight rock",
      recommendedBpm: 115,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/6JZ2n1wPp6E"
    },

    bt_rock_D_rhythm: {
      id: "bt_rock_D_rhythm",
      genre: "rock",
      name: "Rock Backing Track (D) — Rhythm Mix",
      key: "D",
      feel: "straight rock",
      recommendedBpm: 118,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
    },
    bt_rock_D_lead: {
      id: "bt_rock_D_lead",
      genre: "rock",
      name: "Rock Backing Track (D) — Lead Mix",
      key: "D",
      feel: "straight rock",
      recommendedBpm: 118,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/1yZK1RzZx7I"
    }
  }
});
```0
