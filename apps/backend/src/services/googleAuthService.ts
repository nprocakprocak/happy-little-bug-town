import { OAuth2Client } from "google-auth-library";

import { loadAuthEnv } from "../config/authEnv.js";
import { prisma } from "../lib/prisma.js";

export interface GoogleTokenPayload {
  sub: string;
  email?: string;
  name?: string;
}

export interface GoogleLoginResult {
  userId: string;
  name?: string;
  email?: string;
}

const getOAuthClient = (): OAuth2Client => {
  const { googleClientId } = loadAuthEnv();
  return new OAuth2Client(googleClientId);
};

export const verifyGoogleIdToken = async (credential: string): Promise<GoogleTokenPayload> => {
  const { googleClientId } = loadAuthEnv();
  const client = getOAuthClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error("Invalid Google token");
  }

  return {
    sub: payload.sub,
    email: payload.email ?? undefined,
    name: payload.name ?? undefined,
  };
};

export const loginWithGoogle = async (
  credential: string,
  anonymousId: string,
): Promise<GoogleLoginResult> => {
  const { sub, email, name } = await verifyGoogleIdToken(credential);

  const existingBySub = await prisma.user.findUnique({
    where: { googleSub: sub },
  });

  if (existingBySub) {
    return {
      userId: existingBySub.id,
      name: existingBySub.name ?? name,
      email: existingBySub.email ?? email,
    };
  }

  const existingByAnonymousId = await prisma.user.findUnique({
    where: { id: anonymousId },
  });

  if (!existingByAnonymousId) {
    throw new Error("Anonymous user not registered");
  }

  const linkedUser = await prisma.user.update({
    where: { id: anonymousId },
    data: {
      googleSub: sub,
      email: email ?? null,
      name: name ?? null,
    },
  });

  return {
    userId: linkedUser.id,
    name: linkedUser.name ?? undefined,
    email: linkedUser.email ?? undefined,
  };
};
