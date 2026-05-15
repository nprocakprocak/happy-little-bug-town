import { Router, type RequestHandler } from "express";
import { requireAid } from "../middleware/requireAid.js";
import { createFirstMine as createFirstMineService, getMines } from "../services/MinesService.js";

export const minesRouter = Router();

minesRouter.use(requireAid);

const listMines: RequestHandler = async (req, res) => {
  const mines = await getMines(req.authorId!);
  res.status(200).json(mines);
};

const createFirstMine: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const mines = await getMines(authorId);
  if (mines.length > 0) {
    res.status(400).json({ error: "First mine already created" });
    return;
  }
  const mine = await createFirstMineService(authorId);
  res.status(201).json(mine);
};

minesRouter.get("/", listMines);
minesRouter.post("/create", createFirstMine);
