// backing.js — backing track audio engine (small + stable)
// Modes:
// 1) track.audioUrl -> HTMLAudioElement playback (mp3/ogg hosted by you)
// 2) track.generator -> WebAudio generated backing (no files needed)
//
// Goals:
// - Deterministic UI state (play/pause flips immediately)
// - Loop + Stop
// - Volume + Mute (engine only; UI later if desired)

export function createBackingPlayer() {
  // ---------------------------
  // Shared state (UI reads this)
  // ---------------------------
  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false,
    volume: 0.85,
    muted: false,

    // generator-specific (optional)
    mode: null, // "file" | "gen" | null
    bpm: 90,
    key: "A",
    mix: "rhythm" // "rhythm" | "lead"
  };

  // ---------------------------
  // FILE (mp3) player
  // ---------------------------
  const audio = new Audio();
  audio.preload = "auto";

  audio.addEventListener("ended", () => {
    if (!state.isLoop && state.mode === "file") state.isPlaying = false;
  });

  audio.addEventListener("error", () => {
    const code = audio.error ? audio.error.code : "unknown";
    console.warn("[Backing:file] audio error:", code, "src:", audio.src);
    state.isPlaying = false;
  });

  function resolveUrl(url) {
    try { return new URL(url, window.location.href).toString(); }
    catch { return url; }
  }

  function applyFile() {
    audio.loop = !!state.isLoop;
    audio.volume = clamp01(state.volume);
    audio.muted = !!state.muted;
  }

  async function playFile(track) {
    if (!track || !track.audioUrl) return;

    if (state.trackId !== track.id || state.mode !== "file") {
      audio.src = resolveUrl(track.audioUrl);
      try { audio.currentTime = 0; } catch {}
      state.trackId = track.id;
      state.mode = "file";
    }

    applyFile();

    // flip immediately so UI can show Pause right away
    state.isPlaying = true;

    try {
      const p = audio.play();
      if (p && typeof p.then === "function") await p;
      state.isPlaying = true;
    } catch (e) {
      console.warn("[Backing:file] audio play failed:", e, "src:", audio.src);
      state.isPlaying = false;
    }
  }

  function pauseFile() {
    try { audio.pause(); } catch {}
    state.isPlaying = false;
  }

  function stopFile() {
    try { audio.pause(); } catch {}
    try { audio.currentTime = 0; } catch {}
  }

  // ---------------------------
  // GENERATOR (Web Audio)
  // ---------------------------
  let ac = null;
  let gen = null; // current generator instance

  function ensureAC() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ac;
  }

  function applyGen() {
    if (!gen) return;
    gen.setLoop(!!state.isLoop);
    gen.setVolume(clamp01(state.volume));
    gen.setMuted(!!state.muted);
    gen.setBpm(Number(state.bpm) || 90);
    gen.setKey(state.key || "A");
    gen.setMix(state.mix || "rhythm");
  }

  function playGen(track) {
    const g = track && track.generator ? track.generator : null;
    if (!g) return;

    // Stop file mode if active
    if (state.mode === "file") stopFile();

    // Build/replace generator if new track or different style
    const style = g.style || "blues_shuffle_12bar";
    const bpm = Number(g.bpm || state.bpm || 90);
    const key = g.key || state.key || "A";
    const mix = g.mix || state.mix || "rhythm";

    const needNew =
      !gen ||
      state.trackId !== track.id ||
      state.mode !== "gen" ||
      gen.style !== style;

    if (needNew) {
      stopGen(); // safe
      gen = createGenerator(ensureAC(), style);
      state.trackId = track.id;
      state.mode = "gen";
    }

    // Persist generator parameters into state (so UI can show it later)
    state.bpm = bpm;
    state.key = key;
    state.mix = mix;

    applyGen();

    // flip immediately
    state.isPlaying = true;
    gen.start();
  }

  function pauseGen() {
    if (!gen) return;
    gen.pause();
    state.isPlaying = false;
  }

  function stopGen() {
    if (!gen) return;
    gen.stop();
    gen = null;
  }

  // ---------------------------
  // Public controls
  // ---------------------------
  function setLoop(on) {
    state.isLoop = !!on;
    // apply to whichever mode is active
    if (state.mode === "file") applyFile();
    applyGen();
  }

  function setVolume(v) {
    state.volume = clamp01(v);
    if (state.mode === "file") applyFile();
    applyGen();
  }

  function setMuted(on) {
    state.muted = !!on;
    if (state.mode === "file") applyFile();
    applyGen();
  }

  // Optional (won't break anything if unused yet)
  function setBpm(bpm) {
    state.bpm = clampBpm(bpm);
    applyGen();
  }

  function setKey(key) {
    state.key = normalizeKey(key || "A");
    applyGen();
  }

  function setMix(mix) {
    state.mix = (mix === "lead") ? "lead" : "rhythm";
    applyGen();
  }

  function stop() {
    if (state.mode === "file") stopFile();
    if (state.mode === "gen") stopGen();
    state.isPlaying = false;
    state.trackId = null;
    state.mode = null;
  }

  function pause() {
    if (state.mode === "file") pauseFile();
    if (state.mode === "gen") pauseGen();
    state.isPlaying = false;
  }

  function toggle(track) {
    // If track has generator, treat as gen mode.
    const wantsGen = !!(track && track.generator);
    const wantsFile = !!(track && track.audioUrl);

    if (!wantsGen && !wantsFile) return;

    const same = state.trackId === track.id;

    // Same track + playing -> pause
    if (same && state.isPlaying) {
      pause();
      return;
    }

    // Otherwise start
    if (wantsGen) playGen(track);
    else playFile(track);
  }

  // Initialize file player params
  applyFile();

  return {
    state,
    toggle,
    stop,
    pause,
    setLoop,
    setVolume,
    setMuted,

    // optional future controls
    setBpm,
    setKey,
    setMix
  };
}

// ---------------------------
// Generator implementations
// ---------------------------
function createGenerator(ac, style) {
  const g = {
    style,
    isLoop: true,
    volume: 0.85,
    muted: false,
    bpm: 90,
    key: "A",
    mix: "rhythm",
    _isRunning: false,
    _timer: null,
    _nextTime: 0
  };

  // master gain
  const master = ac.createGain();
  master.gain.value = 0.85;
  master.connect(ac.destination);

  // sub-mix gains
  const drumsGain = ac.createGain();
  const bassGain = ac.createGain();
  const rhythmGain = ac.createGain();

  drumsGain.connect(master);
  bassGain.connect(master);
  rhythmGain.connect(master);

  function apply() {
    const vol = g.muted ? 0 : clamp01(g.volume);
    master.gain.setTargetAtTime(vol, ac.currentTime, 0.01);
    // rhythm layer only on lead mix
    rhythmGain.gain.setTargetAtTime(g.mix === "lead" ? 0.18 : 0.0, ac.currentTime, 0.01);
    drumsGain.gain.setTargetAtTime(0.35, ac.currentTime, 0.01);
    bassGain.gain.setTargetAtTime(0.45, ac.currentTime, 0.01);
  }

  g.setLoop = (on) => { g.isLoop = !!on; };
  g.setVolume = (v) => { g.volume = clamp01(v); apply(); };
  g.setMuted = (on) => { g.muted = !!on; apply(); };
  g.setBpm = (bpm) => { g.bpm = clampBpm(bpm); };
  g.setKey = (key) => { g.key = normalizeKey(key); };
  g.setMix = (mix) => { g.mix = (mix === "lead") ? "lead" : "rhythm"; apply(); };

  g.start = () => {
    if (g._isRunning) return;
    // Some browsers require resume on user gesture; toggle click counts as gesture
    if (ac.state === "suspended") ac.resume().catch(() => {});
    g._isRunning = true;
    g._nextTime = ac.currentTime + 0.05;
    apply();
    g._timer = setInterval(() => tick(), 25);
  };

  g.pause = () => {
    if (!g._isRunning) return;
    g._isRunning = false;
    if (g._timer) clearInterval(g._timer);
    g._timer = null;
  };

  g.stop = () => {
    g.pause();
  };

  // --- musical helpers ---
  function tick() {
    if (!g._isRunning) return;

    const spb = 60 / Math.max(30, g.bpm); // seconds per beat
    const lookahead = 0.20;

    while (g._nextTime < ac.currentTime + lookahead) {
      scheduleStep(g._nextTime, spb);
      // 8th-note grid for shuffle/slow blues
      g._nextTime += spb / 2;
    }
  }

  // progress counters for 12-bar
  let bar = 0;
  let halfBeat = 0; // 8th note counter within bar

  function scheduleStep(t, spb) {
    // 4/4 bar has 8 half-beats
    const stepInBar = halfBeat % 8;

    // Determine current chord root (12-bar I-IV-V)
    const prog = (style === "blues_slow_12bar") ? slow12Bar() : shuffle12Bar();
    const chordDegree = prog[bar % 12]; // 1,4,5
    const rootHz = keyDegreeToHz(g.key, chordDegree, 2); // bass octave

    // DRUMS
    // hi-hat every 8th (with light swing in shuffle style)
    const swing = (style === "blues_shuffle_12bar") ? 0.08 : 0.0;
    const hatTime = t + (stepInBar % 2 === 1 ? swing * (spb / 2) : 0);
    schedHat(hatTime, 0.05);

    // kick on 1 & 3 (beats 1,3 => step 0 and 4)
    if (stepInBar === 0 || stepInBar === 4) schedKick(t, 0.10);

    // snare on 2 & 4 (beat 2,4 => step 2 and 6)
    if (stepInBar === 2 || stepInBar === 6) schedSnare(t, 0.09);

    // BASS (simple roots on beats 1 and 3, plus pickup on 4&)
    if (stepInBar === 0 || stepInBar === 4) schedBass(t, rootHz, 0.18, 0.14);
    if (style === "blues_shuffle_12bar" && stepInBar === 7) {
      // quick walk-up hint (a fifth above)
      schedBass(t, rootHz * 1.4983, 0.10, 0.10);
    }

    // RHYTHM GUITAR BED (lead mix only)
    if (g.mix === "lead") {
      // light chord hit on beats 2 and 4
      if (stepInBar === 2 || stepInBar === 6) schedRhythmChord(t, rootHz, 0.12);
    }

    // advance counters
    halfBeat++;
    if (halfBeat % 8 === 0) {
      bar++;
      if (!g.isLoop && bar >= 12) {
        // stop after one chorus if loop is off
        g.stop();
      }
    }
  }

  function shuffle12Bar() {
    // I I I I / IV IV I I / V IV I I
    return [1,1,1,1, 4,4,1,1, 5,4,1,1];
  }

  function slow12Bar() {
    // similar, just “feel” slower via bpm (style name helps later expansions)
    return [1,1,1,1, 4,4,1,1, 5,4,1,1];
  }

  // --- sound design (simple but usable) ---
  function schedHat(t, dur) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuffer(ac);
    const f = ac.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 6000;

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0, t);
    env.gain.linearRampToValueAtTime(0.10, t + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    n.connect(f);
    f.connect(env);
    env.connect(drumsGain);

    n.start(t);
    n.stop(t + dur);
  }

  function schedSnare(t, dur) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuffer(ac);
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800;

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0, t);
    env.gain.linearRampToValueAtTime(0.20, t + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    n.connect(f);
    f.connect(env);
    env.connect(drumsGain);

    n.start(t);
    n.stop(t + dur);
  }

  function schedKick(t, dur) {
    const osc = ac.createOscillator();
    osc.type = "sine";

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    // pitch drop
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + dur);

    osc.connect(env);
    env.connect(drumsGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  function schedBass(t, freq, dur, amp) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, amp), t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(env);
    env.connect(bassGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  function schedRhythmChord(t, rootHz, dur) {
    // simple “guitar-ish” bed: filtered noise + a couple detuned saws
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    // filtered noise for pick attack
    const n = ac.createBufferSource();
    n.buffer = noiseBuffer(ac);

    const nf = ac.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 1200;

    // chord tones (root + 5th + b7-ish color)
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const o3 = ac.createOscillator();
    o1.type = "sawtooth";
    o2.type = "sawtooth";
    o3.type = "triangle";

    const root = rootHz * 4; // guitar-ish octave
    o1.frequency.setValueAtTime(root, t);
    o2.frequency.setValueAtTime(root * 1.4983, t); // 5th
    o3.frequency.setValueAtTime(root * 1.7818, t); // ~b7

    // mild detune
    o1.detune.setValueAtTime(-6, t);
    o2.detune.setValueAtTime(5, t);
    o3.detune.setValueAtTime(2, t);

    const f = ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(2200, t);

    // routing
    n.connect(nf);
    nf.connect(env);

    o1.connect(f);
    o2.connect(f);
    o3.connect(f);
    f.connect(env);

    env.connect(rhythmGain);

    n.start(t);
    n.stop(t + dur);

    o1.start(t);
    o2.start(t);
    o3.start(t);
    o1.stop(t + dur);
    o2.stop(t + dur);
    o3.stop(t + dur);
  }

  // expose for cleanup if needed later
  g._dispose = () => {
    try { master.disconnect(); } catch {}
  };

  apply();
  return g;
}

// ---------------------------
// Helpers
// ---------------------------
let _noiseBuf = null;
function noiseBuffer(ac) {
  if (_noiseBuf && _noiseBuf.sampleRate === ac.sampleRate) return _noiseBuf;
  const len = Math.floor(ac.sampleRate * 1.0);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  _noiseBuf = buf;
  return buf;
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0.85;
  return Math.max(0, Math.min(1, x));
}

function clampBpm(bpm) {
  const x = Number(bpm);
  if (!Number.isFinite(x)) return 90;
  return Math.max(40, Math.min(220, x));
}

function normalizeKey(k) {
  const s = String(k || "A").trim();
  if (!s) return "A";
  // unify flats
  const up = s.toUpperCase();
  // Accept like "Bb" or "BB" -> "Bb"
  if (up.length === 2 && up[1] === "B") return up[0] + "b";
  if (up.length === 2 && up[1] === "#") return up[0] + "#";
  return up[0];
}

function keyDegreeToHz(key, degree, octave) {
  // degree: 1,4,5 for I/IV/V (major-ish)
  const rootMidi = keyToMidi(normalizeKey(key), octave);
  const deg = Number(degree) || 1;
  const semis =
    deg === 4 ? 5 :
    deg === 5 ? 7 :
    0;
  return midiToHz(rootMidi + semis);
}

function keyToMidi(key, octave) {
  // octave: 0..8, where A4=440 is midi 69 (octave 4)
  const map = {
    "C": 0, "C#": 1, "Db": 1,
    "D": 2, "D#": 3, "Eb": 3,
    "E": 4,
    "F": 5, "F#": 6, "Gb": 6,
    "G": 7, "G#": 8, "Ab": 8,
    "A": 9, "A#": 10, "Bb": 10,
    "B": 11
  };
  const k = key.length === 2 && key[1] === "b" ? key[0].toUpperCase() + "b"
          : key.length === 2 && key[1] === "#" ? key[0].toUpperCase() + "#"
          : key[0].toUpperCase();
  const semis = map[k] ?? 9; // default A
  const oct = Number.isFinite(Number(octave)) ? Number(octave) : 2;
  return (oct + 1) * 12 + semis; // midi formula
}

function midiToHz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}
