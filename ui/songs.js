// ui/songs.js
// Songs engine + screens (renderSongs + renderSong)
// Hard fix: always provide a working Back to Home escape.

export function createSongsUI(SONGS_SOURCE, { withCb, safeYoutubeEmbed, View }) {
  let SONG_TICKER = null;
  const FORCE_UNLOCK_FOR_TESTING = true;

  // --- YouTube IFrame API integration ---
  let YT_API_PROMISE = null;
  let YT_PLAYER = null;
  let YT_PLAYER_KEY = null;

  function getSongs(ctx) {
    try {
      if (typeof SONGS_SOURCE === "function") return SONGS_SOURCE(ctx) || {};
      return SONGS_SOURCE || {};
    } catch {
      return {};
    }
  }

  function ensureYoutubeApiLoaded() {
    if (YT_API_PROMISE) return YT_API_PROMISE;

    YT_API_PROMISE = new Promise(resolve => {
      if (window.YT && window.YT.Player) return resolve(true);

      const existing = document.querySelector('script[data-yt-iframe-api="1"]');
      if (!existing) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        s.async = true;
        s.dataset.ytIframeApi = "1";
        document.head.appendChild(s);
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") {
          try { prev(); } catch (_) {}
        }
        resolve(true);
      };
    });

    return YT_API_PROMISE;
  }

  function addJsApiParams(embedUrl) {
    if (!embedUrl || typeof embedUrl !== "string") return embedUrl;
    const origin = encodeURIComponent(window.location.origin);
    const hasQ = embedUrl.includes("?");
    const base = embedUrl + (hasQ ? "&" : "?");
    return `${base}enablejsapi=1&origin=${origin}`;
  }

  function destroyYoutubePlayer() {
    if (YT_PLAYER && typeof YT_PLAYER.destroy === "function") {
      try { YT_PLAYER.destroy(); } catch (_) {}
    }
    YT_PLAYER = null;
    YT_PLAYER_KEY = null;
  }

  function setupYoutubePlayerIfNeeded(ctx, renderHome, playerKey) {
    const iframe = document.getElementById("song-yt-iframe");
    if (!iframe) {
      destroyYoutubePlayer();
      return;
    }

    if (YT_PLAYER && YT_PLAYER_KEY === playerKey) return;

    destroyYoutubePlayer();

    ensureYoutubeApiLoaded().then(() => {
      const iframeNow = document.getElementById("song-yt-iframe");
      if (!iframeNow) return;
      if (!window.YT || !window.YT.Player) return;

      YT_PLAYER_KEY = playerKey;

      YT_PLAYER = new window.YT.Player("song-yt-iframe", {
        events: {
          onStateChange: e => {
            if (!e || typeof e.data !== "number") return;
            if (e.data === 1) startSessionFromExternalPlay(ctx, renderHome);
            if (e.data === 2 || e.data === 0) pauseSession(ctx);
          }
        }
      });

      const st = ctx.state;
      ensureSongState(st);
      if (st.songs.autoStartTrack === true) {
        st.songs.autoStartTrack = false;
        ctx.persist();
        if (YT_PLAYER && typeof YT_PLAYER.playVideo === "function") {
          try { YT_PLAYER.playVideo(); } catch (_) {}
        }
      }
    });
  }

  /* ============================================================
     URL normalization
  ============================================================ */

  function safeEmbedFallback(url) {
    if (!url || typeof url !== "string") return null;
    const ok =
      url.startsWith("https://www.youtube.com/embed/") ||
      url.startsWith("https://youtube.com/embed/") ||
      url.startsWith("https://www.youtube-nocookie.com/embed/");
    return ok ? url : null;
  }

  const safeEmbed = typeof safeYoutubeEmbed === "function" ? safeYoutubeEmbed : safeEmbedFallback;

  function normalizeToEmbedUrl(url) {
    if (!url || typeof url !== "string") return null;

    const alreadySafe = safeEmbedFallback(url);
    if (alreadySafe) return alreadySafe;

    const maybe = safeEmbed(url);
    if (maybe && safeEmbedFallback(maybe)) return maybe;

    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      let videoId = null;

      if (host === "youtu.be") {
        videoId = u.pathname.replace("/", "").trim();
      } else if (host === "youtube.com" || host === "m.youtube.com" || host === "www.youtube.com") {
        if (u.pathname === "/watch") videoId = u.searchParams.get("v");
        else if (u.pathname.startsWith("/embed/")) videoId = u.pathname.split("/embed/")[1] || null;
        else if (u.pathname.startsWith("/shorts/")) videoId = u.pathname.split("/shorts/")[1] || null;
      }

      if (!videoId) return null;

      videoId = String(videoId).split(/[?&/]/)[0].trim();
      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  }

  /* ============================================================
     State
  ============================================================ */

  function ensureSongState(state) {
    if (!state.songs || typeof state.songs !== "object") state.songs = {};
    if (!state.songs.progress || typeof state.songs.progress !== "object") state.songs.progress = {};
    if (!state.songs.requirements || typeof state.songs.requirements !== "object") state.songs.requirements = {};
    if (!state.songs.session || typeof state.songs.session !== "object") state.songs.session = {};

    if (!state.songs.lastSong || typeof state.songs.lastSong !== "object") {
      state.songs.lastSong = { songId: null, variant: "easy" };
    }

    if (!("showTrack" in state.songs)) state.songs.showTrack = false;
    if (!("guidanceOpen" in state.songs)) state.songs.guidanceOpen = false;
    if (!("explainOpen" in state.songs)) state.songs.explainOpen = false;
    if (!("completedOverlay" in state.songs)) state.songs.completedOverlay = false;
    if (!("autoStartTrack" in state.songs)) state.songs.autoStartTrack = false;
    if (!("resumeAfterCore" in state.songs)) state.songs.resumeAfterCore = null;
  }

  function getSongProgress(state, songId) {
    ensureSongState(state);
    if (!songId) return { easyCompletions: 0, mediumCompletions: 0, hardCompletions: 0 };
    if (!state.songs.progress[songId]) {
      state.songs.progress[songId] = { easyCompletions: 0, mediumCompletions: 0, hardCompletions: 0 };
    }
    return state.songs.progress[songId];
  }

  function getSongReqs(state, songId) {
    ensureSongState(state);
    if (!songId) return {};
    if (!state.songs.requirements[songId]) state.songs.requirements[songId] = {};
    return state.songs.requirements[songId];
  }

  function isSongUnlocked(state, song) {
    if (!song) return false;
    const req = getSongReqs(state, song.id);
    const list = Array.isArray(song.requirements) ? song.requirements : [];
    return list.every(r => req[r.id] === true);
  }

  function isVariantUnlocked(state, song, variantId) {
    if (!song) return false;
    if (variantId === "easy") return isSongUnlocked(state, song);
    if (FORCE_UNLOCK_FOR_TESTING) return isSongUnlocked(state, song);

    const p = getSongProgress(state, song.id);
    if (variantId === "medium") return p.easyCompletions >= 1;
    if (variantId === "hard") return p.mediumCompletions >= 1;
    return false;
  }

  /* ============================================================
     Session
  ============================================================ */

  function getActiveSession(state) {
    ensureSongState(state);
    if (!state.songs.session || typeof state.songs.session !== "object") state.songs.session = {};
    return state.songs.session;
  }

  function computeElapsedSec(sess) {
    const acc = typeof sess.accumulatedSec === "number" ? sess.accumulatedSec : 0;
    if (sess.running === true && typeof sess.startedAt === "number" && sess.startedAt > 0) {
      const run = (Date.now() - sess.startedAt) / 1000;
      return Math.max(0, Math.floor(acc + run));
    }
    return Math.max(0, Math.floor(acc));
  }

  function updateSessionUI(sess) {
    const el = document.getElementById("song-elapsed");
    if (el) el.textContent = `${sess.elapsedSec || 0}s`;

    const status = document.getElementById("song-session-status");
    if (status) status.textContent = sess.running === true ? "Session running." : "";

    const startBtn = document.getElementById("song-start");
    const stopBtn = document.getElementById("song-stop");
    if (startBtn) startBtn.disabled = sess.running === true;
    if (stopBtn) stopBtn.disabled = sess.running !== true;
  }

  function stopSongTicker() {
    if (SONG_TICKER) { clearInterval(SONG_TICKER); SONG_TICKER = null; }
  }

  function pauseSession(ctx) {
    const state = ctx.state;
    ensureSongState(state);
    const sess = getActiveSession(state);

    if (sess.running === true) {
      const acc = typeof sess.accumulatedSec === "number" ? sess.accumulatedSec : 0;
      const run = typeof sess.startedAt === "number" && sess.startedAt > 0 ? (Date.now() - sess.startedAt) / 1000 : 0;

      sess.accumulatedSec = acc + Math.max(0, run);
      sess.startedAt = 0;
      sess.running = false;
      sess.elapsedSec = computeElapsedSec(sess);

      state.songs.session = sess;
      ctx.persist();
      updateSessionUI(sess);
    }
  }

  function startSessionFromExternalPlay(ctx, renderHome) {
    const state = ctx.state;
    ensureSongState(state);
    const sess = getActiveSession(state);

    const songId = state.songs.lastSong?.songId || null;
    const variantId = state.songs.lastSong?.variant || "easy";
    if (!songId) return;

    if (sess.songId !== songId || sess.variantId !== variantId) {
      state.songs.session = { running: false, songId, variantId, startedAt: 0, accumulatedSec: 0, elapsedSec: 0, stopCount: 0 };
    }

    const s2 = getActiveSession(state);
    if (s2.running !== true) {
      s2.running = true;
      s2.startedAt = Date.now();
      if (typeof s2.accumulatedSec !== "number") s2.accumulatedSec = 0;
      s2.elapsedSec = computeElapsedSec(s2);
      state.songs.session = s2;

      state.songs.completedOverlay = false;
      ctx.persist();

      updateSessionUI(s2);
      startSongTicker(ctx, renderHome);
    }
  }

  function startSongTicker(ctx, renderHome) {
    stopSongTicker();

    SONG_TICKER = setInterval(() => {
      const state = ctx.state;
      ensureSongState(state);
      const sess = getActiveSession(state);
      if (sess.running !== true) return;

      sess.elapsedSec = computeElapsedSec(sess);
      state.songs.session = sess;
      ctx.persist();
      updateSessionUI(sess);

      const songId = sess.songId || state.songs.lastSong?.songId || null;
      const variantId = sess.variantId || state.songs.lastSong?.variant || "easy";
      if (!songId) return;

      const SONGS = getSongs(ctx);
      const song = SONGS[songId];
      if (!song) return;

      const variant = song.variants?.[variantId] || song.variants?.easy;
      if (!variant) return;

      const target = variant.targetSeconds || 90;
      const stopLimit = typeof variant.stopLimit === "number" ? variant.stopLimit : 1;

      const passesTime = (sess.elapsedSec || 0) >= target;
      const passesStops = (sess.stopCount || 0) <= stopLimit;

      if (passesTime && passesStops) {
        stopSongTicker();
        pauseSession(ctx);

        const prog = getSongProgress(state, songId);
        if (variantId === "easy") prog.easyCompletions += 1;
        if (variantId === "medium") prog.mediumCompletions += 1;
        if (variantId === "hard") prog.hardCompletions += 1;

        state.songs.completedOverlay = true;
        ctx.persist();
        renderSong(ctx, renderHome);
      }
    }, 250);
  }

  /* ============================================================
     Screens
  ============================================================ */

  function openSong(ctx, songId, variantId, renderHome) {
    ensureSongState(ctx.state);
    ctx.state.songs.lastSong = { songId, variant: variantId };
    ctx.persist();
    View.set(ctx, "song");
    renderHome(ctx);
  }

  function renderSongs(ctx, renderHome) {
    ctx.ensureMirrorDefault();

    const { app, state } = ctx;
    ensureSongState(state);

    const SONGS = getSongs(ctx);
    const list = Object.values(SONGS || {}).filter(Boolean).sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));

    app.innerHTML = `
      <div class="card">
        <h2>Songs</h2>
        <p class="muted">Songs are the reward. No pressure, no stats.</p>

        ${
          list.length
            ? list.map(song => {
                const unlocked = isSongUnlocked(state, song);
                const p = getSongProgress(state, song.id);

                const easyUnlocked = isVariantUnlocked(state, song, "easy");
                const medUnlocked = isVariantUnlocked(state, song, "medium");
                const hardUnlocked = isVariantUnlocked(state, song, "hard");

                return `
                  <div class="card" style="background:#171717; margin-top:12px;">
                    <h3 style="margin:0 0 6px 0;">${song.title || song.id}</h3>
                    <div class="muted">${song.description || ""}</div>

                    <div style="height:10px"></div>

                    ${
                      unlocked
                        ? `
                          <div class="muted" style="font-size:13px;">
                            Easy: ${p.easyCompletions} • Medium: ${p.mediumCompletions} • Hard: ${p.hardCompletions}
                          </div>

                          <div style="height:10px"></div>

                          <div class="row">
                            <button data-play="${song.id}|easy" ${easyUnlocked ? "" : "disabled"}>Play Easy</button>
                            <button data-play="${song.id}|medium" class="secondary" ${medUnlocked ? "" : "disabled"}>Play Medium</button>
                            <button data-play="${song.id}|hard" class="secondary" ${hardUnlocked ? "" : "disabled"}>Play Hard</button>
                          </div>
                        `
                        : `
                          <div class="muted" style="margin-top:10px;">Locked. Complete requirements to unlock.</div>
                        `
                    }
                  </div>
                `;
              }).join("")
            : `<div class="muted" style="margin-top:10px;">No songs loaded.</div>`
        }

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-home">Back</button>
        </div>
      </div>
    `;

    app.querySelectorAll("button[data-play]").forEach(btn => {
      btn.onclick = () => {
        const [songId, variantId] = String(btn.getAttribute("data-play") || "").split("|");
        if (!songId || !variantId) return;
        openSong(ctx, songId, variantId, renderHome);
      };
    });

    // ✅ Escape hatch that cannot fail (ignores view state)
    document.getElementById("back-home").onclick = () => ctx.nav.home();
  }

  function resolveTrack(ctx, variant) {
    const btId = variant?.backingTrackId || null;
    const bt = btId && ctx.C?.backingTracks ? ctx.C.backingTracks[btId] : null;

    const rawUrl =
      (bt && (bt.youtubeEmbed || bt.youtubeUrl || bt.url)) ||
      (variant && (variant.youtubeEmbed || variant.youtubeUrl)) ||
      null;

    const name =
      (bt && (bt.name || bt.title)) ||
      (btId ? btId : "Backing track");

    return { rawUrl, name, recommendedBpm: bt?.recommendedBpm, key: bt?.key };
  }

  function renderSong(ctx, renderHome) {
    ctx.ensureMirrorDefault();

    const { app, state } = ctx;
    ensureSongState(state);

    const SONGS = getSongs(ctx);
    const list = Object.values(SONGS || {}).filter(Boolean).sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));

    if (!state.songs.lastSong?.songId && list[0]?.id) {
      state.songs.lastSong = { songId: list[0].id, variant: "easy" };
      ctx.persist();
    }

    const songId = state.songs.lastSong?.songId || null;
    const variantId = state.songs.lastSong?.variant || "easy";

    const song = songId ? SONGS[songId] : null;
    if (!song) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    if (!isSongUnlocked(state, song)) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    const variant = song.variants?.[variantId] || song.variants?.easy;
    if (!variant) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    const chordBlocks =
      Array.isArray(variant.chordBlocks) && variant.chordBlocks.length
        ? variant.chordBlocks
        : Array.isArray(song.chordBlocks)
          ? song.chordBlocks
          : [];

    const trackInfo = resolveTrack(ctx, variant);
    const safeBaseEmbed = normalizeToEmbedUrl(trackInfo.rawUrl);
    const apiUrl = safeBaseEmbed ? addJsApiParams(safeBaseEmbed) : null;
    const iframeSrc = apiUrl ? withCb(apiUrl, `song_${songId}_${variantId}`) : null;

    const sess = getActiveSession(state);
    const isRunning = sess.running === true && sess.songId === songId && sess.variantId === variantId;
    sess.elapsedSec = computeElapsedSec(sess);

    const displayKey = (variant.displayKey && String(variant.displayKey)) || trackInfo.key || "—";
    const displayBpm =
      (typeof variant.displayBpm === "number" ? variant.displayBpm : null) ??
      (typeof trackInfo.recommendedBpm === "number" ? trackInfo.recommendedBpm : null);

    const chordRow = chordBlocks.map(b => `
      <div style="flex:1; min-width:90px; background:#111; border:1px solid #222; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:20px; font-weight:800;">${b.chord}</div>
        <div class="muted" style="margin-top:6px; font-size:14px;">${b.beatsPerBar}</div>
      </div>
    `).join("");

    app.innerHTML = `
      <div class="card">
        <h2>${song.title || song.id}</h2>

        <div class="muted" style="margin-top:6px;">
          Difficulty: <b>${variant.label || variantId}</b> • Style: <b>${song.style || ""}</b>
        </div>
        <div class="muted" style="margin-top:8px;">${variant.subtext || ""}</div>

        <div style="height:14px"></div>

        <h3 style="margin-top:0;">Chord Pattern</h3>
        <div class="muted" style="font-size:13px; margin-bottom:10px;">
          Key: <b>${displayKey}</b>${displayBpm ? ` • ~<b>${displayBpm}</b> bpm` : ""}
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${chordRow}
        </div>

        <div style="height:14px"></div>

        <h3 style="margin-top:0;">Backing Track</h3>
        <div class="muted" style="font-size:13px;">
          ${trackInfo.name || ""}
        </div>

        <div style="height:10px"></div>

        <button id="toggle-track" class="${state.songs.showTrack ? "" : "secondary"}" ${iframeSrc ? "" : "disabled"}>
          ${state.songs.showTrack ? "Hide backing track" : "Start backing track"}
        </button>

        ${
          state.songs.showTrack && iframeSrc
            ? `
              <div style="height:10px"></div>
              <div class="videoWrap">
                <iframe
                  id="song-yt-iframe"
                  src="${iframeSrc}"
                  title="Backing track"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
            `
            : `
              <div class="muted" style="margin-top:10px;">
                ${iframeSrc ? "" : "No backing track loaded for this variant."}
              </div>
            `
        }

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-songs">Back</button>
        </div>
      </div>
    `;

    if (state.songs.showTrack && iframeSrc) {
      const key = `${songId}__${variantId}__${variant.backingTrackId || "none"}`;
      setupYoutubePlayerIfNeeded(ctx, renderHome, key);
    } else {
      destroyYoutubePlayer();
    }

    document.getElementById("toggle-track").onclick = () => {
      state.songs.showTrack = !state.songs.showTrack;
      ctx.persist();
      renderSong(ctx, renderHome);
    };

    // ✅ Always return to songs list, and songs list always has Back to Home
    document.getElementById("back-songs").onclick = () => {
      state.songs.showTrack = false;
      ctx.persist();
      destroyYoutubePlayer();
      View.set(ctx, "songs");
      renderHome(ctx);
    };
  }

  return {
    ensureSongState,
    renderSongs,
    renderSong,
    stopSongTicker: () => stopSongTicker()
  };
}
