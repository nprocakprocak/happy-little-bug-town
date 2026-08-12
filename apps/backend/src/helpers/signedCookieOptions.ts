import type { CookieOptions } from "express";

import { loadAuthEnv } from "../config/authEnv.js";

export const getSignedCookieOptions = (): CookieOptions => {
  const { sessionTtlDays } = loadAuthEnv();
  const maxAge = sessionTtlDays * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
};

export const getSignedClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  signed: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
