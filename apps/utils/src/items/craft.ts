import { getItemCraftCosts } from "../constants/itemCraftCosts.js";
import { ItemType } from "../types/itemType.js";

export interface ItemCraftIngredient {
  itemType: ItemType;
}

export interface ItemForCraft {
  itemType: ItemType;
  items: ItemCraftIngredient[];
}

export interface ItemCraftResourceProgress {
  itemType: ItemType;
  supplied: number;
  required: number;
  missing: number;
}

export function isItemCrafted(item: ItemForCraft): boolean {
  const costs = getItemCraftCosts(item.itemType);

  return costs.every(({ itemType, count }) => {
    const supplied = item.items.filter((ingredient) => ingredient.itemType === itemType).length;
    return supplied >= count;
  });
}

export function isItemIncomplete(item: ItemForCraft): boolean {
  return !isItemCrafted(item);
}

export function getItemCraftProgress(item: ItemForCraft): ItemCraftResourceProgress[] {
  const costs = getItemCraftCosts(item.itemType);

  return costs.map(({ itemType, count: required }) => {
    const supplied = item.items.filter((ingredient) => ingredient.itemType === itemType).length;
    const missing = Math.max(0, required - supplied);
    return { itemType, supplied, required, missing };
  });
}

export function getActiveItemCraftResource(
  item: ItemForCraft,
): ItemCraftResourceProgress | undefined {
  return getItemCraftProgress(item).find(({ missing }) => missing > 0);
}

export function getVisibleItemCraftProgress(item: ItemForCraft): ItemCraftResourceProgress[] {
  const activeResource = getActiveItemCraftResource(item);
  return activeResource ? [activeResource] : [];
}

export function canAcceptItemForItemCraft(target: ItemForCraft, itemType: ItemType): boolean {
  if (!isItemIncomplete(target)) {
    return false;
  }

  const activeResource = getActiveItemCraftResource(target);
  return activeResource !== undefined && activeResource.itemType === itemType;
}

export function canDropItemOnItem(source: ItemForCraft, target: ItemForCraft): boolean {
  if (isItemIncomplete(source)) {
    return false;
  }

  return canAcceptItemForItemCraft(target, source.itemType);
}

export function itemShowsActivationGlow(item: ItemForCraft): boolean {
  return isItemIncomplete(item);
}
