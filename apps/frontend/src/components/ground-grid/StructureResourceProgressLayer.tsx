"use client";

import { useMemo } from "react";
import {
  getStructureOperationalResourceCount,
  getStructureOperationalResourceLimit,
  getStructureSpan,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../../types/dragPayload";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlyingItem } from "../helpers/isFlyingItem";
import { ResourceProgressBar } from "../ui/ResourceProgressBar";

interface StructureResourceProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

export function StructureResourceProgressLayer({
  cols,
  rows,
  structures,
  gridDrag,
}: StructureResourceProgressLayerProps) {
  const structuresWithResources = useMemo(
    () =>
      structures.filter(
        (structure) =>
          !isFlyingItem(structure) && getStructureOperationalResourceCount(structure) > 0,
      ),
    [structures],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {structuresWithResources.map((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const span = getStructureSpan(structure.structureType);

        return (
          <div
            key={`structure-resource-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...gridPlacementStyle(structure.x, structure.y, span),
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <div
              className="absolute min-h-0 min-w-0"
              style={{
                right: 0,
                bottom: 0,
                width: `${100 / span}%`,
                height: `${100 / span}%`,
              }}
            >
              <ResourceProgressBar
                collected={getStructureOperationalResourceCount(structure)}
                max={getStructureOperationalResourceLimit(structure)}
                layout="corner"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
