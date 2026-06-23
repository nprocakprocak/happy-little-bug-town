import type { RequestHandler } from "express";

import { AID_HEADER } from "../constants/aid.js";
import { isUuid } from "../helpers/isUuid.js";

declare global {
  namespace Express {
    interface Request {
      authorId?: string;
    }
  }
}

export const requireAid: RequestHandler = (req, res, next) => {
  const authorId = req.get(AID_HEADER);
  if (!authorId || !isUuid(authorId)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.authorId = authorId;
  next();
};
