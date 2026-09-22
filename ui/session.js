function sessionMarkup(seconds) {
  return `<section class="card practiceRun" aria-label="Practice run">
    <h3>Play for ${seconds} seconds</h3>
    <p class="muted">Start the backing track, then start your run. You judge your playing; the app does not listen.</p>
    <div class="runTime" id="run-time">${seconds}s</div>
    <progress id="run-progress" max="${seconds}" value="0" aria-label="Practice time"></progress>
    <p id="run-message" role="status">Keep going through small mistakes. A full stop restarts the run.</p>
    <div class="row">
      <button id="run-start">Start run</button>
      <button id="run-restart" class="secondary" disabled>I stopped — restart</button>
      <button id="run-save" disabled>I kept going — save</button>
    </div>
  </section>`;
}
function wireSession(ctx, seconds, onComplete) {
  const start = ctx.app.querySelector("#run-start");
  const restart = ctx.app.querySelector("#run-restart");
  const save = ctx.app.querySelector("#run-save");
  const clock = ctx.app.querySelector("#run-time");
  const progress = ctx.app.querySelector("#run-progress");
  const message = ctx.app.querySelector("#run-message");
  let timer = null, startedAt = null, ready = false, saved = false;
  function stop() { if (timer !== null) clearInterval(timer); timer = null; }
  function reset(text) {
    stop(); startedAt = null; ready = false;
    clock.textContent = `${seconds}s`; progress.value = 0;
    start.disabled = false; start.textContent = "Start run";
    restart.disabled = true; save.disabled = true;
    message.textContent = text;
  }
  function tick() {
    const elapsed = Math.min(seconds, (performance.now() - startedAt) / 1000);
    progress.value = elapsed;
    clock.textContent = `${Math.max(0, Math.ceil(seconds - elapsed))}s`;
    if (elapsed >= seconds) {
      stop(); ready = true; save.disabled = false;
      message.textContent = "Did you keep going? Save the run, or restart if you stopped.";
    }
  }
  start.onclick = () => {
    if (saved || timer !== null) return;
    startedAt = performance.now(); ready = false; start.disabled = true;
    restart.disabled = false; save.disabled = true;
    message.textContent = "Keep playing. Small mistakes are okay.";
    timer = setInterval(tick, 200);
  };
  restart.onclick = () => reset("Run reset. Start again when you are ready.");
  save.onclick = () => {
    if (!ready || saved) return;
    saved = true; stop(); start.disabled = true; restart.disabled = true; save.disabled = true;
    onComplete();
  };
  const onVisibility = () => {
    if (document.hidden && timer !== null) reset("Run reset while you were away. Return to the app and start when ready.");
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
}
export { sessionMarkup, wireSession };
