"use client";

import type { ReactNode } from "react";

/**
 * Previously blocked the whole site while polling /health for Render cold starts.
 * That overlay was misleading when the API was already up (CORS / aborted polls
 * looked like "waking"). Pages already retry API calls via ensureBackendReady.
 */
export default function BackendWakeGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
