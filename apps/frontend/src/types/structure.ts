import { BugType, ItemType, Position, StructureType } from "@happy-little-bug-town/utils";

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

export interface Structure extends WithId, Position, GridAnimatable {
  structureType: StructureType;
  items: StructureItem[];
  bugs: StructureBug[];
}
