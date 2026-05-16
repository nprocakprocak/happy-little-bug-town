"use client";

import { Item, Mine, Stack } from "@happy-little-park/types";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [mines, setMines] = useState<Mine[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const animatables = useMemo(() => [...items, ...stacks], [items, stacks]);

  const [gridDrag, setGridDrag] = useState<GridDragPayload | null>(null);

  useEffect(() => {
    (async () => {
      const [minesResponse, itemsResponse, stacksResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mines`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks`, {
          credentials: "include",
        }),
      ]);

      if (!minesResponse.ok || !itemsResponse.ok || !stacksResponse.ok) {
        const { error: minesError } = await minesResponse.json();
        const { error: itemsError } = await itemsResponse.json();
        const { error: stacksError } = await stacksResponse.json();
        console.error("Failed to fetch grid items:", minesError, itemsError, stacksError);
        return;
      }

      const mines = await minesResponse.json();
      const items = await itemsResponse.json();
      const stacks = await stacksResponse.json();

      if (mines.length === 0) {
        const createFirstMineResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mines/create`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        if (!createFirstMineResponse.ok) {
          const { error } = await createFirstMineResponse.json();
          console.error("Failed to create first mine:", error);
          return;
        }
        const firstMine = await createFirstMineResponse.json();
        setMines([firstMine]);
      } else {
        setMines(mines);
        setItems(items);
        setStacks(stacks);
      }
    })();
  }, []);

  const handleFlightComplete = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, fromX: undefined, fromY: undefined } : item,
      ),
    );
  }, []);

  const handleItemDropCancelled = useCallback((itemId: string, dropX: number, dropY: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, fromX: dropX, fromY: dropY } : item)),
    );
  }, []);

  const handleItemDropped = useCallback((itemId: string, x: number, y: number, targetItemId: string | undefined) => {
    (async () => {
      const originalItem = items.find((item) => item.id === itemId);
      if (!originalItem) {
        console.error("Can't drop the item, could not find item with id:", itemId);
        return;
      }

      if (targetItemId) {
        const targetItem = items.find((item) => item.id === targetItemId);
        if (!targetItem) {
          console.error("Can't drop the item, could not find target item with id:", targetItemId);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x, y, itemType: targetItem.itemType, itemIds: [itemId, targetItemId] }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          console.error("Failed to create stack:", error);
          return;
        }

        const stack = await response.json();
        setItems((prev) => prev.filter((it) => it.id !== itemId && it.id !== targetItemId));
        setStacks((prev) => [...prev, stack]);

        return;
      }

      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, x, y } : it)));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${itemId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y }),
      });

      if (!response.ok) {
        setItems((prev) => prev.map((it) => (it.id === itemId ? originalItem : it)));
        const { error } = await response.json();
        console.error("Failed to update item:", error);
        return;
      }

      const item = await response.json();
      setItems((prev) => prev.map((it) => (it.id === itemId ? item : it)));
    })();
  }, [items]);

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
      })();
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
          stacks={stacks}
          gridDrag={gridDrag}
        />
        <ItemFlightLayer
          cols={cols}
          rows={rows}
          animatables={animatables}
          onFlightComplete={handleFlightComplete}
        />
        <GroundGridInteractionLayer
          cols={cols}
          rows={rows}
          mines={mines}
          items={items}
          stacks={stacks}
          onMineClick={onMineClick}
          onDragChange={setGridDrag}
          onItemDropCancelled={handleItemDropCancelled}
          onItemDropped={handleItemDropped}
        />
      </div>
    </div>
  );
}
