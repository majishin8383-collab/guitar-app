// songs.js
// Song registry (data only). No UI logic.
// Song 1: "Two Chords, No Stops" with Easy/Medium/Hard variants.

export const SONGS = {
  song1: {
    id: "song1",
    title: "Two Chords, No Stops",
    style: "Rock",
    description: "Keep going. Mistakes are allowed.",

    // Static chord blocks (pattern recognition, not notation)
    chordBlocks: [
      { chord: "A5", bars: 1, beatsPerBar: 4 },
      { chord: "A5", bars: 1, beatsPerBar: 4 },
      { chord: "D5", bars: 1, beatsPerBar: 4 },
      { chord: "A5", bars: 1, beatsPerBar: 4 }
    ],

    // Requirement UI uses these categories.
    // We keep this simple and user-controlled for now (toggle complete),
    // because your current repo does not have a "drill passed" system.
    requirements: [
      {
        id: "time_continuity",
        title: "Time Continuity",
        subtitle: "Can you keep going without stopping?",
        passText: "60 seconds continuous play. No full stop. Mistakes allowed."
      },
      {
        id: "two_chord_switch",
        title: "Two-Shape Chord Switching",
        subtitle: "Can you move shapes without freezing?",
        passText: "Switch A5 to D5 at slow tempo. No full stop. Noise tolerated."
      },
      {
        id: "basic_muting",
        title: "Basic Muting Awareness",
        subtitle: "Can you mute between hits (not perfection)?",
        passText: "Some ringing is fine. You understand why muting matters."
      }
    ],

    variants: {
      easy: {
        id: "easy",
        label: "Easy",
        subtext: "Keep going. Mistakes are allowed.",
        showCountMarkers: false,
        backingTrackId: "bt_rock_A_rhythm",
        targetSeconds: 90,
        stopLimit: 1,
        completionTitle: "Nice.",
        completionBody: "You just played a full song.\n\nYou didn’t stop. That’s the win."
      },

      medium: {
        id: "medium",
        label: "Medium",
        subtext: "Same song. Less forgiveness.",
        showCountMarkers: true,
        backingTrackId: "bt_rock_E_rhythm",
        targetSeconds: 120,
        stopLimit: 1,
        completionTitle: "That was real playing.",
        completionBody:
          "You stayed in time.\nYou recovered when it slipped.\nThat’s how songs work."
      },

      hard: {
        id: "hard",
        label: "Hard",
        subtext: "Play it like it matters.",
        showCountMarkers: false,
        backingTrackId: "bt_rock_D_rhythm",
        targetSeconds: 150,
        stopLimit: 0,
        completionTitle: "You played a song.",
        completionBody: "Not a drill.\nNot an exercise.\nA song."
      }
    }
  }
};
