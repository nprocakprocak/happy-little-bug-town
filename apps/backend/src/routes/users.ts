import { randomUUID } from "crypto";
import { Router, type RequestHandler } from "express";

import { AID_COOKIE_NAME, SESSION_COOKIE_NAME } from "../constants/cookies.js";
import { setAidCookie } from "../helpers/aidCookie.js";
import { isUuid } from "../helpers/isUuid.js";
import {
  getSignedClearCookieOptions,
  getSignedCookieOptions,
} from "../helpers/signedCookieOptions.js";
import { requireAid } from "../middleware/requireAid.js";
import { requireSession } from "../middleware/requireSession.js";
import { ensureUser, resetGame } from "../services/usersService.js";

export const usersRouter = Router();

const registerUser: RequestHandler = async (req, res) => {
  const cookieAid = req.signedCookies[AID_COOKIE_NAME];

  if (typeof cookieAid === "string" && isUuid(cookieAid)) {
    const user = await ensureUser(cookieAid);
    setAidCookie(res, cookieAid);
    res.status(200).json(user);
    return;
  }

  const anonymousId = randomUUID();
  const user = await ensureUser(anonymousId);
  setAidCookie(res, anonymousId);
  res.status(200).json(user);
};

const resetGameHandler: RequestHandler = async (req, res) => {
  const result = await resetGame(req.authorId!, req.sessionUserId);

  setAidCookie(res, result.user.id);
  if (result.sessionId) {
    res.cookie(SESSION_COOKIE_NAME, result.sessionId, getSignedCookieOptions());
  } else {
    res.clearCookie(SESSION_COOKIE_NAME, getSignedClearCookieOptions());
  }

  res.status(200).json(result.user);
};

usersRouter.post("/register", registerUser);
usersRouter.post("/reset-game", requireAid, requireSession, resetGameHandler);
