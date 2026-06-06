import { Router, type RequestHandler } from "express";

import {
  getToolSpan,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  structureFootprintFits,
  ToolType,
} from "@happy-little-park/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { requireAid } from "../middleware/requireAid.js";
import { toStructureOnGridDto, toToolOnGridDto } from "../services/helpers.js";
import { getStructure, hasWorkshop } from "../services/structuresService.js";
import { createTool as createToolService, getTool as getToolService, getTools, updateTool as updateToolService } from "../services/toolsService.js";
import { isPositioned } from "../typeGuards/items.js";

const TOOL_TYPES: ToolType[] = ["leaf_rake", "shovel"];

function isToolType(value: unknown): value is ToolType {
  return typeof value === "string" && TOOL_TYPES.includes(value as ToolType);
}

export const toolsRouter = Router();

toolsRouter.use(requireAid);

const listTools: RequestHandler = async (req, res) => {
  const tools = await getTools(req.authorId!);
  res.status(200).json(tools.filter(isPositioned).map(toToolOnGridDto));
};

const getTool: RequestHandler<{ id: string }> = async (req, res) => {
  const tool = await getToolService(req.params.id);
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  if (tool.authorId !== req.authorId!) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.status(200).json(toToolOnGridDto(tool));
};

const createTool: RequestHandler = async (req, res) => {
  const { toolType, x, y } = req.body;
  const authorId = req.authorId!;

  if (!isToolType(toolType)) {
    res.status(400).json({ error: "Invalid tool type" });
    return;
  }
  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }
  if (!(await hasWorkshop(authorId))) {
    res.status(400).json({ error: "Workshop is required to create tools" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const span = getToolSpan();
  const fits = structureFootprintFits({ x, y, span }, GROUND_WIDTH, GROUND_HEIGHT, entities);

  if (!fits) {
    res.status(400).json({ error: "Position is not free for tool" });
    return;
  }

  const tool = await createToolService({
    toolType,
    x,
    y,
    authorId,
  });
  res.status(201).json(toToolOnGridDto(tool));
};

const updateTool: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y, structureId } = req.body;
  const authorId = req.authorId!;

  const existingTool = await getToolService(id);
  if (!existingTool) {
    res.status(400).json({ error: "Tool not found when updating" });
    return;
  }
  if (existingTool.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (structureId) {
    const existingStructure = await getStructure(structureId);
    if (!existingStructure) {
      res.status(400).json({ error: "Structure not found when updating tool" });
      return;
    }
    if (existingStructure.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (existingStructure.structureType !== "workshop") {
      // actually not true, the structure accepting tools does not exist yet
      res.status(400).json({ error: "Tools can only be placed in a workshop" });
      return;
    }

    await updateToolService(id, { structureId });
    const structure = await getStructure(structureId);
    if (!structure) {
      res.status(500).json({ error: "Structure not found after updating tool" });
      return;
    }
    res.status(200).json(toStructureOnGridDto(structure));
    return;
  }

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const span = getToolSpan();
  const fits = structureFootprintFits(
    { x, y, span },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities.filter((entity) => entity.x !== existingTool.x || entity.y !== existingTool.y),
  );

  if (!fits) {
    res.status(400).json({ error: "Position is not free for tool" });
    return;
  }

  const tool = await updateToolService(id, { x, y });
  res.status(200).json(toToolOnGridDto(tool));
};

toolsRouter.get("/", listTools);
toolsRouter.post("/create", createTool);
toolsRouter.get("/:id", getTool);
toolsRouter.put("/:id", updateTool);
