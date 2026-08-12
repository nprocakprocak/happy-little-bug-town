import type { RequestHandler } from "express";

import { AID_COOKIE_NAME } from "../constants/aid.js";
import { isUuid } from "../helpers/isUuid.js";

declare global {
  namespace Express {
    interface Request {
      authorId?: string;
    }
  }
}

export const requireAid: RequestHandler = (req, res, next) => {
  const cookieAid = req.signedCookies[AID_COOKIE_NAME];
  if (typeof cookieAid !== "string" || !isUuid(cookieAid)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.authorId = cookieAid;
  next();
};
