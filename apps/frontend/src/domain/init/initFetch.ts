import { Mine, Item, Stack } from "@happy-little-park/types";

export async function initFetch(): Promise<{ mines: Mine[]; items: Item[]; stacks: Stack[] }> {
  const [minesResponse, itemsResponse, stacksResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mines`, {
      credentials: "include",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items`, {
      credentials: "include",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks`, {
      credentials: "include",
    }),
  ]);

  if (!minesResponse.ok || !itemsResponse.ok || !stacksResponse.ok) {
    try {
      const { error: minesError } = await minesResponse.json();
      const { error: itemsError } = await itemsResponse.json();
      const { error: stacksError } = await stacksResponse.json();
      console.error("Failed to fetch grid items:", minesError, itemsError, stacksError);
    } catch (error) {
      console.error("Error parsing response:", error);
    } finally {
      throw new Error("Could not fetch grid items");
    }
  }

  const mines = await minesResponse.json();
  const items = await itemsResponse.json();
  const stacks = await stacksResponse.json();

  return { mines, items, stacks };
}
