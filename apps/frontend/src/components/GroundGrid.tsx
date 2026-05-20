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
import { dropAction } from "../domain/drag-n-drop/dropAction";
import { extractItemFromStack } from "../domain/stacks/extract";

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

        // drop onto an empty position, assume optimistic update
        if (!targetItem && !targetStack) {
          if (originalItem) {
            setItems((prev) =>
              prev.map((it) => (it.id === originalItem.id ? { ...it, x, y } : it)),
            );
          }
          if (originalStack) {
            setStacks((prev) => prev.map((s) => (s.id === originalStack.id ? { ...s, x, y } : s)));
          }
        }

        // drop an item onto a stack to add it to its items, assume optimistic update
        if (originalItem && targetStack) {
          setItems((prev) => prev.filter((it) => it.id !== originalItem.id));
        }

        const { items: newItems, stacks: newStacks } = await dropAction(
          { x, y },
          items,
          stacks,
          originalItem || originalStack!,
          targetItem || targetStack,
        );
        setItems(newItems);
        setStacks(newStacks);
      })();
    },
    [items, stacks],
  );

  const onStackClick = useCallback(
    (stack: Stack) => {
      (async () => {
        const item = await extractItemFromStack(stack.id);

        const newItem: Item = {
          ...item,
          fromX: stack.x,
          fromY: stack.y,
        };

        setItems((prev) => [...prev, newItem]);
      })();
    },
    [cols, rows, mines, items, stacks],
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
          onStackClick={onStackClick}
          onDragChange={setGridDrag}
          onItemDropCancelled={handleItemDropCancelled}
          onItemDropped={handleItemDropped}
        />
      </div>
    </div>
  );
}
