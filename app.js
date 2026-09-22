// app.js (module) — small router + state + helpers
import { loadState, saveState } from "./storage.js?v=GT-003";
import {
  getOrInitDrillProgress,
  setDrillBpm,
  markCleanRep,
  markSloppyRep,
  resetDrillProgress
} from "./progress.js?v=GT-003";
import { renderHome, renderGenre, renderPractice, renderSkill } from "./render.js?v=GT-003";
import { createMetronome } from "./metronome.js?v=GT-003";
import { videoBlock } from "./ui/video.js?v=GT-003";

const app = document.getElementById("app");
const C = window.CONTENT;

// ✅ Defensive: ensure songs bucket exists even if older base.js is present
if (C && typeof C === "object") {
  C.songs = C.songs || {};
}

const DEFAULT_STATE = {
  genre: "blues",
  role: "rhythm",          // "rhythm" | "lead"
  handedness: "left",
  mirrorVideos: true,
  guitar: "strat",
  progress: {},
  btSelectedId: null       // backing-track dropdown selection
};

let state = loadState(DEFAULT_STATE);

// guard for shallow merges / missing keys
state = state && typeof state === "object" ? state : { ...DEFAULT_STATE };
if (!state.progress || typeof state.progress !== "object" || Array.isArray(state.progress)) state.progress = {};
if (!["lead", "rhythm"].includes(state.role)) state.role = "rhythm";
if (!["left", "right"].includes(state.handedness)) state.handedness = "left";
state.genre = "blues";
if (!("btSelectedId" in state)) state.btSelectedId = null;

function persist() {
  const saved = saveState(state);
  let notice = document.getElementById("save-warning");
  if (!saved && !notice) {
    notice = document.createElement("p"); notice.id = "save-warning";
    notice.setAttribute("role", "status"); document.querySelector("header").append(notice);
  }
  if (notice) notice.textContent = saved ? "" : "Browser storage is unavailable. Progress lasts only for this session.";
  return saved;
}

function handednessLabel() {
  return state.handedness === "left" ? "Left-handed" : "Right-handed";
}
function roleLabel() { return state.role === "lead" ? "Lead" : "Rhythm"; }

function ensureMirrorDefault() {
  if (typeof state.mirrorVideos !== "boolean") {
    state.mirrorVideos = state.handedness === "left";
    persist();
  }
}

// Navigation
const nav = {
  view: (name) => { state.view = name; persist(); renderHome(ctx()); },
  home: () => { state.view = "home"; persist(); renderHome(ctx()); },
  genre: (id) => { state.view = "genre"; persist(); renderGenre(ctx(), id); },
  practice: () => { state.view = "practice"; persist(); renderPractice(ctx()); },
  skill: (skillId, opts) => {
    state.view = "skill"; state.skillId = skillId; persist();
    renderSkill(ctx(), skillId, opts);
  }
};
let activeScreen = null;
let screenCleanup = null;
function enterScreen(key) {
  if (screenCleanup) { screenCleanup(); screenCleanup = null; }
  if (key !== activeScreen) {
    metro.stop(); metroState.drillId = null;
    window.scrollTo(0, 0);
  }
  activeScreen = key;
}
function setScreenCleanup(cleanup) { screenCleanup = cleanup; }

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

function ctx() {
  return {
    app, C, state, persist, nav, progress,
    handednessLabel, roleLabel, ensureMirrorDefault, videoBlock,
    metro, metroState, metroToggle, metroSetBpmIfActive, metroStopIfOwnedBy,
    enterScreen, setScreenCleanup
  };
}

// boot
renderHome(ctx());
window.addEventListener("pagehide", () => { metro.stop(); screenCleanup?.(); });

window.addEventListener("pageshow", event => { if (event.persisted) renderHome(ctx()); });
