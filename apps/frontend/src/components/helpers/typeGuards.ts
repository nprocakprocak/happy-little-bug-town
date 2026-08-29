import { Positionable } from "@happy-little-bug-town/utils";

import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";

export function isStack(entity: Positionable): entity is Stack {
  return "itemsCount" in entity;
}

export function isBug(entity: Positionable): entity is Bug {
  return "bugType" in entity;
}

export function isStructure(entity: Positionable): entity is Structure {
  return "structureType" in entity;
}

export function isItem(entity: Positionable): entity is Item {
  return !isStack(entity) && !isBug(entity) && !isStructure(entity);
}
