import { Router, type RequestHandler } from "express";
import { requireAid } from "../middleware/requireAid.js";
import {
  createFirstStructure as createFirstStructureService,
  getStructures,
} from "../services/structuresService.js";

export const structuresRouter = Router();

structuresRouter.use(requireAid);

const listStructures: RequestHandler = async (req, res) => {
  const structures = await getStructures(req.authorId!);
  res.status(200).json(structures);
};

const createFirstStructure: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const structures = await getStructures(authorId);
  if (structures.length > 0) {
    res.status(400).json({ error: "First structure already created" });
    return;
  }
  const structure = await createFirstStructureService(authorId);
  res.status(201).json(structure);
};

structuresRouter.get("/", listStructures);
structuresRouter.post("/create", createFirstStructure);
