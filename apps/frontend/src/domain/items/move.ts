import { Item, Position } from "@happy-little-park/types";

export async function moveItem(itemId: string, position: Position): Promise<Item> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${itemId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(position),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to update item" + error);
  }

  return await response.json();
}
