import { Router, type RequestHandler } from "express";
import { findRandomEmptyPosition } from "../helpers/randomPosition.js";
import { requireAid } from "../middleware/requireAid.js";
import { Item } from "../prisma/prisma/client.js";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../services/constants.js";
import {
  createItem as createItemService,
  generateRandomItem,
  getItems,
  getItem as getItemService,
  updateItem as updateItemService,
} from "../services/itemsService.js";
import { getMines } from "../services/minesService.js";
import { getStack } from "../services/stacksService.js";

export const itemsRouter = Router();

itemsRouter.use(requireAid);

const listItems: RequestHandler = async (req, res) => {
  const items = await getItems(req.authorId!);
  res.status(200).json(items);
};

const getItem: RequestHandler<{ id: string }> = (req, res) => {
  console.log("GET /items/:id", { params: req.params });
  res.status(200).json({ id: req.params.id });
};

const createItem: RequestHandler<Record<string, string>, unknown, Item> = (
  req,
  res,
) => {
  console.log("POST /items", { body: req.body });
  res.status(201).json(req.body);
};

const updateItem: RequestHandler<{ id: string }, unknown, Item> = async (
  req,
  res,
) => {
  const { id } = req.params;
  const { x, y, stackId } = req.body;
  const authorId = req.authorId!;

  if (stackId) {
    const existingStack = await getStack(stackId);
    if (!existingStack) {
      res.status(400).json({ error: "Stack not found when updating item" });
      return;
    }
    if (existingStack.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    
    const item = await updateItemService(id, { stackId });
    res.status(200).json(item);
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

  const items = await getItems(authorId);
  const mines = await getMines(authorId);

  if ([...items, ...mines].some((it) => it.x === x && it.y === y)) {
    res.status(400).json({ error: "Position is already occupied" });
    return;
  }

  const item = await updateItemService(id, { x, y });
  res.status(200).json(item);
};

const deleteItem: RequestHandler<{ id: string }> = (req, res) => {
  console.log("DELETE /items/:id", { params: req.params });
  res.status(204).send();
};

const createRandomItem: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const items = await getItems(authorId);
  const mines = await getMines(authorId);
  const emptyPosition = findRandomEmptyPosition(
    GROUND_HEIGHT,
    GROUND_WIDTH,
    mines,
    items,
  );
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }
  const item = await generateRandomItem(authorId, emptyPosition);
  const createdItem = await createItemService(item);
  res.status(201).json(createdItem);
};

itemsRouter.get("/", listItems);
itemsRouter.get("/:id", getItem);
itemsRouter.post("/", createItem);
itemsRouter.put("/:id", updateItem);
itemsRouter.delete("/:id", deleteItem);
itemsRouter.post("/random", createRandomItem);
