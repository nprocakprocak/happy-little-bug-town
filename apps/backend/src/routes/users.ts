import { randomUUID } from "crypto";
import { Router, type RequestHandler } from "express";

import { AID_COOKIE_NAME } from "../constants/aid.js";
import { setAidCookie } from "../helpers/aidCookie.js";
import { isUuid } from "../helpers/isUuid.js";
import { ensureUser } from "../services/usersService.js";

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

usersRouter.post("/register", registerUser);
