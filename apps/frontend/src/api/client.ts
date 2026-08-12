import { useMainStore } from "../stores/main";
import { LoginRequiredError } from "../utils/loginRequiredError";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

type ApiErrorResponse = {
  error?: string;
  code?: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    if (response.status === 403 && body?.code === "LOGIN_REQUIRED") {
      useMainStore.getState().setRequiresLogin(true);
      throw new LoginRequiredError(body.error);
    }

    throw new Error(body?.error ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
