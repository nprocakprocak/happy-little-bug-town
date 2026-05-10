"use client";

import { useState } from "react";
import { GROUND_GRID_MAX_WIDTH_PX, GROUND_HEIGHT, GROUND_WIDTH } from "../constants";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";

export function GroundGrid() {
  const rows = GROUND_HEIGHT;
  const cols = GROUND_WIDTH;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const mines = [{ image: "/mines/mine.webp", col: 5, row: 8, span: 2 }];

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
        <GroundGridAssetLayer cols={cols} rows={rows} mines={mines} />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          mines={mines}
          selectedIndex={selectedIndex}
          onCellSelect={setSelectedIndex}
        />
      </div>
    </div>
  );
}
