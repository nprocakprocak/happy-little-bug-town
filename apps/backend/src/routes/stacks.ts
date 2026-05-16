import { Router, type RequestHandler } from "express";
import { requireAid } from "../middleware/requireAid.js";
import { createStackWithItems, getStacks } from "../services/StacksService.js";
import { getItemByIds, getItems } from "../services/ItemsService.js";

export const stacksRouter = Router();

stacksRouter.use(requireAid);

const listStacks: RequestHandler = async (req, res) => {
  const stacks = await getStacks(req.authorId!);
  res.status(200).json(stacks);
};

const createStack: RequestHandler = async (req, res) => {
  const { x, y, itemIds } = req.body;
  const authorId = req.authorId!;

  const items = await getItemByIds(authorId, itemIds);
  if (items.length !== itemIds.length) {
    res.status(400).json({ error: "Some items were not found when creating stack" });
    return;
  }

  const itemType = items[0].itemType;

  if (!items.every((item) => item.itemType === itemType)) {
    res.status(400).json({ error: "All items must be of the same type to be in a stack" });
    return;
  }

  const stack = await createStackWithItems({
    itemType,
    x,
    y,
    authorId,
  }, itemIds);

  res.status(201).json(stack);
};

stacksRouter.get("/", listStacks);
stacksRouter.post("/create", createStack);
