import { Position } from "@happy-little-park/utils";

import { StructureType } from "./structureType";
import { WithId } from "./withId";

export interface Structure extends WithId, Position {
  structureType: StructureType;
  span: number;
}
