import { Router, type RequestHandler } from "express";

import { isOnceDialogueId } from "@happy-little-bug-town/utils";

import { requireGameAccess } from "../middleware/requireGameAccess.js";
import {
  getVisitedDialogueIds,
  markDialogueVisited as markDialogueVisitedService,
} from "../services/dialoguesService.js";

export const dialoguesRouter = Router();

dialoguesRouter.use(...requireGameAccess);

const listVisitedDialogues: RequestHandler = async (req, res) => {
  const dialogueIds = await getVisitedDialogueIds(req.authorId!);
  res.status(200).json(dialogueIds);
};

const markVisitedDialogue: RequestHandler = async (req, res) => {
  const { dialogueId } = req.body;

  if (!isOnceDialogueId(dialogueId)) {
    res.status(400).json({ error: "Invalid dialogue id" });
    return;
  }

  const dialogueIds = await markDialogueVisitedService(req.authorId!, dialogueId);
  res.status(200).json(dialogueIds);
};

dialoguesRouter.get("/", listVisitedDialogues);
dialoguesRouter.post("/", markVisitedDialogue);
