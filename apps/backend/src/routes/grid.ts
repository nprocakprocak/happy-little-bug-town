import { Router, type RequestHandler } from "express";
import { GROUND_HEIGHT, GROUND_WIDTH } from "@happy-little-park/utils";

export const gridRouter = Router();

const getGrid: RequestHandler = (req, res) => {
  res.status(200).json({ width: GROUND_WIDTH, height: GROUND_HEIGHT });
};

gridRouter.get("/", getGrid);
