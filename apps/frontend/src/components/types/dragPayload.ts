import { GridEntity } from "../../types/gridEntity";

// todo: usunac DragTarget
export type DragTarget =
  | { kind: "structure"; structureId: string }
  | { kind: "item"; itemId: string }
  | { kind: "stack"; stackId: string }
  | { kind: "bug"; bugId: string };

export interface DragPayload {
  dx: number;
  dy: number;
  target: DragTarget;
  entity: GridEntity;
}
