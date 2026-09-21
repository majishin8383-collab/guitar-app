// Completion is self-reported after a timed run, without microphone scoring.
const VARIANTS = ["easy", "medium", "hard"];
function ensureSongState(state) {
  if (!state.songs || typeof state.songs !== "object" || Array.isArray(state.songs)) state.songs = {};
  const songs = state.songs;
  for (const key of ["completed", "requirements"]) {
    if (!songs[key] || typeof songs[key] !== "object" || Array.isArray(songs[key])) songs[key] = {};
  }
  if (!songs.lastSong || typeof songs.lastSong !== "object") songs.lastSong = { songId: null, variant: "easy" };
  if (!state.coreCompleted || typeof state.coreCompleted !== "object" || Array.isArray(state.coreCompleted)) state.coreCompleted = {};
  return songs;
}
function missingRequirements(state, song) {
  ensureSongState(state);
  return (song.requirements || []).filter(r => state.coreCompleted[r.id] !== true && state.songs.requirements[song.id]?.[r.id] !== true);
}
function isComplete(state, songId, variant) {
  return ensureSongState(state).completed[songId]?.[variant] === true;
}
function isVariantUnlocked(state, song, variant) {
  const index = VARIANTS.indexOf(variant);
  if (index < 0 || !song?.variants?.[variant] || missingRequirements(state, song).length) return false;
  return index === 0 || isComplete(state, song.id, VARIANTS[index - 1]);
}
function completeVariant(state, song, variant) {
  if (!isVariantUnlocked(state, song, variant)) return false;
  const songs = ensureSongState(state);
  songs.completed[song.id] = { ...(songs.completed[song.id] || {}), [variant]: true };
  songs.lastPracticedAt = Date.now();
  return true;
}
function nextStep(state, song, songs, skills) {
  const required = missingRequirements(state, song)[0];
  if (required) return { type: "skill", id: required.id };
  const variant = VARIANTS.find(v => song.variants[v] && !isComplete(state, song.id, v));
  if (variant) return { type: "song", id: song.id, variant };
  const coreId = (song.nextCoreIds || []).find(id => skills[id] && state.coreCompleted[id] !== true);
  if (coreId) return { type: "skill", id: coreId };
  if (song.nextSongId && songs[song.nextSongId]) return nextStep(state, songs[song.nextSongId], songs, skills);
  return { type: "practice" };
}
export { VARIANTS, ensureSongState, missingRequirements, isComplete, isVariantUnlocked, completeVariant, nextStep };
