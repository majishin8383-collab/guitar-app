// storage.js
// Small shared helpers + localStorage persistence

export const STORAGE_KEY = "guitar_trainer_state_v3";

export function loadState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...structuredClone(defaultState), ...parsed }
      : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function nowTs() {
  return Date.now();
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
