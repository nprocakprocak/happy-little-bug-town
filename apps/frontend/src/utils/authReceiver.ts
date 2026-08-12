import { loginWithGoogle, type AuthUser } from "../api/auth";

export interface GoogleAuthHandlers {
  onSuccess: (user: AuthUser) => void | Promise<void>;
  onError?: (error: Error) => void;
}

let handlers: GoogleAuthHandlers | null = null;

export function setGoogleAuthHandlers(next: GoogleAuthHandlers | null): void {
  handlers = next;
}

async function receiveGoogleAuth(response: google.accounts.id.CredentialResponse): Promise<void> {
  try {
    const user = await loginWithGoogle(response.credential);
    await handlers?.onSuccess(user);
  } catch (error) {
    handlers?.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

export function handleAuthReceiver(response: google.accounts.id.CredentialResponse): void {
  void receiveGoogleAuth(response);
}
