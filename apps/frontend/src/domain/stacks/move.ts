import { Position, Stack } from "@happy-little-park/types";

export async function moveStack(stackId: string, position: Position): Promise<Stack> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/${stackId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(position),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to update stack" + error);
  }

  return await response.json();
}
