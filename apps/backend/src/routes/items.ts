import { Router, type RequestHandler } from "express";

import {
  BEETLE_MAX_LEAF_PARTS,
  canCreateItemType,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  isCraftableItemType,
  ItemType,
} from "@happy-little-bug-town/utils";

import { isUuid } from "../helpers/isUuid.js";
import { assertFootprintFits, requireCoords } from "../helpers/placement.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireItem } from "../middleware/requireOwnedEntity.js";
import { getBug } from "../services/bugsService.js";
import {
  toBugOnGridDto,
  toItemOnGridDto,
  toStackOnGridDto,
  toStructureOnGridDto,
} from "../services/helpers.js";
import {
  createItem as createItemService,
  getItem as getItemService,
  getItemsOnGrid,
  hasParentCycle,
  updateItem as updateItemService,
} from "../services/itemsService.js";
import { getStack } from "../services/stacksService.js";
import { getStructure, hasStructureOfType } from "../services/structuresService.js";
import { UpdateItemData } from "../types/itemDto.js";

const ITEM_TYPES: ItemType[] = [
  "leaf_part",
  "little_rock",
  "root",
  "stick",
  "brick",
  "wood",
  "axe",
  "hammer_and_chisel",
  "leaf_rake",
  "shovel",
  "knife",
  "nettle_soup",
  "grilled_roots",
];

function isItemType(value: unknown): value is ItemType {
  return typeof value === "string" && ITEM_TYPES.includes(value as ItemType);
}

export const itemsRouter = Router();

itemsRouter.use(...requireGameAccess);

const listItems: RequestHandler = asyncHandler(async (req, res) => {
  const items = await getItemsOnGrid(req.authorId!);
  res.status(200).json(items.map(toItemOnGridDto));
});

const createItem: RequestHandler = asyncHandler(async (req, res) => {
  const { itemType, x, y } = req.body;
  const authorId = req.authorId!;

  if (!isItemType(itemType) || !isCraftableItemType(itemType)) {
    res.status(400).json({ error: "Invalid item type" });
    return;
  }
  const coords = requireCoords(x, y);
  if (!(await hasStructureOfType(authorId, "workshop"))) {
    res.status(400).json({ error: "Workshop is required to create items" });
    return;
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canCreateItemType(itemsOnGrid, itemType)) {
    res.status(400).json({ error: "Item already created" });
    return;
  }

  await assertFootprintFits(authorId, { x: coords.x, y: coords.y, itemType });

  const item = await createItemService({
    itemType,
    x: coords.x,
    y: coords.y,
    authorId,
  });
  res.status(201).json(toItemOnGridDto(item));
});

const updateItem: RequestHandler<{ id: string }, unknown, UpdateItemData> = asyncHandler(
  async (req, res) => {
  const { id } = req.params;
  const { x, y, stackId, bugId, structureId, parentItemId } = req.body;
  const authorId = req.authorId!;
  const existingItem = req.item!;

  if (parentItemId) {
    if (typeof parentItemId !== "string" || !isUuid(parentItemId)) {
      res.status(400).json({ error: "Invalid parentItemId" });
      return;
    }
    if (id === parentItemId) {
      res.status(400).json({ error: "Item cannot be added to itself" });
      return;
    }
    if (await hasParentCycle(id, parentItemId)) {
      res.status(400).json({ error: "Item cannot be added to its descendant" });
      return;
    }

    const parentItem = await getItemService(parentItemId);
    if (!parentItem || parentItem.authorId !== authorId) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (!canDropItemOnItem(existingItem, parentItem)) {
      res.status(400).json({ error: "Item cannot be added to item" });
      return;
    }

    await updateItemService(id, { parentItemId });
    const updatedParentItem = await getItemService(parentItemId);
    if (!updatedParentItem) {
      res.status(500).json({ error: "Parent item not found after updating item" });
      return;
    }
    res.status(200).json(toItemOnGridDto(updatedParentItem));
    return;
  }

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
    if (!canDropItemOnStructure(existingItem, existingStructure)) {
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
    if (typeof bugId !== "string" || !isUuid(bugId)) {
      res.status(400).json({ error: "Invalid bugId" });
      return;
    }
    if (existingItem.itemType !== "leaf_part") {
      res.status(400).json({ error: "Only leaf parts can be given to bugs" });
      return;
    }

    const existingBug = await getBug(bugId);
    if (!existingBug || existingBug.authorId !== authorId) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (existingBug.bugType !== "beetle") {
      res.status(400).json({ error: "Only beetles can carry leaf parts" });
      return;
    }
    if (existingBug.x == null || existingBug.y == null) {
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
    if (typeof stackId !== "string" || !isUuid(stackId)) {
      res.status(400).json({ error: "Invalid stackId" });
      return;
    }

    const existingStack = await getStack(stackId);
    if (!existingStack || existingStack.authorId !== authorId) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (existingItem.itemType !== existingStack.itemType) {
      res.status(400).json({ error: "Item type must match stack type" });
      return;
    }

    const itemsOnGrid = await getItemsOnGrid(authorId);
    if (!canStackItemType(existingItem.itemType, itemsOnGrid)) {
      res.status(400).json({ error: "Item cannot be stacked" });
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

  const coords = requireCoords(x, y);

  await assertFootprintFits(
    authorId,
    { x: coords.x, y: coords.y, itemType: existingItem.itemType },
    existingItem.x != null && existingItem.y != null
      ? { excludePosition: { x: existingItem.x, y: existingItem.y } }
      : undefined,
  );

  const item = await updateItemService(id, { x: coords.x, y: coords.y });
  res.status(200).json(toItemOnGridDto(item));
  },
);

itemsRouter.get("/", listItems);
itemsRouter.post("/create", createItem);
itemsRouter.put("/:id", requireItem, updateItem);
