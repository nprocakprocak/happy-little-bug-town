import { OnceDialogueId } from "../types/dialogue.js";

export function isOnceDialogueId(value: unknown): value is OnceDialogueId {
  return [
    "welcome",
    "dugFirstItem",
    "dugFirstBeetle",
    "feedBeetle",
    "buildBeetleHouse",
    "buildWorkshop",
    "craftAxe",
    "buildWoodcutter",
    "woodProduction",
    "buildStonemason",
    "buildKitchen",
    "buildTavern",
    "cookNettleSoup",
  ].includes(value as string);
}
