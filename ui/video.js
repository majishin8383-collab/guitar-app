const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function safeYoutubeEmbed(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  try {
    let text = input.trim();
    if (text.startsWith("//")) text = "https:" + text;
    if (!/^https?:\/\//i.test(text)) text = "https://" + text;
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host)) return null;
    const id = host === "youtu.be" ? url.pathname.slice(1)
      : url.pathname === "/watch" ? url.searchParams.get("v")
      : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
    if (!/^[\w-]{11}$/.test(id || "")) return null;
    const embed = new URL(`https://www.youtube.com/embed/${id}`);
    embed.searchParams.set("playsinline", "1");
    const start = url.searchParams.get("start") || url.searchParams.get("t");
    if (start && /^\d+$/.test(start)) embed.searchParams.set("start", start);
    return embed.href;
  } catch { return null; }
}
function youtubeWatchUrl(url) {
  const embed = safeYoutubeEmbed(url);
  if (!embed) return null;
  const parsed = new URL(embed);
  const watch = new URL("https://www.youtube.com/watch");
  watch.searchParams.set("v", parsed.pathname.split("/").pop());
  if (parsed.searchParams.has("start")) watch.searchParams.set("t", parsed.searchParams.get("start"));
  return watch.href;
}
function withCb(url, token) {
  if (!url || typeof url !== "string") return null;
  return `${url}${url.includes("?") ? "&" : "?"}cb=${encodeURIComponent(token || "cb")}`;
}
function videoBlock(label, url, mirrorOn = false) {
  const embed = safeYoutubeEmbed(url);
  if (!embed) return `<p class="muted">This video link is unavailable.</p>`;
  return `<div class="videoCard">
    <div class="videoLabel">${escapeHtml(label)}</div>
    <div class="videoWrap ${mirrorOn ? "mirror" : ""}">
      <iframe src="${escapeHtml(embed)}" title="${escapeHtml(label)}" loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <p class="videoFallback"><a href="${escapeHtml(youtubeWatchUrl(url))}" target="_blank" rel="noopener">Open on YouTube</a> if the player is blocked.</p>
    ${mirrorOn ? '<p class="muted">Mirrored for left-handed viewing; video text is also reversed.</p>' : ""}
  </div>`;
}
export { escapeHtml, safeYoutubeEmbed, youtubeWatchUrl, withCb, videoBlock };
