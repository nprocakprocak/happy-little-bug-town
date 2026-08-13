import { Router, type RequestHandler } from "express";

import { SESSION_COOKIE_NAME } from "../constants/cookies.js";
import { clearAidCookie, setAidCookie } from "../helpers/aidCookie.js";
import {
  getSignedClearCookieOptions,
  getSignedCookieOptions,
} from "../helpers/signedCookieOptions.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAid } from "../middleware/requireAid.js";
import { requireSession } from "../middleware/requireSession.js";
import { loginWithGoogle } from "../services/googleAuthService.js";
import { createSession, deleteSession } from "../services/sessionService.js";
import { getUser } from "../services/usersService.js";

export const authRouter = Router();

const login: RequestHandler = asyncHandler(async (req, res) => {
  const anonymousId = req.authorId!;

  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length === 0) {
    res.status(400).json({ error: "Missing credential" });
    return;
  }

  let userId: string;
  try {
    const result = await loginWithGoogle(credential, anonymousId);
    userId = result.userId;
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = await getUser(userId);
  if (!user) {
    throw new Error("Failed to load user after login");
  }

  const sessionId = await createSession(userId);
  res.cookie(SESSION_COOKIE_NAME, sessionId, getSignedCookieOptions());
  setAidCookie(res, userId);
  res.status(200).json(user);
});

const logout: RequestHandler = asyncHandler(async (req, res) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as string | undefined;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.clearCookie(SESSION_COOKIE_NAME, getSignedClearCookieOptions());
  clearAidCookie(res);
  res.status(200).json({ ok: true });
});

const me: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.sessionUserId;
  if (!userId) {
    if (req.signedCookies[SESSION_COOKIE_NAME]) {
      res.clearCookie(SESSION_COOKIE_NAME, getSignedClearCookieOptions());
    }
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const authUser = await getUser(userId);
  if (!authUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  setAidCookie(res, userId);
  res.status(200).json(authUser);
});

authRouter.post("/google", requireAid, login);
authRouter.post("/logout", requireAid, logout);
authRouter.get("/me", requireSession, me);
