import { AID_HEADER, AID_STORAGE_KEY } from "../constants/aid";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export class LoginRequiredError extends Error {
  readonly code = "LOGIN_REQUIRED" as const;

  constructor(message = "Login required to save progress for this account.") {
    super(message);
    this.name = "LoginRequiredError";
  }
}

type LoginRequiredHandler = () => void;

let loginRequiredHandler: LoginRequiredHandler | null = null;

export function setLoginRequiredHandler(handler: LoginRequiredHandler | null): void {
  loginRequiredHandler = handler;
}

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
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      code?: string;
    } | null;

    if (response.status === 403 && body?.code === "LOGIN_REQUIRED") {
      loginRequiredHandler?.();
      throw new LoginRequiredError(body.error);
    }

    throw new Error(body?.error ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
