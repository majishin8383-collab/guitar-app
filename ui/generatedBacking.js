// ui/generatedBacking.js
// In-app backing generator (rock/blues picking feel)
// - Drums + bass + "guitar-ish" bed (powerchord chug)
// - One master bus for consistent volume across devices
// - Upgradeable later (samples, better drums, real guitar rendering)

let ENGINE = null;

export function getGeneratedBacking() {
  if (ENGINE) return ENGINE;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = AudioCtx ? new AudioCtx() : null;

  if (!ctx) {
    ENGINE = {
      supported: false,
      isRunning: () => false,
      start: async () => {},
      stop: () => {},
      setBpm: () => {}
    };
    return ENGINE;
  }

  /* ---------------------------
     Musical helpers
  --------------------------- */

  const NOTE_TO_SEMI = {
    C: 0, "C#": 1, Db: 1,
    D: 2, "D#": 3, Eb: 3,
    E: 4,
    F: 5, "F#": 6, Gb: 6,
    G: 7, "G#": 8, Ab: 8,
    A: 9, "A#": 10, Bb: 10,
    B: 11
  };

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function parseChordRoot(chord) {
    if (!chord || typeof chord !== "string") return "A";
    const s = chord.trim();
    const m = s.match(/^([A-G])([#b])?/);
    if (!m) return "A";
    const root = m[1] + (m[2] || "");
    return NOTE_TO_SEMI[root] != null ? root : "A";
  }

  function rootMidi(rootNote, octave = 2) {
    const semi = NOTE_TO_SEMI[rootNote];
    const baseC0 = 12;
    const cOct = baseC0 + 12 * octave; // C2=36
    return cOct + semi;
  }

  function beatsFromString(beatsPerBar) {
    if (typeof beatsPerBar === "number") return Math.max(1, Math.floor(beatsPerBar));
    if (typeof beatsPerBar === "string") {
      const n = parseInt(beatsPerBar, 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 4;
  }

  function pickGrooveFromStyle(style) {
    const s = (style || "").toLowerCase();
    if (s.includes("blues")) return "blues_shuffle";
    if (s.includes("shuffle")) return "blues_shuffle";
    return "rock_picking";
  }

  /* ---------------------------
     Audio graph
  --------------------------- */

  // One master bus (phones behave better this way)
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  // Soft limiter (prevents nasty clipping)
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.knee.value = 20;
  limiter.ratio.value = 8;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.08;
  limiter.connect(master);

  // Buses into limiter
  function bus(vol) {
    const g = ctx.createGain();
    g.gain.value = vol;
    g.connect(limiter);
    return g;
  }

  const drumBus = bus(0.75);
  const bassBus = bus(1.15); // 🔊 boosted
  const guitBus = bus(0.85); // 🔊 boosted

  // Noise buffer (hats/snare)
  function noiseBuffer() {
    const bufferSize = Math.floor(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    return buffer;
  }
  const NOISE = noiseBuffer();

  /* ---------------------------
     Drum synth
  --------------------------- */

  function playKick(t) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.09);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1.0, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(g);
    g.connect(drumBus);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  function playSnare(t) {
    const src = ctx.createBufferSource();
    src.buffer = NOISE;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1900, t);
    bp.Q.value = 0.9;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.75, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    src.connect(bp);
    bp.connect(g);
    g.connect(drumBus);

    src.start(t);
    src.stop(t + 0.16);
  }

  function playHat(t, open = false) {
    const src = ctx.createBufferSource();
    src.buffer = NOISE;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(7500, t);

    const g = ctx.createGain();
    const dur = open ? 0.11 : 0.045;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(open ? 0.24 : 0.16, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(hp);
    hp.connect(g);
    g.connect(drumBus);

    src.start(t);
    src.stop(t + dur + 0.01);
  }

  /* ---------------------------
     Bass synth (now audible)
  --------------------------- */

  function playBass(t, freq, dur = 0.22) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t);

    lp.type = "lowpass";
    lp.frequency.setValueAtTime(180, t);
    lp.Q.value = 0.7;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.95, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(lp);
    lp.connect(g);
    g.connect(bassBus);

    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  /* ---------------------------
     Guitar-ish bed (powerchord chug)
     Uses root + fifth with bandpass + mild drive
  --------------------------- */

  function makeDriveCurve(amount = 12) {
    // simple waveshaper curve
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / (n - 1) - 1;
      curve[i] = Math.tanh(amount * x);
    }
    return curve;
  }
  const DRIVE_CURVE = makeDriveCurve(8);

  function playGuitarChug(t, rootFreq, fifthFreq, dur = 0.075, accent = false) {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();

    // Shape & filtering to feel more "pick"
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1200, t);
    bp.Q.value = 0.9;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2600, t);
    lp.Q.value = 0.6;

    const shaper = ctx.createWaveShaper();
    shaper.curve = DRIVE_CURVE;
    shaper.oversample = "2x";

    o1.type = "square";
    o2.type = "square";
    o1.frequency.setValueAtTime(rootFreq, t);
    o2.frequency.setValueAtTime(fifthFreq, t);

    // Envelope (fast pick)
    const peak = accent ? 0.45 : 0.30;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.connect(bp);
    o2.connect(bp);
    bp.connect(shaper);
    shaper.connect(lp);
    lp.connect(g);
    g.connect(guitBus);

    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.02);
    o2.stop(t + dur + 0.02);
  }

  /* ---------------------------
     Scheduler
  --------------------------- */

  let running = false;
  let bpm = 90;
  let groove = "rock_picking";

  let chordBlocks = [];
  let stepIndex = 0; // 16th steps
  let nextTime = 0;

  let timer = null;
  const LOOKAHEAD_MS = 25;
  const SCHEDULE_AHEAD_SEC = 0.12;

  function secPerBeat() { return 60 / bpm; }
  function secPer16() { return secPerBeat() / 4; }

  function buildBars(blocks) {
    const bars = [];
    for (const b of (blocks || [])) {
      const chord = (b && b.chord) ? String(b.chord) : "A";
      const beats = beatsFromString(b && b.beatsPerBar);
      bars.push({ chord, beats });
    }
    return bars.length ? bars : [{ chord: "A", beats: 4 }, { chord: "D", beats: 4 }];
  }

  let bars = buildBars(chordBlocks);
  let total16PerLoop = 32;

  function recomputeLoop() {
    bars = buildBars(chordBlocks);
    total16PerLoop = bars.reduce((acc, bar) => acc + (bar.beats * 4), 0);
    if (total16PerLoop <= 0) total16PerLoop = 32;
  }

  function chordAtStep(step16) {
    let cur = 0;
    for (const bar of bars) {
      const span = bar.beats * 4;
      if (step16 < cur + span) return bar.chord;
      cur += span;
    }
    return bars[0]?.chord || "A";
  }

  function scheduleStep(t, step16) {
    const stepInBeat = step16 % 4; // 0..3
    const beatIndex = Math.floor(step16 / 4);

    const chord = chordAtStep(step16);
    const root = parseChordRoot(chord);
    const m = rootMidi(root, 2);
    const rootFreq = midiToFreq(m);
    const fifthFreq = midiToFreq(m + 7);

    // Drums: kick on 1+3, snare on 2+4 feel
    if (stepInBeat === 0) {
      const b4 = beatIndex % 4;
      if (b4 === 0 || b4 === 2) playKick(t);
      if (b4 === 1 || b4 === 3) playSnare(t);
    }

    // Hats on 8ths
    if (stepInBeat === 0 || stepInBeat === 2) {
      const open = (beatIndex % 8 === 7) && stepInBeat === 2;
      playHat(t, open);
    }

    // Bass on beat starts + a little movement
    if (stepInBeat === 0) {
      playBass(t, rootFreq, 0.24);
      if ((beatIndex % 4) === 2) playBass(t + 0.02, fifthFreq, 0.16);
    }

    // Guitar-ish layer
    if (groove === "blues_shuffle") {
      // shuffle: hit on step0, delayed step2-ish, then step3
      if (stepInBeat === 0) playGuitarChug(t, rootFreq, fifthFreq, 0.07, true);
      if (stepInBeat === 2) playGuitarChug(t + secPer16() * 0.35, rootFreq, fifthFreq, 0.06, false);
      if (stepInBeat === 3) playGuitarChug(t, rootFreq, fifthFreq, 0.055, false);
    } else {
      // rock: chug 8ths (step0 & step2), accent on downbeats
      if (stepInBeat === 0) playGuitarChug(t, rootFreq, fifthFreq, 0.075, (beatIndex % 4) === 0);
      if (stepInBeat === 2) playGuitarChug(t, rootFreq, fifthFreq, 0.065, false);
    }
  }

  function scheduler() {
    if (!running) return;
    const now = ctx.currentTime;
    while (nextTime < now + SCHEDULE_AHEAD_SEC) {
      scheduleStep(nextTime, stepIndex);
      stepIndex = (stepIndex + 1) % total16PerLoop;
      nextTime += secPer16();
    }
  }

  async function start({ bpm: newBpm, chordBlocks: blocks, style }) {
    bpm = (typeof newBpm === "number" && newBpm > 20) ? newBpm : bpm;
    groove = pickGrooveFromStyle(style);

    chordBlocks = Array.isArray(blocks) ? blocks : chordBlocks;
    recomputeLoop();

    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch (_) {}
    }

    stepIndex = 0;
    nextTime = ctx.currentTime + 0.02;

    if (running) return;
    running = true;

    timer = setInterval(scheduler, LOOKAHEAD_MS);
  }

  function stop() {
    running = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function setBpm(newBpm) {
    if (typeof newBpm === "number" && newBpm > 20) bpm = newBpm;
  }

  ENGINE = {
    supported: true,
    isRunning: () => running,
    start,
    stop,
    setBpm
  };

  return ENGINE;
}
