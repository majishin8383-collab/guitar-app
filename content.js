// content.js
// Dose 0.2 — Content Model v1 (+ handedness-safe language)
// Dose 0.2.2 — Video hooks per drill (demo / mistake / fix)
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
      starterSkillIds: ["blues_timing_shuffle", "blues_pentatonic_box1", "blues_bends_vibrato"],
      backingTrackIds: ["bt_blues_shuffle_A", "bt_blues_slow_12bar_E"]
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
            // Muted shuffle strum pattern
            demoUrl: "https://www.youtube.com/embed/Z-Cvv7yo5EA",
            // (placeholder mistake/fix videos for now — replace anytime)
            dontUrl: "https://www.youtube.com/embed/56zp3uWDwVs",
            fixUrl:  "https://www.youtube.com/embed/H7vCMvUyWpA"
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
            // Blues shuffle rhythm / comping references
            demoUrl: "https://www.youtube.com/embed/d5R3Re17dgM",
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
            // Minor pentatonic box 1 lesson
            demoUrl: "https://www.youtube.com/embed/fg1n_i-D7v0",
            dontUrl: "https://www.youtube.com/embed/5Qc426qgSho",
            fixUrl:  "https://www.youtube.com/embed/83GZUBdupaI"
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
            "Pick the target note first (destination pitch).",
            "Then bend up to match it.",
            "Hold the pitch steady for 2 seconds.",
            "Use multiple fretting-hand fingers to support the bend."
          ],
          suggestedBpm: { start: 40, target: 70, step: 5 },
          media: {
            // Beginner bends & vibrato exercise demo
            demoUrl: "https://www.youtube.com/embed/NVJg8VjEVpM",
            dontUrl: "https://www.youtube.com/embed/M65GXQabC-s",
            fixUrl:  "https://www.youtube.com/embed/39mhhYpaFS0"
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
            fixUrl:  "https://www.youtube.com/embed/39mhhYpaFS0"
          }
        }
      ]
    }
  },

  backingTracks: {
    // Metadata only unless you add audioUrl (mp3/ogg hosted on your site).
    bt_blues_shuffle_A: {
      id: "bt_blues_shuffle_A",
      genre: "blues",
      name: "Shuffle Groove in A",
      key: "A",
      feel: "shuffle",
      recommendedBpm: 90
      // audioUrl: "audio/blues_shuffle_A_90.mp3"
    },
    bt_blues_slow_12bar_E: {
      id: "bt_blues_slow_12bar_E",
      genre: "blues",
      name: "Slow 12-Bar in E",
      key: "E",
      feel: "slow blues",
      recommendedBpm: 65
      // audioUrl: "audio/blues_slow_12bar_E_65.mp3"
    }
  }
};
