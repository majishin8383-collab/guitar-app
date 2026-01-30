// js/content/genres/blues.js
// Blues pack (v1) — drills + YouTube backing embeds
// Requires: js/content/base.js loaded first (window.CONTENT_ADD exists)
//
// ✅ Audit pass (CORE mapping) added:
// - drill.coreId / drill.difficultyStep / drill.focus / drill.needsDiagram
// - beginner-friendly drill names (IDs unchanged)
// - NO functional changes to rendering/logic

window.CONTENT_ADD({
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
        // Shuffle (rhythm + lead mixes)
        "bt_shuffle_A_rhythm",
        "bt_shuffle_A_lead",
        "bt_shuffle_E_rhythm",
        "bt_shuffle_E_lead",
        "bt_shuffle_G_rhythm",
        "bt_shuffle_G_lead",

        // Slow blues (rhythm + lead mixes)
        "bt_slow_E_rhythm",
        "bt_slow_E_lead",
        "bt_slow_A_rhythm",
        "bt_slow_A_lead",
        "bt_slow_C_rhythm",
        "bt_slow_C_lead"
      ]
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
          // kid-friendly rename
          name: "Keep the Beat (Muted Strum)",
          durationSec: 120,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_5",          // Time & Rhythm
          difficultyStep: 1,
          focus: "timing",
          needsDiagram: false,

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
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        },
        {
          id: "d_shuffle_2",
          // kid-friendly rename
          name: "Count the Bars (Simple Groove)",
          durationSec: 180,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_5",          // Time & Rhythm
          difficultyStep: 2,
          focus: "timing",
          needsDiagram: false,

          instructions: [
            "Play a simple 12-bar rhythm (even just on one chord).",
            "Count bars out loud if needed.",
            "Goal: no rushing on bar transitions.",
            "Keep fretting-hand pressure light to avoid fatigue."
          ],
          suggestedBpm: { start: 60, target: 100, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
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
          // kid-friendly rename
          name: "Two Notes, One String",
          durationSec: 180,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_6",          // First Shape (repeatable pattern)
          difficultyStep: 1,
          focus: "one-string",
          needsDiagram: true,

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
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        },
        {
          id: "d_penta_2",
          // kid-friendly rename
          name: "Switch Strings Clean",
          durationSec: 180,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_4",          // String Changes (crossing clean)
          difficultyStep: 1,
          focus: "string-change",
          needsDiagram: true,

          instructions: [
            "Play slowly: two notes per string, then move to the next string.",
            "Listen for buzzes and uneven volume.",
            "Stay relaxed in both hands.",
            "Stop immediately if tension creeps in—reset posture."
          ],
          suggestedBpm: { start: 50, target: 100, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
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
          // kid-friendly rename
          name: "Match the Note (Mini Bend)",
          durationSec: 180,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_7",          // Expression
          difficultyStep: 1,
          focus: "expression",
          needsDiagram: false,

          instructions: [
            "Pick the target note first (destination pitch).",
            "Then bend up to match it.",
            "Hold the pitch steady for 2 seconds.",
            "Use multiple fretting-hand fingers to support the bend."
          ],
          suggestedBpm: { start: 40, target: 70, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/NVJg8VjEVpM",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/39mhhYpaFS0"
          }
        },
        {
          id: "d_vib_1",
          // kid-friendly rename
          name: "Make It Sing (Slow Vibrato)",
          durationSec: 180,
          handednessSafe: true,

          // CORE mapping
          coreId: "CORE_7",          // Expression
          difficultyStep: 2,
          focus: "expression",
          needsDiagram: false,

          instructions: [
            "Hold a note firmly with your fretting hand.",
            "Rock the wrist slowly for a wide vibrato.",
            "Keep pitch centered — don’t drift sharp.",
            "Breathe and stay loose in the picking hand."
          ],
          suggestedBpm: { start: 40, target: 80, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/tz7upvwXSt4",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/39mhhYpaFS0"
          }
        }
      ]
    }
  },

  backingTracks: {
    // ---------------------------
    // SHUFFLE (12-bar) — YouTube
    // ---------------------------
    bt_shuffle_A_rhythm: {
      id: "bt_shuffle_A_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Rhythm Mix",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/3szngdntfyM"
    },
    bt_shuffle_A_lead: {
      id: "bt_shuffle_A_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Lead Mix",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/snHUyvxKPEc"
    },

    bt_shuffle_E_rhythm: {
      id: "bt_shuffle_E_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (E) — Rhythm Mix",
      key: "E",
      feel: "shuffle",
      recommendedBpm: 96,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/LpxSayM9cBg"
    },
    bt_shuffle_E_lead: {
      id: "bt_shuffle_E_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (E) — Lead Mix",
      key: "E",
      feel: "shuffle",
      recommendedBpm: 96,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/wEn5qYz57Ws"
    },

    bt_shuffle_G_rhythm: {
      id: "bt_shuffle_G_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (G) — Rhythm Mix",
      key: "G",
      feel: "shuffle",
      recommendedBpm: 90,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/nVdRnJuRgcI"
    },
    bt_shuffle_G_lead: {
      id: "bt_shuffle_G_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (G) — Lead Mix",
      key: "G",
      feel: "shuffle",
      recommendedBpm: 90,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/_LYRAYuHcFU"
    },

    // ---------------------------
    // SLOW BLUES (12-bar) — YouTube
    // ---------------------------
    bt_slow_E_rhythm: {
      id: "bt_slow_E_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (E) — Rhythm Mix",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 66,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/5oy6kOxE-uI"
    },
    bt_slow_E_lead: {
      id: "bt_slow_E_lead",
      genre: "blues",
      name: "Slow 12-Bar (E) — Lead Mix",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 66,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/uircC2D8uk4"
    },

    bt_slow_A_rhythm: {
      id: "bt_slow_A_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (A) — Rhythm Mix",
      key: "A",
      feel: "slow blues",
      recommendedBpm: 64,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/a2I1nO3uVYU"
    },
    bt_slow_A_lead: {
      id: "bt_slow_A_lead",
      genre: "blues",
      name: "Slow 12-Bar (A) — Lead Mix",
      key: "A",
      feel: "slow blues",
      recommendedBpm: 64,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/a2I1nO3uVYU"
    },

    bt_slow_C_rhythm: {
      id: "bt_slow_C_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (C) — Rhythm Mix",
      key: "C",
      feel: "slow blues",
      recommendedBpm: 62,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "rhythm",
      youtubeEmbed: "https://www.youtube.com/embed/IGfyzzcMOKk"
    },
    bt_slow_C_lead: {
      id: "bt_slow_C_lead",
      genre: "blues",
      name: "Slow 12-Bar (C) — Lead Mix",
      key: "C",
      feel: "slow blues",
      recommendedBpm: 62,
      note: "Use the YouTube controls in the player to play/pause.",
      mix: "lead",
      youtubeEmbed: "https://www.youtube.com/embed/IGfyzzcMOKk"
    }
  }
});
