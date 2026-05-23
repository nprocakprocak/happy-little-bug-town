import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";

type Entity = Item | Stack | Bug;

export function isStack(entity: Entity): entity is Stack {
  return "itemsCount" in entity;
}

export function isBug(entity: Entity): entity is Bug {
  return "bugType" in entity;
}

export function isItem(entity: Entity): entity is Item {
  return !isStack(entity) && !isBug(entity);
}
