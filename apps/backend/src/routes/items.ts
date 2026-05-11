import type { Item } from "@happy-little-park/types";
import { Router, type RequestHandler } from "express";
import { generateRandomItem } from "../services/ItemsService.js";
import { findRandomEmptyPosition } from "../helpers/randomPosition.js";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../services/constants.js";

export const itemsRouter = Router();

const listItems: RequestHandler = (req, res) => {
  console.log("GET /items", { query: req.query });
  res.status(200).json([]);
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

const createRandomItem: RequestHandler = (req, res) => {
  console.log("POST /items/random", { body: req.body });
  const emptyPosition = findRandomEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, [], []);
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }
  const item = generateRandomItem(emptyPosition);
  res.status(201).json(item);
}

itemsRouter.get("/", listItems);
itemsRouter.get("/:id", getItem);
itemsRouter.post("/", createItem);
itemsRouter.put("/:id", updateItem);
itemsRouter.delete("/:id", deleteItem);
itemsRouter.post("/random", createRandomItem);
