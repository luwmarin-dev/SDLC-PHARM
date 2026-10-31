const DEFAULT_TARGET = "/";

/**
 * Reads the post-login destination from a query string.
 *
 * Only same-site absolute paths are accepted: anything protocol-relative
 * ("//evil.com") or absolute ("https://evil.com") is dropped so the `next`
 * parameter can never be used as an open redirect.
 */
export function safeNext(
  search: string,
  fallback: string = DEFAULT_TARGET,
): string {
  const raw = new URLSearchParams(search).get("next");
  if (!raw) return fallback;

  const target = decodeURIComponent(raw);
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;

  return target;
}
