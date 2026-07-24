"use client";

import { useMemo } from "react";

import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { isFlyingItem } from "../helpers/isFlyingItem";

interface GridCountersLayerProps {
  cols: number;
  rows: number;
  stacks: Stack[];
  structures: Structure[];
  gridDrag: DragPayload | null;
}

function CounterBadge({ count }: { count: number }) {
  return (
    <span
      className="absolute bottom-0 right-0 flex size-[clamp(18px,42%,34px)] min-w-[clamp(18px,42%,34px)] -translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-orange-500 text-[clamp(11px,58%,16px)] font-bold leading-none text-white"
      aria-hidden
    >
      {count}
    </span>
  );
}

export function GridCountersLayer({
  cols,
  rows,
  stacks,
  structures,
  gridDrag,
}: GridCountersLayerProps) {
  const groundedStacks = useMemo(() => stacks.filter((stack) => !isFlyingItem(stack)), [stacks]);

  const beetleHousesWithOccupants = useMemo(
    () =>
      structures.filter(
        (structure) =>
          structure.structureType === "beetle_house" && (structure.bugs ?? []).length > 0,
      ),
    [structures],
  );

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

        const bottomRightCol = stack.x + (stack.span ?? 1) - 1;
        const bottomRightRow = stack.y + (stack.span ?? 1) - 1;

        return (
          <div
            key={stack.id}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: bottomRightCol,
              gridRow: bottomRightRow,
              ...dragStyle,
            }}
          >
            <CounterBadge count={stack.itemsCount} />
          </div>
        );
      })}
      {beetleHousesWithOccupants.map((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        const bottomRightCol = structure.x + structure.span - 1;
        const bottomRightRow = structure.y + structure.span - 1;

        return (
          <div
            key={`beetle-house-count-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: bottomRightCol,
              gridRow: bottomRightRow,
              ...dragStyle,
            }}
          >
            <CounterBadge count={(structure.bugs ?? []).length} />
          </div>
        );
      })}
    </div>
  );
}
