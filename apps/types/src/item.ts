import { WithId } from "./withId";
import { Position } from "./position";
import { ItemType } from "./itemType";

export interface Item extends WithId, Position {
  itemType: ItemType;
  fromX?: number;
  fromY?: number;
}
