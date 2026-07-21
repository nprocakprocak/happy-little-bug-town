import { loginWithGoogle, type AuthUser } from "../api/auth";
import { AID_STORAGE_KEY } from "../constants/aid";

export interface GoogleAuthHandlers {
  onSuccess: (user: AuthUser) => void | Promise<void>;
  onError?: (error: Error) => void;
}

let handlers: GoogleAuthHandlers | null = null;

export function setGoogleAuthHandlers(next: GoogleAuthHandlers | null): void {
  handlers = next;
}

async function receiveGoogleAuth(response: google.accounts.id.CredentialResponse): Promise<void> {
  if (!localStorage.getItem(AID_STORAGE_KEY)) {
    return;
  }

  try {
    const user = await loginWithGoogle(response.credential);
    localStorage.setItem(AID_STORAGE_KEY, user.id);
    await handlers?.onSuccess(user);
  } catch (error) {
    handlers?.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

export function handleAuthReceiver(response: google.accounts.id.CredentialResponse): void {
  void receiveGoogleAuth(response);
}
