"use client";

import { useMemo } from "react";
import { getBugFoodCount, getBugFoodRequirement, isBugFed } from "@happy-little-bug-town/utils";

import { Bug } from "../../types/bug";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlying } from "../helpers/isFlying";
import type { DragPayload } from "../types/dragPayload";
import { ResourceProgressBar } from "../ui/ResourceProgressBar";

interface BugsProgressLayerProps {
  cols: number;
  rows: number;
  bugs: Bug[];
  gridDrag: DragPayload | null;
}

function HungryBadge() {
  return (
    <span
      className="absolute bottom-0 right-0 flex size-[clamp(18px,42%,34px)] min-w-[clamp(18px,42%,34px)] -translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-red-500 text-[clamp(11px,58%,16px)] leading-none"
      aria-hidden
    >
      🍴
    </span>
  );
}

export function BugsProgressLayer({ cols, rows, bugs, gridDrag }: BugsProgressLayerProps) {
  const hungryBugs = useMemo(() => bugs.filter((bug) => !isFlying(bug) && !isBugFed(bug)), [bugs]);

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {hungryBugs.map((bug) => {
        const foodRequirement = getBugFoodRequirement(bug.bugType);
        if (!foodRequirement) {
          return null;
        }

        const foodCount = getBugFoodCount(bug);
        const isDragged = gridDrag?.entity.id === bug.id;

        return (
          <div
            key={bug.id}
            className="relative min-h-0 min-w-0"
            style={{
              ...gridPlacementStyle(bug.x, bug.y),
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <ResourceProgressBar collected={foodCount} max={foodRequirement.maxCount} />
            {foodCount === 0 && <HungryBadge />}
          </div>
        );
      })}
    </div>
  );
}
