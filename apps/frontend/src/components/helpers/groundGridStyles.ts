import type { CSSProperties } from "react";

import type { DragPayload } from "../types/dragPayload";

export function groundGridTemplateStyle(cols: number, rows: number): CSSProperties {
  return {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
  };
}

export function gridPlacementStyle(x: number, y: number, span?: number): CSSProperties {
  const resolvedSpan = span ?? 1;

  if (resolvedSpan > 1) {
    return {
      gridColumn: `${x} / span ${resolvedSpan}`,
      gridRow: `${y} / span ${resolvedSpan}`,
    };
  }

  return {
    gridColumn: x,
    gridRow: y,
  };
}

export function spanCellGridPosition(
  x: number,
  y: number,
  span: number,
  index: number,
): CSSProperties {
  return {
    gridColumn: x + (index % span),
    gridRow: y + Math.floor(index / span),
  };
}

export function footprintBottomRightCell(
  x: number,
  y: number,
  span: number,
): { col: number; row: number } {
  return {
    col: x + span - 1,
    row: y + span - 1,
  };
}

export function gridDragStyle(gridDrag: DragPayload | null, isDragged: boolean): CSSProperties {
  if (!isDragged || !gridDrag) {
    return {};
  }

  return {
    transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`,
    zIndex: 5,
  };
}
