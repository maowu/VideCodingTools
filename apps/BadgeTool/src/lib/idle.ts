export function requestIdleTask(callback: () => void, timeout = 2000) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = globalThis.setTimeout(callback, timeout);
  return () => globalThis.clearTimeout(handle);
}

export function waitForIdle(timeout = 2000): Promise<void> {
  return new Promise((resolve) => {
    requestIdleTask(resolve, timeout);
  });
}
