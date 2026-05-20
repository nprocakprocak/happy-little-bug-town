import { Item } from "@happy-little-park/types";

export async function extractItemFromStack(stackId: string): Promise<Item> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/${stackId}/extract`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to extract item from stack" + error);
  }

  return await response.json();
}
