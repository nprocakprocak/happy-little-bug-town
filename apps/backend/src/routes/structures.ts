import { Router, type RequestHandler } from "express";

import {
  canRelocateStructure,
  canStartStructureUpgrade,
  getCraftableOperationalResourceOutput,
  getEvolutionStepFromType,
  getHouseOccupants,
  getNextStructureUpgradeLevel,
  getStructureOperationalResourceBugs,
  getStructureOperationalResourceItems,
  isBuildableStructureType,
  isCraftableBugType,
  isFarmBuildableStructureType,
  isStructureReadyToEvolve,
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
import { getBug, getBugsByIds, updateBug as updateBugService } from "../services/bugsService.js";
import { getItemsOnGrid } from "../services/itemsService.js";
import {
  craftOperationalBugAtStructure,
  craftOperationalItemAtStructure,
  createFirstStructure as createFirstStructureService,
  createStructure as createStructureService,
  demolishAtStructure,
  digAtStructure,
  evolveStructureType as evolveStructureTypeService,
  getStructure,
  getStructures,
  hasStructureOfType,
  updateStructure as updateStructureService,
} from "../services/structuresService.js";
import { UpdateStructureData } from "../types/structureDto.js";

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

  if (
    isFarmBuildableStructureType(structureType) &&
    !(await hasStructureOfType(authorId, "farm"))
  ) {
    res.status(400).json({ error: "Farm is required to create this structure" });
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
  const { x, y, upgradeLevel: upgradeLevelInput } = req.body;
  const authorId = req.authorId!;
  const existingStructure = req.structure!;
  const hasPositionUpdate = x !== undefined || y !== undefined;
  const hasUpgradeUpdate = upgradeLevelInput !== undefined;

  if (!hasPositionUpdate && !hasUpgradeUpdate) {
    res.status(400).json({ error: "No structure fields to update" });
    return;
  }

  const data: UpdateStructureData = {};

  if (hasPositionUpdate) {
    const itemsOnGrid = await getItemsOnGrid(authorId);
    if (!canRelocateStructure(existingStructure, itemsOnGrid)) {
      res.status(400).json({ error: "This structure cannot be moved" });
      return;
    }

    const coords = requireCoords(x, y);

    await assertFootprintFits(
      authorId,
      { x: coords.x, y: coords.y, structureType: existingStructure.structureType },
      { excludePosition: { x: existingStructure.x, y: existingStructure.y } },
    );

    data.x = coords.x;
    data.y = coords.y;
  }

  if (hasUpgradeUpdate) {
    if (
      typeof upgradeLevelInput !== "number" ||
      !Number.isInteger(upgradeLevelInput) ||
      !Number.isFinite(upgradeLevelInput)
    ) {
      res.status(400).json({ error: "Invalid upgrade level" });
      return;
    }

    if (
      !canStartStructureUpgrade(existingStructure) ||
      upgradeLevelInput !== getNextStructureUpgradeLevel(existingStructure)
    ) {
      res.status(400).json({ error: "Structure cannot be upgraded" });
      return;
    }

    data.upgradeLevel = upgradeLevelInput;
  }

  const structure = await updateStructureService(id, data);
  res.status(200).json(toStructureOnGridDto(structure));
};

const extractOccupant: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;
  const existingStructure = req.structure!;

  if (
    existingStructure.structureType !== "beetle_house" &&
    existingStructure.structureType !== "greenfly_house"
  ) {
    res.status(400).json({ error: "This structure cannot extract occupants" });
    return;
  }

  const occupants = getHouseOccupants(existingStructure);
  if (occupants.length === 0) {
    res.status(400).json({ error: "No occupants in house" });
    return;
  }

  const emptyPosition = await requireNearestEmpty(authorId, existingStructure);

  const occupantIds = occupants.map((occupant) => occupant.id);
  const occupantBugs = await getBugsByIds(occupantIds);
  const occupantToExtract = pickMostFedBug(occupantBugs);

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

const evolveStructure: RequestHandler<{ id: string }> = async (req, res) => {
  const existingStructure = req.structure!;
  const step = getEvolutionStepFromType(existingStructure.structureType);

  if (!step || !isStructureReadyToEvolve(existingStructure)) {
    res.status(400).json({ error: "Structure is not ready to evolve" });
    return;
  }

  const evolved = await evolveStructureTypeService(existingStructure.id, step.toType);
  res.status(200).json(toStructureOnGridDto(evolved));
};

const dig: RequestHandler<{ id: string }> = async (req, res) => {
  const itemOrBug = await digAtStructure(req.authorId!, req.structure!);
  if ("bugType" in itemOrBug) {
    res.status(201).json(toBugOnGridDto(itemOrBug));
    return;
  }
  res.status(201).json(toItemOnGridDto(itemOrBug));
};

const craft: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId!;
  const existingStructure = req.structure!;

  const structureForCraft = {
    structureType: existingStructure.structureType,
    upgradeLevel: existingStructure.upgradeLevel,
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
  const operationalBugs = getStructureOperationalResourceBugs(existingStructure, requirement).slice(
    0,
    requirement.maxCount,
  );
  const operationalCount = operationalItems.length + operationalBugs.length;
  if (operationalCount < requirement.maxCount) {
    res
      .status(400)
      .json({ error: "Structure does not have enough operational resources to craft" });
    return;
  }

  const emptyPosition = await requireNearestEmpty(authorId, existingStructure);
  await assertFootprintFits(authorId, { x: emptyPosition.x, y: emptyPosition.y });

  const operationalItemIds = operationalItems.map((item) => item.id);
  const operationalBugIds = operationalBugs.map((bug) => bug.id);

  if (isCraftableBugType(craftableOutput.outputType)) {
    const result = await craftOperationalBugAtStructure(
      id,
      authorId,
      craftableOutput.outputType,
      operationalItemIds,
      operationalBugIds,
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
    operationalItemIds,
    operationalBugIds,
    emptyPosition,
  );

  res.status(201).json({
    item: toItemOnGridDto(result.item),
    structure: toStructureOnGridDto(result.structure),
  });
};

const demolish: RequestHandler<{ id: string }> = async (req, res) => {
  const result = await demolishAtStructure(req.authorId!, req.structure!);
  res.status(200).json({
    item: result.item ? toItemOnGridDto(result.item) : undefined,
    bug: result.bug ? toBugOnGridDto(result.bug) : undefined,
    structure: result.structure ? toStructureOnGridDto(result.structure) : null,
  });
};

structuresRouter.get("/", listStructures);
structuresRouter.post("/", createStructure);
structuresRouter.post("/bootstrap", createFirstStructure);
structuresRouter.put("/:id", requireStructure, updateStructure);
structuresRouter.post("/:id/evolve", requireStructure, evolveStructure);
structuresRouter.post("/:id/extract-occupant", requireStructure, extractOccupant);
structuresRouter.post("/:id/craft", economyRateLimit, requireStructure, craft);
structuresRouter.post("/:id/dig", economyRateLimit, requireStructure, dig);
structuresRouter.post("/:id/demolish", economyRateLimit, requireStructure, demolish);
