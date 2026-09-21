// ui/core.js
// Core Learning UI extracted from render.js
//
// Usage:
//   import { createCoreUI } from "./ui/core.js?v=GT-003";
//   const CoreUI = createCoreUI({ hasRole, rolePill, setView });
//   CoreUI.render(ctx, renderHome);

export function createCoreUI(deps) {
  const rolePill = deps?.rolePill || (() => "");
  const setView = deps?.setView || (() => {});

  function getCoreSkills(C) {
    const all = Object.values(C.skills || {});
    return all
      .filter(s => s && s.levelBand === "beginner" && Array.isArray(s.drills) && (s.drills.length || s.sessionSeconds))
      .sort((a, b) => {
        if ((a.order ?? 99) !== (b.order ?? 99)) return (a.order ?? 99) - (b.order ?? 99);
        const ga = String(a.genre || "");
        const gb = String(b.genre || "");
        if (ga !== gb) return ga.localeCompare(gb);
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  function render(ctx, renderHome) {
    ctx.enterScreen("core");
    ctx.ensureMirrorDefault();

    const { app, C, state } = ctx;
    const coreSkills = getCoreSkills(C);

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
            Start with Steady Time. Then play First Groove in Songs. Other lessons are here when you need them.
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
                  ${state.coreCompleted?.[s.id] ? "✓ Completed" : s.sessionSeconds ? "60-second practice run" : `Drills: ${s.drills.length}`}
                </div>
                <button data-skill="${s.id}" style="margin-top:10px;">Open Skill</button>
              </div>
            `;
          })
          .join("")
      : `<div class="muted">No core skills found yet.</div>`;

    list.querySelectorAll("button[data-skill]").forEach(btn => {
      btn.onclick = () => ctx.nav.skill(btn.dataset.skill, { backTo: () => ctx.nav.view("core") });
    });

    document.getElementById("back-home").onclick = () => {
      setView(ctx, "home");
      renderHome(ctx);
    };

    document.getElementById("go-practice").onclick = () => ctx.nav.practice();
  }

  return {
    getCoreSkills,
    render
  };
}
