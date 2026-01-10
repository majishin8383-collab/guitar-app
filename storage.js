// storage.js
// Small shared helpers + localStorage persistence

export const STORAGE_KEY = "guitar_trainer_state_v3";

export function loadState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : defaultState;
  } catch {
    return defaultState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function nowTs() {
  return Date.now();
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
