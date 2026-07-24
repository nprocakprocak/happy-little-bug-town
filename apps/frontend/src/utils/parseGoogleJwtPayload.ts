interface GoogleJwtPayload {
  email?: string;
  name?: string;
  sub?: string;
}

export function parseGoogleJwtPayload(credential: string): GoogleJwtPayload {
  const base64Payload = credential.split(".")[1];
  if (!base64Payload) {
    return {};
  }

  const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json) as GoogleJwtPayload;
}
