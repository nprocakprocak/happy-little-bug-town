"use client";

import { useMemo } from "react";
import {
  getEvolutionOccupancyProgress,
  getHouseOccupants,
  getStackSpan,
  getStructureSpan,
} from "@happy-little-bug-town/utils";

import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import {
  footprintBottomRightCell,
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlying } from "../helpers/isFlying";
import type { DragPayload } from "../types/dragPayload";
import { ResourceProgressBar } from "../ui/ResourceProgressBar";

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
  const groundedStacks = useMemo(() => stacks.filter((stack) => !isFlying(stack)), [stacks]);

  const housesWithOccupants = useMemo(
    () =>
      structures.flatMap((structure) => {
        if (isFlying(structure)) {
          return [];
        }
        const count = getHouseOccupants(structure).length;
        return count > 0 ? [{ structure, count }] : [];
      }),
    [structures],
  );

  const occupancyProgresses = useMemo(
    () =>
      structures.flatMap((structure) => {
        if (isFlying(structure)) {
          return [];
        }
        const progress = getEvolutionOccupancyProgress(structure);
        return progress ? [{ structure, progress }] : [];
      }),
    [structures],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {groundedStacks.map((stack) => {
        const isDragged = gridDrag?.entity.id === stack.id;
        const { col, row } = footprintBottomRightCell(stack.x, stack.y, getStackSpan());

        return (
          <div
            key={stack.id}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: col,
              gridRow: row,
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <CounterBadge count={stack.itemsCount} />
          </div>
        );
      })}
      {housesWithOccupants.map(({ structure, count }) => {
        const isDragged = gridDrag?.entity.id === structure.id;
        const { col, row } = footprintBottomRightCell(
          structure.x,
          structure.y,
          getStructureSpan(structure.structureType),
        );

        return (
          <div
            key={`house-count-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: col,
              gridRow: row,
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <CounterBadge count={count} />
          </div>
        );
      })}
      {occupancyProgresses.map(({ structure, progress }) => {
        const isDragged = gridDrag?.entity.id === structure.id;
        const span = getStructureSpan(structure.structureType);

        return (
          <div
            key={`occupancy-progress-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...gridPlacementStyle(structure.x, structure.y, span),
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <div
              className="absolute flex min-h-0 min-w-0 items-end"
              style={{
                right: 0,
                bottom: 0,
                width: `${100 / span}%`,
                height: `${100 / span}%`,
                paddingInline: "6%",
                paddingBottom: "6%",
              }}
            >
              <div className="relative h-[clamp(3px,18%,5px)] min-h-[3px] min-w-0 flex-1">
                <ResourceProgressBar
                  collected={progress.count}
                  max={progress.max}
                  layout="inline"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
