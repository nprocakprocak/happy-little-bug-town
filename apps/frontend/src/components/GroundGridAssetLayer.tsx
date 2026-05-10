"use client";

import Image from "next/image";
import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_MUD_BG_TILE_HEIGHT_PX,
  GROUND_MUD_BG_TILE_WIDTH_PX,
} from "../constants";
import { Mine } from "../types/mine";
import { Item } from "../types/item";

interface GroundGridAssetLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
}

export function GroundGridAssetLayer({ cols, rows, mines, items }: GroundGridAssetLayerProps) {
  return (
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
      {mines.map((mine) => (
        <div
          key={mine.id}
          className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
          style={{
            gridColumn: `${mine.x} / span ${mine.span}`,
            gridRow: `${mine.y} / span ${mine.span}`,
          }}
        >
          <Image
            src="/mines/hole.webp"
            alt=""
            fill
            className="object-cover"
            sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * mine.span)}px`}
          />
        </div>
      ))}
      {items.map((item) => (
        <div
          key={item.id}
          className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
          style={{
            gridColumn: `${item.x} / span 1`,
            gridRow: `${item.y} / span 1`,
          }}
        >
          <Image
            src="/items/leaf-part.webp"
            alt=""
            fill
            className="object-cover"
            sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols))}px`}
          />
        </div>
      ))}
    </div>
  );
}
