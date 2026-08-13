import { Router, type RequestHandler } from "express";

import {
  getCraftableOperationalResourceOutput,
  getStructureOperationalResourceItems,
  isBuildableStructureType,
  isCraftableBugType,
  isHoleReadyToBecomeAnthill,
  pickMostFedBug,
} from "@happy-little-bug-town/utils";

import { isPrismaUniqueConstraintError } from "../errors/prismaErrors.js";
import { assertFootprintFits, requireCoords, requireNearestEmpty } from "../helpers/placement.js";
import { toBugOnGridDto } from "../mappers/bug.js";
import { toItemOnGridDto } from "../mappers/item.js";
import { toStructureOnGridDto } from "../mappers/structure.js";
import { economyRateLimit } from "../middleware/rateLimits.js";
import { requireGameAccess } from "../middleware/requireGameAccess.js";
import { requireStructure } from "../middleware/requireOwnedEntity.js";
import {
  createBug,
  getBug,
  getBugsByIds,
  updateBug as updateBugService,
} from "../services/bugsService.js";
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

  if (!isBuildableStructureType(structureType)) {
    res.status(400).json({ error: "Invalid structure type" });
    return;
  }

  const coords = requireCoords(x, y);

  if (await hasStructureOfType(authorId, structureType)) {
    res.status(400).json({ error: "Structure already built" });
    return;
  }

  await assertFootprintFits(authorId, {
    x: coords.x,
    y: coords.y,
    structureType,
  });

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

  const coords = requireCoords(x, y);

  await assertFootprintFits(
    authorId,
    { x: coords.x, y: coords.y, structureType: existingStructure.structureType },
    { excludePosition: { x: existingStructure.x, y: existingStructure.y } },
  );

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

  const emptyPosition = await requireNearestEmpty(authorId, existingStructure);

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

  const emptyPosition = await requireNearestEmpty(authorId, hole);
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

  const emptyPosition = await requireNearestEmpty(authorId, existingStructure);
  await assertFootprintFits(authorId, { x: emptyPosition.x, y: emptyPosition.y });

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
structuresRouter.post("/bootstrap", createFirstStructure);
structuresRouter.post("/transform-to-anthill", transformToAnthill);
structuresRouter.put("/:id", requireStructure, updateStructure);
structuresRouter.post("/:id/extract-occupant", requireStructure, extractOccupant);
structuresRouter.post("/:id/craft", economyRateLimit, requireStructure, craft);
structuresRouter.post("/:id/dig", economyRateLimit, requireStructure, dig);
