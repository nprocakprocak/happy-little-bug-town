import { ItemType, Position, Stack } from "@happy-little-park/types";

export async function createStack(
  position: Position,
  itemType: ItemType,
  itemIds: string[],
): Promise<Stack> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      x: position.x,
      y: position.y,
      itemType: itemType,
      itemIds: itemIds,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to create stack" + error);
  }

  return await response.json();
}
