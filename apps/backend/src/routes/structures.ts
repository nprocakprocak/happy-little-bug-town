import { Router, type RequestHandler } from "express";

import {
  getStructureSpan,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  structureFootprintFits,
} from "@happy-little-park/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { findRandomEmptyPosition } from "../helpers/randomPosition.js";
import { requireAid } from "../middleware/requireAid.js";
import { createBug, getBug, updateBug as updateBugService } from "../services/bugsService.js";
import { isItemStackable, toBugOnGridDto, toItemOnGridDto, toStructureOnGridDto } from "../services/helpers.js";
import { createItem, generateRandomItemType } from "../services/itemsService.js";
import {
  createFirstStructure as createFirstStructureService,
  createStructure as createStructureService,
  getStructure,
  getStructures,
  hasBeetleHouse,
  hasWorkshop,
  updateStructurePosition as updateStructurePositionService,
} from "../services/structuresService.js";

export const structuresRouter = Router();

structuresRouter.use(requireAid);

const listStructures: RequestHandler = async (req, res) => {
  const structures = await getStructures(req.authorId!);
  res.status(200).json(structures.map(toStructureOnGridDto));
};

const createStructure: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const { structureType, x, y } = req.body;

  if (structureType !== "beetle_house" && structureType !== "workshop") {
    res.status(400).json({ error: "Invalid structure type" });
    return;
  }
  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  if (structureType === "beetle_house" && (await hasBeetleHouse(authorId))) {
    res.status(400).json({ error: "Beetle house already built" });
    return;
  }

  if (structureType === "workshop" && (await hasWorkshop(authorId))) {
    res.status(400).json({ error: "Workshop already built" });
    return;
  }

  const span = getStructureSpan(structureType);
  const entities = await getAllEntitiesOnGrid(authorId);

  const fits = structureFootprintFits({ x, y, span }, GROUND_WIDTH, GROUND_HEIGHT, entities);

  if (!fits) {
    res.status(400).json({ error: "Position is not free for structure" });
    return;
  }

  const structure = await createStructureService({
    authorId,
    structureType,
    x,
    y,
  });
  res.status(201).json(toStructureOnGridDto(structure));
};

const createFirstStructure: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const structures = await getStructures(authorId);
  if (structures.length > 0) {
    res.status(400).json({ error: "First structure already created" });
    return;
  }
  const structure = await createFirstStructureService(authorId);
  res.status(201).json(toStructureOnGridDto(structure));
};

const updateStructure: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;

  if (typeof x !== "number" || typeof y !== "number") {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const existingStructure = await getStructure(id);
  if (!existingStructure) {
    res.status(400).json({ error: "Structure not found when updating" });
    return;
  }
  if (existingStructure.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  const fits = structureFootprintFits(
    { x, y, span: existingStructure.span },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities.filter((e) => e.x !== existingStructure.x || e.y !== existingStructure.y),
  );

  if (!fits) {
    res.status(400).json({ error: "Position is not free for structure" });
    return;
  }

  const structure = await updateStructurePositionService(id, x, y);
  res.status(200).json(toStructureOnGridDto(structure));
};

const extractOccupant: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;

  const existingStructure = await getStructure(id);
  if (!existingStructure) {
    res.status(400).json({ error: "Structure not found when extracting occupant" });
    return;
  }
  if (existingStructure.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (existingStructure.structureType !== "beetle_house") {
    res.status(400).json({ error: "Only beetle houses can extract occupants" });
    return;
  }
  if (existingStructure.bugs.length === 0) {
    res.status(400).json({ error: "No occupants in house" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findRandomEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, entities);
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }

  const occupantToExtract =
    existingStructure.bugs[Math.floor(Math.random() * existingStructure.bugs.length)];

  await updateBugService(occupantToExtract.id, {
    x: emptyPosition.x,
    y: emptyPosition.y,
  });

  const bug = await getBug(occupantToExtract.id);
  const structure = await getStructure(id);
  if (!bug || !structure) {
    res.status(500).json({ error: "Failed to extract occupant from structure" });
    return;
  }

  res.status(200).json({
    extractedOccupant: toBugOnGridDto(bug),
    structure: toStructureOnGridDto(structure),
  });
};

const dig: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findRandomEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, entities);
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }
  const itemOrBug = generateRandomItemType();
  if (itemOrBug === "beetle") {
    const createdBug = await createBug({
      bugType: itemOrBug,
      x: emptyPosition.x,
      y: emptyPosition.y,
      authorId,
    });
    res.status(201).json(toBugOnGridDto(createdBug));
    return;
  }
  const createdItem = await createItem({
    itemType: itemOrBug,
    stackable: isItemStackable(itemOrBug),
    x: emptyPosition.x,
    y: emptyPosition.y,
    authorId,
  });
  res.status(201).json(toItemOnGridDto(createdItem));
};

structuresRouter.get("/", listStructures);
structuresRouter.post("/", createStructure);
structuresRouter.post("/create", createFirstStructure);
structuresRouter.put("/:id", updateStructure);
structuresRouter.post("/:id/extract-occupant", extractOccupant);
structuresRouter.post("/dig", dig);
