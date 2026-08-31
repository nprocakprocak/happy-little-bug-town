import { BugType } from "./bugType.js";
import { ItemType } from "./itemType.js";
import { StructureType } from "./structureType.js";

export type Spannable =
  | { structureType: StructureType }
  | { itemType: ItemType }
  | { bugType: BugType }
  | { itemsCount: number };
