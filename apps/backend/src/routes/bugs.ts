import { Router, type RequestHandler } from "express";

import {
  canStructureAcceptBugDrop,
  isBugFed,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
} from "@happy-little-park/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireAid } from "../middleware/requireAid.js";
import { getBug, getBugs, updateBug as updateBugService } from "../services/bugsService.js";
import { toBugOnGridDto } from "../services/helpers.js";
import { getStructure } from "../services/structuresService.js";
import { isPositioned } from "../typeGuards/items.js";

export const bugsRouter = Router();

bugsRouter.use(requireAid);

const listBugs: RequestHandler = async (req, res) => {
  const bugs = await getBugs(req.authorId!);
  res.status(200).json(bugs.filter(isPositioned).map(toBugOnGridDto));
};

const getBugById: RequestHandler<{ id: string }> = async (req, res) => {
  const bug = await getBug(req.params.id);
  if (!bug) {
    res.status(404).json({ error: "Bug not found" });
    return;
  }
  if (bug.authorId !== req.authorId!) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.status(200).json(toBugOnGridDto(bug));
};

const updateBug: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y, structureId } = req.body;
  const authorId = req.authorId!;

  const existingBug = await getBug(id);
  if (!existingBug) {
    res.status(400).json({ error: "Bug not found when updating" });
    return;
  }
  if (existingBug.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (structureId) {
    if (existingBug.bugType !== "beetle") {
      res.status(400).json({ error: "Only beetles can be placed in a structure" });
      return;
    }

    const existingStructure = await getStructure(structureId);
    if (!existingStructure) {
      res.status(400).json({ error: "Structure not found when updating bug" });
      return;
    }
    if (existingStructure.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const structureForDrop = {
      structureType: existingStructure.structureType,
      items: existingStructure.items,
      bugs: existingStructure.bugs,
    };

    if (!canStructureAcceptBugDrop(existingBug, structureForDrop)) {
      res.status(400).json({ error: "Structure cannot accept this bug" });
      return;
    }

    if (structureDropRequiresFedBug(existingStructure.structureType) && !isBugFed(existingBug)) {
      res.status(400).json({ error: "Bug must be fed before joining structure" });
      return;
    }

    await updateBugService(id, { structureId });
    const structure = await getStructure(structureId);
    if (!structure) {
      res.status(500).json({ error: "Structure not found after updating bug" });
      return;
    }
    res.status(200).json(structure);
    return;
  }

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  if (positionOverlapsAnyEntity({ x, y }, entities)) {
    res.status(400).json({ error: "Position is already occupied" });
    return;
  }

  const bug = await updateBugService(id, { x, y });
  res.status(200).json(toBugOnGridDto(bug));
};

bugsRouter.get("/", listBugs);
bugsRouter.get("/:id", getBugById);
bugsRouter.put("/:id", updateBug);
