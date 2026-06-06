import { ItemType, Position, Span, ToolType } from "@happy-little-park/utils";

import { WithId } from "./withId";

export interface ToolItem {
  id: string;
  itemType: ItemType;
}

export interface Tool extends WithId, Position, Span {
  toolType: ToolType;
  items: ToolItem[];
}
