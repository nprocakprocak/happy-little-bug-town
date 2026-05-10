"use client";

import { useState } from "react";
import { Mine } from "../types/mine";
import { Item } from "../types/item";
import { SelectedSquarePosition } from "../types/position";
import { positionOverlapsAnyMine } from "./helpers/overlaps";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
  onMineClick: (mine: Mine) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  mines,
  items,
  onMineClick,
}: GroundGridInteractionLayerProps) {
  const [selectedPosition, setSelectedPosition] = useState<SelectedSquarePosition | null>(null);

  const cellCount = rows * cols;

  return (
    <div
      className="absolute inset-0 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: cellCount }, (_, index) => {

        const gridRow = Math.floor(index / cols) + 1;
        const gridCol = (index % cols) + 1;
        const mine = mines.find((mine) => mine.x === gridCol && mine.y === gridRow);

        if (!mine && positionOverlapsAnyMine({ x: gridCol, y: gridRow }, mines)) {
          return null;
        }

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;

        return (
          <div
            key={index}
            className={`min-h-0 min-w-0 cursor-pointer rounded-sm transition-colors ${isSelected ? "bg-amber-300" : "bg-zinc-200/20"}`}
            style={
              mine
                ? {
                  gridColumn: `${mine.x} / span ${mine.span}`,
                  gridRow: `${mine.y} / span ${mine.span}`,
                }
                : {
                  gridColumn: gridCol,
                  gridRow: gridRow,
                }
            }
            onClick={() => mine ? onMineClick(mine) : setSelectedPosition({ x: gridCol, y: gridRow })}
          />
        );
      })}
    </div>
  );
}
