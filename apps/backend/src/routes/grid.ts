import { Router, type RequestHandler } from "express";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../services/constants.js";

export const gridRouter = Router();

const getGrid: RequestHandler = (req, res) => {
  console.log("GET /grid");
  res.status(200).json({ width: GROUND_WIDTH, height: GROUND_HEIGHT });
};

gridRouter.get("/", getGrid);
