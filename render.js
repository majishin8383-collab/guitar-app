// render.js
// UI rendering + event wiring
// Guarded: Role UI only appears if ctx provides role APIs.
// Backing tracks: YouTube embed ONLY. Dropdown controls what displays (no Stop/Play buttons).

import { getView, setView } from "./state/viewState.js?v=GT-003";
import { withCb, safeYoutubeEmbed } from "./ui/video.js?v=GT-003";

import { backingUI, wireBackingDropdown, filterTracksByRole } from "./ui/backing.js?v=GT-003";
import { createCoreUI } from "./ui/core.js?v=GT-003";
import { createSettingsUI } from "./ui/settings.js?v=GT-003";
import { createSongsUI } from "./ui/songs.js?v=GT-003";
import { createSkillUI } from "./ui/skill.js?v=GT-003";
import { shouldShowLevelUp } from "./progress.js?v=GT-003";
import { nextStep, isComplete } from "./state/songProgress.js?v=GT-003";
import { toneCard } from "./ui/chords.js?v=GT-003";

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
   SECTION 2 — External UIs
============================================================ */

const CoreUI = createCoreUI({
  rolePill,
  setView
});

const SettingsUI = createSettingsUI({
  rolePill,
  setView
});

const SkillUI = createSkillUI({
  rolePill,
  shouldShowLevelUp,
  withCb
});

/* ============================================================
   SECTION 2.5 — Songs UI (DATA FROM window.CONTENT)
   IMPORTANT:
   - No songs.js file.
   - Songs live at ctx.C.songs (fed by content/songs/songX.js)
============================================================ */

let _SongsUI = null;

function getSongsUI(ctx) {
  // Ensure songs bucket exists (defensive)
  const songsObj = (ctx && ctx.C && ctx.C.songs && typeof ctx.C.songs === "object") ? ctx.C.songs : {};

  // Rebuild SongsUI only if the songs object reference changes
  if (_SongsUI && _SongsUI.__songsRef === songsObj) return _SongsUI;

  const ui = createSongsUI(songsObj, {
    withCb,
    safeYoutubeEmbed, // ✅ REQUIRED so renderSong doesn't crash
    View: { set: setView }
  });

  ui.__songsRef = songsObj;
  _SongsUI = ui;
  return ui;
}

/* ============================================================
   SECTION 3 — Screens (Home / Genre / Practice / Skill)
============================================================ */

export function renderHome(ctx) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;

  const view = getView(state);

  // ✅ Songs UI must be created AFTER ctx exists
  const SongsUI = getSongsUI(ctx);

  if (view === "settings") return SettingsUI.render(ctx, renderHome);
  if (view === "core") return CoreUI.render(ctx, renderHome);
  if (view === "songs") return SongsUI.renderSongs(ctx, renderHome);
  if (view === "song") return SongsUI.renderSong(ctx, renderHome);

  if (view === "practice") return renderPractice(ctx);
  if (view === "genre") return renderGenre(ctx, state.genre);
  if (view === "skill" && C.skills[state.skillId]) return renderSkill(ctx, state.skillId);
  ctx.enterScreen("home");

  const firstSong = C.songs.song1;
  const next = nextStep(state, firstSong, C.songs, C.skills);
  const nextLabel = next.type === "skill" ? C.skills[next.id].name : next.type === "song" ? `${C.songs[next.id].title} · ${C.songs[next.id].variants[next.variant].label}` : "Blues jam";
  const completed = ["easy", "medium", "hard"].filter(v => isComplete(state, "song1", v)).length;
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
      <h2>Today’s blues practice</h2>
      <p class="muted">Pick up your guitar. Your next step is ready.</p>
      <div class="card practiceNext">
        <span class="pill">First Groove · ${completed}/3 levels completed</span>
        <h3>${nextLabel}</h3>
        <button id="continue-practice">${completed ? "Continue practice" : "Start here"}</button>
        <p class="muted">${next.type === "skill" ? "A 60-second run. Small shapes, steady time." : "Play, save your run, and pick up here next time."}</p>
      </div>

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
        <button id="start-practice" class="secondary">Blues jam</button>
        <div style="height:10px"></div>
        <button id="view-genre" class="secondary">Genre Details</button>
      </div>
    </div>
  `;

  document.getElementById("continue-practice").onclick = () => SongsUI.follow(ctx, firstSong, renderHome);

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
  ctx.enterScreen("genre");
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

      <h3 style="margin-top:16px;">Blues lessons</h3>
      <div id="skill-list"></div>

      ${toneCard(state)}
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
  ctx.enterScreen("practice");
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;
  const genre = C.genres[state.genre];
  if (!genre) return renderHome(ctx);

  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const btsAll = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);
  const bts = filterTracksByRole(ctx, btsAll);

  app.innerHTML = `
    <div class="card">
      <h2>Blues jam</h2>
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

      ${toneCard(state)}
      <h3 style="margin-top:16px;">Backing Tracks</h3>
      <div id="bt-area"></div>

      <h3 style="margin-top:16px;">Blues lessons</h3>
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

export function renderSkill(ctx, skillId, opts = {}) {
  return SkillUI.render(ctx, skillId, opts);
}
