// js/content/genres/rock.js
// Rock pack (v2) — 2 skills in practice + 1 video per skill (simple)
// Requires: js/content/base.js loaded first (window.CONTENT_ADD exists)

(function () {
  // --- helpers: make sure we only ever store safe embed URLs ---
  function toEmbed(url) {
    if (!url || typeof url !== "string") return null;

    // already an embed url
    if (
      url.startsWith("https://www.youtube.com/embed/") ||
      url.startsWith("https://youtube.com/embed/") ||
      url.startsWith("https://www.youtube-nocookie.com/embed/")
    ) return url;

    // normalize common forms:
    // - https://youtu.be/VIDEOID
    // - https://www.youtube.com/watch?v=VIDEOID
    // - https://m.youtube.com/watch?v=VIDEOID
    // - https://www.youtube.com/shorts/VIDEOID
    // - https://www.youtube.com/live/VIDEOID
    // - extra params allowed
    try {
      const u = new URL(url);

      // youtu.be/VIDEOID
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "").trim();
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      // youtube.com/watch?v=VIDEOID
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      // youtube.com/shorts/VIDEOID
      const parts = u.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx !== -1 && parts[shortsIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[shortsIdx + 1]}`;
      }

      // youtube.com/live/VIDEOID
      const liveIdx = parts.indexOf("live");
      if (liveIdx !== -1 && parts[liveIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[liveIdx + 1]}`;
      }
    } catch {
      // ignore
    }

    return null;
  }

  // If these example IDs ever die, swap them later—structure stays the same.
  // (We’re optimizing flow, not perfect curation yet.)
  const VIDEO_POWER_CHORDS = toEmbed("https://www.youtube.com/watch?v=2bPpP3P9Z9Q") || null;
  const VIDEO_TIGHT_RHYTHM  = toEmbed("https://www.youtube.com/watch?v=qbH9Rk0z1xI") || null;
  const VIDEO_PENTA_LEAD    = toEmbed("https://www.youtube.com/watch?v=fg1n_i-D7v0") || null;

  window.CONTENT_ADD({
    genres: {
      rock: {
        id: "rock",
        name: "Rock",
        description: "Power chords, tight timing, classic rock rhythm, and simple lead phrasing.",

        // ✅ IMPORTANT: Practice uses starterSkillIds — keep it to 2 skills for now.
        starterSkillIds: [
          "rock_power_chords",
          "rock_tight_rhythm"
        ],

        backingTrackIds: [
          "bt_rock_A_rhythm",
          "bt_rock_A_lead",
          "bt_rock_E_rhythm",
          "bt_rock_E_lead"
        ]
      }
    },

    skills: {
      rock_power_chords: {
        id: "rock_power_chords",
        genre: "rock",
        name: "Power Chords (Foundation)",
        levelBand: "beginner",
        summary: "Build clean, punchy power chords with controlled muting.",
        drills: [
          {
            id: "d_power_1",
            name: "Two-finger power chords",
            durationSec: 180,
            handednessSafe: true,
            instructions: [
              "Use your index finger on the root note.",
              "Add your ring finger for the fifth.",
              "Mute unused strings with both hands.",
              "Strum evenly with confidence."
            ],
            suggestedBpm: { start: 60, target: 110, step: 5 },

            // ✅ Single video per drill
            media: { videoUrl: VIDEO_POWER_CHORDS }
          }
        ]
      },

      rock_tight_rhythm: {
        id: "rock_tight_rhythm",
        genre: "rock",
        name: "Tight Rhythm Playing",
        levelBand: "beginner",
        summary: "Lock in with the beat and eliminate sloppy transitions.",
        drills: [
          {
            id: "d_rhythm_1",
            name: "Downstroke control",
            durationSec: 180,
            handednessSafe: true,
            instructions: [
              "Use steady downstrokes only.",
              "Keep the picking hand relaxed.",
              "Stay perfectly in time with the beat.",
              "Focus on consistent attack."
            ],
            suggestedBpm: { start: 70, target: 120, step: 5 },

            // ✅ Single video per drill
            media: { videoUrl: VIDEO_TIGHT_RHYTHM }
          }
        ]
      },

      // Keep this skill defined (so the genre page can still list it later if you want),
      // but it won’t appear in Practice until you add it back to starterSkillIds.
      rock_minor_pentatonic: {
        id: "rock_minor_pentatonic",
        genre: "rock",
        name: "Minor Pentatonic (Rock Lead)",
        levelBand: "beginner",
        summary: "Use the minor pentatonic for classic rock solos.",
        drills: [
          {
            id: "d_rock_penta_1",
            name: "Box 1 rock phrasing",
            durationSec: 180,
            handednessSafe: true,
            instructions: [
              "Play the scale slowly and evenly.",
              "Use alternate picking.",
              "Add simple bends for expression.",
              "Leave space between phrases."
            ],
            suggestedBpm: { start: 60, target: 120, step: 5 },

            // ✅ Single video per drill
            media: { videoUrl: VIDEO_PENTA_LEAD }
          }
        ]
      }
    },

    backingTracks: {
      // ---------------------------
      // STRAIGHT ROCK — YouTube
      // ---------------------------
      bt_rock_A_rhythm: {
        id: "bt_rock_A_rhythm",
        genre: "rock",
        name: "Straight Rock Groove (A) — Rhythm",
        key: "A",
        feel: "straight rock",
        recommendedBpm: 100,
        note: "Use YouTube controls in the player.",
        mix: "rhythm",
        youtubeEmbed: toEmbed("https://www.youtube.com/watch?v=6JZ2n1wPp6E")
      },
      bt_rock_A_lead: {
        id: "bt_rock_A_lead",
        genre: "rock",
        name: "Straight Rock Groove (A) — Lead",
        key: "A",
        feel: "straight rock",
        recommendedBpm: 100,
        note: "Use YouTube controls in the player.",
        mix: "lead",
        youtubeEmbed: toEmbed("https://www.youtube.com/watch?v=6JZ2n1wPp6E")
      },

      bt_rock_E_rhythm: {
        id: "bt_rock_E_rhythm",
        genre: "rock",
        name: "Straight Rock Groove (E) — Rhythm",
        key: "E",
        feel: "straight rock",
        recommendedBpm: 105,
        note: "Use YouTube controls in the player.",
        mix: "rhythm",
        youtubeEmbed: toEmbed("https://www.youtube.com/watch?v=1yZK1RzZx7I")
      },
      bt_rock_E_lead: {
        id: "bt_rock_E_lead",
        genre: "rock",
        name: "Straight Rock Groove (E) — Lead",
        key: "E",
        feel: "straight rock",
        recommendedBpm: 105,
        note: "Use YouTube controls in the player.",
        mix: "lead",
        youtubeEmbed: toEmbed("https://www.youtube.com/watch?v=1yZK1RzZx7I")
      }
    }
  });
})();
