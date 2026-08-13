import type { RequestHandler } from "express";

import { getUser } from "../services/usersService.js";

export const requireWritableAccess: RequestHandler = async (req, res, next) => {
  const authorId = req.authorId!;

  const user = await getUser(authorId);

  if (!user || !user.isLinked) {
    next();
    return;
  }

  if (!req.sessionUserId || req.sessionUserId !== authorId) {
    res.status(403).json({
      error: "Login required to save progress for this account.",
      code: "LOGIN_REQUIRED",
    });
    return;
  }

  next();
};
