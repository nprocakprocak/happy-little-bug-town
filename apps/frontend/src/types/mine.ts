import { MineType } from "./mineType";
import { Position } from "./position";
import { WithId } from "./withId";

export interface Mine extends WithId, Position {
  mineType: MineType;
  span: number;
}
