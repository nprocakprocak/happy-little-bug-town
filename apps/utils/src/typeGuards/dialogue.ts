import { OnceDialogueId } from "../types/dialogue.js";

export function isOnceDialogueId(value: unknown): value is OnceDialogueId {
  return [
    "welcome",
    "dugFirstItem",
    "dugFirstBeetle",
    "feedBeetle",
    "fedFirstBeetle",
    "builtBeetleHouse",
  ].includes(value as string);
}
