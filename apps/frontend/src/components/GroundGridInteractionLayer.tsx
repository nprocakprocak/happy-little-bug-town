"use client";

import { useState } from "react";
import { Mine } from "../types/mine";
import { Item } from "../types/item";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  mines,
  items,
}: GroundGridInteractionLayerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const cellCount = rows * cols;

  const skippedIndices = new Set<number>();
  const mineAtTopLeftIndex = new Map(
    mines.map((mine) => {
      const topLeft = (mine.y - 1) * cols + (mine.x - 1);
      return [topLeft, mine] as const;
    }),
  );

  for (const mine of mines) {
    const topLeft = (mine.y - 1) * cols + (mine.x - 1);
    for (let dr = 0; dr < mine.span; dr += 1) {
      for (let dc = 0; dc < mine.span; dc += 1) {
        const idx = topLeft + dr * cols + dc;
        if (idx !== topLeft) {
          skippedIndices.add(idx);
        }
      }
    }
  }

  return (
    <div
      className="absolute inset-0 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        if (skippedIndices.has(index)) {
          return null;
        }

        const gridRow = Math.floor(index / cols) + 1;
        const gridCol = (index % cols) + 1;
        const mine = mineAtTopLeftIndex.get(index);
        const isSelected = selectedIndex === index;

        if (mine) {
          return (
            <div
              key={index}
              className={`min-h-0 min-w-0 cursor-pointer rounded-sm transition-colors ${isSelected ? "bg-amber-300" : "bg-zinc-200/20"}`}
              style={{
                gridColumn: `${gridCol} / span ${mine.span}`,
                gridRow: `${gridRow} / span ${mine.span}`,
              }}
              onClick={() => setSelectedIndex(index)}
            />
          );
        }

        return (
          <div
            key={index}
            className={`min-h-0 min-w-0 cursor-pointer rounded-sm transition-colors ${isSelected ? "bg-amber-300" : "bg-zinc-200/20"}`}
            style={{
              gridColumn: gridCol,
              gridRow: gridRow,
            }}
            onClick={() => setSelectedIndex(index)}
          />
        );
      })}
    </div>
  );
}
