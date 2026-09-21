import { videoBlock, escapeHtml } from "./video.js?v=GT-003";
function filterTracksByRole(ctx, tracks) {
  const role = ctx.state.role === "lead" ? "lead" : "rhythm";
  return tracks.filter(track => !track.mix || track.mix === "both" || track.mix === role);
}
function backingUI(ctx, tracks) {
  if (!tracks.length) return '<p>No tracks available.</p>';
  const selected = tracks.find(t => t.id === ctx.state.btSelectedId) || tracks[0];
  return `<div class="card" style="background:#171717">
    <label for="bt-select">Choose a blues track</label>
    <select id="bt-select" style="width:100%;margin-top:8px">${tracks.map(t => `<option value="${t.id}" ${t.id === selected.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join("")}</select>
    <p class="muted">Key ${escapeHtml(selected.key)}${selected.recommendedBpm ? ` · ${selected.recommendedBpm} BPM at Normal speed` : ' · Follow the tempo in the video'}</p>
    ${selected.note ? `<p>${escapeHtml(selected.note)}</p>` : ''}
    ${videoBlock(selected.name, selected.youtubeEmbed || selected.youtubeUrl)}
  </div>`;
}
function wireBackingDropdown(ctx, tracks, rerender) {
  const select = document.getElementById("bt-select");
  if (select) select.onchange = () => {
    ctx.state.btSelectedId = select.value; ctx.persist(); rerender();
  };
}
export { filterTracksByRole, backingUI, wireBackingDropdown };
