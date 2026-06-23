import type { CookieOptions } from "express";
import { Router, type RequestHandler } from "express";

import { loadAuthEnv } from "../config/authEnv.js";
import { SESSION_COOKIE_NAME } from "../constants/session.js";
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

const getSessionCookieOptions = (): CookieOptions => {
  const { sessionTtlDays } = loadAuthEnv();
  const maxAge = sessionTtlDays * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
};

const getSessionClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  signed: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

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
    res.cookie(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());

    const response: UserDto = {
      id: userId,
      name,
      email,
      isLinked: true,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(401).json({ error: (error as Error).message ?? "Unknown error" });
  }
};

const logout: RequestHandler = async (req, res) => {
  const sessionId = req.signedCookies[SESSION_COOKIE_NAME] as
    | string
    | undefined;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.clearCookie(SESSION_COOKIE_NAME, getSessionClearCookieOptions());
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
    res.clearCookie(SESSION_COOKIE_NAME, getSessionClearCookieOptions());
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const authUser = await getUser(userId);
  if (!authUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(200).json(authUser);
};

authRouter.post("/google", requireAid, login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);
