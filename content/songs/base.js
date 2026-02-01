// content/songs/base.js
// Song content registry (load BEFORE individual song files)

(function () {
  if (!window.CONTENT) {
    console.error("CONTENT not initialized. Load content/base.js first.");
    return;
  }

  window.CONTENT.songs = window.CONTENT.songs || {};

  window.CONTENT_ADD_SONG = function addSong(song) {
    if (!song || !song.id) {
      console.warn("Invalid song definition:", song);
      return;
    }
    window.CONTENT.songs[song.id] = song;
  };
})();
