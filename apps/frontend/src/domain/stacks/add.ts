export async function addItemToStack(itemId: string, stackId: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${itemId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stackId }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to update item" + error);
  }
}
