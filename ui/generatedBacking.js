// ui/generatedBacking.js
// Simple in-app backing generator (rock/blues picking feel)
// - No external deps, no YouTube
// - Uses song chordBlocks + bpm to generate drums + bass + light picking bed
// - Designed to be "good enough now" and upgradeable later (samples, better drums, etc.)

let ENGINE = null;

export function getGeneratedBacking() {
  if (ENGINE) return ENGINE;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = AudioCtx ? new AudioCtx() : null;

  // If no WebAudio support, return a safe no-op engine.
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

  // ---------------------------
  // Helpers: notes + chords
  // ---------------------------
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
    // A4 = 440, midi 69
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function parseChordRoot(chord) {
    if (!chord || typeof chord !== "string") return "A";
    const s = chord.trim();

    // Grab root like A, Bb, F#, etc.
    const m = s.match(/^([A-G])([#b])?/);
    if (!m) return "A";
    const root = m[1] + (m[2] || "");
    return NOTE_TO_SEMI[root] != null ? root : "A";
  }

  function rootMidi(rootNote, octave = 2) {
    // octave 2 => around bass range. MIDI: C0=12 so C2=36
    const semi = NOTE_TO_SEMI[rootNote];
    const baseC0 = 12;
    const cOct = baseC0 + 12 * octave; // C2 = 36
    return cOct + semi;
  }

  function beatsFromString(beatsPerBar) {
    // accepts "4 beats", "3", 4, etc.
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

  // ---------------------------
  // Sound building blocks
  // ---------------------------
  function makeGain(val) {
    const g = ctx.createGain();
    g.gain.value = val;
    g.connect(ctx.destination);
    return g;
  }

  function noiseBuffer() {
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    return buffer;
  }

  const NOISE = noiseBuffer();

  function playKick(t, out) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(g);
    g.connect(out);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  function playSnare(t, out) {
    const src = ctx.createBufferSource();
    src.buffer = NOISE;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1800, t);
    bp.Q.value = 0.8;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    src.connect(bp);
    bp.connect(g);
    g.connect(out);

    src.start(t);
    src.stop(t + 0.13);
  }

  function playHat(t, out, open = false) {
    const src = ctx.createBufferSource();
    src.buffer = NOISE;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(7000, t);

    const g = ctx.createGain();
    const dur = open ? 0.10 : 0.04;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(open ? 0.22 : 0.14, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(hp);
    hp.connect(g);
    g.connect(out);

    src.start(t);
    src.stop(t + dur + 0.01);
  }

  function playBass(t, out, freq, dur = 0.18) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g);
    g.connect(out);

    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playPick(t, out, freq, dur = 0.07) {
    // A slightly brighter pluck for "picking" feel
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g);
    g.connect(out);

    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // ---------------------------
  // Scheduler
  // ---------------------------
  let running = false;
  let bpm = 90;
  let groove = "rock_picking";

  let chordBlocks = [];
  let stepIndex = 0; // 16th note steps
  let nextTime = 0;

  let timer = null;
  const LOOKAHEAD_MS = 25;
  const SCHEDULE_AHEAD_SEC = 0.12;

  // Master mix
  const drumBus = makeGain(0.6);
  const bassBus = makeGain(0.7);
  const pickBus = makeGain(0.5);

  function secPerBeat() { return 60 / bpm; }
  function secPer16() { return secPerBeat() / 4; }

  function buildTimelineFromChordBlocks(blocks) {
    // Convert chordBlocks into a repeating "bars" timeline.
    // Each block gives chord + beats per bar.
    const bars = [];
    for (const b of (blocks || [])) {
      const chord = (b && b.chord) ? String(b.chord) : "A";
      const beats = beatsFromString(b && b.beatsPerBar);
      bars.push({ chord, beats });
    }
    return bars.length ? bars : [{ chord: "A", beats: 4 }, { chord: "D", beats: 4 }];
  }

  let bars = buildTimelineFromChordBlocks(chordBlocks);
  let total16PerLoop = 0;

  function recomputeLoop() {
    bars = buildTimelineFromChordBlocks(chordBlocks);
    total16PerLoop = bars.reduce((acc, bar) => acc + (bar.beats * 4), 0);
    if (total16PerLoop <= 0) total16PerLoop = 32;
  }

  function chordAtStep(step16) {
    // step16 in [0, total16PerLoop)
    let cur = 0;
    for (const bar of bars) {
      const span = bar.beats * 4;
      if (step16 < cur + span) return bar.chord;
      cur += span;
    }
    return bars[0]?.chord || "A";
  }

  function scheduleStep(t, step16) {
    // Pattern logic: rock vs blues shuffle
    const stepInBeat = step16 % 4; // 0..3
    const beatIndex = Math.floor(step16 / 4);

    // Bar/Chord
    const chord = chordAtStep(step16);
    const root = parseChordRoot(chord);
    const m = rootMidi(root, 2);
    const rootFreq = midiToFreq(m);
    const fifthFreq = midiToFreq(m + 7);

    // Drums:
    // Kick on beat 0 and 2, snare on 1 and 3 (4/4 feel)
    // Hats on 8ths
    if (stepInBeat === 0) {
      const b4 = beatIndex % 4;
      if (b4 === 0 || b4 === 2) playKick(t, drumBus);
      if (b4 === 1 || b4 === 3) playSnare(t, drumBus);
    }

    // hats on 8ths (step 0 and 2)
    if (stepInBeat === 0 || stepInBeat === 2) {
      // open hat on bar last beat sometimes for motion
      const open = (beatIndex % 8 === 7) && stepInBeat === 2;
      playHat(t, drumBus, open);
    }

    // Bass on beat start
    if (stepInBeat === 0) {
      playBass(t, bassBus, rootFreq, 0.20);
      // occasional fifth
      if ((beatIndex % 4) === 2) playBass(t + 0.02, bassBus, fifthFreq, 0.14);
    }

    // Picking bed
    if (groove === "blues_shuffle") {
      // shuffle-ish: hits on "1", "a" (step0, step3) and 8ths accent
      if (stepInBeat === 0) playPick(t, pickBus, rootFreq, 0.06);
      if (stepInBeat === 2) playPick(t + secPer16() * 0.35, pickBus, fifthFreq, 0.05);
      if (stepInBeat === 3) playPick(t, pickBus, rootFreq, 0.05);
    } else {
      // rock picking: consistent 8ths (step0 & step2), alternate root/fifth
      if (stepInBeat === 0) playPick(t, pickBus, rootFreq, 0.06);
      if (stepInBeat === 2) playPick(t, pickBus, fifthFreq, 0.06);
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

    // iOS/Android: AudioContext often starts suspended until user gesture.
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch (_) {}
    }

    // reset loop
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
