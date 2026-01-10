// app.js
const app = document.getElementById("app");
const C = window.CONTENT;

// --- persistent state helpers ---
const STORAGE_KEY = "guitar_trainer_state_v1";

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
  handedness: "right" // "right" | "left"
};

function getGenre() {
  return C.genres[state.genre];
}

function handednessLabel() {
  return state.handedness === "left" ? "Left-handed" : "Right-handed";
}

function renderHome() {
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
      <p class="muted">All instructions are written for your <b>fretting hand</b> and <b>picking hand</b> (works for both orientations).</p>
      <div class="row">
        <button id="hand-right">Right-handed</button>
        <button id="hand-left">Left-handed</button>
        <span class="pill">Current: ${handednessLabel()}</span>
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
    saveState();
    renderHome();
  };

  document.getElementById("start-practice").onclick = renderPractice;
  document.getElementById("view-genre").onclick = () => renderGenre(activeGenre.id);
}

function renderGenre(genreId) {
  const genre = C.genres[genreId];
  if (!genre) return renderHome();

  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const bts = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);

  app.innerHTML = `
    <div class="card">
      <h2>${genre.name}</h2>
      <p class="muted">${genre.description}</p>
      <p class="muted"><strong>Playing hand:</strong> ${handednessLabel()}</p>

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
  const genre = getGenre();
  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const bts = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);

  app.innerHTML = `
    <div class="card">
      <h2>Today's Practice</h2>
      <p><strong>Genre:</strong> ${genre.name}</p>
      <p class="muted">${genre.description}</p>

      <p class="muted"><strong>Playing hand:</strong> ${handednessLabel()}</p>

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
      </div>

      <p class="muted" style="margin-top:0;">${handedNote}</p>

      <h3>Drills</h3>
      ${skill.drills.map(d => `
        <div class="card" style="background:#171717;">
          <h4 style="margin:0 0 6px 0;">${d.name}</h4>
          <div class="muted" style="font-size:14px;">
            Suggested BPM: ${d.suggestedBpm.start} → ${d.suggestedBpm.target} (step ${d.suggestedBpm.step})
            • Duration: ~${Math.max(1, Math.round(d.durationSec / 60))} min
          </div>

          <div style="margin-top:10px;">
            ${d.instructions.map(line => `<div style="opacity:.95">• ${line}</div>`).join("")}
          </div>

          ${
            d.handednessNotes && d.handednessNotes[state.handedness]
              ? `<div class="muted" style="margin-top:10px;">Note: ${d.handednessNotes[state.handedness]}</div>`
              : ""
          }
        </div>
      `).join("")}

      <div style="margin-top:16px;" class="row">
        <button class="secondary" id="back">Back</button>
      </div>
    </div>
  `;

  document.getElementById("back").onclick = backTo;
}

// boot
renderHome();
