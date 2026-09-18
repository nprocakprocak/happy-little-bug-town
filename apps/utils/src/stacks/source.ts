import { INFINITE_SOURCE_THRESHOLD } from "../constants/game.js";

export function isInfiniteSource(count: number): boolean {
  return count >= INFINITE_SOURCE_THRESHOLD;
}
