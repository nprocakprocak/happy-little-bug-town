import { BugType } from "../types/bugType.js";

export const CRAFTABLE_BUG_TYPES: BugType[] = ["ant", "ladybug", "termite", "fly"];

export function isCraftableBugType(value: string): value is BugType {
  return (CRAFTABLE_BUG_TYPES as string[]).includes(value);
}
