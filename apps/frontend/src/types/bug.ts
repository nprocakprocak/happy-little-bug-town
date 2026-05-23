import { Position } from "@happy-little-park/utils";

import { BugType } from "./bugType";
import { GridAnimatable } from "./gridAnimatable";
import { WithId } from "./withId";

export interface Bug extends WithId, Position, GridAnimatable {
  bugType: BugType;
}
