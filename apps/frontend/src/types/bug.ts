import { BugType, ItemType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface BugItem {
  id: string;
  itemType: ItemType;
}

export interface Bug extends WithId, Position, GridAnimatable {
  bugType: BugType;
  items: BugItem[];
}
