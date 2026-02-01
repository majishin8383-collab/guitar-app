// render.js
// UI rendering + event wiring
// Guarded: Role UI only appears if ctx provides role APIs.
// Backing tracks: YouTube embed ONLY. Dropdown controls what displays (no Stop/Play buttons).

import { shouldShowLevelUp } from "./progress.js";
import { SONGS } from "./songs.js";

import { getView, setView } from "./state/viewState.js";
import { withCb } from "./ui/video.js";

import { backingUI, wireBackingDropdown, filterTracksByRole } from "./ui/backing.js";
import { createCoreUI } from "./ui/core.js";
import { createSettingsUI } from "./ui/settings.js";
import { createSongsUI } from "./ui/songs.js";
import { createSkillUI } from "./ui/skill.js";

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
   SECTION 1 — Re-render hook (fixes Songs nav)
   Songs UI may call View.set(...) without re-rendering.
   We inject a View.set wrapper that always re-renders the current screen.
============================================================ */

let RERENDER_HOME = null;

function setViewAndRerender(ctx, viewName) {
  setView(ctx, viewName);
  if (typeof RERENDER_HOME === "function") RERENDER_HOME();
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

const SongsUI = createSongsUI(SONGS, {
  withCb,
  // IMPORTANT: wrap View.set so clicking Easy/Medium/Hard actually navigates
  View: { set: setViewAndRerender }
});

const SkillUI = createSkillUI({
  rolePill,
  shouldShowLevelUp,
  withCb
});

/* ============================================================
   SECTION 3 — Screens (Home / Genre / Practice / Skill)
============================================================ */

export function renderHome(ctx) {
  // keep a stable "rerender this screen" hook for child modules
  RERENDER_HOME = () => renderHome(ctx);

  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;

  const view = getView(state);
  if (view === "settings") return SettingsUI.render(ctx, renderHome);
  if (view === "core") return CoreUI.render(ctx, renderHome);
  if (view === "songs") return SongsUI.renderSongs(ctx, renderHome);
  if (view === "song") return SongsUI.renderSong(ctx, renderHome);

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

export function renderSkill(ctx, skillId, opts = {}) {
  return SkillUI.render(ctx, skillId, opts);
}
