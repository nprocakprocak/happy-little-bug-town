import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const rateLimitMessage = { error: "Too many requests" };

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const economyRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 360,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitMessage,
  keyGenerator: (req) => {
    if (typeof req.authorId === "string") {
      return `aid:${req.authorId}`;
    }
    return ipKeyGenerator(req.ip ?? "unknown");
  },
});
