import { Router, type RequestHandler } from "express";
import { requireAid } from "../middleware/requireAid.js";
import { getBug, getBugs } from "../services/bugsService.js";
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

bugsRouter.get("/", listBugs);
bugsRouter.get("/:id", getBugById);
