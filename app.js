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
  btSelectedId: null       // backing-track dropdown selection
};

let state = loadState(DEFAULT_STATE);

// guard for shallow merges / missing keys
state = state && typeof state === "object" ? state : { ...DEFAULT_STATE };
state.progress = state.progress || {};
if (!state.role) state.role = "rhythm";
if (!("btSelectedId" in state)) state.btSelectedId = null;

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

// ---------------------------
// YouTube URL normalization
// Accepts: embed, nocookie embed, watch?v=, youtu.be, shorts,
// AND allows missing scheme (www.youtube.com/...)
// Returns an embed URL or null.
// ---------------------------
function normalizeYoutubeInput(url) {
  if (!url || typeof url !== "string") return null;
  let s = url.trim();
  if (!s) return null;

  // allow protocol-relative
  if (s.startsWith("//")) s = "https:" + s;

  // allow missing scheme like "www.youtube.com/..." or "youtu.be/..."
  if (!/^https?:\/\//i.test(s)) {
    if (s.startsWith("www.youtube.com/") || s.startsWith("youtube.com/") || s.startsWith("m.youtube.com/")) {
      s = "https://" + s;
    } else if (s.startsWith("youtu.be/")) {
      s = "https://" + s;
    }
  }
  return s;
}

function toYoutubeEmbed(url) {
  const s = normalizeYoutubeInput(url);
  if (!s) return null;

  // already embed
  if (
    s.startsWith("https://www.youtube.com/embed/") ||
    s.startsWith("http://www.youtube.com/embed/") ||
    s.startsWith("https://youtube.com/embed/") ||
    s.startsWith("http://youtube.com/embed/") ||
    s.startsWith("https://www.youtube-nocookie.com/embed/") ||
    s.startsWith("http://www.youtube-nocookie.com/embed/")
  ) return s;

  try {
    const u = new URL(s);

    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtube.com")) {
      // /watch?v=<id>
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      // /shorts/<id>
      const mShorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (mShorts?.[1]) return `https://www.youtube.com/embed/${mShorts[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

function safeEmbed(url) {
  return toYoutubeEmbed(url);
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

function ctx() {
  return {
    app, C, state, persist, nav, progress,
    handednessLabel, roleLabel, ensureMirrorDefault, videoBlock,
    metro, metroState, metroToggle, metroSetBpmIfActive, metroStopIfOwnedBy
  };
}

// boot
nav.home();
