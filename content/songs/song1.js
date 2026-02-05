// content/songs/song1.js

CONTENT_ADD({
  songs: {
    song1: {
      id: "song1",
      title: "First Groove",
      style: "Strumming • Time Feel",
      description: "Your first real song. One pattern. Stay in time.",

      requirements: [
        {
          id: "core_time_steady",
          title: "Steady Time",
          subtitle: "Can you keep strumming without stopping?",
          passText: "Play for 60 seconds without breaking time."
        }
      ],

      // ✅ Correct progression (4-bar loop):
      // A / A / D / A
      chordBlocks: [
        { chord: "A", beatsPerBar: 4 },
        { chord: "A", beatsPerBar: 4 },
        { chord: "D", beatsPerBar: 4 },
        { chord: "A", beatsPerBar: 4 }
      ],

      variants: {
        easy: {
          id: "easy",
          label: "Easy",
          subtext: "Slow and steady. Focus on time.",
          backingTrackId: "bt_song1_easy",
          displayKey: "A",
          displayBpm: 80,
          targetSeconds: 60,
          stopLimit: 2,
          completionTitle: "Nice.",
          completionBody: "You stayed in time. That’s the job."
        },

        medium: {
          id: "medium",
          label: "Medium",
          subtext: "Same pattern. Cleaner. Faster.",
          backingTrackId: "bt_song1_medium",
          displayKey: "A",
          displayBpm: 95,
          targetSeconds: 75,
          stopLimit: 1,
          completionTitle: "Locked in.",
          completionBody: "You’re starting to groove."
        },

        hard: {
          id: "hard",
          label: "Hard",
          subtext: "Same pattern. No hesitation.",
          backingTrackId: "bt_song1_hard",
          displayKey: "A",
          displayBpm: 110,
          targetSeconds: 90,
          stopLimit: 0,
          completionTitle: "You played music.",
          completionBody: "That’s a song, not an exercise."
        }
      },

      nextCoreIds: ["core_chord_transitions"],
      nextSongId: "song2"
    }
  }
});
