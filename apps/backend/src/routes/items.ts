import { Router, type RequestHandler } from "express";
import { findRandomEmptyPosition } from "../helpers/randomPosition.js";
import { Item } from "../prisma/prisma/client.js";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../services/constants.js";
import { createItem as createItemService, generateRandomItem, getItems } from "../services/ItemsService.js";
import { getMines } from "../services/MinesService.js";

export const itemsRouter = Router();

const listItems: RequestHandler = async (req, res) => {
  
  const authorId = req.cookies?.aid;
  if (!authorId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const items = await getItems(authorId);
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

const updateItem: RequestHandler<{ id: string }, unknown, Item> = (
  req,
  res,
) => {
  console.log("PUT /items/:id", { params: req.params, body: req.body });
  res.status(200).json({ ...req.body, id: req.params.id });
};

const deleteItem: RequestHandler<{ id: string }> = (req, res) => {
  console.log("DELETE /items/:id", { params: req.params });
  res.status(204).send();
};

const createRandomItem: RequestHandler = async (req, res) => {
  const authorId = req.cookies?.aid;
  if (!authorId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const items = await getItems(authorId);
  const mines = await getMines(authorId);
  const emptyPosition = findRandomEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, mines, items);
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }
  const item = await generateRandomItem(authorId, emptyPosition);
  const createdItem = await createItemService(item);
  res.status(201).json(createdItem);
}

itemsRouter.get("/", listItems);
itemsRouter.get("/:id", getItem);
itemsRouter.post("/", createItem);
itemsRouter.put("/:id", updateItem);
itemsRouter.delete("/:id", deleteItem);
itemsRouter.post("/random", createRandomItem);
