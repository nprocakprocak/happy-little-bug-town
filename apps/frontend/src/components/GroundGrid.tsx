"use client";

import Image from "next/image";
import { useState } from "react";
import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_HEIGHT,
  GROUND_MUD_BG_TILE_HEIGHT_PX,
  GROUND_MUD_BG_TILE_WIDTH_PX,
  GROUND_WIDTH,
} from "../constants";

export function GroundGrid() {
  const rows = GROUND_HEIGHT;
  const cols = GROUND_WIDTH;
  const cellCount = rows * cols;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const holeSpansCenter = {
    colStart: Math.floor((cols - 2) / 2),
    rowStart: Math.floor((rows - 2) / 2),
  };

  return (
    <div
      className="w-full"
      style={{
        containerType: "inline-size",
        maxWidth: GROUND_GRID_MAX_WIDTH_PX,
      }}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
          style={{
            backgroundImage: "url('/backgrounds/bg-mud.webp')",
            backgroundRepeat: "repeat",
            backgroundSize: `calc(100cqi * ${GROUND_MUD_BG_TILE_WIDTH_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px) calc(100cqi * ${GROUND_MUD_BG_TILE_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          <div
            className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
            style={{
              gridColumn: `${holeSpansCenter.colStart + 1} / span 2`,
              gridRow: `${holeSpansCenter.rowStart + 1} / span 2`,
            }}
          >
            <Image
              src="/mines/hole.webp"
              alt=""
              fill
              className="object-cover"
              sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * 2)}px`}
            />
          </div>
        </div>
        <div
          className="absolute inset-0 grid h-full w-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: cellCount }, (_, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div
                key={index}
                className={`min-h-0 min-w-0 cursor-pointer rounded-sm transition-colors ${isSelected ? "bg-amber-300" : "bg-zinc-200/20"}`}
                onClick={() => setSelectedIndex(index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
