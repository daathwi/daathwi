"use client";

import { useEffect, useState, type ReactNode } from "react";
import { checkBackendHealth, ensureBackendReady } from "../../lib/backend-ready";

/**
 * If the API is cold (e.g. Render free tier), show a wait screen, poll /health,
 * then reload so server-rendered pages can load cleanly.
 */
export default function BackendWakeGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"checking" | "waking" | "ready" | "failed">(
    "checking",
  );
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let tick: ReturnType<typeof setInterval> | undefined;

    async function run() {
      const warm = await checkBackendHealth(4_000);
      if (cancelled) return;

      if (warm) {
        setPhase("ready");
        return;
      }

      setPhase("waking");
      const started = Date.now();
      tick = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - started) / 1000));
      }, 500);

      const ok = await ensureBackendReady();
      if (cancelled) return;
      if (tick) clearInterval(tick);

      if (ok) {
        // API is up — refresh RSC/server data that may have failed while cold.
        window.location.reload();
        return;
      }

      setPhase("failed");
    }

    void run();
    return () => {
      cancelled = true;
      if (tick) clearInterval(tick);
    };
  }, []);

  if (phase === "ready" || phase === "checking") {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background px-margin-mobile">
      <div className="max-w-md text-center">
        <p className="mb-3 font-label-caps text-label-caps text-secondary">
          daathwi.jpg
        </p>
        {phase === "waking" ? (
          <>
            <h1 className="mb-4 font-headline-md text-headline-md text-primary">
              Just a moment…
            </h1>
            <p className="mb-6 font-body-md text-on-surface-variant">
              Getting things ready. This can take a little while after idle time.
            </p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {elapsedSec}s
            </p>
            <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, (elapsedSec / 60) * 100)}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <h1 className="mb-4 font-headline-md text-headline-md text-primary">
              Still loading
            </h1>
            <p className="mb-8 font-body-md text-on-surface-variant">
              Taking longer than usual. Wait a moment and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}
