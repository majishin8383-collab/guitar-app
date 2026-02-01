// content/songs/index.js
// Read-only export of merged song content

export const SONGS =
  (window.CONTENT && window.CONTENT.songs)
    ? window.CONTENT.songs
    : {};
