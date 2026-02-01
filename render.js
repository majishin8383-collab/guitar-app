// render.js
// UI rendering + event wiring
// Guarded: Role UI only appears if ctx provides role APIs.
// Backing tracks: YouTube embed ONLY. Dropdown controls what displays (no Stop/Play buttons).

import { getView, setView } from "./state/viewState.js";
import { withCb, safeYoutubeEmbed } from "./ui/video.js";

import { backingUI, wireBackingDropdown, filterTracksByRole } from "./ui/backing.js";
import { createCoreUI } from "./ui/core.js";
import { createSettingsUI } from "./ui/settings.js";
import { createSongsUI } from "./ui/songs.js";
import { createSkillUI } from "./ui/skill.js";
import { shouldShowLevelUp } from "./progress.js";

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

/**
 * 🔒 IMPORTANT
 * Songs are pulled from window.CONTENT (same pattern as genres)
 * NO songs.js file
 */
const SongsUI = createSongsUI(
  ctx => ctx.C.songs || {},
  {
    withCb,
    safeYoutubeEmbed,
    View: { set: setViewAndRerender }
  }
);

const SkillUI = createSkillUI({
  rolePill,
  shouldShowLevelUp,
  withCb
});

/* ============================================================
   SECTION 3 — Screens
============================================================ */

export function renderHome(ctx) {
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
    .map(g => `<option value="${g.id}" ${g.id === state.genre ? "selected" : ""}>${g.name}</option>`)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Home</h2>
      <p class="muted">Core learning first. Songs apply the skills.</p>

      <div class="card" style="background:#171717;">
        <div class="muted">Genre</div>
        <select id="genre-select" style="width:100%; margin-top:6px;">
          ${genreOptions}
        </select>
        <div class="muted" style="margin-top:8px;">
          ${activeGenre?.description || ""}
        </div>
        ${roleLine}
      </div>

      <div style="height:12px"></div>

      <div class="card">
        <button id="open-core">Core Learning</button>
        <div style="height:10px"></div>
        <button id="open-songs">Songs</button>
        <div style="height:10px"></div>
        <button id="start-practice" class="secondary">Practice (Genre)</button>
      </div>
    </div>
  `;

  document.getElementById("genre-select").onchange = e => {
    state.genre = e.target.value;
    ctx.persist();
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
}

export function renderSkill(ctx, skillId, opts = {}) {
  return SkillUI.render(ctx, skillId, opts);
}
