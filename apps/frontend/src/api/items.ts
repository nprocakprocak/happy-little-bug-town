import { Position } from "@happy-little-park/utils";

import { Bug } from "../types/bug";
import { Item } from "../types/item";
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

export function addItemToStack(itemId: string, stackId: string): Promise<Item> {
  return apiFetch<Item>(`/api/items/${itemId}`, {
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
