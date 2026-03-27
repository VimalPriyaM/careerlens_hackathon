import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
});
