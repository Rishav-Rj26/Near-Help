import crypto from 'crypto';

export const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self)',
  });
  next();
};

export const requestContext = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.set('X-Request-Id', req.requestId);
  next();
};

export const createRateLimiter = ({ windowMs, max, key = (req) => req.ip, message }) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const clientKey = key(req);
    const existing = hits.get(clientKey);
    const entry = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
    entry.count += 1;
    hits.set(clientKey, entry);

    if (entry.count > max) {
      res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message, requestId: req.requestId });
    }
    next();
  };
};

export const notFound = (req, res) => res.status(404).json({ message: 'Route not found', requestId: req.requestId });

export const errorHandler = (error, req, res, next) => {
  console.error(JSON.stringify({ level: 'error', requestId: req.requestId, message: error.message, path: req.originalUrl }));
  if (res.headersSent) return next(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.', requestId: req.requestId });
};
