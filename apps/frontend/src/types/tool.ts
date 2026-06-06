import { ItemType, Position, Span, ToolType } from "@happy-little-park/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface ToolItem {
  id: string;
  itemType: ItemType;
}

export interface Tool extends WithId, Position, Span, GridAnimatable {
  toolType: ToolType;
  items: ToolItem[];
}
