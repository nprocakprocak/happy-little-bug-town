import { GridEntity } from "../../types/gridEntity";

export interface DragPayload {
  dx: number;
  dy: number;
  entity: GridEntity;
}
