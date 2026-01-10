const app = document.getElementById("app");
const C = window.CONTENT;

let state = {
  genre: "blues"
};

function getGenre() {
  return C.genres[state.genre];
}

function renderHome() {
  const genres = Object.values(C.genres);

  app.innerHTML = `
    <div class="card">
      <h2>Choose Your Genre</h2>
      <p>Start focused. Expand later.</p>
      <div id="genre-list"></div>
    </div>

    <div class="card">
      <button id="start-practice">Start Practice</button>
    </div>
  `;

  const list = document.getElementById("genre-list");
  list.innerHTML = genres.map(g => {
    const active = g.id === state.genre;
    return `
      <div style="display:flex; gap:10px; align-items:center; margin:10px 0;">
        <button data-genre="${g.id}" class="${active ? "" : "secondary"}">
          ${g.name}
        </button>
        <span style="opacity:.85">${g.description}</span>
      </div>
    `;
  }).join("");

  list.querySelectorAll("button[data-genre]").forEach(btn => {
    btn.onclick = () => {
      state.genre = btn.dataset.genre;
      renderHome(); // re-render to show selection
    };
  });

  document.getElementById("start-practice").onclick = renderPractice;
}

function renderPractice() {
  const genre = getGenre();
  const skills = genre.starterSkillIds.map(id => C.skills[id]).filter(Boolean);
  const bts = genre.backingTrackIds.map(id => C.backingTracks[id]).filter(Boolean);

  app.innerHTML = `
    <div class="card">
      <h2>Today's Practice</h2>
      <p><strong>Genre:</strong> ${genre.name}</p>
      <p style="opacity:.85">${genre.description}</p>

      <h3 style="margin-top:16px;">Starter Skills</h3>
      <div id="skill-list"></div>

      <h3 style="margin-top:16px;">Backing Tracks (coming soon)</h3>
      <div id="bt-list"></div>

      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="secondary" id="back-home">Back</button>
      </div>
    </div>
  `;

  const skillList = document.getElementById("skill-list");
  skillList.innerHTML = skills.map(s => `
    <div class="card" style="background:#171717;">
      <h4 style="margin:0 0 6px 0;">${s.name}</h4>
      <div style="opacity:.85; margin-bottom:10px;">${s.summary}</div>
      <div style="opacity:.8; font-size:14px;">Drills: ${s.drills.length}</div>
      <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
    </div>
  `).join("");

  skillList.querySelectorAll("button[data-skill]").forEach(btn => {
    btn.onclick = () => renderSkill(btn.dataset.skill);
  });

  const btList = document.getElementById("bt-list");
  btList.innerHTML = bts.map(t => `
    <div style="opacity:.9; margin:8px 0;">
      • <strong>${t.name}</strong> — Key ${t.key}, ${t.feel}, ~${t.recommendedBpm} bpm
    </div>
  `).join("");

  document.getElementById("back-home").onclick = renderHome;
}

function renderSkill(skillId) {
  const skill = C.skills[skillId];
  if (!skill) {
    app.innerHTML = `
      <div class="card">
        <h2>Skill not found</h2>
        <button class="secondary" id="back">Back</button>
      </div>
    `;
    document.getElementById("back").onclick = renderPractice;
    return;
  }

  app.innerHTML = `
    <div class="card">
      <h2>${skill.name}</h2>
      <p style="opacity:.85">${skill.summary}</p>

      <h3>Drills</h3>
      ${skill.drills.map(d => `
        <div class="card" style="background:#171717;">
          <h4 style="margin:0 0 6px 0;">${d.name}</h4>
          <div style="opacity:.8; font-size:14px;">Suggested BPM: ${d.suggestedBpm.start} → ${d.suggestedBpm.target} (step ${d.suggestedBpm.step})</div>
          <div style="margin-top:10px;">
            ${d.instructions.map(line => `<div style="opacity:.9">• ${line}</div>`).join("")}
          </div>
          <div style="opacity:.8; font-size:14px; margin-top:10px;">
            Duration: ~${Math.round(d.durationSec / 60)} min
          </div>
        </div>
      `).join("")}

      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="secondary" id="back">Back</button>
      </div>
    </div>
  `;

  document.getElementById("back").onclick = renderPractice;
}

// boot
renderHome();
