import type { RequestHandler } from "express";

import { AID_COOKIE_NAME } from "../constants/cookies.js";
import { isUuid } from "../helpers/isUuid.js";

export const requireAid: RequestHandler = (req, res, next) => {
  const cookieAid = req.signedCookies[AID_COOKIE_NAME];
  if (typeof cookieAid !== "string" || !isUuid(cookieAid)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.authorId = cookieAid;
  next();
};
