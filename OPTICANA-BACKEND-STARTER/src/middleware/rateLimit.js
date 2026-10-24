import { getClientIp } from "../utils/clientIp.js";

const buckets = new Map();
const MAX_BUCKETS = 10_000;

function pruneExpiredBuckets(now) {
  const cutoff = now - 10 * 60_000;
  for (const [key, bucket] of buckets) {
    if (bucket.startedAt < cutoff) buckets.delete(key);
  }
}

export function rateLimit({ windowMs = 60_000, max = 60, message = "Too many requests", keyBy = null } = {}) {
  return (req, res, next) => {
    const scope = `${req.baseUrl || ""}:${req.path || ""}`;
    // keyBy lets a route limit by something other than the IP (e.g. the
    // account being logged into); returning null skips this limiter.
    const custom = keyBy ? keyBy(req) : undefined;
    if (keyBy && !custom) return next();
    const key = keyBy ? `custom:${custom}:${scope}` : `${getClientIp(req)}:${scope}`;
    const now = Date.now();
    const current = buckets.get(key);

    // A public endpoint must not allow an unbounded number of spoofed client
    // keys to grow process memory indefinitely.
    if (!current && buckets.size >= MAX_BUCKETS) {
      pruneExpiredBuckets(now);
      // Preserve availability rather than growing the in-memory map without
      // bounds when all entries are still inside their active window.
      if (buckets.size >= MAX_BUCKETS) return next();
    }

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
  pruneExpiredBuckets(Date.now());
}, 10 * 60_000).unref();
