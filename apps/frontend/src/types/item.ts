import { ItemType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface Item extends WithId, Position, GridAnimatable {
  itemType: ItemType;
}
