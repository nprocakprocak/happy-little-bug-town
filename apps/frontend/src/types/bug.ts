import { BugType, Position } from "@happy-little-bug-town/utils";

import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface Bug extends WithId, Position, GridAnimatable {
  bugType: BugType;
  itemIds: string[];
}
