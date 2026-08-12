import { Router, type RequestHandler } from "express";

import {
  getCraftableOperationalResourceOutput,
  getStructureOperationalResourceItems,
  GROUND_HEIGHT,
  GROUND_WIDTH,
  isCraftableBugType,
  isHoleReadyToBecomeAnthill,
  pickMostFedBug,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { getAllEntitiesOnGrid } from "../helpers/entities.js";
import { isPrismaUniqueConstraintError } from "../helpers/isPrismaUniqueConstraintError.js";
import { findNearestEmptyPosition } from "../helpers/randomPosition.js";
import { getValidCoords } from "../helpers/validateCoords.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireStructure } from "../middleware/requireOwnedEntity.js";
import {
  createBug,
  getBug,
  getBugsByIds,
  updateBug as updateBugService,
} from "../services/bugsService.js";
import { toBugOnGridDto, toItemOnGridDto, toStructureOnGridDto } from "../services/helpers.js";
import { createItem, generateRandomItemType } from "../services/itemsService.js";
import {
  craftOperationalBugAtStructure,
  craftOperationalItemAtStructure,
  createFirstStructure as createFirstStructureService,
  createStructure as createStructureService,
  getHole,
  getStructure,
  getStructures,
  hasStructureOfType,
  transformHoleToAnthill as transformHoleToAnthillService,
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
    !["beetle_house", "workshop", "stonemason", "woodcutter", "kitchen", "tavern"].includes(
      structureType,
    )
  ) {
    res.status(400).json({ error: "Invalid structure type" });
    return;
  }

  const coords = getValidCoords(x, y);
  if (!coords) {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  if (await hasStructureOfType(authorId, structureType)) {
    res.status(400).json({ error: "Structure already built" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  const fits = structureFootprintFits(
    { x: coords.x, y: coords.y, structureType },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities,
  );

  if (!fits) {
    res.status(400).json({ error: "Position is not free for structure" });
    return;
  }

  try {
    const structure = await createStructureService({
      authorId,
      structureType,
      x: coords.x,
      y: coords.y,
    });
    res.status(201).json(toStructureOnGridDto(structure));
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      res.status(409).json({ error: "Structure already built" });
      return;
    }
    throw error;
  }
};

const createFirstStructure: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;
  const structures = await getStructures(authorId);
  if (structures.length > 0) {
    res.status(400).json({ error: "First structure already created" });
    return;
  }
  try {
    const structure = await createFirstStructureService(authorId);
    res.status(201).json(toStructureOnGridDto(structure));
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      res.status(409).json({ error: "First structure already created" });
      return;
    }
    throw error;
  }
};

const updateStructure: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const { x, y } = req.body;
  const authorId = req.authorId!;
  const existingStructure = req.structure!;

  const coords = getValidCoords(x, y);
  if (!coords) {
    res.status(400).json({ error: "x and y are required" });
    return;
  }

  const entities = await getAllEntitiesOnGrid(authorId);

  const fits = structureFootprintFits(
    { x: coords.x, y: coords.y, structureType: existingStructure.structureType },
    GROUND_WIDTH,
    GROUND_HEIGHT,
    entities.filter((e) => e.x !== existingStructure.x || e.y !== existingStructure.y),
  );

  if (!fits) {
    res.status(400).json({ error: "Position is not free for structure" });
    return;
  }

  const structure = await updateStructurePositionService(id, coords.x, coords.y);
  res.status(200).json(toStructureOnGridDto(structure));
};

const extractOccupant: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;
  const existingStructure = req.structure!;

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

const transformToAnthill: RequestHandler = async (req, res) => {
  const authorId = req.authorId!;

  const hole = await getHole(authorId);
  if (!hole) {
    res.status(400).json({ error: "Hole not found when transforming to anthill" });
    return;
  }
  if (!isHoleReadyToBecomeAnthill(hole)) {
    res.status(400).json({ error: "Hole is not ready to become an anthill" });
    return;
  }

  const anthill = await transformHoleToAnthillService(hole.id);
  res.status(200).json(toStructureOnGridDto(anthill));
};

const dig: RequestHandler<{ id: string }> = async (req, res) => {
  const authorId = req.authorId!;
  const hole = req.structure!;

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
  const existingStructure = req.structure!;

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

  if (isCraftableBugType(craftableOutput.outputType)) {
    const result = await craftOperationalBugAtStructure(
      id,
      authorId,
      craftableOutput.outputType,
      operationalItems.map((item) => item.id),
      emptyPosition,
    );

    res.status(201).json({
      bug: toBugOnGridDto(result.bug),
      structure: toStructureOnGridDto(result.structure),
    });
    return;
  }

  const result = await craftOperationalItemAtStructure(
    id,
    authorId,
    craftableOutput.outputType,
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
structuresRouter.post("/transform-to-anthill", transformToAnthill);
structuresRouter.put("/:id", requireStructure, updateStructure);
structuresRouter.post("/:id/extract-occupant", requireStructure, extractOccupant);
structuresRouter.post("/:id/craft", requireStructure, craft);
structuresRouter.post("/:id/dig", requireStructure, dig);
