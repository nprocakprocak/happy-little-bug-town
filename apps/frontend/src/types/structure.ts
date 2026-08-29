import { BugType, ItemType, Position, StructureType } from "@happy-little-bug-town/utils";

import { GridAnimatable, WithId } from "./gridEntity";

interface StructureItem {
  id: string;
  itemType: ItemType;
}

interface StructureBug {
  id: string;
  bugType: BugType;
}

export interface Structure extends WithId, Position, GridAnimatable {
  structureType: StructureType;
  upgradeLevel: number;
  items: StructureItem[];
  bugs: StructureBug[];
}
