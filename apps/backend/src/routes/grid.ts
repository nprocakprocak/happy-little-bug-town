import { Router, type RequestHandler } from "express";

import { GROUND_HEIGHT, GROUND_WIDTH } from "@happy-little-bug-town/utils";

import { parseUuidOrThrow } from "../helpers/ownership.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { swapGridPositions } from "../services/gridService.js";

export const gridRouter = Router();

const getGrid: RequestHandler = (req, res) => {
  res.status(200).json({ width: GROUND_WIDTH, height: GROUND_HEIGHT });
};

const swapPositions: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const sourceId = parseUuidOrThrow(req.body.sourceId, "sourceId");
  const targetId = parseUuidOrThrow(req.body.targetId, "targetId");
  const result = await swapGridPositions(authorId, sourceId, targetId);
  res.status(200).json(result);
};

gridRouter.get("/", getGrid);
gridRouter.post("/swap", ...requireGameAccess, swapPositions);
