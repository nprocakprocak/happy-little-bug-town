import { Router, type RequestHandler } from "express";

import {
  canStructureAcceptBugDrop,
  isBugFed,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
} from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
import { requireCoords } from "../helpers/placement.js";
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
    const parsedStructureId = parseUuidOrThrow(structureId, "structureId");

    const existingStructure = await loadOwnedOr404(getStructure, parsedStructureId, authorId);
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

    await updateBugService(id, { structureId: parsedStructureId });
    const structure = await getStructure(parsedStructureId);
    if (!structure) {
      res.status(500).json({ error: "Structure not found after updating bug" });
      return;
    }
    res.status(200).json(toStructureOnGridDto(structure));
    return;
  }

  const coords = requireCoords(x, y);

  const entities = await getAllEntitiesOnGrid(authorId);

  if (positionOverlapsAnyEntity({ x: coords.x, y: coords.y }, entities)) {
    throw new AppError(400, "Position is already occupied");
  }

  const bug = await updateBugService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toBugOnGridDto(bug));
});

bugsRouter.get("/", listBugs);
bugsRouter.get("/:id", requireBug, getBugById);
bugsRouter.put("/:id", requireBug, updateBug);
