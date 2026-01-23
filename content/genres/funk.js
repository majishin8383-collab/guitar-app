// js/content/genres/funk.js
// Funk pack (v1) — 16th-note feel, muting, chord stabs
// Requires: js/content/base.js loaded first

window.CONTENT_ADD({
  genres: {
    funk: {
      id: "funk",
      name: "Funk",
      description: "Groove-first rhythm: muting, 16ths, and tight chord stabs.",
      starterSkillIds: [
        "funk_16th_groove",
        "funk_muting_control",
        "funk_chord_stabs"
      ],
      backingTrackIds: [
        "bt_funk_E_rhythm",
        "bt_funk_E_lead",
        "bt_funk_A_rhythm",
        "bt_funk_A_lead"
      ]
    }
  },

  skills: {
    funk_16th_groove: {
      id: "funk_16th_groove",
      genre: "funk",
      name: "16th-Note Groove (Foundation)",
      levelBand: "beginner",
      summary: "Build a consistent 16th-note grid without rushing or dragging.",
      drills: [
        {
          id: "d_funk_16_1",
          name: "Muted 16ths (right-hand engine)",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Lightly mute strings with your fretting hand.",
            "Strum steady 16ths: 1-e-&-a.",
            "Keep the picking hand loose and small.",
            "Accent beat 2 and 4 lightly."
          ],
          suggestedBpm: { start: 70, target: 120, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/2yKqf7H6Q0k",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
          }
        }
      ]
    },

    funk_muting_control: {
      id: "funk_muting_control",
      genre: "funk",
      name: "Muting Control (Clean + Choppy)",
      levelBand: "beginner",
      summary: "Get percussive ‘chops’ without accidental ringing strings.",
      drills: [
        {
          id: "d_funk_mute_1",
          name: "Mute-release timing",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Fret a simple chord shape lightly (no full pressure).",
            "Strum once, then immediately mute by releasing pressure.",
            "Alternate: ring → mute → ring → mute.",
            "Goal: zero extra noise between hits."
          ],
          suggestedBpm: { start: 60, target: 110, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/0y2q5QGf2yE",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
          }
        }
      ]
    },

    funk_chord_stabs: {
      id: "funk_chord_stabs",
      genre: "funk",
      name: "Chord Stabs + Accents",
      levelBand: "beginner",
      summary: "Short, rhythmic chord hits with intentional accents.",
      drills: [
        {
          id: "d_funk_stab_1",
          name: "Off-beat stabs",
          durationSec: 180,
          handednessSafe: true,
          instructions: [
            "Keep the picking hand moving 16ths continuously.",
            "Only let the chord ring on the ‘&’ of each beat.",
            "Mute immediately after each stab.",
            "Stay relaxed—groove over force."
          ],
          suggestedBpm: { start: 65, target: 115, step: 5 },
          media: {
            demoUrl: "https://www.youtube.com/embed/5V8pS5g3Q0M",
            dontUrl: "https://www.youtube.com/embed/9jYF2lK9KxY",
            fixUrl: "https://www.youtube.com/embed/7pYF6kU4x2M"
          }
        }
      ]
    }
  },

  backingTracks: {
    // ---------------------------
    // FUNK GROOVES — YouTube
    // ---------------------------
    bt_funk_E_rhythm: {
      id: "bt_funk_E_rhythm",
      genre: "funk",
      name: "Funk Groove (E) — Rhythm",
      key: "E",
      feel: "funk (16ths)",
      recommendedBpm: 95,
      mix: "rhythm",
      note: "Use YouTube controls in the player.",
      youtubeEmbed: "https://www.youtube.com/embed/3mVb2p3pXxE"
    },
    bt_funk_E_lead: {
      id: "bt_funk_E_lead",
      genre: "funk",
      name: "Funk Groove (E) — Lead",
      key: "E",
      feel: "funk (16ths)",
      recommendedBpm: 95,
      mix: "lead",
      note: "Use YouTube controls in the player.",
      youtubeEmbed: "https://www.youtube.com/embed/3mVb2p3pXxE"
    },

    bt_funk_A_rhythm: {
      id: "bt_funk_A_rhythm",
      genre: "funk",
      name: "Funk Groove (A) — Rhythm",
      key: "A",
      feel: "funk (16ths)",
      recommendedBpm: 100,
      mix: "rhythm",
      note: "Use YouTube controls in the player.",
      youtubeEmbed: "https://www.youtube.com/embed/8QyZ8c1gQxU"
    },
    bt_funk_A_lead: {
      id: "bt_funk_A_lead",
      genre: "funk",
      name: "Funk Groove (A) — Lead",
      key: "A",
      feel: "funk (16ths)",
      recommendedBpm: 100,
      mix: "lead",
      note: "Use YouTube controls in the player.",
      youtubeEmbed: "https://www.youtube.com/embed/8QyZ8c1gQxU"
    }
  }
});
