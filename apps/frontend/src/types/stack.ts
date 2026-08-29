import { BugType, ItemType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable, WithId } from "./gridEntity";

interface StackBug {
  id: string;
  bugType: BugType;
}

export interface Stack extends WithId, Position, GridAnimatable {
  itemType: ItemType;
  itemsCount: number;
  bugs: StackBug[];
}
