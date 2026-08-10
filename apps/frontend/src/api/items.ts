import { Position } from "@happy-little-bug-town/utils";

import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { apiFetch } from "./client";

export function fetchItems(): Promise<Item[]> {
  return apiFetch<Item[]>("/api/items");
}

export function updateItemPosition(itemId: string, position: Position): Promise<Item> {
  return apiFetch<Item>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(position),
  });
}

export function addItemToStack(itemId: string, stackId: string): Promise<Stack> {
  return apiFetch<Stack>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ stackId }),
  });
}

export function addItemToBug(itemId: string, bugId: string): Promise<Bug> {
  return apiFetch<Bug>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ bugId }),
  });
}

export function addItemToStructure(itemId: string, structureId: string): Promise<Structure> {
  return apiFetch<Structure>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ structureId }),
  });
}

export function addItemToItem(itemId: string, parentItemId: string): Promise<Item> {
  return apiFetch<Item>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ parentItemId }),
  });
}

export function createCraftableItem(data: Pick<Item, "itemType"> & Position): Promise<Item> {
  return apiFetch<Item>("/api/items/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
