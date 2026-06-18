import { BugType, ItemType, Position, StructureType, ToolType } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface StructureItem {
  id: string;
  itemType: ItemType;
}

export interface StructureBug {
  id: string;
  bugType: BugType;
}

export interface StructureTool {
  id: string;
  toolType: ToolType;
}

export interface Structure extends WithId, Position, GridAnimatable {
  structureType: StructureType;
  span: number;
  items: StructureItem[];
  bugs: StructureBug[];
  tools: StructureTool[];
}
