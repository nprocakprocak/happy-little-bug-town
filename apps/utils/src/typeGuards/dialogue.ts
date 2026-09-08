import { OnceDialogueId } from "../types/dialogue.js";

export function isOnceDialogueId(value: unknown): value is OnceDialogueId {
  return [
    "welcome",
    "dugFirstItem",
    "dugFirstBeetle",
    "feedBeetle",
    "fedFirstBeetle",
    "builtBeetleHouse",
    "builtWorkshop",
  ].includes(value as string);
}
