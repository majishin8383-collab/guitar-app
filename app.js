// progress.js
// Tempo ladder + rep tracking helpers (Dose 1.1)
// Keeps app.js from becoming a monster.

import { nowTs, clamp } from "./storage.js";

export function getOrInitDrillProgress(state, drill, save) {
  const id = drill.id;
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const existing = state.progress?.[id];

  if (existing && typeof existing.bpm === "number") return existing;

  if (!state.progress) state.progress = {};

  const p = {
    bpm: cfg.start,
    cleanStreak: 0,
    bestBpm: cfg.start,
    lastTs: nowTs()
  };

  state.progress[id] = p;
  save();
  return p;
}

export function setDrillBpm(state, drill, nextBpm, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(state, drill, save);

  const minBpm = Math.max(30, cfg.start);        // never below 30, and don't go below suggested start
  const maxBpm = Math.max(cfg.target, cfg.start); // allow reaching target
  p.bpm = clamp(Math.round(nextBpm), minBpm, maxBpm);
  p.bestBpm = Math.max(p.bestBpm || p.bpm, p.bpm);
  p.lastTs = nowTs();
  save();
}

export function markCleanRep(state, drill, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(state, drill, save);

  p.cleanStreak = (p.cleanStreak || 0) + 1;
  p.lastTs = nowTs();

  // Rule: 3 clean reps => bump tempo by step, reset streak
  if (p.cleanStreak >= 3) {
    p.cleanStreak = 0;
    const next = (p.bpm || cfg.start) + (cfg.step || 5);
    setDrillBpm(state, drill, next, save);
    save();
    return { leveledUp: true };
  }

  save();
  return { leveledUp: false };
}

export function markSloppyRep(state, drill, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(state, drill, save);

  // Sloppy rep: reset streak and drop tempo by step (not below start/min)
  p.cleanStreak = 0;
  const next = (p.bpm || cfg.start) - (cfg.step || 5);
  setDrillBpm(state, drill, next, save);
  save();
}

export function resetDrillProgress(state, drill, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  if (!state.progress) state.progress = {};

  state.progress[drill.id] = {
    bpm: cfg.start,
    cleanStreak: 0,
    bestBpm: cfg.start,
    lastTs: nowTs()
  };
  save();
}
