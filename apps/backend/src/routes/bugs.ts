import { Router, type RequestHandler } from "express";

import {
  canStructureAcceptBugDrop,
  isBugFed,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
} from "@happy-little-bug-town/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { isUuid } from "../helpers/isUuid.js";
import { getValidCoords } from "../helpers/validateCoords.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireBug } from "../middleware/requireOwnedEntity.js";
import { getBugs, updateBug as updateBugService } from "../services/bugsService.js";
import { toBugOnGridDto, toStructureOnGridDto } from "../services/helpers.js";
import { getStructure } from "../services/structuresService.js";
import { isPositioned } from "../typeGuards/items.js";

export const bugsRouter = Router();

bugsRouter.use(...requireGameAccess);

const listBugs: RequestHandler = asyncHandler(async (req, res) => {
  const bugs = await getBugs(req.authorId!);
  res.status(200).json(bugs.filter(isPositioned).map(toBugOnGridDto));
});

const getBugById: RequestHandler<{ id: string }> = asyncHandler(async (req, res) => {
  res.status(200).json(req.bug!);
});

const updateBug: RequestHandler<{ id: string }> = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { x, y, structureId } = req.body;
  const authorId = req.authorId!;
  const existingBug = req.bug!;

  if (structureId) {
    if (typeof structureId !== "string" || !isUuid(structureId)) {
      res.status(400).json({ error: "Invalid structureId" });
      return;
    }

    const existingStructure = await getStructure(structureId);
    if (!existingStructure || existingStructure.authorId !== authorId) {
      res.status(404).json({ error: "Not found" });
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
    res.status(200).json(toStructureOnGridDto(structure));
    return;
  }

  const coords = getValidCoords(x, y);
  if (!coords) {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  if (positionOverlapsAnyEntity({ x: coords.x, y: coords.y }, entities)) {
    res.status(400).json({ error: "Position is already occupied" });
    return;
  }

  const bug = await updateBugService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toBugOnGridDto(bug));
});

bugsRouter.get("/", listBugs);
bugsRouter.get("/:id", requireBug, getBugById);
bugsRouter.put("/:id", requireBug, updateBug);
