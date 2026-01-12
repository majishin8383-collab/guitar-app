// app.js (module) — small router + state + helpers
import { loadState, saveState } from "./storage.js";
import {
  getOrInitDrillProgress,
  setDrillBpm,
  markCleanRep,
  markSloppyRep,
  resetDrillProgress
} from "./progress.js";
import { renderHome, renderGenre, renderPractice, renderSkill } from "./render.js";
import { createMetronome } from "./metronome.js";

const app = document.getElementById("app");
const C = window.CONTENT;

const DEFAULT_STATE = {
  genre: "blues",
  role: "rhythm",          // "rhythm" | "lead"
  handedness: "right",     // "right" | "left"
  mirrorVideos: false,     // drill-video mirror preference
  progress: {},

  // backing track UI state
  btSelectedId: null,      // dropdown selection
  btPlayingId: null,       // currently "playing" track (embedded)
  btIsPlaying: false       // whether to show/embed it as playing
};

let state = loadState(DEFAULT_STATE);

// guard for shallow merges / missing keys
state = state && typeof state === "object" ? state : { ...DEFAULT_STATE };
state.progress = state.progress || {};
if (!state.role) state.role = "rhythm";
if (!("btSelectedId" in state)) state.btSelectedId = null;
if (!("btPlayingId" in state)) state.btPlayingId = null;
if (!("btIsPlaying" in state)) state.btIsPlaying = false;

function persist() { saveState(state); }

function handednessLabel() {
  return state.handedness === "left" ? "Left-handed" : "Right-handed";
}
function roleLabel() { return state.role === "lead" ? "Lead" : "Rhythm"; }

function ensureMirrorDefault() {
  if (state.handedness === "left" && state.mirrorVideos !== true) {
    state.mirrorVideos = true;
    persist();
  }
}

// Drill video helper (unchanged)
function safeEmbed(url) {
  if (!url || typeof url !== "string") return null;
  const ok =
    url.startsWith("https://www.youtube.com/embed/") ||
    url.startsWith("https://youtube.com/embed/");
  return ok ? url : null;
}

function videoBlock(label, url, mirrorOn) {
  const safe = safeEmbed(url);
  if (!safe) {
    return `
      <div class="videoCard">
        <div class="videoLabel">${label}</div>
        <div class="muted">No video set yet.</div>
      </div>
    `;
  }
  const mirrorClass = mirrorOn ? "mirror" : "";
  return `
    <div class="videoCard">
      <div class="videoLabel">${label}</div>
      <div class="videoWrap ${mirrorClass}">
        <iframe
          src="${safe}"
          title="${label}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      ${mirrorOn ? `<div class="muted" style="margin-top:8px;">Mirrored for left-handed viewing.</div>` : ""}
    </div>
  `;
}

// Navigation
const nav = {
  home: () => renderHome(ctx()),
  genre: (id) => renderGenre(ctx(), id),
  practice: () => renderPractice(ctx()),
  skill: (skillId, opts) => renderSkill(ctx(), skillId, opts)
};

// Progress wrapper
const progress = {
  getOrInit: (s, d) => getOrInitDrillProgress(s, d, persist),
  setBpm: (s, d, bpm) => setDrillBpm(s, d, bpm, persist),
  clean: (s, d) => markCleanRep(s, d, persist),
  sloppy: (s, d) => markSloppyRep(s, d, persist),
  reset: (s, d) => resetDrillProgress(s, d, persist)
};

// Metronome
const metro = createMetronome();
const metroState = { drillId: null };

function metroToggle(drillId, bpm) {
  if (metro.isRunning() && metroState.drillId === drillId) {
    metro.stop(); metroState.drillId = null; return;
  }
  metroState.drillId = drillId;
  metro.start(bpm);
}
function metroSetBpmIfActive(drillId, bpm) {
  if (!metro.isRunning()) return;
  if (metroState.drillId !== drillId) return;
  metro.setBpm(bpm);
}
function metroStopIfOwnedBy(drillId) {
  if (!metro.isRunning()) return;
  if (metroState.drillId !== drillId) return;
  metro.stop(); metroState.drillId = null;
}

// Backing tracks — IN-APP ONLY (persisted)
// Render.js is responsible for embedding the video when playing.
const backingState = {
  get trackId() { return state.btPlayingId; },
  get isPlaying() { return !!state.btIsPlaying; }
};

function backingSetSelected(id) {
  state.btSelectedId = id || null;
  persist();
}

function backingToggle(track) {
  if (!track) return;

  // keep selection aligned with what user is interacting with
  if (track.id && state.btSelectedId !== track.id) {
    state.btSelectedId = track.id;
  }

  const same = state.btPlayingId === track.id;

  if (same) {
    // toggle play/pause on same track
    state.btIsPlaying = !state.btIsPlaying;

    // if paused, we keep btPlayingId so UI can show selection as current
    persist();
    return;
  }

  // switch to new track and start playing
  state.btPlayingId = track.id;
  state.btIsPlaying = true;
  persist();
}

function backingStop() {
  state.btIsPlaying = false;
  state.btPlayingId = null;
  persist();
}

function ctx() {
  return {
    app, C, state, persist, nav, progress,
    handednessLabel, roleLabel, ensureMirrorDefault, videoBlock,
    metro, metroState, metroToggle, metroSetBpmIfActive, metroStopIfOwnedBy,

    // backing hooks used by render.js
    backingState,
    backingToggle,
    backingStop,
    backingSetSelected
  };
}

// boot
nav.home();
