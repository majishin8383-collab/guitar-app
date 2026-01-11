// backing.js — generator backing-track engine (no mp3 required)
// - WebAudio drums + bass (+ optional rhythm bed for "lead" mix)
// - Deterministic UI state (flip immediately)
// - Loop + Stop
// - Volume + Mute
//
// Track format supported:
//   track.generator: { style: "blues_shuffle_12bar" | "blues_slow_12bar", bpm, key, mix: "rhythm" | "lead" }
// Optional:
//   track.audioUrl: fallback if you ever add real audio files later (not used here)

export function createBackingPlayer() {
  // Public state (UI reads this)
  const state = {
    trackId: null,
    isPlaying: false,
    isLoop: false,
    volume: 0.85,
    muted: false
  };

  // WebAudio core
  let ac = null;
  let master = null;
  let limiter = null;

  // Current playback session (generator)
  let session = null;

  // Small helpers
  const clamp01 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0.85;
    return Math.max(0, Math.min(1, x));
  };

  function ensureAudio() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();

    master = ac.createGain();
    limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;

    master.connect(limiter);
    limiter.connect(ac.destination);

    apply();
  }

  function apply() {
    if (!master) return;
    const vol = state.muted ? 0 : clamp01(state.volume);
    master.gain.setValueAtTime(vol, ac ? ac.currentTime : 0);
  }

  function setLoop(on) {
    state.isLoop = !!on;
  }

  function setVolume(v) {
    state.volume = clamp01(v);
    apply();
  }

  function setMuted(on) {
    state.muted = !!on;
    apply();
  }

  function pause() {
    // For generator: pause = stop (simple + stable)
    stop();
  }

  function stop() {
    // Stop generator session if any
    if (session) {
      session.stop();
      session = null;
    }
    state.isPlaying = false;
    state.trackId = null;
  }

  async function playTrack(track) {
    if (!track) return;

    // Generator path
    if (track.generator && typeof track.generator === "object") {
      ensureAudio();
      if (ac.state === "suspended") {
        try { await ac.resume(); } catch {}
      }

      // If switching tracks, stop old session
      if (state.trackId && state.trackId !== track.id) stop();

      // Flip immediately for UI
      state.trackId = track.id;
      state.isPlaying = true;

      try {
        session = createGeneratorSession(ac, master, track.generator, () => {
          // called when naturally ended (loop off)
          state.isPlaying = false;
          state.trackId = null;
          session = null;
        });

        session.setLoop(state.isLoop);
        session.start();
        return;
      } catch (e) {
        console.warn("[Backing] generator play failed:", e);
        state.isPlaying = false;
        state.trackId = null;
        session = null;
        return;
      }
    }

    // Optional audioUrl fallback (if you ever add MP3 later)
    if (track.audioUrl) {
      console.warn("[Backing] audioUrl present but generator engine is enabled. Add MP3 support if needed.");
      return;
    }
  }

  function toggle(track) {
    if (!track) return;

    const same = state.trackId === track.id;
    if (same && state.isPlaying) {
      pause();
    } else {
      playTrack(track);
    }
  }

  return {
    state,
    toggle,
    stop,
    pause,
    setLoop,
    setVolume,
    setMuted
  };
}

/* --------------------------
   Generator session (12-bar)
-------------------------- */

function createGeneratorSession(ac, outNode, gen, onEnded) {
  const bpm = clampNum(gen.bpm, 60, 220, 90);
  const style = String(gen.style || "");
  const key = String(gen.key || "A").toUpperCase();
  const mix = gen.mix === "lead" ? "lead" : "rhythm";

  // timing
  const beatSec = 60 / bpm;
  const barBeats = 4;
  const bars = 12;
  const totalBeats = bars * barBeats;
  const totalSec = totalBeats * beatSec;

  // scheduler
  const lookahead = 0.10;
  const tickMs = 25;

  let startedAt = 0;
  let nextNoteTime = 0;
  let nextStep = 0; // 0..(stepsPerLoop-1)
  let playing = false;
  let loopOn = false;
  let timer = null;

  // steps: we schedule 8th-notes for shuffle/slow
  const stepsPerBeat = 2; // 8ths
  const stepsPerBar = barBeats * stepsPerBeat; // 8 steps
  const stepsPerLoop = bars * stepsPerBar; // 96 steps

  // very small instrument kit
  const kit = createKit(ac, outNode);

  // 12-bar progression for blues: I I I I | IV IV I I | V IV I V
  const prog = build12BarBlues(key);

  function start() {
    if (playing) return;
    playing = true;

    startedAt = ac.currentTime + 0.03;
    nextNoteTime = startedAt;
    nextStep = 0;

    timer = setInterval(scheduler, tickMs);

    // If loop is OFF, stop at end of the 12 bars
    if (!loopOn) {
      const stopAt = startedAt + totalSec + 0.05;
      scheduleOneShotStop(stopAt);
    }
  }

  function setLoop(on) {
    loopOn = !!on;
  }

  function stop() {
    if (!playing) return;
    playing = false;

    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function scheduleOneShotStop(when) {
    // Stop without drift: use AudioContext timeouts
    const ms = Math.max(0, (when - ac.currentTime) * 1000);
    window.setTimeout(() => {
      // If loop got turned ON in the meantime, do nothing
      if (!playing) return;
      if (loopOn) return;

      stop();
      if (typeof onEnded === "function") onEnded();
    }, ms);
  }

  function scheduler() {
    if (!playing) return;

    while (nextNoteTime < ac.currentTime + lookahead) {
      scheduleStep(nextStep, nextNoteTime);
      advance();
    }
  }

  function advance() {
    const stepSec = beatSec / stepsPerBeat;
    nextNoteTime += stepSec;
    nextStep += 1;

    if (nextStep >= stepsPerLoop) {
      if (loopOn) {
        // wrap cleanly
        nextStep = 0;
        // keep nextNoteTime continuous (no reset), prevents clicks/gaps
      } else {
        // will end via one-shot stop (scheduled at start)
        nextStep = stepsPerLoop; // hold
      }
    }
  }

  function scheduleStep(stepIdx, t) {
    // Determine bar + beat within bar
    const bar = Math.floor(stepIdx / stepsPerBar); // 0..11
    const stepInBar = stepIdx % stepsPerBar; // 0..7
    const beatInBar = Math.floor(stepInBar / stepsPerBeat); // 0..3
    const eighthInBeat = stepInBar % stepsPerBeat; // 0 or 1

    // Determine chord/root for this bar
    const chord = prog[bar]; // { rootHz, fifthHz, seventhHz }
    const isDownbeat = (eighthInBeat === 0);

    // DRUMS
    if (style === "blues_shuffle_12bar") {
      // swing feel: accent on downbeats, light on offbeats
      // kick: beats 1 & 3
      if (isDownbeat && (beatInBar === 0 || beatInBar === 2)) kit.kick(t, 0.95);
      // snare: beats 2 & 4
      if (isDownbeat && (beatInBar === 1 || beatInBar === 3)) kit.snare(t, 0.85);
      // hat: every 8th, offbeat a bit quieter
      kit.hat(t, eighthInBeat === 0 ? 0.45 : 0.28);
    } else if (style === "blues_slow_12bar") {
      // slower vibe: quarter ride + backbeat
      if (isDownbeat) {
        if (beatInBar === 0 || beatInBar === 2) kit.kick(t, 0.90);
        if (beatInBar === 1 || beatInBar === 3) kit.snare(t, 0.80);
        kit.ride(t, 0.35);
      }
      // subtle hat on off 8ths
      if (!isDownbeat) kit.hat(t, 0.18);
    } else {
      // unknown style fallback
      if (isDownbeat && beatInBar === 0) kit.kick(t, 0.85);
      if (isDownbeat && beatInBar === 2) kit.snare(t, 0.70);
      kit.hat(t, 0.22);
    }

    // BASS (roots on beat 1 + walking-ish on beat 3)
    if (isDownbeat) {
      if (beatInBar === 0) kit.bass(t, chord.rootHz, 0.80);
      if (beatInBar === 2) kit.bass(t, chord.fifthHz, 0.70);
    }

    // LEAD MIX: simple rhythm bed (very light)
    if (mix === "lead") {
      if (style === "blues_shuffle_12bar") {
        // light chord stab on offbeat 8ths
        if (!isDownbeat) kit.rhythmStab(t, chord, 0.16);
      } else if (style === "blues_slow_12bar") {
        // slow comp: hit on beat 1 and 3 softly
        if (isDownbeat && (beatInBar === 0 || beatInBar === 2)) kit.rhythmStab(t, chord, 0.18);
      }
    }
  }

  return { start, stop, setLoop };
}

function clampNum(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function noteHz(note) {
  // A4 = 440. Basic mapping for roots we use (E, A, C, G) in guitar-friendly octaves.
  // You can extend later.
  const map = {
    "E": 82.4069,  // E2
    "A": 110.0,    // A2
    "C": 130.8128, // C3
    "G": 98.0      // G2-ish
  };
  return map[note] || 110.0;
}

function build12BarBlues(key) {
  // I-IV-V in that key; we only need bass roots and chord tones.
  // For simplicity we treat:
  //   I = key
  //   IV = key + 5 semitones
  //   V = key + 7 semitones
  // But since we only use E/A/C/G right now, we’ll hard-map IV/V roots for those keys.
  const I = key;
  const IV = ({ E:"A", A:"D", C:"F", G:"C" }[key] || "A");
  const V  = ({ E:"B", A:"E", C:"G", G:"D" }[key] || "E");

  const bars = [I,I,I,I, IV,IV, I,I, V,IV, I,V];
  return bars.map(rootNote => {
    const r = noteHz(rootNote);
    return {
      rootHz: r,
      fifthHz: r * 1.5,    // perfect 5th
      seventhHz: r * 1.7818 // approx minor 7th ratio
    };
  });
}

function createKit(ac, outNode) {
  const mix = ac.createGain();
  mix.gain.value = 1.0;
  mix.connect(outNode);

  // shared noise buffer
  const noiseBuf = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);

  function envGain(t, a, d, peak, end) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, end), t + a + d);
    return g;
  }

  function kick(t, amt) {
    const o = ac.createOscillator();
    o.type = "sine";
    const g = envGain(t, 0.002, 0.18, 0.9 * amt, 0.0001);

    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.16);

    o.connect(g);
    g.connect(mix);

    o.start(t);
    o.stop(t + 0.22);
  }

  function snare(t, amt) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuf;

    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(900, t);

    const g = envGain(t, 0.001, 0.12, 0.45 * amt, 0.0001);

    n.connect(hp);
    hp.connect(g);
    g.connect(mix);

    n.start(t);
    n.stop(t + 0.16);
  }

  function hat(t, amt) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuf;

    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(9000, t);
    bp.Q.setValueAtTime(1.2, t);

    const g = envGain(t, 0.001, 0.05, 0.22 * amt, 0.0001);

    n.connect(bp);
    bp.connect(g);
    g.connect(mix);

    n.start(t);
    n.stop(t + 0.07);
  }

  function ride(t, amt) {
    const n = ac.createBufferSource();
    n.buffer = noiseBuf;

    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(5500, t);
    bp.Q.setValueAtTime(0.9, t);

    const g = envGain(t, 0.002, 0.18, 0.18 * amt, 0.0001);

    n.connect(bp);
    bp.connect(g);
    g.connect(mix);

    n.start(t);
    n.stop(t + 0.22);
  }

  function bass(t, hz, amt) {
    const o = ac.createOscillator();
    o.type = "triangle";
    const g = envGain(t, 0.005, 0.20, 0.30 * amt, 0.0001);

    // a touch of lowpass warmth
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(700, t);

    o.frequency.setValueAtTime(hz, t);

    o.connect(lp);
    lp.connect(g);
    g.connect(mix);

    o.start(t);
    o.stop(t + 0.28);
  }

  function rhythmStab(t, chord, amt) {
    const o = ac.createOscillator();
    o.type = "sawtooth";

    const g = envGain(t, 0.002, 0.10, 0.20 * amt, 0.0001);

    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1400, t);

    // simple dyad-ish: root-ish
    o.frequency.setValueAtTime(chord.rootHz * 2, t);

    o.connect(lp);
    lp.connect(g);
    g.connect(mix);

    o.start(t);
    o.stop(t + 0.14);
  }

  return { kick, snare, hat, ride, bass, rhythmStab };
}
