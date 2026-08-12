import { Router, type RequestHandler } from "express";

import {
  BEETLE_MAX_LEAF_PARTS,
  canCreateItemType,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  isCraftableItemType,
  ItemType,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
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

const listItems: RequestHandler = async (req, res) => {
  const items = await getItemsOnGrid(req.authorId!);
  res.status(200).json(items.map(toItemOnGridDto));
};

const createItem: RequestHandler = async (req, res) => {
  const { itemType, x, y } = req.body;
  const authorId = req.authorId!;

  if (!isItemType(itemType) || !isCraftableItemType(itemType)) {
    res.status(400).json({ error: "Invalid item type" });
    return;
  }
  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }
  if (!(await hasStructureOfType(authorId, "workshop"))) {
    res.status(400).json({ error: "Workshop is required to create items" });
    return;
  }

  const itemsOnGrid = await getItemsOnGrid(authorId);
  if (!canCreateItemType(itemsOnGrid, itemType)) {
    res.status(400).json({ error: "Item already created" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const fits = structureFootprintFits({ x, y, itemType }, GROUND_WIDTH, GROUND_HEIGHT, entities);
  if (!fits) {
    res.status(400).json({ error: "Position is not free for item" });
    return;
  }

  const item = await createItemService({
    itemType,
    x,
    y,
    authorId,
  });
  res.status(201).json(toItemOnGridDto(item));
};

const updateItem: RequestHandler<{ id: string }, unknown, UpdateItemData> = async (req, res) => {
  const { id } = req.params;
  const { x, y, stackId, bugId, structureId, parentItemId } = req.body;
  const authorId = req.authorId!;

  if (parentItemId) {
    const existingItem = await getItemService(id);
    if (!existingItem) {
      res.status(400).json({ error: "Item not found when updating" });
      return;
    }
    if (existingItem.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (id === parentItemId) {
      res.status(400).json({ error: "Item cannot be added to itself" });
      return;
    }

    const parentItem = await getItemService(parentItemId);
    if (!parentItem) {
      res.status(400).json({ error: "Parent item not found when updating item" });
      return;
    }
    if (parentItem.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
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
  const fits = structureFootprintFits(
    { x, y, itemType: existingItem.itemType },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities.filter((entity) => entity.x !== existingItem.x || entity.y !== existingItem.y),
  );
  if (!fits) {
    res.status(400).json({ error: "Position is not free for item" });
    return;
  }

  const item = await updateItemService(id, { x, y });
  res.status(200).json(toItemOnGridDto(item));
};

itemsRouter.get("/", listItems);
itemsRouter.post("/create", createItem);
itemsRouter.put("/:id", updateItem);
