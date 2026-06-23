import type { RequestHandler } from "express";

import { SESSION_COOKIE_NAME } from "../constants/session.js";
import { validateSession } from "../services/sessionService.js";

declare global {
  namespace Express {
    interface Request {
      sessionUserId?: string;
    }
  }
}

export const requireSession: RequestHandler = async (req, _res, next) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as string | undefined;

  if (sessionId) {
    const userId = await validateSession(sessionId);
    if (userId) {
      req.sessionUserId = userId;
    }
  }

  next();
};
