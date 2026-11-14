"use client";

import { useEffect, useState } from "react";

type Result<T> = { for: () => Promise<T>; attempt: number; data?: T; error?: string };

/**
 * Runs `load` and tracks its result. `load` must be stable (wrap it in useCallback);
 * when it changes, the data is fetched again. `reload()` re-runs the same request.
 */
export function useLoad<T>(load: () => Promise<T>) {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setResult({ for: load, attempt, data }),
      (e: Error) => active && setResult({ for: load, attempt, error: e.message }),
    );
    return () => {
      active = false;
    };
  }, [load, attempt]);

  const current = result?.for === load && result.attempt === attempt ? result : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    reload: () => setAttempt((n) => n + 1),
  };
}
