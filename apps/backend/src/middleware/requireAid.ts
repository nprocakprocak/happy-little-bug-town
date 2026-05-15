import type { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      authorId?: string;
    }
  }
}

export const requireAid: RequestHandler = (req, res, next) => {
  const authorId = req.cookies?.aid;
  if (!authorId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.authorId = authorId;
  next();
};
