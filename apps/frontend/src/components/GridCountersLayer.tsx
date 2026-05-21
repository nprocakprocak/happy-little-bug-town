"use client";

import { useMemo } from "react";

import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Stack } from "../types/stack";
import { isFlyingItem } from "./helpers/isFlyingItem";

interface GridCountersLayerProps {
  cols: number;
  rows: number;
  stacks: Stack[];
  gridDrag: DragPayload | null;
}

export function GridCountersLayer({ cols, rows, stacks, gridDrag }: GridCountersLayerProps) {
  const groundedStacks = useMemo(() => stacks.filter((stack) => !isFlyingItem(stack)), [stacks]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {groundedStacks.map((stack) => {
        const isDragged = gridDrag?.target.kind === "stack" && gridDrag.target.stackId === stack.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        return (
          <div
            key={stack.id}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: `${stack.x} / span 1`,
              gridRow: `${stack.y} / span 1`,
              ...dragStyle,
            }}
          >
            <span
              className="absolute bottom-0 right-0 flex size-[clamp(18px,42%,34px)] min-w-[clamp(18px,42%,34px)] translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-orange-500 text-[clamp(11px,58%,16px)] font-bold leading-none text-white"
              aria-hidden
            >
              {stack.itemsCount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
