"use client";

import { Item, Mine, Stack } from "@happy-little-park/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { GroundGridAssetLayer } from "./GroundGridAssetLayer";
import { GroundGridInteractionLayer } from "./GroundGridInteractionLayer";
import { pickRandomNearestMineCenterCell } from "./helpers/mineCenterCell";
import { ItemFlightLayer } from "./ItemFlightLayer";
import { useAnonymousId } from "../context/AnonymousIdContext";
import { initFetch } from "../domain/init/initFetch";
import { createFirstMine } from "../domain/mines/createFirstMine";

interface GroundGridProps {
  rows: number;
  cols: number;
}

export function GroundGrid({ rows, cols }: GroundGridProps) {
  const { anonymousId } = useAnonymousId();
  const [mines, setMines] = useState<Mine[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const animatables = useMemo(() => [...items, ...stacks], [items, stacks]);

  const [gridDrag, setGridDrag] = useState<DragPayload | null>(null);

  useEffect(() => {
    (async () => {
      if (!anonymousId) {
        return;
      }

      const { mines, items, stacks } = await initFetch();

      if (mines.length === 0) {
        const firstMine = await createFirstMine();
        setMines([firstMine]);
      } else {
        setMines(mines);
        setItems(items);
        setStacks(stacks);
      }
    })();
  }, [anonymousId]);

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

  const handleItemDropped = useCallback(
    (itemId: string, x: number, y: number, targetItem?: Item, targetStack?: Stack) => {
      (async () => {
        const originalItem = items.find((item) => item.id === itemId);
        const originalStack = stacks.find((stack) => stack.id === itemId);
        if (!originalItem && !originalStack) {
          console.error("Can't drop the item, could not find item or stack with id:", itemId);
          return;
        }

        if (targetItem) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/create`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              x,
              y,
              itemType: targetItem.itemType,
              itemIds: [itemId, targetItem.id],
            }),
          });

          if (!response.ok) {
            const { error } = await response.json();
            console.error("Failed to create stack:", error);
            return;
          }

          const stack = await response.json();
          setItems((prev) => prev.filter((it) => it.id !== itemId && it.id !== targetItem.id));
          setStacks((prev) => [...prev, stack]);

          return;
        }

        if (targetStack) {
          setItems((prev) => prev.filter((it) => it.id !== itemId));

          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${itemId}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stackId: targetStack.id }),
          });

          if (!response.ok) {
            const { error } = await response.json();
            console.error("Failed to update item:", error);
            return;
          }

          setStacks((prev) =>
            prev.map((stack) => (stack.id === itemId ? { ...stack, itemsCount: stack.itemsCount + 1 } : stack)),
          );

          return;
        }

        if (originalStack) {
          setStacks((prev) =>
            prev.map((stack) => (stack.id === itemId ? { ...stack, x, y } : stack)),
          );

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stacks/${itemId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ x, y }),
            },
          );

          if (!response.ok) {
            const { error } = await response.json();
            console.error("Failed to update stack:", error);
            return;
          }

          const stack = await response.json();
          setStacks((prev) => prev.map((s) => (s.id === itemId ? stack : s)));

          return;
        }

        if (originalItem) {
          setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, x, y } : it)));

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${itemId}`,
            {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ x, y }),
            },
          );

          if (!response.ok) {
            setItems((prev) => prev.map((it) => (it.id === itemId ? originalItem : it)));
            const { error } = await response.json();
            console.error("Failed to update item:", error);
            return;
          }

          const item = await response.json();
          setItems((prev) => prev.map((it) => (it.id === itemId ? item : it)));
        }
      })();
    },
    [items, stacks],
  );

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
