"use client";

import { useMemo } from "react";
import {
  getStructureOperationalResourceCount,
  getStructureOperationalResourceLimit,
} from "@happy-little-park/utils";

import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Structure } from "../types/structure";
import { isFlyingItem } from "./helpers/isFlyingItem";
import { ResourceProgressBar } from "./ResourceProgressBar";

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
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {structuresWithResources.map((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        return (
          <div
            key={`structure-resource-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: `${structure.x} / span ${structure.span}`,
              gridRow: `${structure.y} / span ${structure.span}`,
              ...dragStyle,
            }}
          >
            <div
              className="absolute min-h-0 min-w-0"
              style={{
                right: 0,
                bottom: 0,
                width: `${100 / structure.span}%`,
                height: `${100 / structure.span}%`,
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
