/**
 * Minimal in-memory fixed-window rate limiter (per client IP, per limiter).
 *
 * Suitable for a single API instance; with several instances each one keeps
 * its own counters. Relies on `app.set("trust proxy", ...)` so req.ip is the
 * real client address behind the hosting proxy.
 *
 * Usage: router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), login);
 */
const rateLimit = ({ windowMs, max, message = "Too many requests. Please try again later." }) => {
  const hits = new Map();

  // Drop expired windows periodically so the map doesn't grow unbounded.
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref?.();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
};

export default rateLimit;
