"use client";

import { useMemo } from "react";

import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import { Bug } from "../../types/bug";
import { isFlyingItem } from "../helpers/isFlyingItem";
import { BugsProgressBar } from "../ui/BugsProgressBar";

interface BugsProgressLayerProps {
  cols: number;
  rows: number;
  bugs: Bug[];
  gridDrag: DragPayload | null;
}

export function BugsProgressLayer({ cols, rows, bugs, gridDrag }: BugsProgressLayerProps) {
  const beetlesWithLeaves = useMemo(
    () => bugs.filter((bug) => !isFlyingItem(bug) && bug.itemIds.length > 0),
    [bugs],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {beetlesWithLeaves.map((bug) => {
        const isDragged = gridDrag?.target.kind === "bug" && gridDrag.target.bugId === bug.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        return (
          <div
            key={bug.id}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: `${bug.x} / span 1`,
              gridRow: `${bug.y} / span 1`,
              ...dragStyle,
            }}
          >
            <BugsProgressBar leafCount={bug.itemIds.length} />
          </div>
        );
      })}
    </div>
  );
}
