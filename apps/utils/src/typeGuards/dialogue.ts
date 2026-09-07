import { OnceDialogueId } from "../types/dialogue.js";

export function isOnceDialogueId(value: unknown): value is OnceDialogueId {
  return value === "welcome" || value === "dugFirstItem" || value === "dugFirstBeetle";
}
