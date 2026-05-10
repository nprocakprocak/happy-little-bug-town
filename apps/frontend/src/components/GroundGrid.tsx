"use client";

import { useState } from "react";
import { GROUND_GRID_MAX_WIDTH_PX, GROUND_HEIGHT, GROUND_WIDTH } from "../constants";
import { Item } from "../types/item";
import { Mine } from "../types/mine";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { findRandomEmptyPosition } from "./helpers/randomPosition";

export function GroundGrid() {
  const rows = GROUND_HEIGHT;
  const cols = GROUND_WIDTH;

  const mines: Mine[] = [{ id: "hole", image: "/mines/mine.webp", x: 5, y: 8, span: 2 }];

  const [items, setItems] = useState<Item[]>([{ id: "1", image: "/items/leaf-part.webp", x: 3, y: 4 }]);

  const onMineClick = (mine: Mine) => {
    const emptyPosition = findRandomEmptyPosition(rows, cols, mines, items);

    if (!emptyPosition) {
      // todo: show alert
      return;
    }
    
    setItems([...items, {
      id: `${items.length + 1}`,
      image: "/items/leaf-part.webp",
      fromX: mine.x,
      fromY: mine.y,
      x: emptyPosition.x,
      y: emptyPosition.y
    }]);
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
        <GroundGridAssetLayer cols={cols} rows={rows} mines={mines} items={items} />
        <GroundGridInteractionLayer cols={cols} rows={rows} mines={mines} items={items} onMineClick={onMineClick} />
      </div>
    </div>
  );
}
