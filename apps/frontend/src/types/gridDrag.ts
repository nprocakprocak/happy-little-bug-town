export type GridDragTarget = { kind: "mine"; mineId: string } | { kind: "item"; itemId: string };

export interface GridDragPayload {
  dx: number;
  dy: number;
  target: GridDragTarget;
}
