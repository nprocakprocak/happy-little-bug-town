import { ItemType } from "../types/itemType.js";

const ITEM_TYPE_BY_KEY: Record<ItemType, true> = {
  leaf_part: true,
  little_rock: true,
  root: true,
  stick: true,
  brick: true,
  wood: true,
  axe: true,
  hammer_and_chisel: true,
  leaf_rake: true,
  shovel: true,
  knife: true,
  nettle_soup: true,
  grilled_greenflies: true,
  iron_ore: true,
  clay: true,
  glass: true,
  paper: true,
  crucible: true,
  iron_ingot: true,
  roof_tile: true,
  wheelbarrel: true,
  paving_stone: true,
  plank: true,
  plow: true,
  mushroom: true,
  pasta: true,
  rotten_apple: true,
  stuffed_fly: true,
  seeds: true,
  gravel: true,
  concrete: true,
  steel: true,
  basket: true,
  furniture: true,
  sculpture: true,
};

export const ITEM_TYPES = Object.keys(ITEM_TYPE_BY_KEY) as ItemType[];

const ITEM_TYPE_SET: Set<string> = new Set(ITEM_TYPES);

export function isItemType(value: unknown): value is ItemType {
  return typeof value === "string" && ITEM_TYPE_SET.has(value);
}
