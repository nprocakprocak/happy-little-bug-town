import { ItemType } from "./itemType.js";
import { StructureType } from "./structureType.js";

type Spannables =
  | { structureType: StructureType }
  | { itemType: ItemType }
  | { itemsCount: number };

export type Spannable = Partial<Spannables>;
