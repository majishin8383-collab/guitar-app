// content.js
// Content Registry — PURE DATA ONLY
//
// RULES:
// - No logic/functions in this file.
// - Avoid "left hand / right hand" → use "fretting hand" / "picking hand".
// - Videos can be mirrored by UI.
// - Backing tracks embed in-app via youtubeEmbed (empty string is allowed).

window.CONTENT = {
  genres: {
    // =====================
    // BLUES (working set)
    // =====================
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
        "bt_gen_shuffle_A_rhythm",
        "bt_gen_shuffle_A_lead",
        "bt_gen_shuffle_E_rhythm",
        "bt_gen_shuffle_E_lead",
        "bt_gen_shuffle_G_rhythm",
        "bt_gen_shuffle_G_lead",

        // Slow blues (rhythm + lead mixes)
        "bt_gen_slow_E_rhythm",
        "bt_gen_slow_E_lead",
        "bt_gen_slow_A_rhythm",
        "bt_gen_slow_A_lead",
        "bt_gen_slow_C_rhythm",
        "bt_gen_slow_C_lead"
      ]
    },

    // =====================
    // DEFAULT SET (stubs that won’t break UI)
    // =====================
    rock: {
      id: "rock",
      name: "Rock",
      description: "Power chords, palm muting, tight downstrokes, and riff timing.",
      starterSkillIds: ["rock_power_chords", "rock_palm_muting", "rock_riff_timing"],
      backingTrackIds: ["bt_rock_A", "bt_rock_E", "bt_rock_G"]
    },

    metal: {
      id: "metal",
      name: "Metal",
      description: "Alternate picking, chug control, and tight rhythm precision.",
      starterSkillIds: ["metal_alt_picking", "metal_chug_control", "metal_rhythm_tightness"],
      backingTrackIds: ["bt_metal_E", "bt_metal_A", "bt_metal_D"]
    },

    country: {
      id: "country",
      name: "Country",
      description: "Hybrid picking, double-stops, and clean groove phrasing.",
      starterSkillIds: ["country_boom_chick", "country_double_stops", "country_hybrid_picking"],
      backingTrackIds: ["bt_country_G", "bt_country_A", "bt_country_E"]
    },

    jazz: {
      id: "jazz",
      name: "Jazz",
      description: "Shell chords, swing comping, and clean voice leading.",
      starterSkillIds: ["jazz_shell_chords", "jazz_swing_comp", "jazz_voice_leading"],
      backingTrackIds: ["bt_jazz_C", "bt_jazz_F", "bt_jazz_Bb"]
    },

    funk: {
      id: "funk",
      name: "funk",
      description: "16th-note rhythm, ghost notes, and tight muted strumming.",
      starterSkillIds: ["funk_16th_grid", "funk_ghost_notes", "funk_chops"],
      backingTrackIds: ["bt_funk_E", "bt_funk_A", "bt_funk_D"]
    },

    acoustic: {
      id: "acoustic",
      name: "Acoustic",
      description: "Strumming feel, clean transitions, and dynamic control.",
      starterSkillIds: ["acoustic_strum_feel", "acoustic_chord_changes", "acoustic_dynamics"],
      backingTrackIds: ["bt_acoustic_G", "bt_acoustic_C", "bt_acoustic_D"]
    }
  },

  skills: {
    // =====================
    // BLUES (working set)
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
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
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
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        },
        {
          id: "d_penta_2",
          name: "Two-notes-per-string accuracy",
          durationSec: 180,
          handednessSafe: true,
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
          name: "Quarter/half-step bend checks",
          durationSec: 180,
          handednessSafe: true,
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
          name: "Slow wide vibrato",
          durationSec: 180,
          handednessSafe: true,
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
    },

    // =====================
    // ROCK (starter stubs)
    // =====================
    rock_power_chords: {
      id: "rock_power_chords",
      genre: "rock",
      name: "Power Chords (Foundation)",
      levelBand: "beginner",
      summary: "Clean power chords and fast changes.",
      drills: [
        {
          id: "d_rock_pc_1",
          name: "Two-chord swap (A5 ↔ G5)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Form A5 and G5 with your fretting hand.",
            "Use steady downstrokes with your picking hand.",
            "Keep changes small and quiet.",
            "Stay relaxed—speed comes later."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/2WbSBLplJS0",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    rock_palm_muting: {
      id: "rock_palm_muting",
      genre: "rock",
      name: "Palm Muting (Control)",
      levelBand: "beginner",
      summary: "Get a tight, punchy rock rhythm.",
      drills: [
        {
          id: "d_rock_pm_1",
          name: "Mute pressure ladder",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Rest the picking-hand palm near the bridge.",
            "Pick steady eighth notes on one string.",
            "Adjust pressure until it’s tight but clear.",
            "Hold tempo constant."
          ],
          suggestedBpm: { start: 70, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/8hJmN3A6G1A",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    rock_riff_timing: {
      id: "rock_riff_timing",
      genre: "rock",
      name: "Riff Timing (Tight Stops)",
      levelBand: "beginner",
      summary: "Repeatable riffs with clean starts/stops.",
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
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    // =====================
    // METAL (starter stubs)
    // =====================
    metal_alt_picking: {
      id: "metal_alt_picking",
      genre: "metal",
      name: "Alternate Picking (Engine)",
      levelBand: "beginner",
      summary: "Even down-up picking with clean attack.",
      drills: [
        {
          id: "d_metal_ap_1",
          name: "Single-string alternate grid",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick steady 8ths (down-up) on one string.",
            "Keep the picking-hand motion small.",
            "Stay relaxed at higher tempos.",
            "Aim for identical volume each note."
          ],
          suggestedBpm: { start: 80, target: 160, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/4xVqfXQK5xk",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    metal_chug_control: {
      id: "metal_chug_control",
      genre: "metal",
      name: "Chug Control (Palm + Timing)",
      levelBand: "beginner",
      summary: "Tight low-string chugs without flub.",
      drills: [
        {
          id: "d_metal_chug_1",
          name: "Chug bursts",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Palm mute lightly near the bridge.",
            "Play 1 bar chugs, 1 bar rest.",
            "Resume perfectly on the click.",
            "Keep tone consistent across bars."
          ],
          suggestedBpm: { start: 90, target: 170, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/8hJmN3A6G1A",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    metal_rhythm_tightness: {
      id: "metal_rhythm_tightness",
      genre: "metal",
      name: "Rhythm Tightness (Stops)",
      levelBand: "beginner",
      summary: "Clean silences and sharp rest control.",
      drills: [
        {
          id: "d_metal_rt_1",
          name: "Stop-on-1 drill",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play 3 beats, stop on beat 4.",
            "Make the stop silent (no ring).",
            "Repeat for 2 minutes.",
            "Stay locked to the metronome."
          ],
          suggestedBpm: { start: 80, target: 150, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/4xVqfXQK5xk",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    // =====================
    // COUNTRY (starter stubs)
    // =====================
    country_boom_chick: {
      id: "country_boom_chick",
      genre: "country",
      name: "Boom-Chick (Groove)",
      levelBand: "beginner",
      summary: "A simple country rhythm feel: bass + strum.",
      drills: [
        {
          id: "d_country_bc_1",
          name: "Boom-chick on one chord",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick a bass note, then strum a chord.",
            "Keep it even: boom-chick, boom-chick.",
            "Stay relaxed in the picking hand.",
            "Lock to the click before speeding up."
          ],
          suggestedBpm: { start: 70, target: 130, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    country_double_stops: {
      id: "country_double_stops",
      genre: "country",
      name: "Double Stops (Clean)",
      levelBand: "beginner",
      summary: "Two-note country phrases with clean fretting-hand control.",
      drills: [
        {
          id: "d_country_ds_1",
          name: "Two-note grip shifts",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Choose a simple two-note shape.",
            "Move it up/down the neck slowly.",
            "Keep notes clean with minimal pressure.",
            "Use the picking hand for even attack."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        }
      ]
    },

    country_hybrid_picking: {
      id: "country_hybrid_picking",
      genre: "country",
      name: "Hybrid Picking (Starter)",
      levelBand: "beginner",
      summary: "Pick + fingers for clean, snappy articulation.",
      drills: [
        {
          id: "d_country_hp_1",
          name: "Pick-then-pluck pattern",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick one string with the pick.",
            "Pluck a higher string with a free finger.",
            "Repeat slowly and cleanly.",
            "Keep the picking hand relaxed."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        }
      ]
    },

    // =====================
    // JAZZ (starter stubs)
    // =====================
    jazz_shell_chords: {
      id: "jazz_shell_chords",
      genre: "jazz",
      name: "Shell Chords (3rds + 7ths)",
      levelBand: "beginner",
      summary: "Simple jazz chord shapes that sound full in context.",
      drills: [
        {
          id: "d_jazz_shell_1",
          name: "ii–V–I shell cycle",
          durationSec: 210,
          handednessSafe: true,
          instructions: [
            "Play simple shell shapes for ii–V–I.",
            "Keep fretting-hand fingers close to the strings.",
            "Strum lightly with the picking hand.",
            "Aim for smooth voice-leading."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    jazz_swing_comp: {
      id: "jazz_swing_comp",
      genre: "jazz",
      name: "Swing Comping (Time Feel)",
      levelBand: "beginner",
      summary: "Light comping with steady swing feel.",
      drills: [
        {
          id: "d_jazz_swing_1",
          name: "2 and 4 comp hits",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play soft chord hits on beats 2 and 4.",
            "Count out loud if needed.",
            "Keep tone light and consistent.",
            "Stay locked to the click."
          ],
          suggestedBpm: { start: 70, target: 140, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/Z-Cvv7yo5EA",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    jazz_voice_leading: {
      id: "jazz_voice_leading",
      genre: "jazz",
      name: "Voice Leading (Smooth Changes)",
      levelBand: "beginner",
      summary: "Make changes sound connected instead of jumpy.",
      drills: [
        {
          id: "d_jazz_vl_1",
          name: "One-finger movement changes",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick two chord shapes that share notes.",
            "Move only one fretting-hand finger between them.",
            "Strum gently and evenly.",
            "Listen for smoothness."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        }
      ]
    },

    // =====================
    // FUNK (starter stubs)
    // =====================
    funk_16th_grid: {
      id: "funk_16th_grid",
      genre: "funk",
      name: "16th-Note Grid (Time)",
      levelBand: "beginner",
      summary: "Build tight 16th-note time without rushing.",
      drills: [
        {
          id: "d_funk_16_1",
          name: "Muted 16ths (slow)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Mute strings lightly with your fretting hand.",
            "Strum 16ths softly with the picking hand.",
            "Keep motion tiny and relaxed.",
            "Prioritize evenness over speed."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/Z-Cvv7yo5EA",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    funk_ghost_notes: {
      id: "funk_ghost_notes",
      genre: "funk",
      name: "Ghost Notes (Texture)",
      levelBand: "beginner",
      summary: "Add groove texture with controlled muted hits.",
      drills: [
        {
          id: "d_funk_ghost_1",
          name: "Ghost + accent pattern",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Mute lightly with fretting hand for ghost hits.",
            "Accent one hit every beat.",
            "Keep picking-hand motion constant.",
            "Make accents louder without speeding up."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    funk_chops: {
      id: "funk_chops",
      genre: "funk",
      name: "Funk Chops (Stops)",
      levelBand: "beginner",
      summary: "Clean stop-start rhythm for tight funk.",
      drills: [
        {
          id: "d_funk_chops_1",
          name: "Chop on offbeats",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Strum lightly and stop immediately after each hit.",
            "Focus on clean silences (no ringing).",
            "Use fretting-hand release to help the stop.",
            "Lock to the metronome."
          ],
          suggestedBpm: { start: 70, target: 130, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/4xVqfXQK5xk",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    // =====================
    // ACOUSTIC (starter stubs)
    // =====================
    acoustic_strum_feel: {
      id: "acoustic_strum_feel",
      genre: "acoustic",
      name: "Strum Feel (Steady Motion)",
      levelBand: "beginner",
      summary: "Build a steady strum with relaxed picking-hand motion.",
      drills: [
        {
          id: "d_ac_strum_1",
          name: "Down-up consistency",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Strum down-up lightly on one chord.",
            "Keep the picking hand loose.",
            "Aim for even volume and timing.",
            "Don’t tense up as you speed up."
          ],
          suggestedBpm: { start: 60, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    },

    acoustic_chord_changes: {
      id: "acoustic_chord_changes",
      genre: "acoustic",
      name: "Chord Changes (Quiet Hands)",
      levelBand: "beginner",
      summary: "Smooth changes without noise and without stopping.",
      drills: [
        {
          id: "d_ac_changes_1",
          name: "Two-chord loop (G ↔ C)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Loop between two chords slowly.",
            "Lift fretting-hand fingers only as much as needed.",
            "Keep strumming steady with the picking hand.",
            "Increase BPM only after clean transitions."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/H6yh8H6kNno",
            fixUrl: "https://www.youtube.com/embed/83GZUBdupaI"
          }
        }
      ]
    },

    acoustic_dynamics: {
      id: "acoustic_dynamics",
      genre: "acoustic",
      name: "Dynamics (Soft vs Loud)",
      levelBand: "beginner",
      summary: "Control volume and intensity without changing tempo.",
      drills: [
        {
          id: "d_ac_dyn_1",
          name: "4 bars soft / 4 bars loud",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Strum 4 bars softly, then 4 bars louder.",
            "Keep tempo identical.",
            "Use picking-hand depth and speed for dynamics.",
            "Avoid tensing up on loud sections."
          ],
          suggestedBpm: { start: 70, target: 130, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/Z-Cvv7yo5EA",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl: "https://www.youtube.com/embed/H7vCMvUyWpA"
          }
        }
      ]
    }
  },

  backingTracks: {
    // =====================
    // BLUES (your working embeds)
    // =====================
    bt_gen_shuffle_A_rhythm: {
      id: "bt_gen_shuffle_A_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Rhythm Mix",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      note: "Great for rhythm practice.",
      youtubeQuery: "12 bar blues shuffle backing track key A 92 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/3szngdntfyM"
    },
    bt_gen_shuffle_A_lead: {
      id: "bt_gen_shuffle_A_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Lead Mix",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      note: "Practice lead over the groove.",
      youtubeQuery: "12 bar blues shuffle backing track key A 92 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/snHUyvxKPEc"
    },
    bt_gen_shuffle_E_rhythm: {
      id: "bt_gen_shuffle_E_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (E) — Rhythm Mix",
      key: "E",
      feel: "shuffle",
      recommendedBpm: 96,
      note: "Shuffle feel in E.",
      youtubeQuery: "12 bar blues shuffle backing track key E 96 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/LpxSayM9cBg"
    },
    bt_gen_shuffle_E_lead: {
      id: "bt_gen_shuffle_E_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (E) — Lead Mix",
      key: "E",
      feel: "shuffle",
      recommendedBpm: 96,
      note: "Lead practice in E.",
      youtubeQuery: "12 bar blues shuffle backing track key E 96 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/wEn5qYz57Ws"
    },
    bt_gen_shuffle_G_rhythm: {
      id: "bt_gen_shuffle_G_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (G) — Rhythm Mix",
      key: "G",
      feel: "shuffle",
      recommendedBpm: 90,
      note: "Shuffle feel in G.",
      youtubeQuery: "12 bar blues shuffle backing track key G 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/nVdRnJuRgcI"
    },
    bt_gen_shuffle_G_lead: {
      id: "bt_gen_shuffle_G_lead",
      genre: "blues",
      name: "Shuffle 12-Bar (G) — Lead Mix",
      key: "G",
      feel: "shuffle",
      recommendedBpm: 90,
      note: "Lead practice in G.",
      youtubeQuery: "12 bar blues shuffle backing track key G 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/_LYRAYuHcFU"
    },
    bt_gen_slow_E_rhythm: {
      id: "bt_gen_slow_E_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (E) — Rhythm Mix",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 66,
      note: "Practice timing and dynamics.",
      youtubeQuery: "slow blues backing track key E 66 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/5oy6kOxE-uI"
    },
    bt_gen_slow_E_lead: {
      id: "bt_gen_slow_E_lead",
      genre: "blues",
      name: "Slow 12-Bar (E) — Lead Mix",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 66,
      note: "Great for bends and vibrato.",
      youtubeQuery: "slow blues backing track key E 66 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/uircC2D8uk4"
    },
    bt_gen_slow_A_rhythm: {
      id: "bt_gen_slow_A_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (A) — Rhythm Mix",
      key: "A",
      feel: "slow blues",
      recommendedBpm: 64,
      note: "Slow groove in A.",
      youtubeQuery: "slow blues backing track key A 64 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/a2I1nO3uVYU"
    },
    bt_gen_slow_A_lead: {
      id: "bt_gen_slow_A_lead",
      genre: "blues",
      name: "Slow 12-Bar (A) — Lead Mix",
      key: "A",
      feel: "slow blues",
      recommendedBpm: 64,
      note: "Practice phrasing over the groove.",
      youtubeQuery: "slow blues backing track key A 64 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/a2I1nO3uVYU"
    },
    bt_gen_slow_C_rhythm: {
      id: "bt_gen_slow_C_rhythm",
      genre: "blues",
      name: "Slow 12-Bar (C) — Rhythm Mix",
      key: "C",
      feel: "slow blues",
      recommendedBpm: 62,
      note: "Slow groove in C.",
      youtubeQuery: "slow blues backing track key C 62 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/IGfyzzcMOKk"
    },
    bt_gen_slow_C_lead: {
      id: "bt_gen_slow_C_lead",
      genre: "blues",
      name: "Slow 12-Bar (C) — Lead Mix",
      key: "C",
      feel: "slow blues",
      recommendedBpm: 62,
      note: "Practice melodic ideas over the groove.",
      youtubeQuery: "slow blues backing track key C 62 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/IGfyzzcMOKk"
    },

    // =====================
    // DEFAULT SET (safe placeholders — fill youtubeEmbed later)
    // =====================
    bt_rock_A: {
      id: "bt_rock_A",
      genre: "rock",
      name: "Rock Groove (A)",
      key: "A",
      feel: "mid rock",
      recommendedBpm: 120,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "rock backing track key A 120 bpm",
      youtubeEmbed: ""
    },
    bt_rock_E: {
      id: "bt_rock_E",
      genre: "rock",
      name: "Rock Groove (E)",
      key: "E",
      feel: "mid rock",
      recommendedBpm: 120,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "rock backing track key E 120 bpm",
      youtubeEmbed: ""
    },
    bt_rock_G: {
      id: "bt_rock_G",
      genre: "rock",
      name: "Rock Groove (G)",
      key: "G",
      feel: "mid rock",
      recommendedBpm: 115,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "rock backing track key G 115 bpm",
      youtubeEmbed: ""
    },

    bt_metal_E: {
      id: "bt_metal_E",
      genre: "metal",
      name: "Metal Chug (E)",
      key: "E",
      feel: "metal",
      recommendedBpm: 160,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "metal backing track key E 160 bpm",
      youtubeEmbed: ""
    },
    bt_metal_A: {
      id: "bt_metal_A",
      genre: "metal",
      name: "Metal Groove (A)",
      key: "A",
      feel: "metal",
      recommendedBpm: 150,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "metal backing track key A 150 bpm",
      youtubeEmbed: ""
    },
    bt_metal_D: {
      id: "bt_metal_D",
      genre: "metal",
      name: "Metal Groove (D)",
      key: "D",
      feel: "metal",
      recommendedBpm: 150,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "metal backing track key D 150 bpm",
      youtubeEmbed: ""
    },

    bt_country_G: {
      id: "bt_country_G",
      genre: "country",
      name: "Country Groove (G)",
      key: "G",
      feel: "country",
      recommendedBpm: 110,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "country backing track key G 110 bpm",
      youtubeEmbed: ""
    },
    bt_country_A: {
      id: "bt_country_A",
      genre: "country",
      name: "Country Groove (A)",
      key: "A",
      feel: "country",
      recommendedBpm: 110,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "country backing track key A 110 bpm",
      youtubeEmbed: ""
    },
    bt_country_E: {
      id: "bt_country_E",
      genre: "country",
      name: "Country Groove (E)",
      key: "E",
      feel: "country",
      recommendedBpm: 115,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "country backing track key E 115 bpm",
      youtubeEmbed: ""
    },

    bt_jazz_C: {
      id: "bt_jazz_C",
      genre: "jazz",
      name: "Jazz Swing (C)",
      key: "C",
      feel: "swing",
      recommendedBpm: 140,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "jazz backing track key C swing 140 bpm",
      youtubeEmbed: ""
    },
    bt_jazz_F: {
      id: "bt_jazz_F",
      genre: "jazz",
      name: "Jazz Swing (F)",
      key: "F",
      feel: "swing",
      recommendedBpm: 130,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "jazz backing track key F swing 130 bpm",
      youtubeEmbed: ""
    },
    bt_jazz_Bb: {
      id: "bt_jazz_Bb",
      genre: "jazz",
      name: "Jazz Swing (Bb)",
      key: "Bb",
      feel: "swing",
      recommendedBpm: 125,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "jazz backing track key Bb swing 125 bpm",
      youtubeEmbed: ""
    },

    bt_funk_E: {
      id: "bt_funk_E",
      genre: "funk",
      name: "Funk Groove (E)",
      key: "E",
      feel: "funk",
      recommendedBpm: 105,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "funk backing track key E 105 bpm",
      youtubeEmbed: ""
    },
    bt_funk_A: {
      id: "bt_funk_A",
      genre: "funk",
      name: "Funk Groove (A)",
      key: "A",
      feel: "funk",
      recommendedBpm: 100,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "funk backing track key A 100 bpm",
      youtubeEmbed: ""
    },
    bt_funk_D: {
      id: "bt_funk_D",
      genre: "funk",
      name: "Funk Groove (D)",
      key: "D",
      feel: "funk",
      recommendedBpm: 100,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "funk backing track key D 100 bpm",
      youtubeEmbed: ""
    },

    bt_acoustic_G: {
      id: "bt_acoustic_G",
      genre: "acoustic",
      name: "Acoustic Strum (G)",
      key: "G",
      feel: "acoustic",
      recommendedBpm: 95,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "acoustic backing track key G 95 bpm",
      youtubeEmbed: ""
    },
    bt_acoustic_C: {
      id: "bt_acoustic_C",
      genre: "acoustic",
      name: "Acoustic Strum (C)",
      key: "C",
      feel: "acoustic",
      recommendedBpm: 95,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "acoustic backing track key C 95 bpm",
      youtubeEmbed: ""
    },
    bt_acoustic_D: {
      id: "bt_acoustic_D",
      genre: "acoustic",
      name: "Acoustic Strum (D)",
      key: "D",
      feel: "acoustic",
      recommendedBpm: 100,
      note: "Placeholder — add youtubeEmbed when you pick a track.",
      youtubeQuery: "acoustic backing track key D 100 bpm",
      youtubeEmbed: ""
    }
  }
};
