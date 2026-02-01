// ui/songs.js
// Songs engine + screens (renderSongs + renderSong)
// Keeps internal ticker + song state logic isolated.

export function createSongsUI(SONGS, { withCb, safeYoutubeEmbed, View }) {
  let SONG_TICKER = null;

  function ensureSongState(state) {
    if (!state.songs || typeof state.songs !== "object") state.songs = {};
    if (!state.songs.progress || typeof state.songs.progress !== "object") state.songs.progress = {};
    if (!state.songs.requirements || typeof state.songs.requirements !== "object") state.songs.requirements = {};
    if (!state.songs.session || typeof state.songs.session !== "object") state.songs.session = {};
    if (!state.songs.lastSong || typeof state.songs.lastSong !== "object") state.songs.lastSong = { songId: "song1", variant: "easy" };
    if (!("showTrack" in state.songs)) state.songs.showTrack = false;
    if (!("guidanceOpen" in state.songs)) state.songs.guidanceOpen = false;
    if (!("explainOpen" in state.songs)) state.songs.explainOpen = false;
    if (!("completedOverlay" in state.songs)) state.songs.completedOverlay = false;
  }

  function getSongProgress(state, songId) {
    ensureSongState(state);
    if (!state.songs.progress[songId]) {
      state.songs.progress[songId] = {
        easyCompletions: 0,
        mediumCompletions: 0,
        hardCompletions: 0
      };
    }
    return state.songs.progress[songId];
  }

  function getSongReqs(state, songId) {
    ensureSongState(state);
    if (!state.songs.requirements[songId]) {
      state.songs.requirements[songId] = {};
    }
    return state.songs.requirements[songId];
  }

  function isSong1Unlocked(state) {
    const song = SONGS.song1;
    const req = getSongReqs(state, song.id);
    return song.requirements.every(r => req[r.id] === true);
  }

  function isVariantUnlocked(state, songId, variantId) {
    const p = getSongProgress(state, songId);
    if (variantId === "easy") return isSong1Unlocked(state);
    if (variantId === "medium") return p.easyCompletions >= 2;
    if (variantId === "hard") return p.mediumCompletions >= 1;
    return false;
  }

  function stopSongTicker() {
    if (SONG_TICKER) {
      clearInterval(SONG_TICKER);
      SONG_TICKER = null;
    }
  }

  function startSongTicker(ctx, renderHome) {
    stopSongTicker();
    SONG_TICKER = setInterval(() => {
      const s = ctx.state;
      ensureSongState(s);
      const sess = s.songs.session;

      if (!sess || sess.running !== true) return;

      const now = Date.now();
      const startedAt = sess.startedAt || now;
      const elapsedSec = Math.max(0, Math.floor((now - startedAt) / 1000));
      sess.elapsedSec = elapsedSec;
      ctx.persist();

      renderSong(ctx, renderHome);
    }, 1000);
  }

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

    const track = C.backingTracks ? C.backingTracks[variant.backingTrackId] : null;
    const safe = track ? safeYoutubeEmbed(track.youtubeEmbed) : null;
    const iframeSrc = safe ? withCb(safe, `song_${songId}_${variantId}`) : null;

    const sess = state.songs.session || {};
    const isRunning = sess.running === true && sess.songId === songId && sess.variantId === variantId;
    const elapsedSec = isRunning ? (sess.elapsedSec || 0) : 0;

    const showCounts = !!variant.showCountMarkers;

    const chordRow = song.chordBlocks
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
          Big blocks. No notation. Just keep going.
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
          state.songs.showTrack && iframeSrc
            ? `
              <div style="height:10px"></div>
              <div class="videoWrap">
                <iframe
                  src="${iframeSrc}"
                  title="Backing track"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div class="muted" style="font-size:12px; margin-top:8px;">
                Use the YouTube controls in the player to play/pause.
              </div>
            `
            : ""
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
        </div>

        ${isRunning ? `<div class="muted" style="margin-top:10px; font-size:13px;">Session running.</div>` : ""}

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
      state.songs.completedOverlay = false;

      state.songs.session = {
        running: true,
        songId,
        variantId,
        startedAt: Date.now(),
        elapsedSec: 0,
        stopCount: 0
      };

      ctx.persist();
      startSongTicker(ctx, renderHome);
      renderSong(ctx, renderHome);
    };

    document.getElementById("song-stop").onclick = () => {
      ensureSongState(state);
      const s = state.songs.session || {};
      if (s.running === true) {
        s.stopCount = (s.stopCount || 0) + 1;
        s.running = false;
        state.songs.session = s;
        ctx.persist();
      }
      stopSongTicker();
      renderSong(ctx, renderHome);
    };

    // Completion check
    if (isRunning) {
      const target = variant.targetSeconds || 90;
      const stopLimit = typeof variant.stopLimit === "number" ? variant.stopLimit : 1;

      const passesTime = elapsedSec >= target;
      const passesStops = (sess.stopCount || 0) <= stopLimit;

      if (passesTime && passesStops) {
        stopSongTicker();
        sess.running = false;
        state.songs.session = sess;

        const prog = getSongProgress(state, songId);
        if (variantId === "easy") prog.easyCompletions += 1;
        if (variantId === "medium") prog.mediumCompletions += 1;
        if (variantId === "hard") prog.hardCompletions += 1;

        state.songs.completedOverlay = true;
        ctx.persist();
        renderSong(ctx, renderHome);
        return;
      }
    }

    const playAgainBtn = document.getElementById("song-play-again");
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        ensureSongState(state);
        state.songs.completedOverlay = false;
        state.songs.session = { running: false, songId, variantId, startedAt: 0, elapsedSec: 0, stopCount: 0 };
        ctx.persist();
        renderSong(ctx, renderHome);
      };
    }

    const nextStepBtn = document.getElementById("song-next-step");
    if (nextStepBtn) {
      nextStepBtn.onclick = () => {
        ensureSongState(state);
        state.songs.completedOverlay = false;
        ctx.persist();
        View.set(ctx, "core");
        renderHome(ctx);
      };
    }

    document.getElementById("back-songs").onclick = () => {
      stopSongTicker();
      if (state.songs.session) state.songs.session.running = false;
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
