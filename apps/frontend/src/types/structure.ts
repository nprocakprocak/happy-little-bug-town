import { Position } from "@happy-little-park/utils";

import { BugType } from "./bugType";
import { ItemType } from "./itemType";
import { StructureType } from "./structureType";
import { WithId } from "./withId";

export interface StructureItem {
  id: string;
  itemType: ItemType;
}

export interface StructureBug {
  id: string;
  bugType: BugType;
}

export interface Structure extends WithId, Position {
  structureType: StructureType;
  span: number;
  items: StructureItem[];
  bugs: StructureBug[];
}
