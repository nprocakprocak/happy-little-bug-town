"use client";

import { useState } from "react";
import { GROUND_HEIGHT, GROUND_WIDTH } from "../constants";

export function GroundGrid() {
  const rows = GROUND_HEIGHT;
  const cols = GROUND_WIDTH;
  const cellCount = rows * cols;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div
      className="grid w-full max-w-md gap-1"
      style={{
        backgroundImage: "url('/backgrounds/bg-mud.webp')",
        backgroundRepeat: "repeat",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        aspectRatio: `${cols} / ${rows}`,
      }}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const isSelected = selectedIndex === index;
        return (
          <button
            key={index}
            type="button"
            className={`min-h-0 min-w-0 cursor-pointer rounded-sm border-0 p-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
              isSelected ? "bg-amber-300 dark:bg-amber-400" : "bg-zinc-200/20 dark:bg-zinc-700/80"
            }`}
            aria-label={`Cell row ${row + 1}, column ${col + 1}`}
            aria-pressed={isSelected}
            onClick={() => setSelectedIndex(index)}
          />
        );
      })}
    </div>
  );
}
