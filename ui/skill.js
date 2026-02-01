// ui/skill.js
// Skill screen UI extracted from render.js
//
// Usage:
//   import { createSkillUI } from "./ui/skill.js";
//   const SkillUI = createSkillUI({ rolePill, shouldShowLevelUp, withCb });
//   SkillUI.render(ctx, skillId, opts);
//
// Notes:
// - Uses ctx.videoBlock(title, url, mirrorBool)
// - Uses ctx.progress + ctx.metro helpers already present in app
// - Keeps deterministic, mobile-safe cache-busting via withCb()

export function createSkillUI(deps) {
  const rolePill = deps?.rolePill || (() => "");
  const shouldShowLevelUp = deps?.shouldShowLevelUp || (() => false);
  const withCb = deps?.withCb || ((u) => u);

  // helper: pick ONE video url per drill (videoUrl OR media)
  function pickOneVideoUrl(d) {
    if (!d) return null;
    if (d.videoUrl && typeof d.videoUrl === "string") return d.videoUrl;
    const m = d.media || null;
    if (!m) return null;
    return m.demoUrl || m.fixUrl || m.dontUrl || null;
  }

  function render(ctx, skillId, opts = {}) {
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
        render(ctx, skillId, opts);
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
          render(ctx, skillId, opts);
        };

      if (up)
        up.onclick = () => {
          const p = ctx.progress.getOrInit(state, d);
          ctx.progress.setBpm(state, d, (p.bpm || cfg.start) + (cfg.step || 5));
          const p2 = ctx.progress.getOrInit(state, d);
          ctx.metroSetBpmIfActive(d.id, p2.bpm);
          render(ctx, skillId, opts);
        };

      if (clean)
        clean.onclick = () => {
          ctx.progress.clean(state, d);
          const p2 = ctx.progress.getOrInit(state, d);
          ctx.metroSetBpmIfActive(d.id, p2.bpm);
          render(ctx, skillId, opts);
        };

      if (sloppy)
        sloppy.onclick = () => {
          ctx.progress.sloppy(state, d);
          const p2 = ctx.progress.getOrInit(state, d);
          ctx.metroSetBpmIfActive(d.id, p2.bpm);
          render(ctx, skillId, opts);
        };

      if (reset)
        reset.onclick = () => {
          ctx.progress.reset(state, d);
          ctx.metroStopIfOwnedBy(d.id);
          render(ctx, skillId, opts);
        };

      if (metroBtn)
        metroBtn.onclick = () => {
          const p = ctx.progress.getOrInit(state, d);
          ctx.metroToggle(d.id, p.bpm);
          render(ctx, skillId, opts);
        };
    });

    document.getElementById("back").onclick = backTo;
  }

  return { render };
}
