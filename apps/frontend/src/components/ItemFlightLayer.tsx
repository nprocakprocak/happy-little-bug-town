"use client";

import { GridAnimatable } from "../types/gridAnimatable";
import { ItemType } from "../types/itemType";
import { Position } from "../types/position";
import { WithId } from "../types/withId";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";
import { isFlyingItem } from "./helpers/isFlyingItem";
import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

const FLIGHT_DURATION_MS = 550;
const FLIGHT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

type Animatable = GridAnimatable & WithId & Position & { itemType: ItemType };

interface ItemFlightLayerProps {
  cols: number;
  rows: number;
  animatables: Animatable[];
  onFlightComplete: (itemId: string) => void;
}

interface FlyingItemAnimationProps {
  cols: number;
  rows: number;
  item: Animatable;
  onComplete: () => void;
}

function FlyingItemAnimation({ cols, rows, item, onComplete }: FlyingItemAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromMarkerRef = useRef<HTMLDivElement>(null);
  const toMarkerRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      onCompleteRef.current();
      return;
    }

    const container = containerRef.current;
    const fromEl = fromMarkerRef.current;
    const toEl = toMarkerRef.current;
    const flyer = flyerRef.current;

    if (!container || !fromEl || !toEl || !flyer) {
      onCompleteRef.current();
      return;
    }

    const cRect = container.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();

    const startLeft = fr.left - cRect.left;
    const startTop = fr.top - cRect.top;

    flyer.style.opacity = "0";
    flyer.style.left = `${startLeft}px`;
    flyer.style.top = `${startTop}px`;
    flyer.style.width = `${fr.width}px`;
    flyer.style.height = `${fr.height}px`;

    const dx = tr.left - fr.left;
    const dy = tr.top - fr.top;

    let animation: Animation | undefined;

    requestAnimationFrame(() => {
      if (!flyerRef.current) {
        return;
      }
      flyerRef.current.style.opacity = "1";
      animation = flyerRef.current.animate(
        [{ transform: "translate(0, 0)" }, { transform: `translate(${dx}px, ${dy}px)` }],
        {
          duration: FLIGHT_DURATION_MS,
          easing: FLIGHT_EASING,
          fill: "forwards",
        },
      );
      animation.onfinish = () => {
        onCompleteRef.current();
      };
    });

    return () => {
      animation?.cancel();
    };
  }, [cols, rows, item.fromX, item.fromY, item.x, item.y]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <div
        className="grid h-full w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        <div
          ref={fromMarkerRef}
          aria-hidden
          className="min-h-0 min-w-0 opacity-0"
          style={{
            gridColumn: item.fromX,
            gridRow: item.fromY,
          }}
        />
        <div
          ref={toMarkerRef}
          aria-hidden
          className="min-h-0 min-w-0 opacity-0"
          style={{
            gridColumn: item.x,
            gridRow: item.y,
          }}
        />
      </div>
      <div ref={flyerRef} className="pointer-events-none absolute overflow-hidden rounded-sm">
        <Image
          src={itemTypeToImageForItem(item.itemType)}
          alt=""
          fill
          className="object-cover"
          sizes={`${Math.ceil(GROUND_GRID_MAX_WIDTH_PX / cols)}px`}
        />
      </div>
    </div>
  );
}

export function ItemFlightLayer({
  cols,
  rows,
  animatables,
  onFlightComplete,
}: ItemFlightLayerProps) {
  return (
    <>
      {animatables.filter(isFlyingItem).map((item: Animatable) => (
        <FlyingItemAnimation
          key={item.id}
          cols={cols}
          rows={rows}
          item={item}
          onComplete={() => {
            onFlightComplete(item.id);
          }}
        />
      ))}
    </>
  );
}
