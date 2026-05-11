import { Position } from "./position";
import { WithId } from "./withId";
import { MineType } from "./mineType";

export interface Mine extends WithId, Position {
  mineType: MineType;
  span: number;
}
