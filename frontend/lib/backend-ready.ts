/** Wait out Render-style free-tier cold starts before hitting the API. */

const HEALTH_PATH = "/health";
const MAX_WAIT_MS = 120_000;
/** Don’t poll too aggressively — overlapping short requests abort Render’s cold start. */
const POLL_MS = 2_000;
/** Free-tier wake can take 30–60s on one connection; aborting early keeps /health failing forever. */
const REQUEST_TIMEOUT_MS = 60_000;

function apiBase() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkBackendHealth(timeoutMs = REQUEST_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBase()}${HEALTH_PATH}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Poll `/health` until the API is up or MAX_WAIT_MS elapses.
 * Safe to call from server components and the browser.
 */
export async function ensureBackendReady(
  onAttempt?: (info: { attempt: number; elapsedMs: number }) => void,
): Promise<boolean> {
  const started = Date.now();
  let attempt = 0;

  while (Date.now() - started < MAX_WAIT_MS) {
    attempt += 1;
    onAttempt?.({ attempt, elapsedMs: Date.now() - started });
    if (await checkBackendHealth()) return true;
    await sleep(POLL_MS);
  }

  return false;
}

export function isRetryableStatus(status: number) {
  return [408, 425, 429, 502, 503, 504].includes(status);
}

export function isRetryableError(error: unknown) {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && /timeout|network|fetch|econnrefused|enotfound/i.test(error.message)) {
    return true;
  }
  return false;
}
