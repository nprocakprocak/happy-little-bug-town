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

import { loadOwnedOr404, parseUuidOrThrow } from "../helpers/ownership.js";
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
      const parsedParentItemId = parseUuidOrThrow(parentItemId, "parentItemId");
      if (id === parsedParentItemId) {
        res.status(400).json({ error: "Item cannot be added to itself" });
        return;
      }
      if (await hasParentCycle(id, parsedParentItemId)) {
        res.status(400).json({ error: "Item cannot be added to its descendant" });
        return;
      }

      const parentItem = await loadOwnedOr404(getItemService, parsedParentItemId, authorId);
      if (!canDropItemOnItem(existingItem, parentItem)) {
        res.status(400).json({ error: "Item cannot be added to item" });
        return;
      }

      await updateItemService(id, { parentItemId: parsedParentItemId });
      const updatedParentItem = await getItemService(parsedParentItemId);
      if (!updatedParentItem) {
        res.status(500).json({ error: "Parent item not found after updating item" });
        return;
      }
      res.status(200).json(toItemOnGridDto(updatedParentItem));
      return;
    }

    if (structureId) {
      const parsedStructureId = parseUuidOrThrow(structureId, "structureId");

      const existingStructure = await loadOwnedOr404(getStructure, parsedStructureId, authorId);
      if (!canDropItemOnStructure(existingItem, existingStructure)) {
        res.status(400).json({ error: "Item cannot be added to structure" });
        return;
      }

      await updateItemService(id, { structureId: parsedStructureId });
      const structure = await getStructure(parsedStructureId);
      if (!structure) {
        res.status(500).json({ error: "Structure not found after updating item" });
        return;
      }
      // todo: move to structures router
      res.status(200).json(toStructureOnGridDto(structure));
      return;
    }

    if (bugId) {
      const parsedBugId = parseUuidOrThrow(bugId, "bugId");
      if (existingItem.itemType !== "leaf_part") {
        res.status(400).json({ error: "Only leaf parts can be given to bugs" });
        return;
      }

      const existingBug = await loadOwnedOr404(getBug, parsedBugId, authorId);
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

      await updateItemService(id, { bugId: parsedBugId });
      const bug = await getBug(parsedBugId);
      if (!bug) {
        res.status(500).json({ error: "Bug not found after updating item" });
        return;
      }
      // todo: move to bugs router
      res.status(200).json(toBugOnGridDto(bug));
      return;
    }

    if (stackId) {
      const parsedStackId = parseUuidOrThrow(stackId, "stackId");

      const existingStack = await loadOwnedOr404(getStack, parsedStackId, authorId);
      if (existingItem.itemType !== existingStack.itemType) {
        res.status(400).json({ error: "Item type must match stack type" });
        return;
      }

      const itemsOnGrid = await getItemsOnGrid(authorId);
      if (!canStackItemType(existingItem.itemType, itemsOnGrid)) {
        res.status(400).json({ error: "Item cannot be stacked" });
        return;
      }

      await updateItemService(id, { stackId: parsedStackId });
      const stack = await getStack(parsedStackId);
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
