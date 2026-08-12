import type { Response } from "express";

import { AID_COOKIE_NAME } from "../constants/aid.js";
import {
  getSignedClearCookieOptions,
  getSignedCookieOptions,
} from "./signedCookieOptions.js";

export const setAidCookie = (res: Response, aid: string): void => {
  res.cookie(AID_COOKIE_NAME, aid, getSignedCookieOptions());
};

export const clearAidCookie = (res: Response): void => {
  res.clearCookie(AID_COOKIE_NAME, getSignedClearCookieOptions());
};
