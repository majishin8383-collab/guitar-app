// app.js
const app = document.getElementById("app");
const C = window.CONTENT;

// --- persistent state helpers ---
const STORAGE_KEY = "guitar_trainer_state_v3";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

// --- app state ---
let state = loadState() || {
  genre: "blues",
  handedness: "right",      // "right" | "left"
  mirrorVideos: false,      // video mirror preference
  progress: {
    // drillId: { bpm, cleanStreak, bestBpm, lastTs }
  }
};

function nowTs() {
  return Date.now();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getGenre() {
  return C.genres[state.genre];
}

function handednessLabel() {
  return state.handedness === "left" ? "Left-handed" : "Right-handed";
}

function ensureMirrorDefault() {
  // Sensible default: left-handed users usually want mirrored demos.
  if (state.handedness === "left" && state.mirrorVideos !== true) {
    state.mirrorVideos = true;
    saveState();
  }
}

function safeEmbed(url) {
  // Only allow YouTube embed links for now (simple safety + predictability).
  if (!url || typeof url !== "string") return null;
  const ok =
    url.startsWith("https://www.youtube.com/embed/") ||
    url.startsWith("https://youtube.com/embed/");
  return ok ? url : null;
}

function videoBlock(label, url, mirrorOn) {
  const safe = safeEmbed(url);
  if (!safe) {
    return `
      <div class="videoCard">
        <div class="videoLabel">${label}</div>
        <div class="muted">No video set yet.</div>
      </div>
    `;
  }

  const mirrorClass = mirrorOn ? "mirror" : "";
  return `
    <div class="videoCard">
      <div class="videoLabel">${label}</div>
      <div class="videoWrap ${mirrorClass}">
        <iframe
          src="${safe}"
          title="${label}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      ${mirrorOn ? `<div class="muted" style="margin-top:8px;">Mirrored for left-handed viewing.</div>` : ""}
    </div>
  `;
}

// --- Progress helpers (Dose 1.1) ---
function getOrInitDrillProgress(drill) {
  const id = drill.id;
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const existing = state.progress[id];

  if (existing && typeof existing.bpm === "number") return existing;

  const p = {
    bpm: cfg.start,
    cleanStreak: 0,
    bestBpm: cfg.start,
    lastTs: nowTs()
  };
  state.progress[id] = p;
  saveState();
  return p;
}

function setDrillBpm(drill, nextBpm) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(drill);

  const minBpm = Math.max(30, cfg.start); // never below 30, and don't go below suggested start
  const maxBpm = Math.max(cfg.target, cfg.start); // allow reaching target
  p.bpm = clamp(Math.round(nextBpm), minBpm, maxBpm);
  p.bestBpm = Math.max(p.bestBpm || p.bpm, p.bpm);
  p.lastTs = nowTs();
  saveState();
}

function markCleanRep(drill) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(drill);
  p.cleanStreak = (p.cleanStreak || 0) + 1;
  p.lastTs = nowTs();

  // Rule: 3 clean reps => bump tempo by step, reset streak to 0
  if (p.cleanStreak >= 3) {
    p.cleanStreak = 0;
    const next = (p.bpm || cfg.start) + (cfg.step || 5);
    setDrillBpm(drill, next);
    // setDrillBpm saves; but we already changed streak/ts, so ensure saved
    saveState();
    return { leveledUp: true };
  }

  saveState();
  return { leveledUp: false };
}

function markSloppyRep(drill) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(drill);

  // Sloppy rep: reset streak and drop tempo by step (but not below start/min)
  p.cleanStreak = 0;
  const next = (p.bpm || cfg.start) - (cfg.step || 5);
  setDrillBpm(drill, next);
  saveState();
}

function resetDrillProgress(drill) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  state.progress[drill.id] = {
    bpm: cfg.start,
    cleanStreak: 0,
    bestBpm: cfg.start,
    lastTs: nowTs()
  };
  saveState();
}

// --- UI ---
function renderHome() {
  ensureMirrorDefault();

  const genres = Object.values(C.genres);
  const activeGenre = getGenre();

  app.innerHTML = `
    <div class="card">
      <h2>Choose Your Genre</h2>
      <p class="muted">Start focused. Expand later.</p>
      <div id="genre-list"></div>
    </div>

    <div class="card">
      <h3 style="margin-top:0;">Playing Hand</h3>
      <p class="muted">All instructions use <b>fretting hand</b> + <b>picking hand</b> (works for both orientations).</p>
      <div class="row">
        <button id="hand-right">Right-handed</button>
        <button id="hand-left">Left-handed</button>
        <span class="pill">Current: ${handednessLabel()}</span>
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
      saveState();
      renderHome();
    };
  });

  // handedness buttons with visual state
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
    saveState();
    renderHome();
  };

  leftBtn.onclick = () => {
    state.handedness = "left";
    if (!state.mirrorVideos) state.mirrorVideos = true;
    saveState();
    renderHome();
  };

  document.getElementById("toggle-mirror").onclick = () => {
    state.mirrorVideos = !state.mirrorVideos;
    saveState();
    renderHome();
  };

  document.getElementById("start-practice").onclick = renderPractice;
  document.getElementById("view-genre").onclick = () => renderGenre(activeGenre.id);
}

function renderGenre(genreId) {
  ensureMirrorDefault();

  const genre = C.genres[genreId];
  if (!genre) return renderHome();

  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const bts = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);

  app.innerHTML = `
    <div class="card">
      <h2>${genre.name}</h2>
      <p class="muted">${genre.description}</p>
      <p class="muted"><strong>Playing hand:</strong> ${handednessLabel()}</p>
      <p class="muted"><strong>Video mirror:</strong> ${state.mirrorVideos ? "ON" : "OFF"}</p>

      <h3 style="margin-top:16px;">Starter Skills</h3>
      <div id="skill-list"></div>

      <h3 style="margin-top:16px;">Backing Tracks (coming soon)</h3>
      <div id="bt-list"></div>

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
    btn.onclick = () => renderSkill(btn.dataset.skill, { backTo: () => renderGenre(genreId) });
  });

  const btList = document.getElementById("bt-list");
  btList.innerHTML = bts.map(t => `
    <div style="opacity:.9; margin:8px 0;">
      • <strong>${t.name}</strong> — Key ${t.key}, ${t.feel}, ~${t.recommendedBpm} bpm
    </div>
  `).join("");

  document.getElementById("back-home").onclick = renderHome;
  document.getElementById("go-practice").onclick = renderPractice;
}

function renderPractice() {
  ensureMirrorDefault();

  const genre = getGenre();
  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const bts = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);

  app.innerHTML = `
    <div class="card">
      <h2>Today's Practice</h2>
      <p><strong>Genre:</strong> ${genre.name}</p>
      <p class="muted">${genre.description}</p>

      <div class="row" style="margin:10px 0;">
        <span class="pill">Hand: ${handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
      </div>

      <h3 style="margin-top:16px;">Starter Skills</h3>
      <div id="skill-list"></div>

      <h3 style="margin-top:16px;">Backing Tracks (coming soon)</h3>
      <div id="bt-list"></div>

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back-home">Back</button>
        <button class="secondary" id="genre-details">Genre Details</button>
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
    btn.onclick = () => renderSkill(btn.dataset.skill, { backTo: renderPractice });
  });

  const btList = document.getElementById("bt-list");
  btList.innerHTML = bts.map(t => `
    <div style="opacity:.9; margin:8px 0;">
      • <strong>${t.name}</strong> — Key ${t.key}, ${t.feel}, ~${t.recommendedBpm} bpm
    </div>
  `).join("");

  document.getElementById("back-home").onclick = renderHome;
  document.getElementById("genre-details").onclick = () => renderGenre(genre.id);
}

function renderSkill(skillId, opts = {}) {
  ensureMirrorDefault();

  const skill = C.skills[skillId];
  const backTo = opts.backTo || renderPractice;

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
        <span class="pill">Hand: ${handednessLabel()}</span>
        <span class="pill">Video mirror: ${state.mirrorVideos ? "ON" : "OFF"}</span>
      </div>

      <p class="muted" style="margin-top:0;">${handedNote}</p>

      <h3>Drills</h3>

      ${skill.drills.map(d => {
        const cfg = d.suggestedBpm || { start: 60, step: 5, target: 120 };
        const p = getOrInitDrillProgress(d);

        const media = d.media || null;
        const hasAnyVideo = media && (media.demoUrl || media.dontUrl || media.fixUrl);

        return `
          <div class="card" style="background:#171717;">
            <h4 style="margin:0 0 6px 0;">${d.name}</h4>

            <div class="muted" style="font-size:14px;">
              Suggested BPM: ${cfg.start} → ${cfg.target} (step ${cfg.step})
              • Duration: ~${Math.max(1, Math.round(d.durationSec / 60))} min
            </div>

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
            </div>

            <div class="hr"></div>

            <div style="margin-top:10px;">
              ${d.instructions.map(line => `<div style="opacity:.95">• ${line}</div>`).join("")}
            </div>

            ${
              d.handednessNotes && d.handednessNotes[state.handedness]
                ? `<div class="muted" style="margin-top:10px;">Note: ${d.handednessNotes[state.handedness]}</div>`
                : ""
            }

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
                      ${videoBlock("✅ Do this (correct)", media.demoUrl, state.mirrorVideos)}
                      ${videoBlock("❌ Don’t do this (common mistake)", media.dontUrl, state.mirrorVideos)}
                      ${videoBlock("🔧 Fix (correction)", media.fixUrl, state.mirrorVideos)}
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

  // Mirror toggle (global setting)
  app.querySelectorAll("button[data-toggle-mirror]").forEach(btn => {
    btn.onclick = () => {
      state.mirrorVideos = !state.mirrorVideos;
      saveState();
      renderSkill(skillId, opts);
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

    if (down) down.onclick = () => {
      const p = getOrInitDrillProgress(d);
      setDrillBpm(d, (p.bpm || cfg.start) - (cfg.step || 5));
      renderSkill(skillId, opts);
    };

    if (up) up.onclick = () => {
      const p = getOrInitDrillProgress(d);
      setDrillBpm(d, (p.bpm || cfg.start) + (cfg.step || 5));
      renderSkill(skillId, opts);
    };

    if (clean) clean.onclick = () => {
      const res = markCleanRep(d);
      // subtle feedback: bump happened
      if (res.leveledUp) {
        // no alerts; just re-render and let stats show it
      }
      renderSkill(skillId, opts);
    };

    if (sloppy) sloppy.onclick = () => {
      markSloppyRep(d);
      renderSkill(skillId, opts);
    };

    if (reset) reset.onclick = () => {
      resetDrillProgress(d);
      renderSkill(skillId, opts);
    };
  });

  document.getElementById("back").onclick = backTo;
}

// boot
renderHome();
