// content.js
// Content Registry — pure data only
//
// RULES:
// - No logic in this file
// - Avoid "left hand / right hand" → use "fretting hand" / "picking hand"
// - Videos may be mirrored by UI
// - Backing tracks may have empty youtubeEmbed safely

window.CONTENT = {
  genres: {
    blues: {
      id: "blues",
      name: "Blues",
      description: "Phrasing, bends, vibrato, groove, and the 12-bar language.",
      starterSkillIds: [
        "blues_timing_shuffle",
        "blues_pentatonic_box1",
        "blues_bends_vibrato"
      ],
      backingTrackIds: [
        "bt_blues_shuffle_A_rhythm",
        "bt_blues_shuffle_A_lead",
        "bt_blues_shuffle_E_rhythm",
        "bt_blues_shuffle_E_lead",
        "bt_blues_shuffle_G_rhythm",
        "bt_blues_shuffle_G_lead",
        "bt_blues_slow_E_rhythm",
        "bt_blues_slow_E_lead",
        "bt_blues_slow_A_rhythm",
        "bt_blues_slow_A_lead",
        "bt_blues_slow_C_rhythm",
        "bt_blues_slow_C_lead"
      ]
    },

    rock: {
      id: "rock",
      name: "Rock",
      description: "Power chords, palm muting, tight downstrokes, and riff timing.",
      starterSkillIds: [
        "rock_power_chords",
        "rock_palm_muting",
        "rock_riff_timing"
      ],
      backingTrackIds: [
        "bt_rock_mid_A_rhythm",
        "bt_rock_mid_A_lead",
        "bt_rock_mid_E_rhythm",
        "bt_rock_mid_E_lead",
        "bt_rock_mid_G_rhythm",
        "bt_rock_mid_G_lead"
      ]
    }
  },

  skills: {
    // =====================
    // BLUES
    // =====================
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
            demoUrl: "https://www.youtube.com/embed/Z-Cvv7yo5EA",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl:  "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    blues_pentatonic_box1: {
      id: "blues_pentatonic_box1",
      genre: "blues",
      name: "Minor Pentatonic (Box 1)",
      levelBand: "beginner",
      summary: "Learn the core shape used for riffs, licks, and solos.",
      drills: [
        {
          id: "d_penta_1",
          name: "Box 1 ascent / descent",
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
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl:  "https://www.youtube.com/embed/83GZUBdupaI"
          }
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
          handednessSafe: true,
          instructions: [
            "Pick the target note first.",
            "Then bend up to match it.",
            "Hold the pitch steady for 2 seconds.",
            "Support bends with multiple fretting-hand fingers."
          ],
          suggestedBpm: { start: 40, target: 70, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/NVJg8VjEVpM",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl:  "https://www.youtube.com/embed/39mhhYpaFS0"
          }
        }
      ]
    },

    // =====================
    // ROCK
    // =====================
    rock_power_chords: {
      id: "rock_power_chords",
      genre: "rock",
      name: "Power Chords",
      levelBand: "beginner",
      summary: "Fast, clean power-chord changes form the backbone of rock.",
      drills: [
        {
          id: "d_rock_pc_1",
          name: "Two-chord swap (A5 ↔ G5)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Form A5 and G5 with your fretting hand.",
            "Use steady downstrokes with the picking hand.",
            "Minimize movement between chord shapes.",
            "Aim for smooth, silent transitions."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/2WbSBLplJS0",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl:  "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    rock_palm_muting: {
      id: "rock_palm_muting",
      genre: "rock",
      name: "Palm Muting",
      levelBand: "beginner",
      summary: "Control muting pressure for tight, punchy rhythm.",
      drills: [
        {
          id: "d_rock_pm_1",
          name: "Mute pressure ladder",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Rest the picking-hand palm lightly near the bridge.",
            "Pick steady eighth notes on one string.",
            "Adjust pressure until the sound is tight but clear.",
            "Maintain consistent tempo."
          ],
          suggestedBpm: { start: 70, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/8hJmN3A6G1A",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl:  "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    rock_riff_timing: {
      id: "rock_riff_timing",
      genre: "rock",
      name: "Riff Timing",
      levelBand: "beginner",
      summary: "Tight riffs come from controlled starts and stops.",
      drills: [
        {
          id: "d_rock_rt_1",
          name: "Start/stop grid",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick steady eighth notes.",
            "Stop cleanly every two beats.",
            "Resume exactly on the click.",
            "Eliminate ringing during rests."
          ],
          suggestedBpm: { start: 70, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/4xVqfXQK5xk",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl:  "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    }
  },

  backingTracks: {
    // =====================
    // BLUES
    // =====================
    bt_blues_shuffle_A_rhythm: {
      id: "bt_blues_shuffle_A_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Rhythm",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      youtubeEmbed: "https://www.youtube.com/embed/3szngdntfyM"
    },

    bt_blues_slow_A_rhythm: {
      id: "bt_blues_slow_A_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (A)",
      key: "A",
      feel: "slow blues",
      recommendedBpm: 64,
      youtubeEmbed: "https://www.youtube.com/embed/a2I1nO3uVYU"
    },

    // =====================
    // ROCK (safe placeholders)
    // =====================
    bt_rock_mid_A_rhythm: {
      id: "bt_rock_mid_A_rhythm",
      genre: "rock",
      name: "Rock Mid-Tempo (A)",
      key: "A",
      feel: "mid rock",
      recommendedBpm: 120,
      youtubeEmbed: ""
    }
  }
};
