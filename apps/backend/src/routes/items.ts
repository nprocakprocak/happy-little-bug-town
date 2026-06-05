import { Router, type RequestHandler } from "express";

import { BEETLE_MAX_LEAF_PARTS, canAcceptItemForBuild, positionOverlapsAnyEntity } from "@happy-little-park/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireAid } from "../middleware/requireAid.js";
import { getBug } from "../services/bugsService.js";
import {
  toBugOnGridDto,
  toItemOnGridDto,
  toStackOnGridDto,
  toStructureOnGridDto,
} from "../services/helpers.js";
import {
  getItem as getItemService,
  getItemsOnGrid,
  updateItem as updateItemService,
} from "../services/itemsService.js";
import { getStack } from "../services/stacksService.js";
import { getStructure } from "../services/structuresService.js";
import { UpdateItemData } from "../types/itemDto.js";

export const itemsRouter = Router();

itemsRouter.use(requireAid);

const listItems: RequestHandler = async (req, res) => {
  const items = await getItemsOnGrid(req.authorId!);
  res.status(200).json(items.map(toItemOnGridDto));
};

const updateItem: RequestHandler<{ id: string }, unknown, UpdateItemData> = async (req, res) => {
  const { id } = req.params;
  const { x, y, stackId, bugId, structureId } = req.body;
  const authorId = req.authorId!;

  if (structureId) {
    const existingItem = await getItemService(id);
    if (!existingItem) {
      res.status(400).json({ error: "Item not found when updating" });
      return;
    }
    if (existingItem.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const existingStructure = await getStructure(structureId);
    if (!existingStructure) {
      res.status(400).json({ error: "Structure not found when updating item" });
      return;
    }
    if (existingStructure.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!canAcceptItemForBuild(existingStructure, existingItem.itemType)) {
      res.status(400).json({ error: "Item cannot be added to structure" });
      return;
    }

    await updateItemService(id, { structureId });
    const structure = await getStructure(structureId);
    if (!structure) {
      res.status(500).json({ error: "Structure not found after updating item" });
      return;
    }
    // todo: move to structures router
    res.status(200).json(toStructureOnGridDto(structure));
    return;
  }

  if (bugId) {
    const existingItem = await getItemService(id);
    if (!existingItem) {
      res.status(400).json({ error: "Item not found when updating" });
      return;
    }
    if (existingItem.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (existingItem.itemType !== "leaf_part") {
      res.status(400).json({ error: "Only leaf parts can be given to bugs" });
      return;
    }

    const existingBug = await getBug(bugId);
    if (!existingBug) {
      res.status(400).json({ error: "Bug not found when updating item" });
      return;
    }
    if (existingBug.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (existingBug.bugType !== "beetle") {
      res.status(400).json({ error: "Only beetles can carry leaf parts" });
      return;
    }
    if (!existingBug.x || !existingBug.y) {
      res.status(400).json({ error: "Bug must be on the grid" });
      return;
    }
    if (existingBug.itemIds.length >= BEETLE_MAX_LEAF_PARTS) {
      res.status(400).json({ error: "Beetle is already full" });
      return;
    }

    await updateItemService(id, { bugId });
    const bug = await getBug(bugId);
    if (!bug) {
      res.status(500).json({ error: "Bug not found after updating item" });
      return;
    }
    // todo: move to bugs router
    res.status(200).json(toBugOnGridDto(bug));
    return;
  }

  if (stackId) {
    const existingItem = await getItemService(id);
    if (!existingItem) {
      res.status(400).json({ error: "Item not found when updating" });
      return;
    }
    if (existingItem.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!existingItem.stackable) {
      res.status(400).json({ error: "Item is not stackable" });
      return;
    }

    const existingStack = await getStack(stackId);
    if (!existingStack) {
      res.status(400).json({ error: "Stack not found when updating item" });
      return;
    }
    if (existingStack.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (existingItem.itemType !== existingStack.itemType) {
      res.status(400).json({ error: "Item type must match stack type" });
      return;
    }

    await updateItemService(id, { stackId });
    const stack = await getStack(stackId);
    if (!stack) {
      res.status(500).json({ error: "Stack not found after updating item" });
      return;
    }
    // todo: move to stacks router
    res.status(200).json(toStackOnGridDto(stack));
    return;
  }

  const existingItem = await getItemService(id);
  if (!existingItem) {
    res.status(400).json({ error: "Item not found when updating" });
    return;
  }
  if (existingItem.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!x || !y) {
    res.status(400).json({ error: "x and y are required when updating item not in stack" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  if (positionOverlapsAnyEntity({ x, y }, entities)) {
    res.status(400).json({ error: "Position is already occupied" });
    return;
  }

  const item = await updateItemService(id, { x, y });
  res.status(200).json(toItemOnGridDto(item));
};

itemsRouter.get("/", listItems);
itemsRouter.put("/:id", updateItem);
