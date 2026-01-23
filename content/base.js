// content/base.js
// Content registry + safe merge (keeps window.CONTENT stable)
// Load this BEFORE any genre content scripts.

(function () {
  const empty = { genres: {}, skills: {}, backingTracks: {} };

  // If something already created CONTENT, keep it; otherwise initialize.
  window.CONTENT = (window.CONTENT && typeof window.CONTENT === "object")
    ? window.CONTENT
    : { ...empty };

  // Ensure all top-level buckets exist
  window.CONTENT.genres = window.CONTENT.genres || {};
  window.CONTENT.skills = window.CONTENT.skills || {};
  window.CONTENT.backingTracks = window.CONTENT.backingTracks || {};

  // Merge helper used by genre files
  window.CONTENT_ADD = function addContent(part) {
    if (!part || typeof part !== "object") return;

    if (part.genres) Object.assign(window.CONTENT.genres, part.genres);
    if (part.skills) Object.assign(window.CONTENT.skills, part.skills);
    if (part.backingTracks) Object.assign(window.CONTENT.backingTracks, part.backingTracks);
  };
})();
