import type { CookieOptions } from "express";

import { loadAuthEnv } from "../config/authEnv.js";

const isSecureCookie = (): boolean => {
  if (process.env.COOKIE_SECURE === "true") {
    return true;
  }
  if (process.env.COOKIE_SECURE === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "development";
};

const sharedCookieOptions = (): CookieOptions => {
  const secure = isSecureCookie();

  return {
    httpOnly: true,
    signed: true,
    secure,
    sameSite: secure ? "none" : "lax",
    partitioned: secure,
  };
};

export const getSignedCookieOptions = (): CookieOptions => {
  const { sessionTtlDays } = loadAuthEnv();
  const maxAge = sessionTtlDays * 24 * 60 * 60 * 1000;

  return {
    ...sharedCookieOptions(),
    maxAge,
  };
};

export const getSignedClearCookieOptions = (): CookieOptions => sharedCookieOptions();
