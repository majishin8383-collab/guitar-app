import { VARIANTS, ensureSongState, missingRequirements, isComplete, isVariantUnlocked, completeVariant, nextStep } from "../state/songProgress.js?v=GT-003";
import { videoBlock, escapeHtml } from "./video.js?v=GT-003";
import { chordDiagrams, toneCard } from "./chords.js?v=GT-003";
import { sessionMarkup, wireSession } from "./session.js?v=GT-003";
function createSongsUI(SONGS_SOURCE, { View }) {
  const getSongs = ctx => typeof SONGS_SOURCE === "function" ? SONGS_SOURCE(ctx) : SONGS_SOURCE;
  function openSong(ctx, id, variant, renderHome) {
    ensureSongState(ctx.state);
    ctx.state.songs.lastSong = { songId: id, variant };
    View.set(ctx, "song"); renderHome(ctx);
  }
  function follow(ctx, song, renderHome) {
    const step = nextStep(ctx.state, song, getSongs(ctx), ctx.C.skills);
    if (step.type === "skill") {
      ctx.state.coreReturnSong = song.id;
      ctx.nav.skill(step.id, { backTo: () => { View.set(ctx, "songs"); renderHome(ctx); } });
    } else if (step.type === "song") openSong(ctx, step.id, step.variant, renderHome);
    else ctx.nav.practice();
  }
  function renderSongs(ctx, renderHome) {
    ctx.enterScreen("songs"); ensureSongState(ctx.state);
    const list = Object.values(getSongs(ctx)).sort((a,b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    ctx.app.innerHTML = `<div class="card">
      <h2>Songs</h2><p class="muted">One groove at a time. Finish Easy, then Medium, then Hard.</p>
      ${list.map(song => {
        const missing = missingRequirements(ctx.state, song);
        return `<section class="card" style="background:#171717">
          <h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.description)}</p>
          ${missing.length ? `<p class="muted">First: ${missing.map(r=>escapeHtml(r.title)).join(", ")}.</p><button data-prepare="${song.id}">Start the 60-second warm-up</button>` : ""}
          <div class="row" style="margin-top:12px">${VARIANTS.filter(v=>song.variants[v]).map(v =>
            `<button data-play="${song.id}|${v}" class="${v === 'easy' ? '' : 'secondary'}" ${isVariantUnlocked(ctx.state,song,v)?'':'disabled'}>${isComplete(ctx.state,song.id,v)?'✓ ':''}${song.variants[v].label}</button>`).join("")}</div>
          ${!missing.length ? '<p class="muted">A completed run stays saved on this browser.</p>' : ''}
        </section>`;
      }).join("")}
      <button id="back-home" class="secondary">Home</button>
    </div>`;
    ctx.app.querySelectorAll("[data-play]").forEach(btn => btn.onclick = () => {
      const [id,variant] = btn.dataset.play.split("|");
      if (isVariantUnlocked(ctx.state,getSongs(ctx)[id],variant)) openSong(ctx,id,variant,renderHome);
    });
    ctx.app.querySelectorAll("[data-prepare]").forEach(btn => btn.onclick = () => follow(ctx,getSongs(ctx)[btn.dataset.prepare],renderHome));
    ctx.app.querySelector("#back-home").onclick = ctx.nav.home;
  }
  function renderSong(ctx, renderHome) {
    const songs = ensureSongState(ctx.state);
    const song = getSongs(ctx)[songs.lastSong.songId];
    const variantId = songs.lastSong.variant || "easy";
    if (!song || !isVariantUnlocked(ctx.state,song,variantId)) {
      View.set(ctx,"songs"); return renderSongs(ctx,renderHome);
    }
    ctx.enterScreen(`song:${song.id}:${variantId}`);
    const variant = song.variants[variantId];
    const track = ctx.C.backingTracks[variant.backingTrackId];
    ctx.app.innerHTML = `<div class="card">
      <div class="row screenTop"><span class="pill">${escapeHtml(variant.label)} · ${variant.displayBpm} BPM</span><button id="back-songs" class="secondary small">Songs</button><button id="back-home" class="secondary small">Home</button></div>
      <h2>${escapeHtml(song.title)}</h2><p>${escapeHtml(variant.subtext)}</p>
      <h3>Play this four-bar loop</h3><p class="muted">Key A · 4/4 · one downstrum per beat. Count 1, 2, 3, 4 in each box, then repeat.</p>
      <div class="chordPattern">${song.chordBlocks.map((b,i)=>`<div class="chordBar"><small>Bar ${i+1}</small><strong>${escapeHtml(b.chord)}</strong><span>1 · 2 · 3 · 4</span></div>`).join("")}</div>
      <details class="card"><summary>Show the small chord shapes</summary>${chordDiagrams(song.chordBlocks.map(b=>b.chord),ctx.state.handedness)}</details>
      <h3>Backing track</h3><p class="muted">Drums only, so your A–A–D–A chords always fit. Keep the YouTube speed at Normal for ${variant.displayBpm} BPM.</p>
      ${videoBlock(track.name,track.youtubeEmbed)}
      ${sessionMarkup(variant.targetSeconds)}
      <div id="song-result" role="status"></div>
      ${toneCard(ctx.state)}
    </div>`;
    const cleanup = wireSession(ctx,variant.targetSeconds,() => {
      if (!completeVariant(ctx.state,song,variantId)) return;
      const saved = ctx.persist();
      ctx.app.querySelector("#song-result").innerHTML = `<div class="card success"><h3>${escapeHtml(variant.completionTitle)}</h3><p>${escapeHtml(variant.completionBody)}</p><p>${saved === false ? 'Completed for this session. Browser storage is unavailable.' : 'Progress saved.'}</p><button id="next-step">${variantId === 'hard' ? 'Continue to the next skill' : 'Continue to '+song.variants[VARIANTS[VARIANTS.indexOf(variantId)+1]].label}</button></div>`;
      ctx.app.querySelector("#next-step").onclick = () => follow(ctx,song,renderHome);
    });
    ctx.setScreenCleanup(cleanup);
    ctx.app.querySelector("#back-songs").onclick = () => { View.set(ctx,"songs"); renderHome(ctx); };
    ctx.app.querySelector("#back-home").onclick = ctx.nav.home;
  }
  return { renderSongs, renderSong, follow };
}
export { createSongsUI };
