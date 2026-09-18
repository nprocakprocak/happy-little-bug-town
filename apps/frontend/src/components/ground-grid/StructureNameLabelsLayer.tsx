"use client";

import { useMemo } from "react";
import {
  getStructureSpan,
  isBuildableStructureType,
  isStructureBuilt,
  isStructurePowered,
  isStructureUpgradeIncomplete,
} from "@happy-little-bug-town/utils";

import { useBoardVisibility } from "../../context/BoardVisibilityContext";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlying } from "../helpers/isFlying";
import { getStructureName } from "../helpers/structureName";
import type { DragPayload } from "../types/dragPayload";

interface StructureNameLabelsLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

function shouldShowStructureNameLabel(structure: Structure): boolean {
  return (
    isBuildableStructureType(structure.structureType) &&
    !isFlying(structure) &&
    isStructureBuilt(structure) &&
    isStructurePowered(structure) &&
    !isStructureUpgradeIncomplete(structure)
  );
}

function StructureNameLabel({ name }: { name: string }) {
  return (
    <span className="inline-block max-w-full rounded-sm bg-stone-900/80 px-[0.75cqi] py-[0.15cqi] text-center text-[clamp(0.625rem,2.5cqi,0.875rem)] font-bold leading-tight break-words text-white shadow-sm">
      {name}
    </span>
  );
}

export function StructureNameLabelsLayer({
  cols,
  rows,
  structures,
  gridDrag,
}: StructureNameLabelsLayerProps) {
  const { structureNamesVisible } = useBoardVisibility();
  const labeledStructures = useMemo(
    () => (structureNamesVisible ? structures.filter(shouldShowStructureNameLabel) : []),
    [structureNamesVisible, structures],
  );

  if (!structureNamesVisible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {labeledStructures.map((structure) => {
        const isDragged = gridDrag?.entity.id === structure.id;
        const span = getStructureSpan(structure.structureType);

        return (
          <div
            key={`structure-name-${structure.id}`}
            className="relative min-h-0 min-w-0 overflow-hidden"
            style={{
              ...gridPlacementStyle(structure.x, structure.y, span),
              ...gridDragStyle(gridDrag, isDragged),
            }}
          >
            <div className="flex h-full w-full items-start justify-center overflow-hidden p-[0.4cqi]">
              <StructureNameLabel name={getStructureName(structure)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
