import { BugType } from "./bugType";
import { GridAnimatable } from "./gridAnimatable";
import { Position } from "./position";
import { WithId } from "./withId";

export interface Bug extends WithId, Position, GridAnimatable {
  bugType: BugType;
}
