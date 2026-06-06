import { Router, type RequestHandler } from "express";

import {
  canStackItemType,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  positionOverlapsAnyEntity,
} from "@happy-little-park/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { findRandomEmptyPosition } from "../helpers/randomPosition.js";
import { requireAid } from "../middleware/requireAid.js";
import { toStackOnGridDto } from "../services/helpers.js";
import { dissolveStack, getItemsByIds, takeItemFromStack } from "../services/itemsService.js";
import {
  createStackWithItems,
  getStack,
  getStacks,
  mergeStacks as mergeStacksService,
  updateStack as updateStackService,
} from "../services/stacksService.js";
import { getTools } from "../services/toolsService.js";

export const stacksRouter = Router();

stacksRouter.use(requireAid);

const listStacks: RequestHandler = async (req, res) => {
  const stacks = await getStacks(req.authorId!);
  res.status(200).json(stacks.map(toStackOnGridDto));
};

const createStack: RequestHandler = async (req, res) => {
  const { x, y, itemIds } = req.body;
  const authorId = req.authorId!;

  const items = await getItemsByIds(authorId, itemIds);
  if (items.length !== itemIds.length) {
    res.status(400).json({ error: "Some items were not found when creating stack" });
    return;
  }

  const itemType = items[0].itemType;

  if (!items.every((item) => item.itemType === itemType)) {
    res.status(400).json({ error: "All items must be of the same type to be in a stack" });
    return;
  }

  const tools = await getTools(authorId);
  if (!canStackItemType(itemType, tools)) {
    res.status(400).json({ error: "Items of this type cannot be stacked" });
    return;
  }

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const entitiesWithoutItems = entities.filter(
    (entity) => !items.some((item) => item.x === entity.x && item.y === entity.y),
  );
  if (positionOverlapsAnyEntity({ x, y }, entitiesWithoutItems)) {
    res.status(400).json({ error: "Position is already occupied" });
    return;
  }

  const stack = await createStackWithItems(
    {
      itemType,
      x,
      y,
      authorId,
    },
    itemIds,
  );

  res.status(201).json(toStackOnGridDto(stack));
};

const updateStack: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;

  const existingStack = await getStack(id);
  if (!existingStack) {
    res.status(400).json({ error: "Item not found when updating" });
    return;
  }
  if (existingStack.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
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

  const stack = await updateStackService(id, { x, y });
  res.status(200).json(toStackOnGridDto(stack));
};

const mergeStacks: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { targetStackId } = req.body;
  const authorId = req.authorId!;

  if (!targetStackId || typeof targetStackId !== "string") {
    res.status(400).json({ error: "targetStackId is required" });
    return;
  }

  if (id === targetStackId) {
    res.status(400).json({ error: "Cannot merge a stack with itself" });
    return;
  }

  const sourceStack = await getStack(id);
  if (!sourceStack) {
    res.status(400).json({ error: "Source stack not found when merging" });
    return;
  }
  if (sourceStack.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const targetStack = await getStack(targetStackId);
  if (!targetStack) {
    res.status(400).json({ error: "Target stack not found when merging" });
    return;
  }
  if (targetStack.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (sourceStack.itemType !== targetStack.itemType) {
    res.status(400).json({ error: "Stacks must be of the same type to merge" });
    return;
  }

  const tools = await getTools(authorId);
  if (!canStackItemType(sourceStack.itemType, tools)) {
    res.status(400).json({ error: "Stacks of this type cannot be merged" });
    return;
  }

  const stack = await mergeStacksService(id, targetStackId);
  res.status(200).json(toStackOnGridDto(stack));
};

const extractItemFromStack: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;

  const existingStack = await getStack(id);
  if (!existingStack) {
    res.status(400).json({ error: "Stack not found when extracting item" });
    return;
  }
  if (existingStack.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findRandomEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, entities);
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }

  const stackPosition = { x: existingStack.x, y: existingStack.y };

  if (existingStack.itemsCount === 2) {
    const { extractedItem, remainingItem } = await dissolveStack(id, stackPosition, emptyPosition);
    res.status(200).json({
      extractedItem,
      remainingItem,
      stackDissolved: true,
    });
    return;
  }

  const item = await takeItemFromStack(id, emptyPosition);
  res.status(200).json({
    extractedItem: item,
    stackDissolved: false,
  });
};

stacksRouter.get("/", listStacks);
stacksRouter.post("/create", createStack);
stacksRouter.post("/:id/merge", mergeStacks);
stacksRouter.post("/:id/extract", extractItemFromStack);
stacksRouter.put("/:id", updateStack);
