import { ItemType, Position, Span } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface Stack extends WithId, Position, Span, GridAnimatable {
  itemType: ItemType;
  itemsCount: number;
}
