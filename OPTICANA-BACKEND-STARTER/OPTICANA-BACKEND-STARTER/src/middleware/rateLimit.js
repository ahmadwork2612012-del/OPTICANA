const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, message = "Too many requests" } = {}) {
  return (req, res, next) => {
    const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${req.baseUrl || ""}:${req.path || ""}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || now - current.startedAt >= windowMs) {
      buckets.set(key, { startedAt: now, count: 1 });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      res.set("Retry-After", String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)));
      return res.status(429).json({
        success: false,
        error: { code: "RATE_LIMITED", message, details: null },
      });
    }

    return next();
  };
}

setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [key, bucket] of buckets) {
    if (bucket.startedAt < cutoff) buckets.delete(key);
  }
}, 10 * 60_000).unref();
