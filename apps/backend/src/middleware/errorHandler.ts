import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/AppError.js";
import { isPrismaUniqueConstraintError } from "../errors/prismaErrors.js";
import { StackItemsUnavailableError } from "../services/stacksService.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const body: { error: string; code?: string } = { error: err.message };
    if (err.code !== undefined) {
      body.code = err.code;
    }
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof StackItemsUnavailableError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (isPrismaUniqueConstraintError(err)) {
    res.status(409).json({ error: "Conflict" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};
