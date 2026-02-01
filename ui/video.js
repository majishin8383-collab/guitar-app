// ui/video.js
// Cache-bust + YouTube embed safety helpers (used by drills + songs)

export function withCb(url, token) {
  if (!url || typeof url !== "string") return null;
  const cb = encodeURIComponent(String(token || "cb"));
  return `${url}${url.includes("?") ? "&" : "?"}cb=${cb}`;
}

export function safeYoutubeEmbed(url) {
  if (!url || typeof url !== "string") return null;
  const ok =
    url.startsWith("https://www.youtube.com/embed/") ||
    url.startsWith("https://youtube.com/embed/") ||
    url.startsWith("https://www.youtube-nocookie.com/embed/");
  return ok ? url : null;
}
