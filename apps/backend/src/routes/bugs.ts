import { Router, type RequestHandler } from "express";

import { positionOverlapsAnyEntity } from "@happy-little-bug-town/utils";

import { AppError } from "../errors/AppError.js";
import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireCoords } from "../helpers/placement.js";
import { toBugOnGridDto } from "../mappers/bug.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireBug } from "../middleware/requireOwnedEntity.js";
import {
  attachBugToStructure,
  getBugs,
  updateBug as updateBugService,
} from "../services/bugsService.js";
import { isPositioned } from "../typeGuards/position.js";

export const bugsRouter = Router();

bugsRouter.use(...requireGameAccess);

const listBugs: RequestHandler = async (req, res) => {
  const bugs = await getBugs(req.authorId!);
  res.status(200).json(bugs.filter(isPositioned).map(toBugOnGridDto));
};

const getBugById: RequestHandler<{ id: string }> = async (req, res) => {
  const bug = req.bug!;
  if (!isPositioned(bug)) {
    res.status(400).json({ error: "Bug is not on the grid" });
    return;
  }
  res.status(200).json(toBugOnGridDto(bug));
};

const updateBug: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y, structureId } = req.body;
  const authorId = req.authorId!;
  const existingBug = req.bug!;

  if (structureId) {
    const structure = await attachBugToStructure(id, structureId, existingBug, authorId);
    res.status(200).json(structure);
    return;
  }

  const coords = requireCoords(x, y);

  const entities = await getAllEntitiesOnGrid(authorId);

  if (positionOverlapsAnyEntity({ x: coords.x, y: coords.y }, entities)) {
    throw new AppError(400, "Position is already occupied");
  }

  const bug = await updateBugService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toBugOnGridDto(bug));
};

bugsRouter.get("/", listBugs);
bugsRouter.get("/:id", requireBug, getBugById);
bugsRouter.put("/:id", requireBug, updateBug);
