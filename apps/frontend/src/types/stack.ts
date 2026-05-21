import { WithId } from "./withId";
import { Position } from "./position";
import { ItemType } from "./itemType";
import { GridAnimatable } from "./gridAnimatable";

export interface Stack extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  itemsCount: number;
}
