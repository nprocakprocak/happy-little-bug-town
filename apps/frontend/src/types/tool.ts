import { ItemType, Position, ToolType } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface ToolItem {
  id: string;
  itemType: ItemType;
}

export interface Tool extends WithId, Position, GridAnimatable {
  toolType: ToolType;
  items: ToolItem[];
}
