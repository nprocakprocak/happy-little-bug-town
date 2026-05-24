import { positionOverlapsAnyEntity } from "@happy-little-park/utils";
import { Router, type RequestHandler } from "express";
import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireAid } from "../middleware/requireAid.js";
import { getBug, getBugs, updateBug as updateBugService } from "../services/bugsService.js";
import { toBugOnGridDto } from "../services/helpers.js";

export const bugsRouter = Router();

bugsRouter.use(requireAid);

const listBugs: RequestHandler = async (req, res) => {
  const bugs = await getBugs(req.authorId!);
  res.status(200).json(bugs.map(toBugOnGridDto));
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
  const { x, y } = req.body;
  const authorId = req.authorId!;

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const existingBug = await getBug(id);
  if (!existingBug) {
    res.status(400).json({ error: "Bug not found when updating" });
    return;
  }
  if (existingBug.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
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
