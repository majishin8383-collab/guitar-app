// ui/songs.js
// Songs engine + screens (renderSongs + renderSong)
// Fixes:
// - FORCE unlock actually unlocks songs (not just variants)
// - If no iframeSrc, force showTrack false (prevents "Hide backing track" + "No track loaded")
// - Back button always returns safely (songs -> home escape hatch)

export function createSongsUI(SONGS_SOURCE, { withCb, safeYoutubeEmbed, View }) {
  const FORCE_UNLOCK_FOR_TESTING = true;

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
        if (typeof prev === "function") { try { prev(); } catch (_) {} }
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

  function setupYoutubePlayerIfNeeded(playerKey) {
    const iframe = document.getElementById("song-yt-iframe");
    if (!iframe) { destroyYoutubePlayer(); return; }
    if (YT_PLAYER && YT_PLAYER_KEY === playerKey) return;

    destroyYoutubePlayer();

    ensureYoutubeApiLoaded().then(() => {
      const iframeNow = document.getElementById("song-yt-iframe");
      if (!iframeNow) return;
      if (!window.YT || !window.YT.Player) return;

      YT_PLAYER_KEY = playerKey;
      YT_PLAYER = new window.YT.Player("song-yt-iframe", { events: {} });
    });
  }

  // ---------------- URL normalization ----------------
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

    // last resort: try parsing watch/shorts/youtu.be
    try {
      let s = url.trim();
      if (s.startsWith("//")) s = "https:" + s;
      if (!/^https?:\/\//i.test(s)) {
        if (s.startsWith("www.youtube.com/") || s.startsWith("youtube.com/") || s.startsWith("m.youtube.com/")) s = "https://" + s;
        if (s.startsWith("youtu.be/")) s = "https://" + s;
      }

      const u = new URL(s);
      const host = u.hostname.replace(/^www\./, "");
      let videoId = null;

      if (host === "youtu.be") {
        videoId = u.pathname.replace("/", "").trim();
      } else if (host.includes("youtube.com")) {
        if (u.pathname === "/watch") videoId = u.searchParams.get("v");
        else if (u.pathname.startsWith("/shorts/")) videoId = u.pathname.split("/shorts/")[1] || null;
        else if (u.pathname.startsWith("/embed/")) videoId = u.pathname.split("/embed/")[1] || null;
      }

      if (!videoId) return null;
      videoId = String(videoId).split(/[?&/]/)[0].trim();
      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  }

  // ---------------- State ----------------
  function ensureSongState(state) {
    if (!state.songs || typeof state.songs !== "object") state.songs = {};
    if (!state.songs.lastSong || typeof state.songs.lastSong !== "object") state.songs.lastSong = { songId: null, variant: "easy" };
    if (!("showTrack" in state.songs)) state.songs.showTrack = false;
  }

  // ✅ IMPORTANT: if FORCE unlock is on, songs are unlocked (period).
  function isSongUnlocked(state, song) {
    if (FORCE_UNLOCK_FOR_TESTING) return true;
    if (!song) return false;
    const reqMap = (state.songs && state.songs.requirements && state.songs.requirements[song.id]) || {};
    const reqs = Array.isArray(song.requirements) ? song.requirements : [];
    return reqs.every(r => reqMap[r.id] === true);
  }

  function isVariantUnlocked(state, song, variantId) {
    if (!song) return false;
    if (!isSongUnlocked(state, song)) return false;
    if (variantId === "easy") return true;
    if (FORCE_UNLOCK_FOR_TESTING) return true;
    // real progression later
    return true;
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

  function openSong(ctx, songId, variantId, renderHome) {
    ensureSongState(ctx.state);
    ctx.state.songs.lastSong = { songId, variant: variantId };
    ctx.persist();
    View.set(ctx, "song");
    renderHome(ctx);
  }

  function renderSongs(ctx, renderHome) {
    ensureSongState(ctx.state);

    const { app, state } = ctx;
    const SONGS = getSongs(ctx);

    const list = Object.values(SONGS || {})
      .filter(Boolean)
      .sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));

    app.innerHTML = `
      <div class="card">
        <h2>Songs</h2>
        <p class="muted">Songs are the reward. No pressure, no stats.</p>

        ${
          list.length
            ? list.map(song => {
                const unlocked = isSongUnlocked(state, song);
                const easyUnlocked = isVariantUnlocked(state, song, "easy");
                const medUnlocked  = isVariantUnlocked(state, song, "medium");
                const hardUnlocked = isVariantUnlocked(state, song, "hard");

                return `
                  <div class="card" style="background:#171717; margin-top:12px;">
                    <h3 style="margin:0 0 6px 0;">${song.title || song.id}</h3>
                    <div class="muted">${song.description || ""}</div>

                    <div style="height:10px"></div>

                    ${
                      unlocked
                        ? `
                          <div class="row">
                            <button data-play="${song.id}|easy" ${easyUnlocked ? "" : "disabled"}>Play Easy</button>
                            <button data-play="${song.id}|medium" class="secondary" ${medUnlocked ? "" : "disabled"}>Play Medium</button>
                            <button data-play="${song.id}|hard" class="secondary" ${hardUnlocked ? "" : "disabled"}>Play Hard</button>
                          </div>
                        `
                        : `<div class="muted">Locked.</div>`
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

    document.getElementById("back-home").onclick = () => ctx.nav.home();
  }

  function renderSong(ctx, renderHome) {
    ensureSongState(ctx.state);

    const { app, state } = ctx;
    const SONGS = getSongs(ctx);

    const list = Object.values(SONGS || {}).filter(Boolean);
    if (!state.songs.lastSong?.songId && list[0]?.id) {
      state.songs.lastSong = { songId: list[0].id, variant: "easy" };
      ctx.persist();
    }

    const songId = state.songs.lastSong?.songId || null;
    const variantId = state.songs.lastSong?.variant || "easy";
    const song = songId ? SONGS[songId] : null;

    if (!song || !isSongUnlocked(state, song)) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    const variant = song.variants?.[variantId] || song.variants?.easy;
    if (!variant) {
      View.set(ctx, "songs");
      return renderHome(ctx);
    }

    const chordBlocks = Array.isArray(song.chordBlocks) ? song.chordBlocks : [];
    const trackInfo = resolveTrack(ctx, variant);

    const safeBaseEmbed = normalizeToEmbedUrl(trackInfo.rawUrl);
    const apiUrl = safeBaseEmbed ? addJsApiParams(safeBaseEmbed) : null;
    const iframeSrc = apiUrl ? withCb(apiUrl, `song_${songId}_${variantId}`) : null;

    // ✅ If no iframe is possible, never allow showTrack=true
    if (!iframeSrc && state.songs.showTrack) {
      state.songs.showTrack = false;
      ctx.persist();
    }

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
        <div class="muted" style="font-size:13px;">${trackInfo.name || ""}</div>

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
            : `<div class="muted" style="margin-top:10px;">${iframeSrc ? "" : "No backing track loaded for this variant."}</div>`
        }

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-songs">Back</button>
        </div>
      </div>
    `;

    if (state.songs.showTrack && iframeSrc) {
      setupYoutubePlayerIfNeeded(`${songId}__${variantId}__${variant.backingTrackId || "none"}`);
    } else {
      destroyYoutubePlayer();
    }

    document.getElementById("toggle-track").onclick = () => {
      state.songs.showTrack = !state.songs.showTrack;
      ctx.persist();
      renderSong(ctx, renderHome);
    };

    document.getElementById("back-songs").onclick = () => {
      state.songs.showTrack = false;
      ctx.persist();
      destroyYoutubePlayer();
      View.set(ctx, "songs");
      renderHome(ctx);
    };
  }

  return { renderSongs, renderSong };
}
