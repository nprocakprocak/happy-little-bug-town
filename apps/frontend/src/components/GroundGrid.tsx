"use client";

import { useCallback, useState } from "react";
import { GROUND_GRID_MAX_WIDTH_PX, GROUND_HEIGHT, GROUND_WIDTH } from "../constants";
import { Item } from "../types/item";
import { GridDragPayload } from "../types/gridDrag";
import { Mine } from "../types/mine";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { pickRandomNearestMineCenterCell } from "./helpers/mineCenterCell";
import { findRandomEmptyPosition } from "./helpers/randomPosition";
import { ItemFlightLayer } from "./ItemFlightLayer";

export function GroundGrid() {
  const rows = GROUND_HEIGHT;
  const cols = GROUND_WIDTH;

  const mines: Mine[] = [{ id: "hole", image: "/mines/mine.webp", x: 5, y: 8, span: 2 }];

  const [items, setItems] = useState<Item[]>([]);
  const [gridDrag, setGridDrag] = useState<GridDragPayload | null>(null);

  const handleFlightComplete = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, fromX: undefined, fromY: undefined } : item,
      ),
    );
  }, []);

  const onMineClick = useCallback(
    (mine: Mine) => {
      setItems((prev) => {
        const emptyPosition = findRandomEmptyPosition(rows, cols, mines, prev);

        if (!emptyPosition) {
          // todo: show alert
          console.log("No empty position found");
          return prev;
        }

        const origin = pickRandomNearestMineCenterCell(mine);

        const newItem: Item = {
          id: crypto.randomUUID(),
          image: "/items/leaf-part.webp",
          fromX: origin.x,
          fromY: origin.y,
          x: emptyPosition.x,
          y: emptyPosition.y,
        };

        return [...prev, newItem];
      });
    },
    [cols, mines, rows],
  );

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
        <GroundGridAssetLayer
          cols={cols}
          rows={rows}
          mines={mines}
          items={items}
          gridDrag={gridDrag}
        />
        <ItemFlightLayer
          cols={cols}
          rows={rows}
          items={items}
          onFlightComplete={handleFlightComplete}
        />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          mines={mines}
          items={items}
          onMineClick={onMineClick}
          onDragChange={setGridDrag}
        />
      </div>
    </div>
  );
}
