// ui/songs.js
// Songs engine + screens (renderSongs + renderSong)
// FIXES:
// 1) Variant-specific chord display via variant.chordBlocks (fallback song.chordBlocks)
// 2) Variant-specific display key/bpm via variant.displayKey/displayBpm (fallback track data)
// 3) Start Playing can start the YouTube player deterministically (YT IFrame API)
// 4) Medium + Hard forced unlocked for testing (toggle FORCE_UNLOCK_FOR_TESTING)
// 5) Start Playing auto-enables the track embed (no “nothing happens” if track is hidden)
// 6) Robust YouTube URL normalization so Easy/Medium behave exactly like Hard
// 7) Next Step is now FULL progression:
//    - easy → medium → hard
//    - hard → next core skills (if any) else next song (if configured) else songs list
// 8) Stores a "resume target" so Core can send the user back to the next song later
//
// PATCH (today):
// - Default showTrack = true (restore “backing track shows up” behavior)
// - Accept multiple track URL fields (youtubeEmbed / youtube / embed / url / href)
// - Don’t show “No backing track…” when embed is simply hidden

export function createSongsUI(SONGS, { withCb, safeYoutubeEmbed, View }) {
  let SONG_TICKER = null;

  // ✅ Toggle for your current testing session
  const FORCE_UNLOCK_FOR_TESTING = true;

  // --- YouTube IFrame API integration ---
  let YT_API_PROMISE = null;
  let YT_PLAYER = null;
  let YT_PLAYER_KEY = null;

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

            // 1 = playing, 2 = paused, 0 = ended
            if (e.data === 1) {
              startSessionFromExternalPlay(ctx, renderHome);
            } else if (e.data === 2 || e.data === 0) {
              pauseSession(ctx);
            }
          }
        }
      });

      // ✅ If Start Playing requested autostart, kick playback now that player exists
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
     URL Safety + Normalization
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
        if (u.pathname === "/watch") {
          videoId = u.searchParams.get("v");
        } else if (u.pathname.startsWith("/embed/")) {
          videoId = u.pathname.split("/embed/")[1] || null;
        } else if (u.pathname.startsWith("/shorts/")) {
          videoId = u.pathname.split("/shorts/")[1] || null;
        }
      }

      if (!videoId) return null;

      videoId = String(videoId).split(/[?&/]/)[0].trim();
      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;
    } catch (_) {
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
    if (!state.songs.lastSong || typeof state.songs.lastSong !== "object")
      state.songs.lastSong = { songId: "song1", variant: "easy" };

    // ✅ restore “backing track shows” by default
    if (!("showTrack" in state.songs)) state.songs.showTrack = true;

    if (!("guidanceOpen" in state.songs)) state.songs.guidanceOpen = false;
    if (!("explainOpen" in state.songs)) state.songs.explainOpen = false;
    if (!("completedOverlay" in state.songs)) state.songs.completedOverlay = false;

    // internal flag: Start Playing can request track+autoplay
    if (!("autoStartTrack" in state.songs)) state.songs.autoStartTrack = false;

    // ✅ progression support: if Core needs to send user back into Songs
    if (!("resumeAfterCore" in state.songs)) state.songs.resumeAfterCore = null;
  }

  function getSongProgress(state, songId) {
    ensureSongState(state);
    if (!state.songs.progress[songId]) {
      state.songs.progress[songId] = { easyCompletions: 0, mediumCompletions: 0, hardCompletions: 0 };
    }
    return state.songs.progress[songId];
  }

  function getSongReqs(state, songId) {
    ensureSongState(state);
    if (!state.songs.requirements[songId]) state.songs.requirements[songId] = {};
    return state.songs.requirements[songId];
  }

  function isSong1Unlocked(state) {
    const song = SONGS.song1;
    const req = getSongReqs(state, song.id);
    return song.requirements.every(r => req[r.id] === true);
  }

  function isVariantUnlocked(state, songId, variantId) {
    if (variantId === "easy") return isSong1Unlocked(state);

    if (FORCE_UNLOCK_FOR_TESTING) return isSong1Unlocked(state);

    const p = getSongProgress(state, songId);
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
      const now = Date.now();
      const run = (now - sess.startedAt) / 1000;
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
    if (SONG_TICKER) {
      clearInterval(SONG_TICKER);
      SONG_TICKER = null;
    }
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

    const songId = state.songs.lastSong?.songId || "song1";
    const variantId = state.songs.lastSong?.variant || "easy";

    if (sess.songId !== songId || sess.variantId !== variantId) {
      state.songs.session = {
        running: false,
        songId,
        variantId,
        startedAt: 0,
        accumulatedSec: 0,
        elapsedSec: 0,
        stopCount: 0
      };
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

      const songId = sess.songId || state.songs.lastSong?.songId || "song1";
      const variantId = sess.variantId || state.songs.lastSong?.variant || "easy";

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
     Progression (data-driven for all songs)
  ============================================================ */

  function getNextVariantId(currentVariantId) {
    if (currentVariantId === "easy") return "medium";
    if (currentVariantId === "medium") return "hard";
    return null;
  }

  function goToSongsList(ctx, renderHome) {
    View.set(ctx, "songs");
    renderHome(ctx);
  }

  function handlePostHardProgression(ctx, renderHome, songIdJustCompleted) {
    const state = ctx.state;
    ensureSongState(state);

    const song = SONGS[songIdJustCompleted];
    if (!song) return goToSongsList(ctx, renderHome);

    const nextSongId = song.nextSongId || null;
    const nextCoreIds = Array.isArray(song.nextCoreIds) ? song.nextCoreIds.filter(Boolean) : [];
    const nextCoreView = song.nextCoreView || "core";

    if (nextCoreIds.length) {
      state.songs.resumeAfterCore = {
        songId: nextSongId || null,
        variant: "easy",
        coreIds: nextCoreIds.slice(0)
      };
      ctx.persist();

      View.set(ctx, nextCoreView);
      renderHome(ctx);
      return;
    }

    if (nextSongId && SONGS[nextSongId]) {
      state.songs.lastSong = { songId: nextSongId, variant: "easy" };
      ctx.persist();
      View.set(ctx, "song");
      renderHome(ctx);
      return;
    }

    goToSongsList(ctx, renderHome);
  }

  /* ============================================================
     Nav
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

    const song = SONGS.song1;
    const unlocked = isSong1Unlocked(state);

    const p = getSongProgress(state, song.id);
    const easyUnlocked = isVariantUnlocked(state, song.id, "easy");
    const mediumUnlocked = isVariantUnlocked(state, song.id, "medium");
    const hardUnlocked = isVariantUnlocked(state, song.id, "hard");

    app.innerHTML = `
      <div class="card">
        <h2>Songs</h2>
        <p class="muted">Songs are the reward. No pressure, no stats.</p>

        <div class="card" style="background:#171717;">
          <h3 style="margin:0 0 6px 0;">${song.title}</h3>
          <div class="muted">${song.description}</div>

          <div style="height:10px"></div>

          ${
            unlocked
              ? `
                <div class="kpi" style="margin-top:6px;">Unlocked</div>
                <div class="muted" style="margin-top:8px; font-size:13px;">
                  Easy completions: ${p.easyCompletions} • Medium completions: ${p.mediumCompletions} • Hard completions: ${p.hardCompletions}
                </div>

                <div style="height:10px"></div>

                <div class="row">
                  <button id="play-easy" ${easyUnlocked ? "" : "disabled"}>Play Easy</button>
                  <button id="play-medium" class="secondary" ${mediumUnlocked ? "" : "disabled"}>Play Medium</button>
                  <button id="play-hard" class="secondary" ${hardUnlocked ? "" : "disabled"}>Play Hard</button>
                </div>

                <div style="height:10px"></div>
                <button id="song-explain" class="secondary">What am I practicing?</button>
              `
              : `
                <div class="muted" style="margin-top:10px;">
                  Locked. Complete the three core requirements to unlock.
                </div>
                <div style="height:10px"></div>
                <button id="song-explain">What am I practicing?</button>
              `
          }
        </div>

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-home">Back</button>
        </div>
      </div>
    `;

    const explainBtn = document.getElementById("song-explain");
    if (explainBtn) {
      explainBtn.onclick = () => {
        ensureSongState(state);
        state.songs.explainOpen = !state.songs.explainOpen;
        ctx.persist();
        renderSongs(ctx, renderHome);
      };
    }

    if (unlocked) {
      const be = document.getElementById("play-easy");
      const bm = document.getElementById("play-medium");
      const bh = document.getElementById("play-hard");

      if (be) be.onclick = () => openSong(ctx, song.id, "easy", renderHome);
      if (bm) bm.onclick = () => openSong(ctx, song.id, "medium", renderHome);
      if (bh) bh.onclick = () => openSong(ctx, song.id, "hard", renderHome);
    }

    const explainOpen = !!state.songs.explainOpen;
    if (explainOpen) {
      const req = getSongReqs(state, song.id);

      const reqHtml = song.requirements
        .map(r => {
          const done = req[r.id] === true;
          return `
            <div class="card" style="background:#111; border:1px solid #222; margin-top:10px;">
              <div style="font-weight:700;">${r.title}</div>
              <div class="muted" style="margin-top:6px;">${r.subtitle}</div>
              <div class="muted" style="margin-top:8px; font-size:13px;">${r.passText}</div>
              <div style="height:10px"></div>
              <button data-req="${r.id}" class="${done ? "" : "secondary"}">
                ${done ? "Marked complete" : "Mark complete"}
              </button>
            </div>
          `;
        })
        .join("");

      app.querySelector(".card .card").insertAdjacentHTML(
        "beforeend",
        `
          <div style="height:10px"></div>
          <div class="card" style="background:#111; border:1px solid #222;">
            <h3 style="margin-top:0;">Unlock requirements</h3>
            <div class="muted" style="font-size:13px;">
              This is a temporary, simple unlock method so you can use Song Mode today.
              Later we will auto-detect completion from drill sessions.
            </div>
            ${reqHtml}
          </div>
        `
      );

      app.querySelectorAll("button[data-req]").forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-req");
          const r = getSongReqs(state, song.id);
          r[id] = true;
          ctx.persist();
          renderSongs(ctx, renderHome);
        };
      });
    }

    document.getElementById("back-home").onclick = () => {
      View.set(ctx, "home");
      renderHome(ctx);
    };
  }

  function renderSong(ctx, renderHome) {
    ctx.ensureMirrorDefault();

    const { app, C, state } = ctx;
    ensureSongState(state);

    const songId = state.songs.lastSong?.songId || "song1";
    const variantId = state.songs.lastSong?.variant || "easy";

    const song = SONGS[songId];
    if (!song) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    if (variantId !== "easy" && !isVariantUnlocked(state, songId, variantId)) {
      state.songs.lastSong.variant = "easy";
      ctx.persist();
    }

    if (!isSong1Unlocked(state)) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    const variant = song.variants[variantId] || song.variants.easy;

    const chordBlocks =
      Array.isArray(variant.chordBlocks) && variant.chordBlocks.length
        ? variant.chordBlocks
        : Array.isArray(song.chordBlocks)
          ? song.chordBlocks
          : [];

    const track = C.backingTracks ? C.backingTracks[variant.backingTrackId] : null;

    // ✅ Accept multiple possible field names (restores older backingTracks shape)
    const rawUrl = track
      ? (track.youtubeEmbed || track.youtube || track.embed || track.url || track.href || null)
      : null;

    const safeBaseEmbed = normalizeToEmbedUrl(rawUrl);
    const apiUrl = safeBaseEmbed ? addJsApiParams(safeBaseEmbed) : null;
    const iframeSrc = apiUrl ? withCb(apiUrl, `song_${songId}_${variantId}`) : null;

    const sess = getActiveSession(state);
    const isRunning = sess.running === true && sess.songId === songId && sess.variantId === variantId;
    sess.elapsedSec = computeElapsedSec(sess);

    const showCounts = !!variant.showCountMarkers;

    const displayKey = (variant.displayKey && String(variant.displayKey)) || (track && track.key) || "—";
    const displayBpm =
      (typeof variant.displayBpm === "number" ? variant.displayBpm : null) ??
      (track && typeof track.recommendedBpm === "number" ? track.recommendedBpm : null);

    const chordRow = chordBlocks
      .map(b => {
        return `
          <div style="flex:1; min-width:90px; background:#111; border:1px solid #222; border-radius:12px; padding:12px; text-align:center;">
            <div style="font-size:20px; font-weight:800;">${b.chord}</div>
            <div class="muted" style="margin-top:6px; font-size:14px;">${b.beatsPerBar}</div>
            ${showCounts ? `<div class="muted" style="margin-top:8px; font-size:12px;">1 2 3 4</div>` : ""}
          </div>
        `;
      })
      .join("");

    const guidanceOpen = !!state.songs.guidanceOpen;

    const completedOverlay = !!state.songs.completedOverlay;
    const overlayHtml = completedOverlay
      ? `
        <div class="card" style="background:#0b0b0b; border:1px solid #2a2a2a; margin-top:14px;">
          <h3 style="margin-top:0;">${variant.completionTitle}</h3>
          <div class="muted" style="white-space:pre-line;">${variant.completionBody}</div>

          <div style="height:12px"></div>

          <div class="row">
            <button id="song-play-again">Play Again</button>
            <button id="song-next-step" class="secondary">Next Step</button>
          </div>
        </div>
      `
      : "";

    app.innerHTML = `
      <div class="card">
        <h2>${song.title}</h2>

        <div class="muted" style="margin-top:6px;">
          Difficulty: <b>${variant.label}</b> • Style: <b>${song.style}</b>
        </div>
        <div class="muted" style="margin-top:8px;">${variant.subtext}</div>

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
          ${track ? `${track.name}${track.recommendedBpm ? ` • ~${track.recommendedBpm} bpm` : ""}` : "No track configured."}
        </div>

        <div style="height:10px"></div>

        <button id="toggle-track" class="${state.songs.showTrack ? "" : "secondary"}">
          ${state.songs.showTrack ? "Hide backing track" : "Start backing track"}
        </button>

        ${
          iframeSrc
            ? (
              state.songs.showTrack
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
                  <div class="muted" style="font-size:12px; margin-top:8px;">
                    Tip: press Play in the player to start the timer automatically.
                  </div>
                `
                : `
                  <div class="muted" style="margin-top:10px;">
                    Backing track ready. Tap <b>Start backing track</b>.
                  </div>
                `
            )
            : `
              <div class="muted" style="margin-top:10px;">
                No backing track configured for this variant yet.
              </div>
            `
        }

        <div style="height:14px"></div>

        <h3 style="margin-top:0;">Metronome</h3>
        <div class="muted" style="font-size:13px;">Optional. Default is OFF. Backing track is the timekeeper.</div>

        <div style="height:10px"></div>

        <button id="song-metro" class="secondary">
          ${ctx.metro.isRunning() ? "Stop metronome" : "Start metronome"}
        </button>

        <div style="height:14px"></div>

        <h3 style="margin-top:0;">Play Mode</h3>
        <div class="muted" style="font-size:13px;">
          Start playing. Keep going. No scoring.
        </div>

        <div style="height:10px"></div>

        <div class="row">
          <button id="song-start" ${isRunning ? "disabled" : ""}>Start Playing</button>
          <button id="song-stop" class="secondary" ${isRunning ? "" : "disabled"}>Stop</button>
          <span class="pill">Elapsed: <span id="song-elapsed">${sess.elapsedSec || 0}s</span></span>
        </div>

        <div id="song-session-status" class="muted" style="margin-top:10px; font-size:13px;">
          ${isRunning ? "Session running." : ""}
        </div>

        <div style="height:14px"></div>

        <button id="toggle-guidance" class="secondary">
          ${guidanceOpen ? "Hide guidance" : "How to play this song"}
        </button>

        ${
          guidanceOpen
            ? `
              <div class="card" style="background:#171717; margin-top:10px;">
                <div style="opacity:.95">• Strum steadily. Don’t stop.</div>
                <div style="opacity:.95">• Switch chords every 4 counts.</div>
                <div style="opacity:.95">• If you lose the chord, keep strumming muted strings.</div>
                <div style="opacity:.95">• This is about time, not correctness.</div>
              </div>
            `
            : ""
        }

        ${overlayHtml}

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

    document.getElementById("toggle-guidance").onclick = () => {
      state.songs.guidanceOpen = !state.songs.guidanceOpen;
      ctx.persist();
      renderSong(ctx, renderHome);
    };

    document.getElementById("song-metro").onclick = () => {
      if (ctx.metro.isRunning()) {
        ctx.metro.stop();
        renderSong(ctx, renderHome);
        return;
      }
      const fallback = variantId === "easy" ? 80 : variantId === "medium" ? 95 : 100;
      const bpm = track && track.recommendedBpm ? track.recommendedBpm : fallback;
      ctx.metro.start(bpm);
      renderSong(ctx, renderHome);
    };

    document.getElementById("song-start").onclick = () => {
      ensureSongState(state);

      const sess0 = getActiveSession(state);
      if (sess0.songId !== songId || sess0.variantId !== variantId) {
        state.songs.session = {
          running: false,
          songId,
          variantId,
          startedAt: 0,
          accumulatedSec: 0,
          elapsedSec: 0,
          stopCount: 0
        };
      }

      state.songs.completedOverlay = false;

      if (!state.songs.showTrack && iframeSrc) {
        state.songs.showTrack = true;
        state.songs.autoStartTrack = true;
        ctx.persist();
        renderSong(ctx, renderHome);
        return;
      }

      if (YT_PLAYER && typeof YT_PLAYER.playVideo === "function") {
        try { YT_PLAYER.playVideo(); } catch (_) {}
      }
    };

    document.getElementById("song-stop").onclick = () => {
      ensureSongState(state);

      const s2 = getActiveSession(state);
      if (s2.running === true) {
        s2.stopCount = (s2.stopCount || 0) + 1;
        state.songs.session = s2;
        ctx.persist();
      }

      pauseSession(ctx);
      stopSongTicker();

      if (YT_PLAYER && typeof YT_PLAYER.pauseVideo === "function") {
        try { YT_PLAYER.pauseVideo(); } catch (_) {}
      }
    };

    const playAgainBtn = document.getElementById("song-play-again");
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        ensureSongState(state);
        state.songs.completedOverlay = false;
        state.songs.session = {
          running: false,
          songId,
          variantId,
          startedAt: 0,
          accumulatedSec: 0,
          elapsedSec: 0,
          stopCount: 0
        };
        ctx.persist();
        stopSongTicker();
        renderSong(ctx, renderHome);
      };
    }

    const nextStepBtn = document.getElementById("song-next-step");
    if (nextStepBtn) {
      nextStepBtn.onclick = () => {
        ensureSongState(state);
        state.songs.completedOverlay = false;

        // Always end playback cleanly before navigating
        pauseSession(ctx);
        stopSongTicker();
        if (YT_PLAYER && typeof YT_PLAYER.pauseVideo === "function") {
          try { YT_PLAYER.pauseVideo(); } catch (_) {}
        }

        // ✅ 1) Progress within song: easy → medium → hard
        const nextVariant = getNextVariantId(variantId);
        if (nextVariant && isVariantUnlocked(state, songId, nextVariant)) {
          state.songs.lastSong = { songId, variant: nextVariant };
          ctx.persist();
          View.set(ctx, "song");
          renderHome(ctx);
          return;
        }

        // ✅ 2) If hard completed (or no next variant), progress to core/next song
        handlePostHardProgression(ctx, renderHome, songId);
      };
    }

    document.getElementById("back-songs").onclick = () => {
      pauseSession(ctx);
      stopSongTicker();
      ctx.persist();
      View.set(ctx, "songs");
      renderHome(ctx);
    };
  }

  return {
    ensureSongState,
    renderSongs,
    renderSong,
    stopSongTicker
  };
}
