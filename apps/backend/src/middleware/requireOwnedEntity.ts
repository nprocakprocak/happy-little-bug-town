import type { Request, RequestHandler } from "express";

import { getBug } from "../services/bugsService.js";
import { getItem } from "../services/itemsService.js";
import { getStack } from "../services/stacksService.js";
import { getStructure } from "../services/structuresService.js";
import type { BugDto } from "../types/bugDto.js";
import type { ItemDto } from "../types/itemDto.js";
import type { StackDto } from "../types/stackDto.js";
import type { StructureDto } from "../types/structureDto.js";

declare global {
  namespace Express {
    interface Request {
      structure?: StructureDto;
      item?: ItemDto;
      bug?: BugDto;
      stack?: StackDto;
    }
  }
}

interface OwnedEntity {
  authorId: string;
}

interface RequireOwnedEntityOptions<T extends OwnedEntity> {
  load: (id: string) => Promise<T | null>;
  entityName: string;
  setOnRequest: (req: Request, entity: T) => void;
}

function createRequireOwnedEntity<T extends OwnedEntity>(
  options: RequireOwnedEntityOptions<T>,
): RequestHandler<{ id: string }> {
  return async (req, res, next) => {
    const entity = await options.load(req.params.id);
    if (!entity) {
      res.status(404).json({ error: `${options.entityName} not found` });
      return;
    }
    if (entity.authorId !== req.authorId!) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    options.setOnRequest(req, entity);
    next();
  };
}

export const requireStructure = createRequireOwnedEntity({
  load: getStructure,
  entityName: "Structure",
  setOnRequest: (req, structure) => {
    req.structure = structure;
  },
});

export const requireItem = createRequireOwnedEntity({
  load: getItem,
  entityName: "Item",
  setOnRequest: (req, item) => {
    req.item = item;
  },
});

export const requireBug = createRequireOwnedEntity({
  load: getBug,
  entityName: "Bug",
  setOnRequest: (req, bug) => {
    req.bug = bug;
  },
});

export const requireStack = createRequireOwnedEntity({
  load: getStack,
  entityName: "Stack",
  setOnRequest: (req, stack) => {
    req.stack = stack;
  },
});
