// ui/songs.js
// Songs engine + screens (renderSongs + renderSong)

export function createSongsUI(SONGS, { withCb, safeYoutubeEmbed, View }) {
  let SONG_TICKER = null;
  const FORCE_UNLOCK_FOR_TESTING = true;

  /* ===============================
     YouTube IFrame API
  =============================== */

  let YT_API_PROMISE = null;
  let YT_PLAYER = null;
  let YT_PLAYER_KEY = null;

  function ensureYoutubeApiLoaded() {
    if (YT_API_PROMISE) return YT_API_PROMISE;

    YT_API_PROMISE = new Promise(resolve => {
      if (window.YT && window.YT.Player) return resolve(true);

      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve(true);
      };
    });

    return YT_API_PROMISE;
  }

  function addJsApiParams(embedUrl) {
    const origin = encodeURIComponent(window.location.origin);
    return embedUrl.includes("?")
      ? `${embedUrl}&enablejsapi=1&origin=${origin}`
      : `${embedUrl}?enablejsapi=1&origin=${origin}`;
  }

  function destroyYoutubePlayer() {
    if (YT_PLAYER?.destroy) YT_PLAYER.destroy();
    YT_PLAYER = null;
    YT_PLAYER_KEY = null;
  }

  function setupYoutubePlayerIfNeeded(ctx, renderHome, key) {
    const iframe = document.getElementById("song-yt-iframe");
    if (!iframe) return destroyYoutubePlayer();
    if (YT_PLAYER && YT_PLAYER_KEY === key) return;

    destroyYoutubePlayer();

    ensureYoutubeApiLoaded().then(() => {
      if (!window.YT?.Player) return;

      YT_PLAYER_KEY = key;
      YT_PLAYER = new window.YT.Player("song-yt-iframe", {
        events: {
          onStateChange: e => {
            if (e.data === 1) startSession(ctx, renderHome);
            if (e.data === 2 || e.data === 0) pauseSession(ctx);
          }
        }
      });
    });
  }

  /* ===============================
     State helpers
  =============================== */

  function ensureSongState(state) {
    state.songs ??= {};
    state.songs.progress ??= {};
    state.songs.requirements ??= {};
    state.songs.session ??= {};
    state.songs.lastSong ??= { songId: "song1", variant: "easy" };
    state.songs.showTrack ??= false;
    state.songs.guidanceOpen ??= false;
    state.songs.completedOverlay ??= false;
  }

  function getSongProgress(state, id) {
    ensureSongState(state);
    return (state.songs.progress[id] ??=
      { easyCompletions: 0, mediumCompletions: 0, hardCompletions: 0 });
  }

  function isVariantUnlocked(state, songId, variant) {
    if (variant === "easy") return true;
    if (FORCE_UNLOCK_FOR_TESTING) return true;
    const p = getSongProgress(state, songId);
    if (variant === "medium") return p.easyCompletions >= 1;
    if (variant === "hard") return p.mediumCompletions >= 1;
    return false;
  }

  /* ===============================
     Session
  =============================== */

  function startSession(ctx, renderHome) {
    const s = ctx.state.songs.session;
    if (s.running) return;

    s.running = true;
    s.startedAt = Date.now();
    SONG_TICKER = setInterval(() => {
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      document.getElementById("song-elapsed").textContent = `${elapsed}s`;
    }, 250);
  }

  function pauseSession(ctx) {
    const s = ctx.state.songs.session;
    if (!s.running) return;
    s.running = false;
    clearInterval(SONG_TICKER);
    SONG_TICKER = null;
  }

  /* ===============================
     Screens
  =============================== */

  function renderSongs(ctx, renderHome) {
    ctx.ensureMirrorDefault();
    const song = SONGS.song1;

    ctx.app.innerHTML = `
      <div class="card">
        <h2>Songs</h2>
        <div class="card" style="background:#171717;">
          <h3>${song.title}</h3>
          <p class="muted">${song.description}</p>
          <div class="row">
            <button id="play-easy">Play Easy</button>
            <button id="play-medium" class="secondary">Play Medium</button>
            <button id="play-hard" class="secondary">Play Hard</button>
          </div>
        </div>
      </div>
    `;

    ["easy","medium","hard"].forEach(v => {
      document.getElementById(`play-${v}`).onclick = () => {
        ctx.state.songs.lastSong = { songId: song.id, variant: v };
        ctx.persist();
        View.set(ctx, "song");
        renderHome(ctx);
      };
    });
  }

  function renderSong(ctx, renderHome) {
    ctx.ensureMirrorDefault();
    const { state, app, C } = ctx;
    ensureSongState(state);

    const { songId, variant } = state.songs.lastSong;
    const song = SONGS[songId];
    const v = song.variants[variant];
    const track = C.backingTracks?.[v.backingTrackId];

    const chordRow = song.chordBlocks.map(b => `
      <div style="flex:1; background:#111; padding:12px; border-radius:12px; text-align:center;">
        <div style="font-size:20px;font-weight:800;">${b.chord}</div>
        <div class="muted" style="margin-top:6px;font-size:14px;">
          ${b.beatsPerBar} beats
        </div>
      </div>
    `).join("");

    const embed = track?.youtubeEmbed
      ? withCb(addJsApiParams(track.youtubeEmbed), `${songId}_${variant}`)
      : null;

    app.innerHTML = `
      <div class="card">
        <h2>${song.title}</h2>
        <p class="muted">${v.subtext}</p>

        <h3>Chord Pattern</h3>
        <div style="display:flex;gap:10px;">${chordRow}</div>

        <h3 style="margin-top:14px;">Backing Track</h3>
        ${
          embed
            ? `<iframe id="song-yt-iframe" src="${embed}" allowfullscreen></iframe>`
            : `<div class="muted">No backing track configured.</div>`
        }

        <div class="row" style="margin-top:14px;">
          <button id="song-start">Start Playing</button>
          <button id="song-stop" class="secondary">Stop</button>
          <span class="pill">Elapsed: <span id="song-elapsed">0s</span></span>
        </div>

        <div style="margin-top:14px;">
          <button class="secondary" id="back-songs">Back</button>
        </div>
      </div>
    `;

    if (embed) {
      setupYoutubePlayerIfNeeded(ctx, renderHome, `${songId}_${variant}`);
    }

    document.getElementById("song-start").onclick = () => {
      YT_PLAYER?.playVideo?.();
    };

    document.getElementById("song-stop").onclick = () => {
      YT_PLAYER?.pauseVideo?.();
      pauseSession(ctx);
    };

    document.getElementById("back-songs").onclick = () => {
      pauseSession(ctx);
      View.set(ctx, "songs");
      renderHome(ctx);
    };
  }

  return { renderSongs, renderSong };
}
