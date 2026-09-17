import { STACK_INFINITE_SOURCE_THRESHOLD } from "../constants/game.js";

export function isInfiniteStackSource(itemsCount: number): boolean {
  return itemsCount > STACK_INFINITE_SOURCE_THRESHOLD;
}
