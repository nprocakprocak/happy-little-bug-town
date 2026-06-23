import { AID_STORAGE_KEY } from "../constants/aid";
import { parseGoogleJwtPayload } from "./parseGoogleJwtPayload";

async function receiveGoogleAuth(response: google.accounts.id.CredentialResponse): Promise<void> {
  const anonymousId = localStorage.getItem(AID_STORAGE_KEY);
  if (!anonymousId) {
    return;
  }

  const { email, name } = parseGoogleJwtPayload(response.credential);

  console.log("receiveGoogleAuth", { credential: response.credential, email, name });

  // todo: save to zustand
}

export function handleAuthReceiver(response: google.accounts.id.CredentialResponse): void {
  void receiveGoogleAuth(response);
}
