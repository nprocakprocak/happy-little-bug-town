import { ItemType, Position } from "@happy-little-park/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface Stack extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  itemsCount: number;
}
