// ui/settings.js
// Settings screen extraction (handedness, mirroring, role focus)

function hasRole(ctx) {
  return typeof ctx.roleLabel === "function" && ctx.state && typeof ctx.state.role === "string";
}

export function createSettingsUI(deps = {}) {
  const rolePill = typeof deps.rolePill === "function" ? deps.rolePill : () => "";
  const setView = typeof deps.setView === "function" ? deps.setView : () => {};

  function render(ctx, renderHome) {
    ctx.ensureMirrorDefault();

    const { app, state } = ctx;

    const roleCard = hasRole(ctx)
      ? `
        <div class="card" style="background:#171717;">
          <h3 style="margin-top:0;">Your Focus</h3>
          <p class="muted">Pick what you're practicing most right now.</p>
          <div class="row">
            <button id="role-rhythm">Rhythm</button>
            <button id="role-lead">Lead</button>
            ${rolePill(ctx)}
          </div>
        </div>
      `
      : "";

    app.innerHTML = `
      <div class="card">
        <h2>Settings</h2>
        <p class="muted">These apply across the whole app.</p>

        ${roleCard}

        <div class="card" style="background:#171717; margin-top:10px;">
          <h3 style="margin-top:0;">Playing Hand</h3>
          <p class="muted">All instructions use <b>fretting hand</b> + <b>picking hand</b>.</p>
          <div class="row">
            <button id="hand-right">Right-handed</button>
            <button id="hand-left">Left-handed</button>
            <span class="pill">Current: ${ctx.handednessLabel()}</span>
          </div>
        </div>

        <div class="card" style="background:#171717; margin-top:10px;">
          <h3 style="margin-top:0;">Video Orientation</h3>
          <p class="muted">Mirroring is a viewing preference only.</p>
          <div class="row">
            <button id="toggle-mirror" class="${state.mirrorVideos ? "" : "secondary"}">
              ${state.mirrorVideos ? "Mirroring: ON" : "Mirroring: OFF"}
            </button>
            <span class="pill">Applies to drill videos</span>
          </div>
        </div>

        <div style="margin-top:16px;" class="row">
          <button class="secondary" id="back-home">Back</button>
        </div>
      </div>
    `;

    // Role focus
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

      rr.onclick = () => {
        state.role = "rhythm";
        ctx.persist();
        render(ctx, renderHome);
      };

      rl.onclick = () => {
        state.role = "lead";
        ctx.persist();
        render(ctx, renderHome);
      };
    }

    // Handedness
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
      render(ctx, renderHome);
    };

    leftBtn.onclick = () => {
      state.handedness = "left";
      if (!state.mirrorVideos) state.mirrorVideos = true; // your rule
      ctx.persist();
      render(ctx, renderHome);
    };

    // Mirroring
    document.getElementById("toggle-mirror").onclick = () => {
      state.mirrorVideos = !state.mirrorVideos;
      ctx.persist();
      render(ctx, renderHome);
    };

    // Back
    document.getElementById("back-home").onclick = () => {
      setView(ctx, "home");
      renderHome(ctx);
    };
  }

  return { render };
}
