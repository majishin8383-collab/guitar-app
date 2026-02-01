// render.js
// UI rendering + event wiring
// Guarded: Role UI only appears if ctx provides role APIs.
// Backing tracks: YouTube embed ONLY. Dropdown controls what displays (no Stop/Play buttons).

import { shouldShowLevelUp } from "./progress.js";
import { SONGS } from "./songs.js";

import { getView, setView } from "./state/viewState.js";
import { withCb } from "./ui/video.js";

import { createSongsUI } from "./ui/songs.js";
import { filterTracksByRole, backingUI, wireBackingDropdown } from "./ui/backing.js";
import { createCoreUI } from "./ui/core.js";
import { createSettingsUI } from "./ui/settings.js";

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
   SECTION 1 — External UIs (Songs + Core + Settings)
============================================================ */

const SongsUI = createSongsUI(SONGS, {
  withCb,
  View: { set: setView }
});

const CoreUI = createCoreUI({
  rolePill,
  setView
});

const SettingsUI = createSettingsUI({
  rolePill,
  setView
});

/* ============================================================
   SECTION 2 — Screens (Home / Genre / Practice / Skill)
============================================================ */

export function renderHome(ctx) {
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

/* ============================================================
   SECTION 3 — Skill screen
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
