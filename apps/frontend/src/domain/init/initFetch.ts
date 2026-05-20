import { Item } from "@happy-little-park/types";
import { apiFetch } from "../../api/client";

export async function initFetch(): Promise<{ items: Item[] }> {
  const items = await apiFetch<Item[]>("/api/items");
  return { items };
}
