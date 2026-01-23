// js/content/funk.js
// Dose 0.4 — Funk Genre Pack v1
// - Adds Funk genre + 3 starter skills
// - Every drill includes media.demoUrl / dontUrl / fixUrl (YouTube embeds)
// - Handedness-safe language (fretting hand / picking hand)

(function () {
  const add = {
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
          // You can add these later the same way Blues backing tracks are defined
          // "bt_funk_E_groove_95",
          // "bt_funk_A_groove_100"
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
            instructions: [
              "Lightly mute the strings with your fretting hand.",
              "Strum steady 16ths: 1 e & a 2 e & a 3 e & a 4 e & a.",
              "Keep the picking hand loose and small—no big swings.",
              "Goal: even volume and timing. Accents come later."
            ],
            suggestedBpm: { start: 55, target: 95, step: 5 },
            media: {
              // JustinGuitar - funk strumming mechanics
              demoUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ",
              // 16th strumming patterns lesson (different context but helpful)
              dontUrl: "https://www.youtube.com/embed/DHuxg6toams",
              // Single-note funk line / groove focus (good for feel + timing)
              fixUrl: "https://www.youtube.com/embed/mW1aOiczLFA"
            }
          },
          {
            id: "d_funk_16th_2",
            name: "Accent map (two accents per bar)",
            durationSec: 180,
            handednessSafe: true,
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
            instructions: [
              "Mute strings with the fretting hand.",
              "Do a short burst: hit a chord shape quickly, then mute instantly.",
              "Keep the picking hand moving softly between hits.",
              "Goal: zero ringing between stabs."
            ],
            suggestedBpm: { start: 50, target: 85, step: 5 },
            media: {
              // Fretting-hand muting lesson (funk focus)
              demoUrl: "https://www.youtube.com/embed/xKgCSfkHzs4",
              // Percussive funk muting breakdown
              dontUrl: "https://www.youtube.com/embed/_VUUdRVKhoI",
              // Justin funk mechanics again as a correction reference
              fixUrl: "https://www.youtube.com/embed/zMgZL4iW4nQ"
            }
          },
          {
            id: "d_funk_mute_2",
            name: "Ghost strums (percussion without notes)",
            durationSec: 180,
            handednessSafe: true,
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

    // Backing tracks can be added later once you want them consistent with the Blues embed approach
    backingTracks: {}
  };

  // ---- Merge into existing CONTENT (non-destructive) ----
  const C = (window.CONTENT = window.CONTENT || {});
  C.genres = Object.assign({}, C.genres || {}, add.genres);
  C.skills = Object.assign({}, C.skills || {}, add.skills);
  C.backingTracks = Object.assign({}, C.backingTracks || {}, add.backingTracks);
})();
