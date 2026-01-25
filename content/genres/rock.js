// content/genres/rock.js
// Rock pack (v1.2) — power chords, timing, basic lead
// - Matches blues/funk drill structure (uses d.media.*)
// - 2 drills per skill (so Practice shows the same density as Blues/Funk)
// - Backing tracks use youtubeEmbed (in-app iframe)

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
          name: "Two-finger power chord shape",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Place the root with your fretting hand index finger.",
            "Add the fifth with your fretting hand ring finger.",
            "Mute unused strings using both hands.",
            "Strum evenly—aim for clean, punchy attacks."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/xe8nmZA4cfQ"
          }
        },
        {
          id: "d_rock_power_2",
          name: "Power chord switches (2-chord loop)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Choose two power chords (example: A5 and G5).",
            "Play steady 8th-notes for 2 bars, then switch.",
            "Keep fretting-hand pressure light—no death grip.",
            "Goal: the switch is silent + on-time."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/XacSttupjBA"
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
          name: "Downstroke consistency (single string)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick one string and play steady 8th-notes.",
            "Use downstrokes only.",
            "Keep the picking-hand motion small and relaxed.",
            "Aim for identical spacing + volume."
          ],
          suggestedBpm: { start: 80, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/M-haPvPnmj8"
          }
        },
        {
          id: "d_rock_rhythm_2",
          name: "Accent control (2 and 4)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Keep steady 8th-notes.",
            "Accentuate beats 2 and 4 (strong), keep others light.",
            "If timing wobbles, reduce bpm and reset.",
            "Goal: accents pop without speeding up."
          ],
          suggestedBpm: { start: 80, target: 130, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM"
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
            "Keep fretting-hand fingers close to the fretboard.",
            "Aim for even volume between notes."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0"
          }
        },
        {
          id: "d_rock_penta_2",
          name: "Call-and-response phrasing (2 bars each)",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Improvise a short 2-bar phrase in Box 1.",
            "Answer it with a different 2-bar phrase.",
            "Leave space—don’t fill every beat.",
            "End phrases with confident target notes."
          ],
          suggestedBpm: { start: 70, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/5Qc426qgSho"
          }
        }
      ]
    }
  },

  backingTracks: {
    // NOTE: These are WATCH links converted to /embed/ IDs.
    // If any specific track still shows “Video unavailable”, swap the ID for a different backing track.

    bt_rock_A_rhythm: {
      id: "bt_rock_A_rhythm",
      genre: "rock",
      name: "Rock Backing Track (A) — Rhythm",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 80,
      note: "Use YouTube controls in the player.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/AAHEWBH7Af4",
      youtubeQuery: "rock backing track key A 80 bpm"
    },
    bt_rock_A_lead: {
      id: "bt_rock_A_lead",
      genre: "rock",
      name: "Rock Backing Track (A) — Lead",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 80,
      note: "Use YouTube controls in the player.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/AAHEWBH7Af4",
      youtubeQuery: "rock backing track key A 80 bpm"
    },

    bt_rock_E_rhythm: {
      id: "bt_rock_E_rhythm",
      genre: "rock",
      name: "Blues/Rock Backing Track (E) — Rhythm",
      key: "E",
      feel: "blues rock",
      recommendedBpm: 0,
      note: "Use YouTube controls in the player.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/pPQSgFtG394",
      youtubeQuery: "blues rock backing track key E"
    },
    bt_rock_E_lead: {
      id: "bt_rock_E_lead",
      genre: "rock",
      name: "Blues/Rock Backing Track (E) — Lead",
      key: "E",
      feel: "blues rock",
      recommendedBpm: 0,
      note: "Use YouTube controls in the player.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/pPQSgFtG394",
      youtubeQuery: "blues rock backing track key E"
    }
  }
});
