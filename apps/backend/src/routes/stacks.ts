import { Router, type RequestHandler } from "express";

import { canStackItemType } from "@happy-little-bug-town/utils";

import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
import { assertFootprintFits, requireCoords } from "../helpers/placement.js";
import { toBugOnGridDto } from "../mappers/bug.js";
import { toItemOnGridDto } from "../mappers/item.js";
import { toStackOnGridDto } from "../mappers/stack.js";
import { economyRateLimit } from "../middleware/rateLimits.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireStack } from "../middleware/requireOwnedEntity.js";
import {
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

const listStacks: RequestHandler = async (req, res) => {
  const stacks = await getStacks(req.authorId!);
  res.status(200).json(stacks.map(toStackOnGridDto));
};

const createStack: RequestHandler = async (req, res) => {
  const { x, y, itemIds } = req.body;
  const authorId = req.authorId!;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    res.status(400).json({ error: "itemIds must be a non-empty array" });
    return;
  }
  const parsedItemIds = itemIds.map((itemId: unknown) => parseUuidOrThrow(itemId, "itemIds"));
  const coords = requireCoords(x, y);

  const items = await getItemsByIds(authorId, parsedItemIds);
  if (items.length !== parsedItemIds.length) {
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

  await assertFootprintFits(
    authorId,
    { x: coords.x, y: coords.y, itemsCount: items.length },
    {
      excludePosition: items.map((item) => ({ x: item.x!, y: item.y! })),
    },
  );

  try {
    const stack = await createStackWithItems(
      {
        itemType,
        x: coords.x,
        y: coords.y,
        authorId,
      },
      parsedItemIds,
    );
    res.status(201).json(toStackOnGridDto(stack));
  } catch (error) {
    if (error instanceof StackItemsUnavailableError) {
      res.status(400).json({ error: "Some items are not available for stacking" });
      return;
    }
    throw error;
  }
};

const updateStack: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;
  const existingStack = req.stack!;

  const coords = requireCoords(x, y);

  await assertFootprintFits(
    authorId,
    { x: coords.x, y: coords.y, itemsCount: existingStack.itemsCount },
    { excludePosition: { x: existingStack.x, y: existingStack.y } },
  );

  const stack = await updateStackService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toStackOnGridDto(stack));
};

const mergeStacks: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { targetStackId } = req.body;
  const authorId = req.authorId!;
  const sourceStack = req.stack!;

  const parsedTargetStackId = parseUuidOrThrow(targetStackId, "targetStackId");

  if (id === parsedTargetStackId) {
    res.status(400).json({ error: "Cannot merge a stack with itself" });
    return;
  }

  const targetStack = await loadOwnedOr404(getStack, parsedTargetStackId, authorId);

  if (sourceStack.itemType !== targetStack.itemType) {
    res.status(400).json({ error: "Stacks must be of the same type to merge" });
    return;
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canStackItemType(sourceStack.itemType, itemsOnGrid)) {
    res.status(400).json({ error: "Stacks of this type cannot be merged" });
    return;
  }

  const { stack, releasedBugs } = await mergeStacksService(id, parsedTargetStackId);
  res.status(200).json({
    stack: toStackOnGridDto(stack),
    releasedBugs: releasedBugs.map(toBugOnGridDto),
  });
};

const extractItemFromStack: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;

  const { item, stackDissolved, releasedBugs, generated } = await takeItemFromStack(id, authorId);
  res.status(generated ? 201 : 200).json({
    extractedItem: toItemOnGridDto(item),
    stackDissolved,
    releasedBugs: releasedBugs.map(toBugOnGridDto),
    generated,
  });
};

stacksRouter.get("/", listStacks);
stacksRouter.post("/", createStack);
stacksRouter.post("/:id/merge", requireStack, mergeStacks);
stacksRouter.post("/:id/extract", economyRateLimit, requireStack, extractItemFromStack);
stacksRouter.put("/:id", requireStack, updateStack);
