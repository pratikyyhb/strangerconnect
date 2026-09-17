type Entry = { count: number; resetAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  __strangerConnectRateLimits?: Map<string, Entry>;
};

const store = globalForRateLimit.__strangerConnectRateLimits ?? new Map<string, Entry>();
globalForRateLimit.__strangerConnectRateLimits = store;

export function checkRateLimit(request: Request, namespace: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identity = forwarded || request.headers.get("x-real-ip") || "local";
  const key = `${namespace}:${identity}`;
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return Response.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  current.count += 1;

  if (store.size > 5000) {
    for (const [storedKey, entry] of store) {
      if (entry.resetAt <= now) store.delete(storedKey);
    }
  }
  return null;
}
