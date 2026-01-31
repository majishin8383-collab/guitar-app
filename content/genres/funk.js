// content/genres/funk.js
// Funk pack (v1) — drills + YouTube embeds
// Requires: content/base.js loaded first (window.CONTENT_ADD exists)
//
// Notes:
// - Uses window.CONTENT_ADD (same merge pattern as Blues/Rock)
// - IDs unchanged
// - Optional audit fields added (non-breaking): drill.coreId / drill.difficultyStep / drill.focus / drill.needsDiagram

window.CONTENT_ADD({
  genres: {
    funk: {
      id: "funk",
      name: "Funk",
      description: "16th-note groove, muting control, and tight chord stabs (Nile-style fundamentals).",
      starterSkillIds: [
        "funk_16th_groove",
        "funk_muting_control",
        "funk_chord_stabs"
      ],
      backingTrackIds: [
        // Add later using the Blues embed approach:
        // "bt_funk_E_rhythm", "bt_funk_E_lead",
        // "bt_funk_A_rhythm", "bt_funk_A_lead"
      ]
    }
  },

  skills: {
    funk_16th_groove: {
      id: "funk_16th_groove",
      genre: "funk",
      name: "16th-Note Groove (Foundation)",
      levelBand: "beginner",
      summary: "Build an even 16th-note strum engine with clean accents and zero tension.",
      drills: [
        {
          id: "d_funk_16th_1",
          name: "Muted 16ths (engine builder)",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_5",          // Time & Rhythm
          difficultyStep: 1,
          focus: "timing",
          needsDiagram: false,

          instructions: [
            "Lightly mute the strings with your fretting hand.",
            "Strum steady 16ths: 1 e & a 2 e & a 3 e & a 4 e & a.",
            "Keep the picking hand loose and small—no big swings.",
            "Goal: even volume and timing. Accents come later."
          ],
          suggestedBpm: { start: 55, target: 95, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ",
            dontUrl: "https://www.youtube.com/embed/DHuxg6toams",
            fixUrl: "https://www.youtube.com/embed/mW1aOiczLFA"
          }
        },
        {
          id: "d_funk_16th_2",
          name: "Accent map (two accents per bar)",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_5",          // Time & Rhythm
          difficultyStep: 2,
          focus: "accents",
          needsDiagram: false,

          instructions: [
            "Keep muted 16ths going with the picking hand.",
            "Add two accents per bar (example: accent on ‘2’ and ‘& of 4’).",
            "Everything else stays light and quiet.",
            "If it gets messy, drop the accents and rebuild the engine."
          ],
          suggestedBpm: { start: 55, target: 90, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ",
            dontUrl: "https://www.youtube.com/embed/DHuxg6toams",
            fixUrl: "https://www.youtube.com/embed/mW1aOiczLFA"
          }
        }
      ]
    },

    funk_muting_control: {
      id: "funk_muting_control",
      genre: "funk",
      name: "Muting Control (The Chops)",
      levelBand: "beginner",
      summary: "Funk is mostly precision muting. Learn to kill strings instantly and cleanly.",
      drills: [
        {
          id: "d_funk_mute_1",
          name: "Mute → hit → mute (tight bursts)",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_3",          // Muting / Noise Control
          difficultyStep: 1,
          focus: "muting",
          needsDiagram: false,

          instructions: [
            "Mute strings with the fretting hand.",
            "Do a short burst: hit a chord shape quickly, then mute instantly.",
            "Keep the picking hand moving softly between hits.",
            "Goal: zero ringing between stabs."
          ],
          suggestedBpm: { start: 50, target: 85, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/xKgCSfkHzs4",
            dontUrl: "https://www.youtube.com/embed/_VUUdRVKhoI",
            fixUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ"
          }
        },
        {
          id: "d_funk_mute_2",
          name: "Ghost strums (percussion without notes)",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_3",          // Muting / Noise Control
          difficultyStep: 2,
          focus: "ghost-strums",
          needsDiagram: false,

          instructions: [
            "Keep a steady 16th motion with the picking hand.",
            "Most strums are ghosted (muted), with occasional clean chord stabs.",
            "Use the fretting hand to control what rings and what dies.",
            "Start slow. Clean control beats speed."
          ],
          suggestedBpm: { start: 50, target: 90, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/_VUUdRVKhoI",
            dontUrl: "https://www.youtube.com/embed/DHuxg6toams",
            fixUrl: "https://www.youtube.com/embed/xKgCSfkHzs4"
          }
        }
      ]
    },

    funk_chord_stabs: {
      id: "funk_chord_stabs",
      genre: "funk",
      name: "Chord Stabs (Pocket + Clean Cuts)",
      levelBand: "beginner",
      summary: "Classic funk rhythm: tight stabs, dead space, and perfect pocket.",
      drills: [
        {
          id: "d_funk_stab_1",
          name: "Two-chord vamp stabs",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_2",          // Chords / Shapes
          difficultyStep: 1,
          focus: "stabs",
          needsDiagram: true,

          instructions: [
            "Pick two easy chord shapes (or simple triads).",
            "Play stabs on the offbeats (the ‘&’ counts).",
            "Mute instantly after each stab.",
            "Stay locked to the count, not the strum."
          ],
          suggestedBpm: { start: 60, target: 100, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ",
            dontUrl: "https://www.youtube.com/embed/_VUUdRVKhoI",
            fixUrl: "https://www.youtube.com/embed/xKgCSfkHzs4"
          }
        },
        {
          id: "d_funk_stab_2",
          name: "Add ghost notes between stabs",
          durationSec: 180,
          handednessSafe: true,

          // audit mapping
          coreId: "CORE_2",          // Chords / Shapes
          difficultyStep: 2,
          focus: "stabs+ghosts",
          needsDiagram: true,

          instructions: [
            "Keep the offbeat stabs going.",
            "Between stabs, add soft ghost strums (muted).",
            "The groove should feel like: stab + air + percussion.",
            "If it starts ringing, simplify and rebuild control."
          ],
          suggestedBpm: { start: 60, target: 105, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/_VUUdRVKhoI",
            dontUrl: "https://www.youtube.com/embed/DHuxg6toams",
            fixUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ"
          }
        }
      ]
    }
  },

  backingTracks: {
    // Intentionally empty for now (add later like Blues)
  }
});
