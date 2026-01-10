// metronome.js
// Simple click metronome using Web Audio API (Dose 1.2)

export function createMetronome() {
  let ctx = null;
  let running = false;
  let bpm = 80;
  let timer = null;

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Some browsers start suspended until a user gesture.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  function click() {
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 1200;

    // very short click envelope
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  function loop() {
    if (!running) return;
    click();

    const intervalMs = Math.max(10, Math.round(60000 / bpm));
    timer = window.setTimeout(loop, intervalMs);
  }

  function start(nextBpm) {
    ensureCtx();
    if (typeof nextBpm === "number" && isFinite(nextBpm)) {
      bpm = Math.max(30, Math.round(nextBpm));
    }

    stop(); // guarantee single instance
    running = true;
    loop();
  }

  function stop() {
    running = false;
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function setBpm(nextBpm) {
    if (typeof nextBpm !== "number" || !isFinite(nextBpm)) return;
    bpm = Math.max(30, Math.round(nextBpm));
  }

  return {
    start,
    stop,
    setBpm,
    isRunning: () => running,
    getBpm: () => bpm
  };
}
