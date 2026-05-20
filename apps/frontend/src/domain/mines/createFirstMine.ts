export async function createFirstMine() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mines/create`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error("Failed to create first mine:" + error);
  }

  return await response.json();
}
