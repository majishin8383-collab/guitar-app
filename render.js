// render.js
// UI rendering + event wiring
// Guarded: Role UI only appears if ctx provides role APIs.
// Backing tracks: YouTube embed ONLY. Dropdown controls what displays (no Stop/Play buttons).

import { shouldShowLevelUp } from "./progress.js";
import { SONGS } from "./songs.js";

import { getView, setView } from "./state/viewState.js";
import { withCb, safeYoutubeEmbed } from "./ui/video.js";
import { backingUI, wireBackingDropdown, filterTracksByRole } from "./ui/backing.js";

/* ============================================================
   SECTION 0 — Small shared guards
============================================================ */

function hasRole(ctx) {
  return typeof ctx.roleLabel === "function" && ctx.state && typeof ctx.state.role === "string";
}

function rolePill(ctx) {
  if (!hasRole(ctx)) return "";
  return `<span class="pill">Role: ${ctx.roleLabel()}</span>`;
}

/* ============================================================
   SECTION 4 — Core Learning aggregation
============================================================ */

const Core = {
  getCoreSkills(C) {
    const all = Object.values(C.skills || {});
    return all
      .filter(s => s && s.levelBand === "beginner" && Array.isArray(s.drills) && s.drills.length)
      .sort((a, b) => {
        const ga = String(a.genre || "");
        const gb = String(b.genre || "");
        if (ga !== gb) return ga.localeCompare(gb);
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  },

  render(ctx) {
    ctx.ensureMirrorDefault();

    const { app, C, state } = ctx;
    const coreSkills = Core.getCoreSkills(C);

    app.innerHTML = `
      <div class="card">
        <h2>Core Learning</h2>
        <p class="muted">
          This is the beginner path (all genres share the same fundamentals).
        </p>

        <div class="row" style="margin:10px 0;">
          <span class="pill">Hand: ${ctx.handednessLabel()}</span>
          <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
          ${rolePill(ctx)}
        </div>

        <div class="card" style="background:#171717;">
          <h3 style="margin-top:0;">Start Here</h3>
          <div class="muted" style="font-size:14px;">
            Pick any skill below. Later we can reorder these into your locked core list.
          </div>
        </div>

        <div style="height:10px"></div>

        <div id="core-skill-list"></div>

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-home">Back</button>
          <button id="go-practice">Go to Practice</button>
        </div>
      </div>
    `;

    const list = document.getElementById("core-skill-list");
    list.innerHTML = coreSkills.length
      ? coreSkills
          .map(s => {
            return `
              <div class="card" style="background:#171717;">
                <h4 style="margin:0 0 6px 0;">${s.name}</h4>
                <div class="muted" style="margin-bottom:10px;">${s.summary}</div>
                <div class="muted" style="font-size:14px;">
                  Source: ${s.genre} • Drills: ${s.drills.length} • Level: ${s.levelBand}
                </div>
                <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
              </div>
            `;
          })
          .join("")
      : `<div class="muted">No core skills found yet.</div>`;

    list.querySelectorAll("button[data-skill]").forEach(btn => {
      btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => Core.render(ctx) });
    });

    document.getElementById("back-home").onclick = () => {
      setView(ctx, "home");
      renderHome(ctx);
    };
    document.getElementById("go-practice").onclick = () => ctx.nav.practice();
  }
};

/* ============================================================
   SECTION 5 — Settings screen
============================================================ */

function renderSettings(ctx) {
  ctx.ensureMirrorDefault();

  const { app, state } = ctx;

  const roleCard = hasRole(ctx)
    ? `
      <div class="card" style="background:#171717;">
        <h3 style="margin-top:0;">Your Focus</h3>
        <p class="muted">Pick what you're practicing most right now.</p>
        <div class="row">
          <button id="role-rhythm">Rhythm</button>
          <button id="role-lead">Lead</button>
          ${rolePill(ctx)}
        </div>
      </div>
    `
    : "";

  app.innerHTML = `
    <div class="card">
      <h2>Settings</h2>
      <p class="muted">These apply across the whole app.</p>

      ${roleCard}

      <div class="card" style="background:#171717; margin-top:10px;">
        <h3 style="margin-top:0;">Playing Hand</h3>
        <p class="muted">All instructions use <b>fretting hand</b> + <b>picking hand</b>.</p>
        <div class="row">
          <button id="hand-right">Right-handed</button>
          <button id="hand-left">Left-handed</button>
          <span class="pill">Current: ${ctx.handednessLabel()}</span>
        </div>
      </div>

      <div class="card" style="background:#171717; margin-top:10px;">
        <h3 style="margin-top:0;">Video Orientation</h3>
        <p class="muted">Mirroring is a viewing preference only.</p>
        <div class="row">
          <button id="toggle-mirror" class="${state.mirrorVideos ? "" : "secondary"}">
            ${state.mirrorVideos ? "Mirroring: ON" : "Mirroring: OFF"}
          </button>
          <span class="pill">Applies to drill videos</span>
        </div>
      </div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
      </div>
    </div>
  `;

  if (hasRole(ctx)) {
    const rr = document.getElementById("role-rhythm");
    const rl = document.getElementById("role-lead");

    if (state.role === "lead") {
      rl.classList.remove("secondary");
      rr.classList.add("secondary");
    } else {
      rr.classList.remove("secondary");
      rl.classList.add("secondary");
    }

    rr.onclick = () => {
      state.role = "rhythm";
      ctx.persist();
      renderSettings(ctx);
    };
    rl.onclick = () => {
      state.role = "lead";
      ctx.persist();
      renderSettings(ctx);
    };
  }

  const rightBtn = document.getElementById("hand-right");
  const leftBtn = document.getElementById("hand-left");

  if (state.handedness === "right") {
    rightBtn.classList.remove("secondary");
    leftBtn.classList.add("secondary");
  } else {
    rightBtn.classList.add("secondary");
    leftBtn.classList.remove("secondary");
  }

  rightBtn.onclick = () => {
    state.handedness = "right";
    ctx.persist();
    renderSettings(ctx);
  };

  leftBtn.onclick = () => {
    state.handedness = "left";
    if (!state.mirrorVideos) state.mirrorVideos = true;
    ctx.persist();
    renderSettings(ctx);
  };

  document.getElementById("toggle-mirror").onclick = () => {
    state.mirrorVideos = !state.mirrorVideos;
    ctx.persist();
    renderSettings(ctx);
  };

  document.getElementById("back-home").onclick = () => {
    setView(ctx, "home");
    renderHome(ctx);
  };
}

/* ============================================================
   SECTION 6 — Songs engine + screens
============================================================ */

const Songs = (function () {
  let SONG_TICKER = null;

  function ensureSongState(state) {
    if (!state.songs || typeof state.songs !== "object") state.songs = {};
    if (!state.songs.progress || typeof state.songs.progress !== "object") state.songs.progress = {};
    if (!state.songs.requirements || typeof state.songs.requirements !== "object") state.songs.requirements = {};
    if (!state.songs.session || typeof state.songs.session !== "object") state.songs.session = {};
    if (!state.songs.lastSong || typeof state.songs.lastSong !== "object")
      state.songs.lastSong = { songId: "song1", variant: "easy" };
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

  function startSongTicker(ctx) {
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

      renderSong(ctx);
    }, 1000);
  }

  function openSong(ctx, songId, variantId) {
    ensureSongState(ctx.state);
    ctx.state.songs.lastSong = { songId, variant: variantId };
    ctx.persist();
    setView(ctx, "song");
    renderHome(ctx);
  }

  function renderSongs(ctx) {
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
        renderSongs(ctx);
      };
    }

    if (unlocked) {
      const be = document.getElementById("play-easy");
      const bm = document.getElementById("play-medium");
      const bh = document.getElementById("play-hard");

      if (be) be.onclick = () => openSong(ctx, song.id, "easy");
      if (bm) bm.onclick = () => openSong(ctx, song.id, "medium");
      if (bh) bh.onclick = () => openSong(ctx, song.id, "hard");
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
          renderSongs(ctx);
        };
      });
    }

    document.getElementById("back-home").onclick = () => {
      setView(ctx, "home");
      renderHome(ctx);
    };
  }

  function renderSong(ctx) {
    ctx.ensureMirrorDefault();

    const { app, C, state } = ctx;
    ensureSongState(state);

    const songId = state.songs.lastSong?.songId || "song1";
    const variantId = state.songs.lastSong?.variant || "easy";

    const song = SONGS[songId];
    if (!song) {
      setView(ctx, "songs");
      return renderHome(ctx);
    }

    if (variantId !== "easy" && !isVariantUnlocked(state, songId, variantId)) {
      state.songs.lastSong.variant = "easy";
      ctx.persist();
    }

    if (!isSong1Unlocked(state)) {
      setView(ctx, "songs");
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
      renderSong(ctx);
    };

    document.getElementById("toggle-guidance").onclick = () => {
      state.songs.guidanceOpen = !state.songs.guidanceOpen;
      ctx.persist();
      renderSong(ctx);
    };

    document.getElementById("song-metro").onclick = () => {
      if (ctx.metro.isRunning()) {
        ctx.metro.stop();
        renderSong(ctx);
        return;
      }
      const fallback = variantId === "easy" ? 80 : variantId === "medium" ? 95 : 100;
      const bpm = track && track.recommendedBpm ? track.recommendedBpm : fallback;
      ctx.metro.start(bpm);
      renderSong(ctx);
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
      startSongTicker(ctx);
      renderSong(ctx);
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
      renderSong(ctx);
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
        renderSong(ctx);
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
        renderSong(ctx);
      };
    }

    const nextStepBtn = document.getElementById("song-next-step");
    if (nextStepBtn) {
      nextStepBtn.onclick = () => {
        ensureSongState(state);
        state.songs.completedOverlay = false;
        ctx.persist();
        setView(ctx, "core");
        renderHome(ctx);
      };
    }

    document.getElementById("back-songs").onclick = () => {
      stopSongTicker();
      if (state.songs.session) state.songs.session.running = false;
      ctx.persist();
      setView(ctx, "songs");
      renderHome(ctx);
    };
  }

  return {
    ensureSongState,
    renderSongs,
    renderSong
  };
})();

/* ============================================================
   SECTION 7 — Screens (Home / Genre / Practice / Skill)
============================================================ */

export function renderHome(ctx) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;

  const view = getView(state);
  if (view === "settings") return renderSettings(ctx);
  if (view === "core") return Core.render(ctx);
  if (view === "songs") return Songs.renderSongs(ctx);
  if (view === "song") return Songs.renderSong(ctx);

  const genres = Object.values(C.genres || {});
  const activeGenre = C.genres ? C.genres[state.genre] : null;

  const roleLine = hasRole(ctx)
    ? `<div class="muted" style="margin-top:8px;">Focus: <b>${ctx.roleLabel()}</b></div>`
    : "";

  const genreOptions = genres
    .map(g => {
      const sel = g.id === state.genre ? "selected" : "";
      return `<option value="${g.id}" ${sel}>${g.name}</option>`;
    })
    .join("");

  const activeDesc = activeGenre?.description
    ? activeGenre.description
    : "Select a genre to access backing tracks and genre-specific material.";

  app.innerHTML = `
    <div class="card">
      <h2>Home</h2>
      <p class="muted">Core learning first. Genres later for backing tracks, styles, and songs.</p>

      <div class="card" style="background:#171717;">
        <div class="muted" style="font-size:14px;">Genre</div>
        <select id="genre-select" style="width:100%; max-width:560px; margin-top:6px;">
          ${genreOptions}
        </select>
        <div class="muted" style="margin-top:8px;">${activeDesc}</div>
        ${roleLine}
      </div>

      <div style="height:10px"></div>

      <div class="card" style="background:#171717;">
        <div class="row" style="justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700;">Quick Controls</div>
            <div class="muted" style="font-size:13px;">Handedness and video mirroring live in Settings.</div>
          </div>
          <button id="open-settings" class="secondary">Settings</button>
        </div>
      </div>

      <div style="height:10px"></div>

      <div class="card">
        <button id="open-core">Core Learning</button>
        <div style="height:10px"></div>
        <button id="open-songs">Songs</button>
        <div style="height:10px"></div>
        <button id="start-practice" class="secondary">Practice (Genre)</button>
        <div style="height:10px"></div>
        <button id="view-genre" class="secondary">Genre Details</button>
      </div>
    </div>
  `;

  const genreSelect = document.getElementById("genre-select");
  if (genreSelect) {
    genreSelect.onchange = () => {
      state.genre = genreSelect.value;
      ctx.persist();
      renderHome(ctx);
    };
  }

  document.getElementById("open-settings").onclick = () => {
    setView(ctx, "settings");
    renderHome(ctx);
  };

  document.getElementById("open-core").onclick = () => {
    setView(ctx, "core");
    renderHome(ctx);
  };

  document.getElementById("open-songs").onclick = () => {
    setView(ctx, "songs");
    renderHome(ctx);
  };

  document.getElementById("start-practice").onclick = () => ctx.nav.practice();
  document.getElementById("view-genre").onclick = () => ctx.nav.genre(activeGenre?.id || state.genre);
}

export function renderGenre(ctx, genreId) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;
  const genre = C.genres[genreId];
  if (!genre) return renderHome(ctx);

  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const btsAll = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);
  const bts = filterTracksByRole(ctx, btsAll);

  app.innerHTML = `
    <div class="card">
      <h2>${genre.name}</h2>
      <p class="muted">${genre.description}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Hand: ${ctx.handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
        ${rolePill(ctx)}
      </div>

      <div class="card" style="background:#171717;">
        <div class="row" style="justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700;">Core First</div>
            <div class="muted" style="font-size:13px;">Beginner skills live in Core Learning. Genres will hold advanced techniques and songs.</div>
          </div>
          <button id="go-core" class="secondary">Open Core</button>
        </div>
      </div>

      <h3 style="margin-top:16px;">Starter Skills (temporary)</h3>
      <div id="skill-list"></div>

      <h3 style="margin-top:16px;">Backing Tracks</h3>
      <div id="bt-area"></div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
        <button id="go-practice">Go to Practice</button>
      </div>
    </div>
  `;

  document.getElementById("go-core").onclick = () => {
    setView(ctx, "core");
    renderHome(ctx);
  };

  const skillList = document.getElementById("skill-list");
  skillList.innerHTML = skills
    .map(
      s => `
      <div class="card" style="background:#171717;">
        <h4 style="margin:0 0 6px 0;">${s.name}</h4>
        <div class="muted" style="margin-bottom:10px;">${s.summary}</div>
        <div class="muted" style="font-size:14px;">Drills: ${s.drills.length} • Level: ${s.levelBand}</div>
        <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
      </div>
    `
    )
    .join("");

  skillList.querySelectorAll("button[data-skill]").forEach(btn => {
    btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => ctx.nav.genre(genreId) });
  });

  const btArea = document.getElementById("bt-area");
  btArea.innerHTML = backingUI(ctx, bts);
  wireBackingDropdown(ctx, bts, () => renderGenre(ctx, genreId));

  document.getElementById("back-home").onclick = () => ctx.nav.home();
  document.getElementById("go-practice").onclick = () => ctx.nav.practice();
}

export function renderPractice(ctx) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;
  const genre = C.genres[state.genre];
  if (!genre) return renderHome(ctx);

  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const btsAll = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);
  const bts = filterTracksByRole(ctx, btsAll);

  app.innerHTML = `
    <div class="card">
      <h2>Practice (Genre)</h2>
      <p><strong>Genre:</strong> ${genre.name}</p>
      <p class="muted">${genre.description}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Hand: ${ctx.handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
        ${rolePill(ctx)}
      </div>

      <div class="card" style="background:#171717;">
        <div class="row" style="justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700;">Core Learning</div>
            <div class="muted" style="font-size:13px;">For the main beginner path, use Core Learning.</div>
          </div>
          <button id="go-core" class="secondary">Open Core</button>
        </div>
      </div>

      <h3 style="margin-top:16px;">Backing Tracks</h3>
      <div id="bt-area"></div>

      <h3 style="margin-top:16px;">Starter Skills (temporary)</h3>
      <div id="skill-list"></div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
        <button class="secondary" id="genre-details">Genre Details</button>
      </div>
    </div>
  `;

  document.getElementById("go-core").onclick = () => {
    setView(ctx, "core");
    renderHome(ctx);
  };

  const btArea = document.getElementById("bt-area");
  btArea.innerHTML = backingUI(ctx, bts);
  wireBackingDropdown(ctx, bts, () => renderPractice(ctx));

  const skillList = document.getElementById("skill-list");
  skillList.innerHTML = skills
    .map(
      s => `
      <div class="card" style="background:#171717;">
        <h4 style="margin:0 0 6px 0;">${s.name}</h4>
        <div class="muted" style="margin-bottom:10px;">${s.summary}</div>
        <div class="muted" style="font-size:14px;">Drills: ${s.drills.length} • Level: ${s.levelBand}</div>
        <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
      </div>
    `
    )
    .join("");

  skillList.querySelectorAll("button[data-skill]").forEach(btn => {
    btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => ctx.nav.practice() });
  });

  document.getElementById("back-home").onclick = () => ctx.nav.home();
  document.getElementById("genre-details").onclick = () => ctx.nav.genre(genre.id);
}

/* ============================================================
   SECTION 8 — Skill screen
============================================================ */

// helper: pick ONE video url per drill (videoUrl OR media)
function pickOneVideoUrl(d) {
  if (!d) return null;
  if (d.videoUrl && typeof d.videoUrl === "string") return d.videoUrl;
  const m = d.media || null;
  if (!m) return null;
  return m.demoUrl || m.fixUrl || m.dontUrl || null;
}

export function renderSkill(ctx, skillId, opts = {}) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;
  const skill = C.skills[skillId];
  const backTo = opts.backTo || (() => ctx.nav.practice());

  if (!skill) {
    app.innerHTML = `
      <div class="card">
        <h2>Skill not found</h2>
        <button class="secondary" id="back">Back</button>
      </div>
    `;
    document.getElementById("back").onclick = backTo;
    return;
  }

  const handedNote =
    state.handedness === "left"
      ? "Left-handed: pick with your left hand, fret with your right."
      : "Right-handed: pick with your right hand, fret with your left.";

  app.innerHTML = `
    <div class="card">
      <h2>${skill.name}</h2>
      <p class="muted">${skill.summary}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Genre: ${skill.genre}</span>
        <span class="pill">Level: ${skill.levelBand}</span>
        <span class="pill">Hand: ${ctx.handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
        ${rolePill(ctx)}
      </div>

      <p class="muted" style="margin-top:0;">${handedNote}</p>

      <h3>Drills</h3>

      ${skill.drills
        .map(d => {
          const cfg = d.suggestedBpm || { start: 60, step: 5, target: 120 };
          const p = ctx.progress.getOrInit(state, d);

          const showLevelUp = shouldShowLevelUp(p);
          const levelUpMsg = showLevelUp
            ? `Level up: <b>${p.lastLevelUpFrom}</b> to <b>${p.lastLevelUpTo}</b> bpm`
            : "";

          const metroRunning = ctx.metro.isRunning() && ctx.metroState.drillId === d.id;

          const rawUrl = pickOneVideoUrl(d);
          const oneUrl = rawUrl ? withCb(rawUrl, `${skill.id}_${d.id}`) : null;

          return `
            <div class="card" style="background:#171717;">
              <h4 style="margin:0 0 6px 0;">${d.name}</h4>

              <div class="muted" style="font-size:14px;">
                Suggested BPM: ${cfg.start} to ${cfg.target} (step ${cfg.step})
                • Duration: ~${Math.max(1, Math.round(d.durationSec / 60))} min
              </div>

              ${showLevelUp ? `<div class="kpi" style="margin-top:10px;">${levelUpMsg}</div>` : ""}

              <div class="statline">
                <div class="kpi"><b>Current:</b> ${p.bpm} bpm</div>
                <div class="kpi"><b>Clean reps:</b> ${p.cleanStreak}/3</div>
                <div class="kpi"><b>Best:</b> ${p.bestBpm} bpm</div>
              </div>

              <div class="controls">
                <button class="secondary small" data-bpm-down="${d.id}">- ${cfg.step}</button>
                <button class="secondary small" data-bpm-up="${d.id}">+ ${cfg.step}</button>

                <button class="small" data-clean="${d.id}">Clean rep</button>
                <button class="secondary small" data-sloppy="${d.id}">Sloppy rep</button>

                <button class="secondary small" data-reset="${d.id}">Reset</button>

                <button class="${metroRunning ? "" : "secondary"} small" data-metro="${d.id}">
                  ${metroRunning ? "Stop metronome" : "Start metronome"}
                </button>

                <span class="pill">${metroRunning ? `Metronome: ON (${ctx.metro.getBpm()} bpm)` : "Metronome: OFF"}</span>
              </div>

              <div class="hr"></div>

              <div style="margin-top:10px;">
                ${d.instructions.map(line => `<div style="opacity:.95">• ${line}</div>`).join("")}
              </div>

              <div style="margin-top:14px;">
                <div class="row" style="justify-content:space-between;">
                  <h4 style="margin:0;">Video Example</h4>
                  <button class="secondary small" data-toggle-mirror="1">
                    ${state.mirrorVideos ? "Mirroring ON" : "Mirroring OFF"}
                  </button>
                </div>

                ${
                  oneUrl
                    ? `<div style="margin-top:10px;">${ctx.videoBlock("Example", oneUrl, state.mirrorVideos)}</div>`
                    : `<div class="muted" style="margin-top:8px;">No video set for this drill yet.</div>`
                }
              </div>
            </div>
          `;
        })
        .join("")}

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back">Back</button>
      </div>
    </div>
  `;

  app.querySelectorAll("button[data-toggle-mirror]").forEach(btn => {
    btn.onclick = () => {
      state.mirrorVideos = !state.mirrorVideos;
      ctx.persist();
      renderSkill(ctx, skillId, opts);
    };
  });

  skill.drills.forEach(d => {
    const cfg = d.suggestedBpm || { start: 60, step: 5, target: 120 };

    const down = app.querySelector(`button[data-bpm-down="${d.id}"]`);
    const up = app.querySelector(`button[data-bpm-up="${d.id}"]`);
    const clean = app.querySelector(`button[data-clean="${d.id}"]`);
    const sloppy = app.querySelector(`button[data-sloppy="${d.id}"]`);
    const reset = app.querySelector(`button[data-reset="${d.id}"]`);
    const metroBtn = app.querySelector(`button[data-metro="${d.id}"]`);

    if (down)
      down.onclick = () => {
        const p = ctx.progress.getOrInit(state, d);
        ctx.progress.setBpm(state, d, (p.bpm || cfg.start) - (cfg.step || 5));
        const p2 = ctx.progress.getOrInit(state, d);
        ctx.metroSetBpmIfActive(d.id, p2.bpm);
        renderSkill(ctx, skillId, opts);
      };

    if (up)
      up.onclick = () => {
        const p = ctx.progress.getOrInit(state, d);
        ctx.progress.setBpm(state, d, (p.bpm || cfg.start) + (cfg.step || 5));
        const p2 = ctx.progress.getOrInit(state, d);
        ctx.metroSetBpmIfActive(d.id, p2.bpm);
        renderSkill(ctx, skillId, opts);
      };

    if (clean)
      clean.onclick = () => {
        ctx.progress.clean(state, d);
        const p2 = ctx.progress.getOrInit(state, d);
        ctx.metroSetBpmIfActive(d.id, p2.bpm);
        renderSkill(ctx, skillId, opts);
      };

    if (sloppy)
      sloppy.onclick = () => {
        ctx.progress.sloppy(state, d);
        const p2 = ctx.progress.getOrInit(state, d);
        ctx.metroSetBpmIfActive(d.id, p2.bpm);
        renderSkill(ctx, skillId, opts);
      };

    if (reset)
      reset.onclick = () => {
        ctx.progress.reset(state, d);
        ctx.metroStopIfOwnedBy(d.id);
        renderSkill(ctx, skillId, opts);
      };

    if (metroBtn)
      metroBtn.onclick = () => {
        const p = ctx.progress.getOrInit(state, d);
        ctx.metroToggle(d.id, p.bpm);
        renderSkill(ctx, skillId, opts);
      };
  });

  document.getElementById("back").onclick = backTo;
         }
