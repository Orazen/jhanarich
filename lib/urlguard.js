// URL allowlist guard for server-side outbound fetches (SSRF hardening).
const ALLOWED_HOSTS = new Set([
  "api.openai.com",
  "generativelanguage.googleapis.com",
  "api.anthropic.com",
]);

export function assertSafeUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error("blocked_url"); }
  if (url.protocol !== "https:") throw new Error("blocked_url");
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error("blocked_host");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) throw new Error("blocked_ip");
  if (url.username || url.password) throw new Error("blocked_url");
  return url;
}
