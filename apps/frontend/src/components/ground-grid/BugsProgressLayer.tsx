"use client";

import { useMemo } from "react";

import { Bug } from "../../types/bug";
import type { DragPayload } from "../../types/dragPayload";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
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
    () => bugs.filter((bug) => !isFlyingItem(bug) && bug.items.length > 0),
    [bugs],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {beetlesWithLeaves.map((bug) => {
        const isDragged = gridDrag?.target.kind === "bug" && gridDrag.target.bugId === bug.id;

        return (
          <div
            key={bug.id}
            className="relative min-h-0 min-w-0"
            style={{
              ...gridPlacementStyle(bug.x, bug.y),
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <BugsProgressBar leafCount={bug.items.length} />
          </div>
        );
      })}
    </div>
  );
}
