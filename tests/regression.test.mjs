import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { safeYoutubeEmbed, youtubeWatchUrl } from "../ui/video.js";
import { nextStep, isVariantUnlocked, completeVariant, isComplete } from "../state/songProgress.js";
import { loadState, saveState, STORAGE_KEY } from "../storage.js";
import { markCleanRep, setDrillBpm } from "../progress.js";
import { chordDiagrams } from "../ui/chords.js";
function content() {
  const sandbox = { console }; sandbox.window = sandbox; vm.createContext(sandbox);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const [,src] of html.matchAll(/<script src="([^"?]+)[^"]*"><\/script>/g)) {
    vm.runInContext(fs.readFileSync(new URL("../"+src,import.meta.url),"utf8"),sandbox,{filename:src});
  }
  return sandbox.CONTENT;
}
const C=content();
test("loaded content, requirements and backing references resolve",()=>{
  assert.deepEqual(Object.keys(C.genres),["blues"]);
  for(const song of Object.values(C.songs)) {
    for(const req of song.requirements) assert.ok(C.skills[req.id],req.id);
    for(const v of Object.values(song.variants)) {
      const t=C.backingTracks[v.backingTrackId];
      assert.ok(t,v.backingTrackId);assert.ok(safeYoutubeEmbed(t.youtubeEmbed));
      assert.equal(t.recommendedBpm,v.displayBpm);assert.equal(t.key,v.displayKey);
      assert.equal(t.accompaniment,"drums-only");
    }
  }
  for(const id of C.genres.blues.backingTrackIds)assert.ok(C.backingTracks[id],id);
});
test("fresh learner follows core, Easy, Medium, Hard, next core, then jam",()=>{
  const state={},song=C.songs.song1;
  assert.deepEqual(nextStep(state,song,C.songs,C.skills),{type:"skill",id:"core_time_steady"});
  assert.equal(completeVariant(state,song,"hard"),false);
  state.coreCompleted.core_time_steady=true;
  assert.deepEqual(nextStep(state,song,C.songs,C.skills),{type:"song",id:"song1",variant:"easy"});
  assert.equal(isVariantUnlocked(state,song,"medium"),false);
  for(const variant of ["easy","medium","hard"]){
    assert.equal(isVariantUnlocked(state,song,variant),true);
    assert.equal(completeVariant(state,song,variant),true);
    assert.equal(isComplete(state,"song1",variant),true);
  }
  assert.deepEqual(nextStep(state,song,C.songs,C.skills),{type:"skill",id:"core_chord_transitions"});
  state.coreCompleted.core_chord_transitions=true;
  assert.deepEqual(nextStep(state,song,C.songs,C.skills),{type:"practice"});
});
test("legacy requirements and saved drill progress survive",()=>{
  const state={songs:{requirements:{song1:{core_time_steady:true}}},progress:{d_shuffle_1:{bpm:85,cleanStreak:2}}};
  assert.equal(isVariantUnlocked(state,C.songs.song1,"easy"),true);
  completeVariant(state,C.songs.song1,"easy");
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
  assert.equal(saveState(state),true);
  const reloaded=loadState({handedness:"left",mirrorVideos:true,progress:{}});
  assert.equal(reloaded.progress.d_shuffle_1.bpm,85);
  assert.equal(isVariantUnlocked(reloaded,C.songs.song1,"medium"),true);
  memory.set(STORAGE_KEY,"invalid json");assert.deepEqual(loadState({progress:{}}),{progress:{}});
  memory.set(STORAGE_KEY,"[]");assert.deepEqual(loadState({progress:{}}),{progress:{}});
  globalThis.localStorage.setItem=()=>{throw new Error("denied");};assert.equal(saveState(state),false);
});
test("YouTube URL forms normalize; lookalike hosts and injected IDs are refused",()=>{
  for(const input of ["https://youtu.be/QUZOJF_czqU","www.youtube.com/watch?v=QUZOJF_czqU","https://www.youtube-nocookie.com/embed/QUZOJF_czqU","https://m.youtube.com/shorts/QUZOJF_czqU"])assert.match(safeYoutubeEmbed(input),/youtube\.com\/embed\/QUZOJF_czqU/);
  for(const input of ["https://notyoutube.com/watch?v=QUZOJF_czqU","https://youtube.com.evil.test/embed/QUZOJF_czqU","javascript:alert(1)",'https://youtube.com/embed/x" onload="alert(1)'])assert.equal(safeYoutubeEmbed(input),null);
  assert.equal(youtubeWatchUrl("https://youtu.be/QUZOJF_czqU?t=30"),"https://www.youtube.com/watch?v=QUZOJF_czqU&t=30");
});
test("tempo ladder cannot overshoot target or save NaN",()=>{
  const state={progress:{}},drill={id:"test",suggestedBpm:{start:60,step:5,target:65}},save=()=>{};
  setDrillBpm(state,drill,65,save);markCleanRep(state,drill,save);markCleanRep(state,drill,save);
  const result=markCleanRep(state,drill,save);assert.equal(result.leveledUp,false);assert.equal(result.to,65);
  setDrillBpm(state,drill,NaN,save);assert.equal(state.progress.test.bpm,65);
});
test("lefty chord layout reverses strings without reversing text",()=>{
  const left=chordDiagrams(["A","D"],"left"),right=chordDiagrams(["A","D"],"right");
  assert.match(left,/x="144" y="172">E/);assert.match(right,/x="24" y="172">E/);
  assert.match(left,/Mini-barre/);assert.doesNotMatch(left,/scaleX/);
});
