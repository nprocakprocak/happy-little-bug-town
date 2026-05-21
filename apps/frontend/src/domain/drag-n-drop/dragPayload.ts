export type DragTarget =
  | { kind: "structure"; structureId: string }
  | { kind: "item"; itemId: string }
  | { kind: "stack"; stackId: string };

export interface DragPayload {
  dx: number;
  dy: number;
  target: DragTarget;
}
