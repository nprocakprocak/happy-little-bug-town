import { Router, type RequestHandler } from "express";

import { SESSION_COOKIE_NAME } from "../constants/session.js";
import { clearAidCookie, setAidCookie } from "../helpers/aidCookie.js";
import {
  getSignedClearCookieOptions,
  getSignedCookieOptions,
} from "../helpers/signedCookieOptions.js";
import { requireAid } from "../middleware/requireAid.js";
import { loginWithGoogle } from "../services/googleAuthService.js";
import {
  createSession,
  deleteSession,
  validateSession,
} from "../services/sessionService.js";
import { UserDto } from "../types/userDto.js";
import { getUser } from "../services/usersService.js";

export const authRouter = Router();

const login: RequestHandler = async (req, res) => {
  const anonymousId = req.authorId!;

  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length === 0) {
    res.status(400).json({ error: "Missing credential" });
    return;
  }

  try {
    const { userId, name, email } = await loginWithGoogle(
      credential,
      anonymousId,
    );
    const sessionId = await createSession(userId);
    res.cookie(SESSION_COOKIE_NAME, sessionId, getSignedCookieOptions());
    setAidCookie(res, userId);

    const response: UserDto = {
      id: userId,
      name,
      email,
      isLinked: true,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

const logout: RequestHandler = async (req, res) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as
    | string
    | undefined;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.clearCookie(SESSION_COOKIE_NAME, getSignedClearCookieOptions());
  clearAidCookie(res);
  res.status(200).json({ ok: true });
};

const me: RequestHandler = async (req, res) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as
    | string
    | undefined;

  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = await validateSession(sessionId);
  if (!userId) {
    res.clearCookie(SESSION_COOKIE_NAME, getSignedClearCookieOptions());
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
};

authRouter.post("/google", requireAid, login);
authRouter.post("/logout", requireAid, logout);
authRouter.get("/me", me);
