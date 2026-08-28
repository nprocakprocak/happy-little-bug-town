import { Router, type RequestHandler } from "express";

import {
  canCreateItemType,
  getCompletedUpgradeLevel,
  isCraftableItemType,
  isItemType,
  isWorkshopItemUnlocked,
} from "@happy-little-bug-town/utils";

import { assertFootprintFits, requireCoords } from "../helpers/placement.js";
import { toItemOnGridDto } from "../mappers/item.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireItem } from "../middleware/requireOwnedEntity.js";
import {
  attachItemToBug,
  attachItemToParent,
  attachItemToStack,
  attachItemToStructure,
  createItem as createItemService,
  discardItemIntoStructure,
  getItemsOnGrid,
  updateItem as updateItemService,
} from "../services/itemsService.js";
import { getStructures } from "../services/structuresService.js";
import { UpdateItemData } from "../types/itemDto.js";

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
  const coords = requireCoords(x, y);
  const structures = await getStructures(authorId);
  const workshop = structures.find((structure) => structure.structureType === "workshop");
  if (!workshop) {
    res.status(400).json({ error: "Workshop is required to create items" });
    return;
  }
  if (!isWorkshopItemUnlocked(itemType, getCompletedUpgradeLevel(workshop))) {
    res.status(400).json({ error: "Workshop upgrade required" });
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
};

const updateItem: RequestHandler<{ id: string }, unknown, UpdateItemData> = async (req, res) => {
  const { id } = req.params;
  const { x, y, stackId, bugId, structureId, parentItemId } = req.body;
  const authorId = req.authorId!;
  const existingItem = req.item!;

  if (parentItemId) {
    const parentItem = await attachItemToParent(id, parentItemId, existingItem, authorId);
    res.status(200).json(parentItem);
    return;
  }

  if (structureId) {
    const structure = await attachItemToStructure(id, structureId, existingItem, authorId);
    res.status(200).json(structure);
    return;
  }

  if (bugId) {
    const bug = await attachItemToBug(id, bugId, existingItem, authorId);
    res.status(200).json(bug);
    return;
  }

  if (stackId) {
    const stack = await attachItemToStack(id, stackId, existingItem, authorId);
    res.status(200).json(stack);
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
};

const deleteItem: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { structureId } = req.body;
  const authorId = req.authorId!;

  await discardItemIntoStructure(id, structureId, authorId);
  res.status(204).end();
};

itemsRouter.get("/", listItems);
itemsRouter.post("/", createItem);
itemsRouter.put("/:id", requireItem, updateItem);
itemsRouter.delete("/:id", requireItem, deleteItem);
