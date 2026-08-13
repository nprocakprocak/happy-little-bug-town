import type { RequestHandler } from "express";

import { SESSION_COOKIE_NAME } from "../constants/cookies.js";
import { validateSession } from "../services/sessionService.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireSession: RequestHandler = asyncHandler(async (req, _res, next) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as string | undefined;

  if (sessionId) {
    const userId = await validateSession(sessionId);
    if (userId) {
      req.sessionUserId = userId;
    }
  }

  next();
});
