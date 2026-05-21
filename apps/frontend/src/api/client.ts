import { AID_HEADER, AID_STORAGE_KEY } from "../constants/aid";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

function getAid(): string | null {
  return localStorage.getItem(AID_STORAGE_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const aid = getAid();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (aid) {
    headers.set(AID_HEADER, aid);
  }

  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
