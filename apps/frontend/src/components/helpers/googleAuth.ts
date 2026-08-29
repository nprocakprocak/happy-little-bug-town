import { loginWithGoogle } from "../../api/auth";
import { User } from "../../types/user";

interface GoogleAuthHandlers {
  onSuccess: (user: User) => void | Promise<void>;
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

export function waitForGoogleAccountsId(
  onReady: (accountsId: typeof google.accounts.id) => void,
): () => void {
  let cancelled = false;

  const tryReady = () => {
    if (cancelled || typeof google === "undefined" || !google.accounts?.id) {
      return false;
    }

    onReady(google.accounts.id);
    return true;
  };

  if (tryReady()) {
    return () => {
      cancelled = true;
    };
  }

  const intervalId = window.setInterval(() => {
    if (tryReady()) {
      window.clearInterval(intervalId);
    }
  }, 100);

  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
  };
}
