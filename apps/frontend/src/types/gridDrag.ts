export type GridDragTarget =
  | { kind: "mine"; mineId: string }
  | { kind: "item"; itemId: string }
  | { kind: "stack"; stackId: string };

export interface GridDragPayload {
  dx: number;
  dy: number;
  target: GridDragTarget;
}
