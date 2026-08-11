import { Router, type RequestHandler } from "express";

import {
  getCraftableOperationalResourceOutput,
  getStructureOperationalResourceItems,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  pickMostFedBug,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { findNearestEmptyPosition } from "../helpers/randomPosition.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import {
  createBug,
  getBug,
  getBugsByIds,
  updateBug as updateBugService,
} from "../services/bugsService.js";
import { toBugOnGridDto, toItemOnGridDto, toStructureOnGridDto } from "../services/helpers.js";
import { createItem, generateRandomItemType } from "../services/itemsService.js";
import {
  craftOperationalItemAtStructure,
  createFirstStructure as createFirstStructureService,
  createStructure as createStructureService,
  getStructure,
  getStructures,
  hasBeetleHouse,
  hasKitchen,
  hasStonemason,
  hasWoodcutter,
  hasWorkshop,
  updateStructurePosition as updateStructurePositionService,
} from "../services/structuresService.js";

export const structuresRouter = Router();

structuresRouter.use(...requireGameAccess);

const listStructures: RequestHandler = async (req, res) => {
  const structures = await getStructures(req.authorId!);
  res.status(200).json(structures.map(toStructureOnGridDto));
};

const createStructure: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const { structureType, x, y } = req.body;

  if (
    !["beetle_house", "workshop", "stonemason", "woodcutter", "kitchen"].includes(structureType)
  ) {
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

  if (structureType === "stonemason" && (await hasStonemason(authorId))) {
    res.status(400).json({ error: "Stonemason already built" });
    return;
  }

  if (structureType === "woodcutter" && (await hasWoodcutter(authorId))) {
    res.status(400).json({ error: "Woodcutter already built" });
    return;
  }

  if (structureType === "kitchen" && (await hasKitchen(authorId))) {
    res.status(400).json({ error: "Kitchen already built" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  const fits = structureFootprintFits(
    { x, y, structureType },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities,
  );

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
    { x, y, structureType: existingStructure.structureType },
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
  const emptyPosition = findNearestEmptyPosition(
    GROUND_HEIGHT,
    GROUND_WIDTH,
    entities,
    existingStructure,
  );
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }

  const occupants = await getBugsByIds(existingStructure.bugs.map((bug) => bug.id));
  const occupantToExtract = pickMostFedBug(occupants);

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

const dig: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;

  const hole = await getStructure(id);
  if (!hole) {
    res.status(400).json({ error: "Structure not found when digging" });
    return;
  }
  if (hole.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (hole.structureType !== "hole") {
    res.status(400).json({ error: "Only holes can be dug" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findNearestEmptyPosition(GROUND_HEIGHT, GROUND_WIDTH, entities, hole);
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
    x: emptyPosition.x,
    y: emptyPosition.y,
    authorId,
  });
  res.status(201).json(toItemOnGridDto(createdItem));
};

const craft: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;

  const existingStructure = await getStructure(id);
  if (!existingStructure) {
    res.status(400).json({ error: "Structure not found when crafting operational resource" });
    return;
  }
  if (existingStructure.authorId !== authorId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const structureForCraft = {
    structureType: existingStructure.structureType,
    items: existingStructure.items,
    bugs: existingStructure.bugs,
  };

  const craftableOutput = getCraftableOperationalResourceOutput(structureForCraft);
  if (!craftableOutput) {
    res.status(400).json({ error: "Structure is not ready to craft operational resource" });
    return;
  }

  const { requirement } = craftableOutput;
  const operationalItems = getStructureOperationalResourceItems(
    existingStructure,
    requirement,
  ).slice(0, requirement.maxCount);
  if (operationalItems.length < requirement.maxCount) {
    res
      .status(400)
      .json({ error: "Structure does not have enough operational resources to craft" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);
  const emptyPosition = findNearestEmptyPosition(
    GROUND_HEIGHT,
    GROUND_WIDTH,
    entities,
    existingStructure,
  );
  if (!emptyPosition) {
    res.status(400).json({ error: "No empty position found" });
    return;
  }

  const footprintOrigin = { x: emptyPosition.x, y: emptyPosition.y };
  const fits = structureFootprintFits(footprintOrigin, GROUND_WIDTH, GROUND_HEIGHT, entities);
  if (!fits) {
    res.status(400).json({ error: "Position is not free for crafted resource" });
    return;
  }

  const result = await craftOperationalItemAtStructure(
    id,
    authorId,
    craftableOutput.outputItemType,
    operationalItems.map((item) => item.id),
    emptyPosition,
  );

  res.status(201).json({
    item: toItemOnGridDto(result.item),
    structure: toStructureOnGridDto(result.structure),
  });
};

structuresRouter.get("/", listStructures);
structuresRouter.post("/", createStructure);
structuresRouter.post("/create", createFirstStructure);
structuresRouter.put("/:id", updateStructure);
structuresRouter.post("/:id/extract-occupant", extractOccupant);
structuresRouter.post("/:id/craft", craft);
structuresRouter.post("/:id/dig", dig);
