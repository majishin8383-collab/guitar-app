// ui/backing.js
// Backing track helpers + UI (dropdown + role filtering)

import { withCb, safeYoutubeEmbed } from "./video.js";

function hasRole(ctx) {
  return typeof ctx.roleLabel === "function" && ctx.state && typeof ctx.state.role === "string";
}

function getTrackMix(track) {
  const mix = track?.mix || track?.generator?.mix;
  if (mix === "rhythm" || mix === "lead") return mix;

  const n = String(track?.name || "").toLowerCase();
  if (n.includes("rhythm mix")) return "rhythm";
  if (n.includes("lead mix")) return "lead";
  return null;
}

// Convert common YouTube URL forms into an embed URL.
// Accepts watch?v=, youtu.be, shorts, embed.
function normalizeToEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;

  // First try existing helper (may already return an embed)
  try {
    const maybe = safeYoutubeEmbed(url);
    if (maybe && typeof maybe === "string" && maybe.includes("/embed/")) return maybe;
  } catch (_) {}

  // If already embed, accept
  if (
    url.startsWith("https://www.youtube.com/embed/") ||
    url.startsWith("https://youtube.com/embed/") ||
    url.startsWith("https://www.youtube-nocookie.com/embed/")
  ) {
    return url;
  }

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let videoId = null;

    if (host === "youtu.be") {
      videoId = u.pathname.replace("/", "").trim();
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "www.youtube.com") {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/embed/")[1] || null;
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1] || null;
      }
    }

    if (!videoId) return null;
    videoId = String(videoId).split(/[?&/]/)[0].trim();
    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
  } catch (_) {
    return null;
  }
}

export function filterTracksByRole(ctx, tracks) {
  if (!hasRole(ctx)) return tracks;
  const want = ctx.state.role === "lead" ? "lead" : "rhythm";
  return tracks.filter(t => {
    const tm = getTrackMix(t);
    return tm ? tm === want : true;
  });
}

function getSelectedTrackId(ctx, tracks) {
  const id = ctx.state.btSelectedId;
  if (id && tracks.some(t => t.id === id)) return id;
  return tracks.length ? tracks[0].id : null;
}

function setSelectedTrackId(ctx, id) {
  ctx.state.btSelectedId = id;
  ctx.persist();
}

export function backingUI(ctx, tracks) {
  if (!tracks.length) {
    return `<div class="muted" style="margin-top:8px;">No backing tracks defined for this genre yet.</div>`;
  }

  const selectedId = getSelectedTrackId(ctx, tracks);
  const selected = tracks.find(t => t.id === selectedId) || tracks[0];

  const safe = normalizeToEmbedUrl(selected.youtubeEmbed);
  const iframeSrc = safe ? withCb(safe, selected.id) : null;

  return `
    <div class="card" style="background:#171717; margin-top:10px;">
      <div class="muted" style="font-size:14px;">Choose track</div>

      <select id="bt-select" style="width:100%; max-width:560px; margin-top:6px;">
        ${tracks
          .map(t => {
            const sel = t.id === selected.id ? "selected" : "";
            const label = `${t.name} — Key ${t.key} • ${t.feel}${t.recommendedBpm ? ` • ~${t.recommendedBpm} bpm` : ""}`;
            return `<option value="${t.id}" ${sel}>${label}</option>`;
          })
          .join("")}
      </select>

      ${
        hasRole(ctx)
          ? `<div class="muted" style="font-size:14px; margin-top:6px;">Auto-filtered by Role: <b>${ctx.roleLabel()}</b></div>`
          : ""
      }

      ${selected.note ? `<div class="muted" style="font-size:13px; margin-top:10px;">${selected.note}</div>` : ""}

      <div class="hr" style="margin:12px 0;"></div>

      ${
        iframeSrc
          ? `
            <div style="font-weight:700;">Backing Track (in-app)</div>
            <div class="muted" style="font-size:14px; margin-bottom:10px;">
              ${selected.name} • Key ${selected.key}${selected.recommendedBpm ? ` • ~${selected.recommendedBpm} bpm` : ""}
            </div>

            <div class="videoWrap">
              <iframe
                src="${iframeSrc}"
                title="${selected.name}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>

            <div class="muted" style="font-size:12px; margin-top:8px;">
              Use the YouTube controls in the player to play/pause.
            </div>
          `
          : `
            <div class="muted">
              No valid YouTube URL found for this track.
            </div>
          `
      }
    </div>
  `;
}

export function wireBackingDropdown(ctx, tracks, rerender) {
  const select = document.getElementById("bt-select");
  if (!select) return;

  select.onchange = () => {
    setSelectedTrackId(ctx, select.value);
    rerender();
  };
}
