import { ItemType } from "./itemType.js";
import { StructureType } from "./structureType.js";
import { ToolType } from "./toolType.js";

type Spannables =
  | { structureType: StructureType }
  | { toolType: ToolType }
  | { itemType: ItemType }
  | { itemsCount: number };

export type Spannable = Partial<Spannables>;
