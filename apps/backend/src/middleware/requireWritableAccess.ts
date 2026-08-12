import type { RequestHandler } from "express";

import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireWritableAccess: RequestHandler = asyncHandler(async (req, res, next) => {
  const authorId = req.authorId!;

  const user = await prisma.user.findUnique({
    where: { id: authorId },
    select: { googleSub: true },
  });

  if (!user || user.googleSub === null) {
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
});
