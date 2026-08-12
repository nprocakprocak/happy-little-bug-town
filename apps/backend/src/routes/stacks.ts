import { Router, type RequestHandler } from "express";

import {
  canStackItemType,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { isUuid } from "../helpers/isUuid.js";
import { findNearestEmptyPosition } from "../helpers/randomPosition.js";
import { getValidCoords } from "../helpers/validateCoords.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireStack } from "../middleware/requireOwnedEntity.js";
import { toStackOnGridDto } from "../services/helpers.js";
import {
  dissolveStack,
  getItemsByIds,
  getItemsOnGrid,
  isItemFreeOnGrid,
  takeItemFromStack,
} from "../services/itemsService.js";
import {
  createStackWithItems,
  getStack,
  getStacks,
  mergeStacks as mergeStacksService,
  StackItemsUnavailableError,
  updateStack as updateStackService,
} from "../services/stacksService.js";

export const stacksRouter = Router();

stacksRouter.use(...requireGameAccess);

const listStacks: RequestHandler = asyncHandler(async (req, res) => {
  const stacks = await getStacks(req.authorId!);
  res.status(200).json(stacks.map(toStackOnGridDto));
});

const createStack: RequestHandler = asyncHandler(async (req, res) => {
  const { x, y, itemIds } = req.body;
  const authorId = req.authorId!;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400).json({ error: "itemIds must be a non-empty array" });
    return;
  }
  if (!itemIds.every((id: unknown) => typeof id === "string" && isUuid(id))) {
    res.status(400).json({ error: "Invalid itemIds" });
    return;
  }
  const coords = getValidCoords(x, y);
  if (!coords) {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const items = await getItemsByIds(authorId, itemIds);
  if (items.length !== itemIds.length) {
    res.status(400).json({ error: "Some items were not found when creating stack" });
    return;
  }
  if (!items.every(isItemFreeOnGrid)) {
    res.status(400).json({ error: "All items must be free on the grid" });
    return;
  }

  const itemType = items[0].itemType;

  if (!items.every((item) => item.itemType === itemType)) {
    res.status(400).json({ error: "All items must be of the same type to be in a stack" });
    return;
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canStackItemType(itemType, itemsOnGrid)) {
    res.status(400).json({ error: "Items of this type cannot be stacked" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const entitiesWithoutItems = entities.filter(
    (entity) => !items.some((item) => item.x === entity.x && item.y === entity.y),
  );
  const fits = structureFootprintFits(
    { x: coords.x, y: coords.y, itemsCount: items.length },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entitiesWithoutItems,
  );
  if (!fits) {
    res.status(400).json({ error: "Position is not free for stack" });
    return;
  }

  try {
    const stack = await createStackWithItems(
      {
        itemType,
        x: coords.x,
        y: coords.y,
        authorId,
      },
      itemIds,
    );
    res.status(201).json(toStackOnGridDto(stack));
  } catch (error) {
    if (error instanceof StackItemsUnavailableError) {
      res.status(400).json({ error: "Some items are not available for stacking" });
      return;
    }
    throw error;
  }
});

const updateStack: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;
  const existingStack = req.stack!;

  const coords = getValidCoords(x, y);
  if (!coords) {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const fits = structureFootprintFits(
    { x: coords.x, y: coords.y, itemsCount: existingStack.itemsCount },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities.filter((entity) => entity.x !== existingStack.x || entity.y !== existingStack.y),
  );
  if (!fits) {
    res.status(400).json({ error: "Position is not free for stack" });
    return;
  }

  const stack = await updateStackService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toStackOnGridDto(stack));
});

const mergeStacks: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetStackId } = req.body;
  const authorId = req.authorId!;
  const sourceStack = req.stack!;

  if (typeof targetStackId !== "string" || !isUuid(targetStackId)) {
    res.status(400).json({ error: "Invalid targetStackId" });
    return;
  }

  if (id === targetStackId) {
    res.status(400).json({ error: "Cannot merge a stack with itself" });
    return;
  }

  const targetStack = await getStack(targetStackId);
  if (!targetStack || targetStack.authorId !== authorId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (sourceStack.itemType !== targetStack.itemType) {
    res.status(400).json({ error: "Stacks must be of the same type to merge" });
    return;
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canStackItemType(sourceStack.itemType, itemsOnGrid)) {
    res.status(400).json({ error: "Stacks of this type cannot be merged" });
    return;
  }

  const stack = await mergeStacksService(id, targetStackId);
  res.status(200).json(toStackOnGridDto(stack));
});

const extractItemFromStack: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;
  const existingStack = req.stack!;

  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findNearestEmptyPosition(
    GROUND_HEIGHT,
    GROUND_WIDTH,
    entities,
    existingStack,
  );
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }

  if (existingStack.itemsCount === 2) {
    const { extractedItem, remainingItem } = await dissolveStack(
      id,
      { x: existingStack.x, y: existingStack.y },
      emptyPosition,
    );
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
});

stacksRouter.get("/", listStacks);
stacksRouter.post("/create", createStack);
stacksRouter.post("/:id/merge", requireStack, mergeStacks);
stacksRouter.post("/:id/extract", requireStack, extractItemFromStack);
stacksRouter.put("/:id", requireStack, updateStack);
