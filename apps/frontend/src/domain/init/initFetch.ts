import { Mine, Item } from "@happy-little-park/types";
import { apiFetch } from "../../api/client";

export async function initFetch(): Promise<{ mines: Mine[]; items: Item[] }> {
  const [mines, items] = await Promise.all([
    apiFetch<Mine[]>("/api/mines"),
    apiFetch<Item[]>("/api/items"),
  ]);

  return { mines, items };
}
