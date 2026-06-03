import { Position } from "@happy-little-park/utils";

import { ItemType } from "./itemType";
import { StructureType } from "./structureType";
import { WithId } from "./withId";

export interface StructureItem {
  id: string;
  itemType: ItemType;
}

export interface Structure extends WithId, Position {
  structureType: StructureType;
  span: number;
  items: StructureItem[];
}
