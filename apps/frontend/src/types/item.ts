import { GridAnimatable } from "./gridAnimatable";
import { ItemType } from "./itemType";
import { Position } from "./position";
import { WithId } from "./withId";

export interface Item extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  stackable: boolean;
}
