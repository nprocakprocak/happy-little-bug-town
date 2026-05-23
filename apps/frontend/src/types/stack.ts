import { Position } from "@happy-little-park/utils";

import { GridAnimatable } from "./gridAnimatable";
import { ItemType } from "./itemType";
import { WithId } from "./withId";

export interface Stack extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  itemsCount: number;
}
