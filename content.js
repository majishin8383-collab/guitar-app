// content.js
// Dose 0.2 — Content Model v1 (+ handedness-safe language)
// Dose 0.2.2 — Video hooks per drill (demo / mistake / fix)
// Dose 0.3.1 — Backing tracks use YouTube embeds (legal + easy, no mp3)
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

    rock: {
      id: "rock",
      name: "Rock",
      description: "Power chords, tight rhythm, and pentatonic phrasing with attitude.",
      starterSkillIds: [
        "rock_timing_8ths",
        "rock_power_chords",
        "rock_pentatonic_phrasing"
      ],
      backingTrackIds: [
        "bt_rock_E_rhythm",
        "bt_rock_E_lead",
        "bt_rock_A_rhythm",
        "bt_rock_A_lead",
        "bt_rock_G_rhythm",
        "bt_rock_G_lead"
      ]
    },

    metal: {
      id: "metal",
      name: "Metal",
      description: "Palm-muted precision, downpicking endurance, and tight alternate picking.",
      starterSkillIds: [
        "metal_timing_chugs",
        "metal_downpicking",
        "metal_alt_picking"
      ],
      backingTrackIds: [
        "bt_metal_Em_rhythm",
        "bt_metal_Em_lead",
        "bt_metal_Gm_rhythm",
        "bt_metal_Gm_lead",
        "bt_metal_Am_rhythm",
        "bt_metal_Am_lead"
      ]
    },

    country: {
      id: "country",
      name: "Country",
      description: "Clean rhythm, chord changes, and melodic fills that land in the pocket.",
      starterSkillIds: [
        "country_timing_boomchick",
        "country_open_chords",
        "country_major_pentatonic"
      ],
      backingTrackIds: [
        "bt_country_G_rhythm",
        "bt_country_G_lead",
        "bt_country_A_rhythm",
        "bt_country_A_lead",
        "bt_country_D_rhythm",
        "bt_country_D_lead"
      ]
    },

    funk: {
      id: "funk",
      name: "Funk",
      description: "16th-note feel, muting control, and groove-first rhythm playing.",
      starterSkillIds: [
        "funk_timing_16ths",
        "funk_mute_control",
        "funk_chord_stabs"
      ],
      backingTrackIds: [
        "bt_funk_Em_rhythm",
        "bt_funk_Em_lead",
        "bt_funk_Am_rhythm",
        "bt_funk_Am_lead",
        "bt_funk_Dm_rhythm",
        "bt_funk_Dm_lead"
      ]
    }
  },

  skills: {
    // ---------------------------
    // BLUES (existing)
    // ---------------------------
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

    // ---------------------------
    // ROCK
    // ---------------------------
    rock_timing_8ths: {
      id: "rock_timing_8ths",
      genre: "rock",
      name: "8th-Note Timing (Rock Engine)",
      levelBand: "beginner",
      summary: "Build steady, punchy 8th-notes with clean picking-hand control.",
      drills: [
        {
          id: "d_rock_8ths_1",
          name: "Muted 8th-note chugs",
          durationSec: 150,
          handednessSafe: true,
          instructions: [
            "Mute strings lightly with your fretting hand.",
            "Pick steady 8th-notes on one string.",
            "Stay relaxed in the picking hand.",
            "Aim for consistent volume and spacing."
          ],
          suggestedBpm: { start: 80, target: 140, step: 5 }
        },
        {
          id: "d_rock_8ths_2",
          name: "Accent control (2 and 4)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Keep steady 8th-notes.",
            "Accentuate beats 2 and 4.",
            "Keep non-accent notes light and even.",
            "If tension shows up, slow down and reset."
          ],
          suggestedBpm: { start: 80, target: 130, step: 5 }
        }
      ]
    },

    rock_power_chords: {
      id: "rock_power_chords",
      genre: "rock",
      name: "Power Chords (Clean Changes)",
      levelBand: "beginner",
      summary: "Move between power chords cleanly without losing timing.",
      drills: [
        {
          id: "d_rock_pc_1",
          name: "Two-chord switch",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Choose two power chords (example: E5 and G5).",
            "Strum steady 8th-notes.",
            "Switch chords every 2 bars.",
            "Keep fretting-hand pressure only as heavy as needed."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 }
        },
        {
          id: "d_rock_pc_2",
          name: "Palm-mute vs open contrast",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play one bar palm-muted, one bar open.",
            "Keep tempo identical in both bars.",
            "Use the picking-hand edge to control mute depth.",
            "Listen for note clarity (no dead thuds unless intended)."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 }
        }
      ]
    },

    rock_pentatonic_phrasing: {
      id: "rock_pentatonic_phrasing",
      genre: "rock",
      name: "Pentatonic Phrasing (Rock Lead)",
      levelBand: "beginner",
      summary: "Turn scale shapes into musical phrases with timing and space.",
      drills: [
        {
          id: "d_rock_penta_1",
          name: "Call-and-response (2 bars each)",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Improvise a short 2-bar phrase.",
            "Answer it with a different 2-bar phrase.",
            "Leave space between phrases.",
            "Keep bends and vibrato controlled—pitch first."
          ],
          suggestedBpm: { start: 70, target: 110, step: 5 }
        }
      ]
    },

    // ---------------------------
    // METAL
    // ---------------------------
    metal_timing_chugs: {
      id: "metal_timing_chugs",
      genre: "metal",
      name: "Chug Timing (Tight Low End)",
      levelBand: "beginner",
      summary: "Lock in palm-muted chugs that stay perfectly on the grid.",
      drills: [
        {
          id: "d_metal_chug_1",
          name: "16th-note bursts",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play steady 8th-notes for 2 beats.",
            "Switch to 16th-notes for 2 beats.",
            "Return to 8th-notes cleanly.",
            "Keep palm-mute depth consistent."
          ],
          suggestedBpm: { start: 90, target: 150, step: 5 }
        }
      ]
    },

    metal_downpicking: {
      id: "metal_downpicking",
      genre: "metal",
      name: "Downpicking Endurance",
      levelBand: "beginner",
      summary: "Build power and endurance while staying relaxed and even.",
      drills: [
        {
          id: "d_metal_down_1",
          name: "Downpick 8ths (1-minute blocks)",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Pick steady 8th-notes using downstrokes only.",
            "Keep motion small and efficient.",
            "Stop before form breaks down.",
            "Increase bpm only when relaxed and clean."
          ],
          suggestedBpm: { start: 90, target: 160, step: 5 }
        }
      ]
    },

    metal_alt_picking: {
      id: "metal_alt_picking",
      genre: "metal",
      name: "Alternate Picking (Accuracy First)",
      levelBand: "beginner",
      summary: "Clean, even alternate picking across strings without tension.",
      drills: [
        {
          id: "d_metal_alt_1",
          name: "Single-string accuracy",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick one string with strict alternate picking.",
            "Listen for uneven volume between strokes.",
            "Keep fretting-hand fingers close to the fretboard.",
            "If you tense up, reduce bpm and reset posture."
          ],
          suggestedBpm: { start: 90, target: 170, step: 5 }
        }
      ]
    },

    // ---------------------------
    // COUNTRY
    // ---------------------------
    country_timing_boomchick: {
      id: "country_timing_boomchick",
      genre: "country",
      name: "Boom-Chick Timing",
      levelBand: "beginner",
      summary: "Bass note + chord hit timing that stays steady and musical.",
      drills: [
        {
          id: "d_country_bc_1",
          name: "Boom-chick on one chord",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Pick a bass note on beat 1 and 3.",
            "Strum a chord on beat 2 and 4.",
            "Keep chord hits short and controlled.",
            "Make the groove feel effortless."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 }
        }
      ]
    },

    country_open_chords: {
      id: "country_open_chords",
      genre: "country",
      name: "Open Chord Changes",
      levelBand: "beginner",
      summary: "Clean chord switches without rushing the change.",
      drills: [
        {
          id: "d_country_chords_1",
          name: "Two-chord loop (4 bars each)",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Choose two open chords (example: G and C).",
            "Play 4 bars of the first chord, then switch.",
            "Keep strum dynamics consistent.",
            "Aim for silent, efficient fretting-hand movement."
          ],
          suggestedBpm: { start: 65, target: 110, step: 5 }
        }
      ]
    },

    country_major_pentatonic: {
      id: "country_major_pentatonic",
      genre: "country",
      name: "Major Pentatonic (Melodic Fills)",
      levelBand: "beginner",
      summary: "Simple melodic fills that fit over major progressions.",
      drills: [
        {
          id: "d_country_penta_1",
          name: "Fill after the chord",
          durationSec: 240,
          handednessSafe: true,
          instructions: [
            "Strum one bar of chords.",
            "Play a short 1-bar fill from the major pentatonic.",
            "Keep fills rhythmic and singable.",
            "Return to chords cleanly without rushing."
          ],
          suggestedBpm: { start: 65, target: 105, step: 5 }
        }
      ]
    },

    // ---------------------------
    // FUNK
    // ---------------------------
    funk_timing_16ths: {
      id: "funk_timing_16ths",
      genre: "funk",
      name: "16th-Note Timing (Funk Grid)",
      levelBand: "beginner",
      summary: "Feel 16ths cleanly so your groove stays locked and confident.",
      drills: [
        {
          id: "d_funk_16_1",
          name: "Muted 16ths (light touch)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Mute strings with the fretting hand.",
            "Strum continuous 16ths lightly.",
            "Keep the picking hand loose and small.",
            "Aim for consistent motion without fatigue."
          ],
          suggestedBpm: { start: 70, target: 110, step: 5 }
        }
      ]
    },

    funk_mute_control: {
      id: "funk_mute_control",
      genre: "funk",
      name: "Mute Control (Clean Stops)",
      levelBand: "beginner",
      summary: "Start and stop chord sounds sharply without losing the beat.",
      drills: [
        {
          id: "d_funk_mute_1",
          name: "Short chord hits (tight release)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Play a chord hit on beats 2 and 4.",
            "Immediately release pressure to mute the chord.",
            "Keep timing strict—no rushing the mute.",
            "Use minimal fretting-hand movement."
          ],
          suggestedBpm: { start: 70, target: 110, step: 5 }
        }
      ]
    },

    funk_chord_stabs: {
      id: "funk_chord_stabs",
      genre: "funk",
      name: "Chord Stabs (Groove First)",
      levelBand: "beginner",
      summary: "Punchy chord stabs that sit inside the groove.",
      drills: [
        {
          id: "d_funk_stab_1",
          name: "Offbeat stabs",
          durationSec: 210,
          handednessSafe: true,
          instructions: [
            "Keep a steady 16th-note motion with the picking hand.",
            "Only let chord stabs ring on offbeats.",
            "Mute everything else.",
            "Stay relaxed—groove comes from control, not force."
          ],
          suggestedBpm: { start: 70, target: 105, step: 5 }
        }
      ]
    }
  },

  backingTracks: {
    // ---------------------------
    // BLUES (existing) — YouTube
    // ---------------------------
    bt_gen_shuffle_A_rhythm: {
      id: "bt_gen_shuffle_A_rhythm",
      genre: "blues",
      name: "Shuffle 12-Bar (A) — Rhythm Mix",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 92,
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
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
      note: "Use the YouTube controls in the player to play/pause.",
      youtubeQuery: "slow blues backing track key C 62 bpm 12 bar",
      youtubeEmbed: "https://www.youtube.com/embed/IGfyzzcMOKk"
    },

    // ---------------------------
    // ROCK — YouTube
    // ---------------------------
    bt_rock_E_rhythm: {
      id: "bt_rock_E_rhythm",
      genre: "rock",
      name: "Rock Backing Track (E) — Rhythm Mix",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Tight rock groove. Use YouTube player controls.",
      youtubeQuery: "rock backing track key E 120 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/-Te_EMMUyEA"
    },
    bt_rock_E_lead: {
      id: "bt_rock_E_lead",
      genre: "rock",
      name: "Rock Backing Track (E) — Lead Mix",
      key: "E",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Practice lead phrasing with space and strong endings.",
      youtubeQuery: "rock backing track key E 120 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/-Te_EMMUyEA"
    },
    bt_rock_A_rhythm: {
      id: "bt_rock_A_rhythm",
      genre: "rock",
      name: "Rock Backing Track (A) — Rhythm Mix",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Use YouTube player controls.",
      youtubeQuery: "rock backing track key A 120 bpm",
      youtubeEmbed: null
    },
    bt_rock_A_lead: {
      id: "bt_rock_A_lead",
      genre: "rock",
      name: "Rock Backing Track (A) — Lead Mix",
      key: "A",
      feel: "straight rock",
      recommendedBpm: 120,
      note: "Use YouTube player controls.",
      youtubeQuery: "rock backing track key A 120 bpm",
      youtubeEmbed: null
    },
    bt_rock_G_rhythm: {
      id: "bt_rock_G_rhythm",
      genre: "rock",
      name: "Rock Backing Track (G) — Rhythm Mix",
      key: "G",
      feel: "straight rock",
      recommendedBpm: 110,
      note: "Use YouTube player controls.",
      youtubeQuery: "rock backing track key G 110 bpm",
      youtubeEmbed: null
    },
    bt_rock_G_lead: {
      id: "bt_rock_G_lead",
      genre: "rock",
      name: "Rock Backing Track (G) — Lead Mix",
      key: "G",
      feel: "straight rock",
      recommendedBpm: 110,
      note: "Use YouTube player controls.",
      youtubeQuery: "rock backing track key G 110 bpm",
      youtubeEmbed: null
    },

    // ---------------------------
    // METAL — YouTube
    // ---------------------------
    bt_metal_Em_rhythm: {
      id: "bt_metal_Em_rhythm",
      genre: "metal",
      name: "Metal Backing Track (E minor) — Rhythm Mix",
      key: "Em",
      feel: "metal",
      recommendedBpm: 140,
      note: "Chugs + tight timing. Use YouTube player controls.",
      youtubeQuery: "metal backing track E minor 140 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/TSXmRwHK-4w"
    },
    bt_metal_Em_lead: {
      id: "bt_metal_Em_lead",
      genre: "metal",
      name: "Metal Backing Track (E minor) — Lead Mix",
      key: "Em",
      feel: "metal",
      recommendedBpm: 140,
      note: "Practice alternate picking and clean targeting.",
      youtubeQuery: "metal backing track E minor 140 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/TSXmRwHK-4w"
    },
    bt_metal_Gm_rhythm: {
      id: "bt_metal_Gm_rhythm",
      genre: "metal",
      name: "Metal Backing Track (G minor) — Rhythm Mix",
      key: "Gm",
      feel: "metal",
      recommendedBpm: 140,
      note: "Use YouTube player controls.",
      youtubeQuery: "metal backing track G minor 140 bpm",
      youtubeEmbed: null
    },
    bt_metal_Gm_lead: {
      id: "bt_metal_Gm_lead",
      genre: "metal",
      name: "Metal Backing Track (G minor) — Lead Mix",
      key: "Gm",
      feel: "metal",
      recommendedBpm: 140,
      note: "Use YouTube player controls.",
      youtubeQuery: "metal backing track G minor 140 bpm",
      youtubeEmbed: null
    },
    bt_metal_Am_rhythm: {
      id: "bt_metal_Am_rhythm",
      genre: "metal",
      name: "Metal Backing Track (A minor) — Rhythm Mix",
      key: "Am",
      feel: "metal",
      recommendedBpm: 135,
      note: "Use YouTube player controls.",
      youtubeQuery: "metal backing track A minor 135 bpm",
      youtubeEmbed: null
    },
    bt_metal_Am_lead: {
      id: "bt_metal_Am_lead",
      genre: "metal",
      name: "Metal Backing Track (A minor) — Lead Mix",
      key: "Am",
      feel: "metal",
      recommendedBpm: 135,
      note: "Use YouTube player controls.",
      youtubeQuery: "metal backing track A minor 135 bpm",
      youtubeEmbed: null
    },

    // ---------------------------
    // COUNTRY — YouTube
    // ---------------------------
    bt_country_G_rhythm: {
      id: "bt_country_G_rhythm",
      genre: "country",
      name: "Country Backing Track (G) — Rhythm Mix",
      key: "G",
      feel: "country",
      recommendedBpm: 90,
      note: "Boom-chick + clean changes. Use YouTube player controls.",
      youtubeQuery: "country backing track in G 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/rGoYRaHTwGM"
    },
    bt_country_G_lead: {
      id: "bt_country_G_lead",
      genre: "country",
      name: "Country Backing Track (G) — Lead Mix",
      key: "G",
      feel: "country",
      recommendedBpm: 90,
      note: "Practice melodic fills that land on chord tones.",
      youtubeQuery: "country backing track in G 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/rGoYRaHTwGM"
    },
    bt_country_A_rhythm: {
      id: "bt_country_A_rhythm",
      genre: "country",
      name: "Country Backing Track (A) — Rhythm Mix",
      key: "A",
      feel: "country",
      recommendedBpm: 90,
      note: "Use YouTube player controls.",
      youtubeQuery: "country backing track in A 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/HzLCLJAbVOI"
    },
    bt_country_A_lead: {
      id: "bt_country_A_lead",
      genre: "country",
      name: "Country Backing Track (A) — Lead Mix",
      key: "A",
      feel: "country",
      recommendedBpm: 90,
      note: "Use YouTube player controls.",
      youtubeQuery: "country backing track in A 90 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/HzLCLJAbVOI"
    },
    bt_country_D_rhythm: {
      id: "bt_country_D_rhythm",
      genre: "country",
      name: "Country Backing Track (D) — Rhythm Mix",
      key: "D",
      feel: "country",
      recommendedBpm: 95,
      note: "Use YouTube player controls.",
      youtubeQuery: "country backing track in D 95 bpm",
      youtubeEmbed: null
    },
    bt_country_D_lead: {
      id: "bt_country_D_lead",
      genre: "country",
      name: "Country Backing Track (D) — Lead Mix",
      key: "D",
      feel: "country",
      recommendedBpm: 95,
      note: "Use YouTube player controls.",
      youtubeQuery: "country backing track in D 95 bpm",
      youtubeEmbed: null
    },

    // ---------------------------
    // FUNK — YouTube
    // ---------------------------
    bt_funk_Em_rhythm: {
      id: "bt_funk_Em_rhythm",
      genre: "funk",
      name: "Funk Backing Track (E minor) — Rhythm Mix",
      key: "Em",
      feel: "funk",
      recommendedBpm: 100,
      note: "Muted 16ths + tight stabs. Use YouTube player controls.",
      youtubeQuery: "funk backing track in E minor 100 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/xnvd2nRdU54"
    },
    bt_funk_Em_lead: {
      id: "bt_funk_Em_lead",
      genre: "funk",
      name: "Funk Backing Track (E minor) — Lead Mix",
      key: "Em",
      feel: "funk",
      recommendedBpm: 100,
      note: "Practice short phrases that fit between the stabs.",
      youtubeQuery: "funk backing track in E minor 100 bpm",
      youtubeEmbed: "https://www.youtube.com/embed/xnvd2nRdU54"
    },
    bt_funk_Am_rhythm: {
      id: "bt_funk_Am_rhythm",
      genre: "funk",
      name: "Funk Backing Track (A minor) — Rhythm Mix",
      key: "Am",
      feel: "funk",
      recommendedBpm: 100,
      note: "Use YouTube player controls.",
      youtubeQuery: "funk backing track in A minor 100 bpm",
      youtubeEmbed: null
    },
    bt_funk_Am_lead: {
      id: "bt_funk_Am_lead",
      genre: "funk",
      name: "Funk Backing Track (A minor) — Lead Mix",
      key: "Am",
      feel: "funk",
      recommendedBpm: 100,
      note: "Use YouTube player controls.",
      youtubeQuery: "funk backing track in A minor 100 bpm",
      youtubeEmbed: null
    },
    bt_funk_Dm_rhythm: {
      id: "bt_funk_Dm_rhythm",
      genre: "funk",
      name: "Funk Backing Track (D minor) — Rhythm Mix",
      key: "Dm",
      feel: "funk",
      recommendedBpm: 95,
      note: "Use YouTube player controls.",
      youtubeQuery: "funk backing track in D minor 95 bpm",
      youtubeEmbed: null
    },
    bt_funk_Dm_lead: {
      id: "bt_funk_Dm_lead",
      genre: "funk",
      name: "Funk Backing Track (D minor) — Lead Mix",
      key: "Dm",
      feel: "funk",
      recommendedBpm: 95,
      note: "Use YouTube player controls.",
      youtubeQuery: "funk backing track in D minor 95 bpm",
      youtubeEmbed: null
    }
  }
};
