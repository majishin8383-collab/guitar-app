// progress.js
// Tempo ladder + rep tracking helpers (Dose 1.1)
// Micro-fix: show a "level up" message when streak resets.

import { nowTs, clamp } from "./storage.js";

const LEVELUP_FLASH_MS = 3500;

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
    lastTs: nowTs(),

    // UI feedback
    lastLevelUpTs: 0,
    lastLevelUpFrom: 0,
    lastLevelUpTo: 0
  };

  state.progress[id] = p;
  save();
  return p;
}

export function setDrillBpm(state, drill, nextBpm, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(state, drill, save);

  const minBpm = Math.max(30, cfg.start);
  const maxBpm = Math.max(cfg.target, cfg.start);

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
    const from = p.bpm || cfg.start;
    const step = cfg.step || 5;
    const to = from + step;

    // Reset streak (this is the "it resets" behavior)
    p.cleanStreak = 0;

    // Store a short-lived level-up message
    p.lastLevelUpTs = nowTs();
    p.lastLevelUpFrom = from;
    p.lastLevelUpTo = to;

    setDrillBpm(state, drill, to, save);
    save();

    return { leveledUp: true, from, to };
  }

  save();
  return { leveledUp: false };
}

export function markSloppyRep(state, drill, save) {
  const cfg = drill.suggestedBpm || { start: 60, step: 5, target: 120 };
  const p = getOrInitDrillProgress(state, drill, save);

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
    lastTs: nowTs(),
    lastLevelUpTs: 0,
    lastLevelUpFrom: 0,
    lastLevelUpTo: 0
  };
  save();
}

export function shouldShowLevelUp(progressObj) {
  if (!progressObj) return false;
  if (!progressObj.lastLevelUpTs) return false;
  return (nowTs() - progressObj.lastLevelUpTs) <= LEVELUP_FLASH_MS;
}
