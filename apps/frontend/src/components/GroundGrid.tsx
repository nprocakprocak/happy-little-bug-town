"use client";

import { Item, Mine } from "@happy-little-park/types";
import { useCallback, useEffect, useState } from "react";
import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { GridDragPayload } from "../types/gridDrag";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { pickRandomNearestMineCenterCell } from "./helpers/mineCenterCell";
import { ItemFlightLayer } from "./ItemFlightLayer";

interface GroundGridProps {
  rows: number;
  cols: number;
}

export function GroundGrid({ rows, cols }: GroundGridProps) {
  const mines: Mine[] = [{ id: "hole", mineType: "hole", x: 5, y: 8, span: 2 }];

  const [items, setItems] = useState<Item[]>([]);
  const [gridDrag, setGridDrag] = useState<GridDragPayload | null>(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items`, {
        credentials: "include",
      });
      const items = await response.json();
      setItems(items);
    })();
  }, []);

  const handleFlightComplete = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, fromX: undefined, fromY: undefined } : item,
      ),
    );
  }, []);

  const onMineClick = useCallback(
    (mine: Mine) => {
      (async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/random`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const { error } = await response.json();
          // todo: show alert
          console.error("Failed to create random item:", error);
          return;
        }

        const item = await response.json();

        setItems((prev) => {
          const origin = pickRandomNearestMineCenterCell(mine);

          const newItem: Item = {
            ...item,
            fromX: origin.x,
            fromY: origin.y,
          };

          return [...prev, newItem];
        });
      })()
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
