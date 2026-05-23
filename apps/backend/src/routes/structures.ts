import { Router, type RequestHandler } from "express";
import { structureFootprintFits } from "../helpers/overlaps.js";
import { requireAid } from "../middleware/requireAid.js";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../services/constants.js";
import { getItems } from "../services/itemsService.js";
import { getStacks } from "../services/stacksService.js";
import {
  createFirstStructure as createFirstStructureService,
  getStructure,
  getStructures,
  updateStructurePosition as updateStructurePositionService,
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

const updateStructure: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const existingStructure = await getStructure(id);
  if (!existingStructure) {
    res.status(400).json({ error: "Structure not found when updating" });
    return;
  }
  if (existingStructure.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const structures = await getStructures(authorId);
  const items = await getItems(authorId);
  const stacks = await getStacks(authorId);

  const fits = structureFootprintFits(
    { x, y },
    existingStructure.span,
    GROUND_WIDTH,
    GROUND_HEIGHT,
    structures.filter((s) => s.id !== id),
    items,
    stacks,
  );

  if (!fits) {
    res.status(400).json({ error: "Position is not free for structure" });
    return;
  }

  const structure = await updateStructurePositionService(id, x, y);
  res.status(200).json(structure);
};

structuresRouter.get("/", listStructures);
structuresRouter.post("/create", createFirstStructure);
structuresRouter.put("/:id", updateStructure);
