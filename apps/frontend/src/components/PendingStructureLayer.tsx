"use client";

import Image from "next/image";

import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { Structure } from "../types/structure";
import { structureTypeToImage } from "./helpers/itemTypeToImage";

interface PendingStructureLayerProps {
  cols: number;
  rows: number;
  structure: Structure;
  onCancel: () => void;
}

export function PendingStructureLayer({
  cols,
  rows,
  structure,
  onCancel,
}: PendingStructureLayerProps) {
  const { x, y, span, structureType } = structure;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      <div
        className="pointer-events-auto relative min-h-0 min-w-0 overflow-visible rounded-sm ring-2 ring-sky-400/80 ring-offset-1"
        style={{
          gridColumn: `${x} / span ${span}`,
          gridRow: `${y} / span ${span}`,
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-sm opacity-90">
          <Image
            src={structureTypeToImage(structureType)}
            alt=""
            fill
            className="object-cover"
            sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * span)}px`}
          />
        </div>
        <div className="absolute -bottom-[12%] left-1/2 flex -translate-x-1/2 gap-[1cqi]">
          <button
            type="button"
            aria-label="Confirm placement"
            className="flex h-[7cqi] w-[7cqi] items-center justify-center rounded-full bg-emerald-500 text-[clamp(0.75rem,3.5cqi,1.25rem)] font-bold text-white shadow-md transition-colors hover:bg-emerald-600"
          >
            ✓
          </button>
          <button
            type="button"
            aria-label="Cancel placement"
            onClick={onCancel}
            className="flex h-[7cqi] w-[7cqi] items-center justify-center rounded-full bg-stone-500 text-[clamp(0.75rem,3.5cqi,1.25rem)] font-bold text-white shadow-md transition-colors hover:bg-stone-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
