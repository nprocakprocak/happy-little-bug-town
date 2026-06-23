import { requireAid } from "./requireAid.js";
import { requireSession } from "./requireSession.js";
import { requireWritableAccess } from "./requireWritableAccess.js";

export const requireGameAccess = [requireAid, requireSession, requireWritableAccess];
