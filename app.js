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
  handedness: "right",      // "right" | "left"
  mirrorVideos: false,      // video mirror preference
  progress: {}
};

let state = loadState(DEFAULT_STATE);

function persist() {
  saveState(state);
}

function handednessLabel() {
  return state.handedness === "left" ? "Left-handed" : "Right-handed";
}

function ensureMirrorDefault() {
  if (state.handedness === "left" && state.mirrorVideos !== true) {
    state.mirrorVideos = true;
    persist();
  }
}

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

// Navigation (stable function refs)
const nav = {
  home: () => renderHome(ctx()),
  genre: (id) => renderGenre(ctx(), id),
  practice: () => renderPractice(ctx()),
  skill: (skillId, opts) => renderSkill(ctx(), skillId, opts)
};

// Progress API wrapper (so render.js stays simple)
const progress = {
  getOrInit: (s, d) => getOrInitDrillProgress(s, d, persist),
  setBpm: (s, d, bpm) => setDrillBpm(s, d, bpm, persist),
  clean: (s, d) => markCleanRep(s, d, persist),
  sloppy: (s, d) => markSloppyRep(s, d, persist),
  reset: (s, d) => resetDrillProgress(s, d, persist)
};

// --- Metronome (Dose 1.2) ---
const metro = createMetronome();
const metroState = { drillId: null };

function metroToggle(drillId, bpm) {
  if (metro.isRunning() && metroState.drillId === drillId) {
    metro.stop();
    metroState.drillId = null;
    return;
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
  metro.stop();
  metroState.drillId = null;
}

function ctx() {
  return {
    app,
    C,
    state,
    persist,
    nav,
    progress,
    handednessLabel,
    ensureMirrorDefault,
    videoBlock,
    // metronome
    metro,
    metroState,
    metroToggle,
    metroSetBpmIfActive,
    metroStopIfOwnedBy
  };
}

// boot
nav.home();
