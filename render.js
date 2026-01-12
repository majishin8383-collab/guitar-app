// render.js
// UI rendering + event wiring
// Guarded: Role + Backing UI only appear if ctx provides the APIs.
// UPDATE:
// - Backing tracks dropdown + play button
// - Play launches YouTube (new tab) WITHOUT rerender to avoid scroll/focus jumps
// - Tracks playable if audioUrl OR generator OR youtubeEmbed OR youtubeQuery

import { shouldShowLevelUp } from "./progress.js";

function hasRole(ctx) {
  return typeof ctx.roleLabel === "function" && ctx.state && typeof ctx.state.role === "string";
}

function rolePill(ctx) {
  if (!hasRole(ctx)) return "";
  return `<span class="pill">Role: ${ctx.roleLabel()}</span>`;
}

function hasBacking(ctx) {
  return !!(ctx.backingState && typeof ctx.backingToggle === "function");
}

// -------- Backing helpers (dropdown + role filtering) --------

function getTrackMix(track) {
  const mix = track?.mix || track?.generator?.mix;
  if (mix === "rhythm" || mix === "lead") return mix;

  const n = String(track?.name || "").toLowerCase();
  if (n.includes("rhythm mix")) return "rhythm";
  if (n.includes("lead mix")) return "lead";
  return null;
}

function filterTracksByRole(ctx, tracks) {
  if (!hasRole(ctx)) return tracks;
  const want = ctx.state.role === "lead" ? "lead" : "rhythm";

  return tracks.filter(t => {
    const tm = getTrackMix(t);
    return tm ? tm === want : true;
  });
}

function getSelectedTrackId(ctx, tracks) {
  const id = ctx.state.btSelectedId;
  if (id && tracks.some(t => t.id === id)) return id;
  return tracks.length ? tracks[0].id : null;
}

function setSelectedTrackId(ctx, id) {
  ctx.state.btSelectedId = id;
  ctx.persist();
}

function isTrackPlayable(track) {
  return !!(
    track &&
    (
      track.audioUrl ||
      track.generator ||
      track.youtubeEmbed ||
      track.youtubeQuery
    )
  );
}

function backingDropdownUI(ctx, tracks) {
  if (!tracks.length) {
    return `<div class="muted" style="margin-top:8px;">No backing tracks defined for this genre yet.</div>`;
  }

  const selectedId = getSelectedTrackId(ctx, tracks);
  const selected = tracks.find(t => t.id === selectedId) || tracks[0];

  const playable = isTrackPlayable(selected);

  const isCurrent = ctx.backingState.trackId === selected.id;
  const isPlaying = isCurrent && ctx.backingState.isPlaying;

  const btnLabel = !playable ? "No track yet" : (isPlaying ? "⏸ Pause" : "▶ Play");

  const roleNote = hasRole(ctx)
    ? `<div class="muted" style="font-size:14px; margin-top:6px;">Auto-filtered by Role: <b>${ctx.roleLabel()}</b></div>`
    : "";

  const sourceNote =
    selected.youtubeEmbed || selected.youtubeQuery
      ? `<div class="muted" style="font-size:14px; margin-top:10px;">Opens <b>YouTube</b> in a new tab.</div>`
      : (selected.generator
          ? `<div class="muted" style="font-size:14px; margin-top:10px;">Using <b>generator</b> backing track (no mp3 needed).</div>`
          : (!selected.audioUrl
              ? `<div class="muted" style="font-size:14px; margin-top:10px;">No source set yet for this track.</div>`
              : ""));

  return `
    <div class="card" style="background:#171717; margin-top:10px;">
      <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div style="flex:1; min-width:240px;">
          <div class="muted" style="font-size:14px;">Choose track</div>
          <select id="bt-select" style="width:100%; max-width:560px;">
            ${tracks.map(t => {
              const sel = t.id === selected.id ? "selected" : "";
              const label = `${t.name} — Key ${t.key} • ${t.feel} • ~${t.recommendedBpm} bpm`;
              return `<option value="${t.id}" ${sel}>${label}</option>`;
            }).join("")}
          </select>
          ${roleNote}
        </div>

        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <button
            id="bt-play"
            class="${playable ? (isPlaying ? "" : "secondary") : "secondary"}"
            ${playable ? "" : "disabled"}
            style="white-space:nowrap;"
          >${btnLabel}</button>

          <span id="bt-status" class="pill">${isPlaying ? "Playing" : "Stopped"}</span>
        </div>
      </div>

      ${selected.note ? `<div class="muted" style="font-size:14px; margin-top:10px;">${selected.note}</div>` : ""}
      ${sourceNote}
    </div>
  `;
}

function wireBackingDropdown(ctx, tracks, rerender) {
  const select = document.getElementById("bt-select");
  const playBtn = document.getElementById("bt-play");
  const statusPill = document.getElementById("bt-status");
  if (!select || !playBtn) return;

  function currentTrack() {
    const id = select.value;
    return tracks.find(t => t.id === id) || tracks[0];
  }

  function updatePlayUI() {
    const t = currentTrack();
    const playable = isTrackPlayable(t);

    const isCurrent = ctx.backingState.trackId === t.id;
    const isPlaying = isCurrent && ctx.backingState.isPlaying;

    playBtn.disabled = !playable;
    playBtn.className = playable ? (isPlaying ? "" : "secondary") : "secondary";
    playBtn.textContent = !playable ? "No track yet" : (isPlaying ? "⏸ Pause" : "▶ Play");

    if (statusPill) statusPill.textContent = isPlaying ? "Playing" : "Stopped";
  }

  // Dropdown change SHOULD rerender (updates notes + source text)
  select.onchange = () => {
    const t = currentTrack();
    setSelectedTrackId(ctx, t.id);
    rerender();
  };

  // Play should NOT rerender (prevents scroll/focus jumps after returning from YouTube)
  playBtn.onclick = () => {
    const t = currentTrack();
    ctx.backingToggle(t);
    updatePlayUI();
  };

  // On first wire, ensure UI matches state
  updatePlayUI();
}

// ------------------ Screens ------------------

export function renderHome(ctx) {
  ctx.ensureMirrorDefault();

  const { app, C, state } = ctx;
  const genres = Object.values(C.genres);
  const activeGenre = C.genres[state.genre];

  const roleCard = hasRole(ctx) ? `
    <div class="card">
      <h3 style="margin-top:0;">Your Focus</h3>
      <p class="muted">Pick what you're practicing most right now.</p>
      <div class="row">
        <button id="role-rhythm">Rhythm</button>
        <button id="role-lead">Lead</button>
        ${rolePill(ctx)}
      </div>
    </div>
  ` : "";

  app.innerHTML = `
    <div class="card">
      <h2>Choose Your Genre</h2>
      <p class="muted">Start focused. Expand later.</p>
      <div id="genre-list"></div>
    </div>

    ${roleCard}

    <div class="card">
      <h3 style="margin-top:0;">Playing Hand</h3>
      <p class="muted">All instructions use <b>fretting hand</b> + <b>picking hand</b>.</p>
      <div class="row">
        <button id="hand-right">Right-handed</button>
        <button id="hand-left">Left-handed</button>
        <span class="pill">Current: ${ctx.handednessLabel()}</span>
      </div>

      <div style="height:12px"></div>

      <h3 style="margin:0;">Video Orientation</h3>
      <p class="muted">Left-handed players often prefer mirrored demos.</p>
      <div class="row">
        <button id="toggle-mirror" class="${state.mirrorVideos ? "" : "secondary"}">
          ${state.mirrorVideos ? "Mirroring: ON" : "Mirroring: OFF"}
        </button>
        <span class="pill">Applies to drill videos</span>
      </div>
    </div>

    <div class="card">
      <button id="start-practice">Start Practice</button>
      <div style="height:10px"></div>
      <button id="view-genre" class="secondary">View Genre Details</button>
    </div>
  `;

  // Role buttons
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

    rr.onclick = () => { state.role = "rhythm"; ctx.persist(); renderHome(ctx); };
    rl.onclick = () => { state.role = "lead"; ctx.persist(); renderHome(ctx); };
  }

  // genre list
  const list = document.getElementById("genre-list");
  list.innerHTML = genres.map(g => {
    const active = g.id === state.genre;
    return `
      <div style="display:flex; gap:10px; align-items:center; margin:10px 0;">
        <button data-genre="${g.id}" class="${active ? "" : "secondary"}">${g.name}</button>
        <span class="muted">${g.description}</span>
      </div>
    `;
  }).join("");

  list.querySelectorAll("button[data-genre]").forEach(btn => {
    btn.onclick = () => {
      state.genre = btn.dataset.genre;
      ctx.persist();
      renderHome(ctx);
    };
  });

  // handedness buttons
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
    renderHome(ctx);
  };

  leftBtn.onclick = () => {
    state.handedness = "left";
    if (!state.mirrorVideos) state.mirrorVideos = true;
    ctx.persist();
    renderHome(ctx);
  };

  document.getElementById("toggle-mirror").onclick = () => {
    state.mirrorVideos = !state.mirrorVideos;
    ctx.persist();
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

  const backingHeader = hasBacking(ctx)
    ? `<div class="muted" style="font-size:14px;">Playable if the track has YouTube info (embed/query), <code>audioUrl</code>, or <code>generator</code>.</div>`
    : `<div class="muted" style="font-size:14px;">(Backing player not enabled yet.)</div>`;

  app.innerHTML = `
    <div class="card">
      <h2>${genre.name}</h2>
      <p class="muted">${genre.description}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Hand: ${ctx.handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
        ${rolePill(ctx)}
      </div>

      <h3 style="margin-top:16px;">Starter Skills</h3>
      <div id="skill-list"></div>

      <h3 style="margin-top:16px;">Backing Tracks</h3>
      ${backingHeader}
      <div id="bt-area"></div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
        <button id="go-practice">Go to Practice</button>
      </div>
    </div>
  `;

  const skillList = document.getElementById("skill-list");
  skillList.innerHTML = skills.map(s => `
    <div class="card" style="background:#171717;">
      <h4 style="margin:0 0 6px 0;">${s.name}</h4>
      <div class="muted" style="margin-bottom:10px;">${s.summary}</div>
      <div class="muted" style="font-size:14px;">Drills: ${s.drills.length} • Level: ${s.levelBand}</div>
      <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
    </div>
  `).join("");

  skillList.querySelectorAll("button[data-skill]").forEach(btn => {
    btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => ctx.nav.genre(genreId) });
  });

  const btArea = document.getElementById("bt-area");
  if (hasBacking(ctx)) {
    btArea.innerHTML = backingDropdownUI(ctx, bts);
    wireBackingDropdown(ctx, bts, () => renderGenre(ctx, genreId));
  } else {
    btArea.innerHTML = btsAll.map(t => `
      <div style="opacity:.9; margin:8px 0;">
        • <strong>${t.name}</strong> — Key ${t.key}, ${t.feel}, ~${t.recommendedBpm} bpm
      </div>
    `).join("");
  }

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

  const backingHeader = hasBacking(ctx)
    ? `<div class="muted" style="font-size:14px;">Pick a track from the dropdown. Play opens YouTube in a new tab.</div>`
    : `<div class="muted" style="font-size:14px;">Backing player not enabled yet.</div>`;

  app.innerHTML = `
    <div class="card">
      <h2>Today's Practice</h2>
      <p><strong>Genre:</strong> ${genre.name}</p>
      <p class="muted">${genre.description}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Hand: ${ctx.handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
        ${rolePill(ctx)}
      </div>

      <h3 style="margin-top:16px;">Backing Tracks</h3>
      ${backingHeader}
      <div id="bt-area"></div>

      <h3 style="margin-top:16px;">Starter Skills</h3>
      <div id="skill-list"></div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
        <button class="secondary" id="genre-details">Genre Details</button>
      </div>
    </div>
  `;

  const btArea = document.getElementById("bt-area");
  if (hasBacking(ctx)) {
    btArea.innerHTML = backingDropdownUI(ctx, bts);
    wireBackingDropdown(ctx, bts, () => renderPractice(ctx));
  } else {
    btArea.innerHTML = btsAll.map(t => `
      <div style="opacity:.9; margin:8px 0;">
        • <strong>${t.name}</strong> — Key ${t.key}, ${t.feel}, ~${t.recommendedBpm} bpm
      </div>
    `).join("");
  }

  const skillList = document.getElementById("skill-list");
  skillList.innerHTML = skills.map(s => `
    <div class="card" style="background:#171717;">
      <h4 style="margin:0 0 6px 0;">${s.name}</h4>
      <div class="muted" style="margin-bottom:10px;">${s.summary}</div>
      <div class="muted" style="font-size:14px;">Drills: ${s.drills.length} • Level: ${s.levelBand}</div>
      <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
    </div>
  `).join("");

  skillList.querySelectorAll("button[data-skill]").forEach(btn => {
    btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => ctx.nav.practice() });
  });

  document.getElementById("back-home").onclick = () => ctx.nav.home();
  document.getElementById("genre-details").onclick = () => ctx.nav.genre(genre.id);
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

      ${skill.drills.map(d => {
        const cfg = d.suggestedBpm || { start: 60, step: 5, target: 120 };
        const p = ctx.progress.getOrInit(state, d);

        const showLevelUp = shouldShowLevelUp(p);
        const levelUpMsg = showLevelUp
          ? `✅ Level up: <b>${p.lastLevelUpFrom}</b> → <b>${p.lastLevelUpTo}</b> bpm`
          : "";

        const metroRunning = ctx.metro.isRunning() && ctx.metroState.drillId === d.id;

        const media = d.media || null;
        const hasAnyVideo = media && (media.demoUrl || media.dontUrl || media.fixUrl);

        return `
          <div class="card" style="background:#171717;">
            <h4 style="margin:0 0 6px 0;">${d.name}</h4>

            <div class="muted" style="font-size:14px;">
              Suggested BPM: ${cfg.start} → ${cfg.target} (step ${cfg.step})
              • Duration: ~${Math.max(1, Math.round(d.durationSec / 60))} min
            </div>

            ${showLevelUp ? `<div class="kpi" style="margin-top:10px;">${levelUpMsg}</div>` : ""}

            <div class="statline">
              <div class="kpi"><b>Current:</b> ${p.bpm} bpm</div>
              <div class="kpi"><b>Clean reps:</b> ${p.cleanStreak}/3</div>
              <div class="kpi"><b>Best:</b> ${p.bestBpm} bpm</div>
            </div>

            <div class="controls">
              <button class="secondary small" data-bpm-down="${d.id}">− ${cfg.step}</button>
              <button class="secondary small" data-bpm-up="${d.id}">+ ${cfg.step}</button>

              <button class="small" data-clean="${d.id}">✅ Clean rep</button>
              <button class="secondary small" data-sloppy="${d.id}">😵 Sloppy rep</button>

              <button class="secondary small" data-reset="${d.id}">Reset</button>

              <button class="${metroRunning ? "" : "secondary"} small" data-metro="${d.id}">
                ${metroRunning ? "⏹ Metronome" : "▶ Metronome"}
              </button>

              <span class="pill">${metroRunning ? `Metronome: ON (${ctx.metro.getBpm()} bpm)` : "Metronome: OFF"}</span>
            </div>

            <div class="hr"></div>

            <div style="margin-top:10px;">
              ${d.instructions.map(line => `<div style="opacity:.95">• ${line}</div>`).join("")}
            </div>

            <div style="margin-top:14px;">
              <div class="row" style="justify-content:space-between;">
                <h4 style="margin:0;">Video Examples</h4>
                <button class="secondary small" data-toggle-mirror="1">
                  ${state.mirrorVideos ? "Mirroring ON" : "Mirroring OFF"}
                </button>
              </div>

              ${
                hasAnyVideo
                  ? `
                    <div class="videoGrid" style="margin-top:10px;">
                      ${ctx.videoBlock("✅ Do this (correct)", media.demoUrl, state.mirrorVideos)}
                      ${ctx.videoBlock("❌ Don’t do this (common mistake)", media.dontUrl, state.mirrorVideos)}
                      ${ctx.videoBlock("🔧 Fix (correction)", media.fixUrl, state.mirrorVideos)}
                    </div>
                  `
                  : `<div class="muted" style="margin-top:8px;">No videos set for this drill yet.</div>`
              }
            </div>
          </div>
        `;
      }).join("")}

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back">Back</button>
      </div>
    </div>
  `;

  // Mirror toggle (global)
  app.querySelectorAll("button[data-toggle-mirror]").forEach(btn => {
    btn.onclick = () => {
      state.mirrorVideos = !state.mirrorVideos;
      ctx.persist();
      renderSkill(ctx, skillId, opts);
    };
  });

  // Drill controls
  skill.drills.forEach(d => {
    const cfg = d.suggestedBpm || { start: 60, step: 5, target: 120 };

    const down = app.querySelector(`button[data-bpm-down="${d.id}"]`);
    const up = app.querySelector(`button[data-bpm-up="${d.id}"]`);
    const clean = app.querySelector(`button[data-clean="${d.id}"]`);
    const sloppy = app.querySelector(`button[data-sloppy="${d.id}"]`);
    const reset = app.querySelector(`button[data-reset="${d.id}"]`);
    const metroBtn = app.querySelector(`button[data-metro="${d.id}"]`);

    if (down) down.onclick = () => {
      const p = ctx.progress.getOrInit(state, d);
      ctx.progress.setBpm(state, d, (p.bpm || cfg.start) - (cfg.step || 5));
      const p2 = ctx.progress.getOrInit(state, d);
      ctx.metroSetBpmIfActive(d.id, p2.bpm);
      renderSkill(ctx, skillId, opts);
    };

    if (up) up.onclick = () => {
      const p = ctx.progress.getOrInit(state, d);
      ctx.progress.setBpm(state, d, (p.bpm || cfg.start) + (cfg.step || 5));
      const p2 = ctx.progress.getOrInit(state, d);
      ctx.metroSetBpmIfActive(d.id, p2.bpm);
      renderSkill(ctx, skillId, opts);
    };

    if (clean) clean.onclick = () => {
      ctx.progress.clean(state, d);
      const p2 = ctx.progress.getOrInit(state, d);
      ctx.metroSetBpmIfActive(d.id, p2.bpm);
      renderSkill(ctx, skillId, opts);
    };

    if (sloppy) sloppy.onclick = () => {
      ctx.progress.sloppy(state, d);
      const p2 = ctx.progress.getOrInit(state, d);
      ctx.metroSetBpmIfActive(d.id, p2.bpm);
      renderSkill(ctx, skillId, opts);
    };

    if (reset) reset.onclick = () => {
      ctx.progress.reset(state, d);
      ctx.metroStopIfOwnedBy(d.id);
      renderSkill(ctx, skillId, opts);
    };

    if (metroBtn) metroBtn.onclick = () => {
      const p = ctx.progress.getOrInit(state, d);
      ctx.metroToggle(d.id, p.bpm);
      renderSkill(ctx, skillId, opts);
    };
  });

  document.getElementById("back").onclick = backTo;
      }
