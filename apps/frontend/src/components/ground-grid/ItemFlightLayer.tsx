"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { getSpannableSpan, Positionable } from "@happy-little-bug-town/utils";

import { GROUND_GRID_MAX_WIDTH_PX } from "../../constants";
import { GridAnimatable } from "../../types/gridAnimatable";
import { WithId } from "../../types/withId";
import { isBug, isItem, isStack, isStructure, isTool } from "../../utils/typeGuards";
import { gridPlacementStyle, groundGridTemplateStyle } from "../helpers/groundGridStyles";
import { isFlyingItem } from "../helpers/isFlyingItem";
import {
  bugTypeToImage,
  itemTypeToImageForItem,
  itemTypeToImageForStack,
  structureTypeToImage,
  toolTypeToImage,
} from "../helpers/itemTypeToImage";
import { FLIGHT_DURATION_MS, FLIGHT_EASING } from "./constants";

type Animatable = GridAnimatable & WithId & Positionable;

function animatableImageSrc(animatable: Animatable): string {
  if (isBug(animatable)) {
    return bugTypeToImage(animatable.bugType);
  }
  if (isStack(animatable)) {
    return itemTypeToImageForStack(animatable.itemType);
  }
  if (isItem(animatable)) {
    return itemTypeToImageForItem(animatable.itemType);
  }
  if (isStructure(animatable)) {
    return structureTypeToImage(animatable.structureType);
  }
  if (isTool(animatable)) {
    return toolTypeToImage(animatable.toolType);
  }
  throw new Error(`Unknown animatable type: ${animatable}`);
}

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
  const span = getSpannableSpan(item);
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
  }, [cols, rows, item.fromX, item.fromY, item.x, item.y, span]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <div className="grid h-full w-full gap-1" style={groundGridTemplateStyle(cols, rows)}>
        <div
          ref={fromMarkerRef}
          aria-hidden
          className="min-h-0 min-w-0 opacity-0"
          style={gridPlacementStyle(item.fromX!, item.fromY!, span)}
        />
        <div
          ref={toMarkerRef}
          aria-hidden
          className="min-h-0 min-w-0 opacity-0"
          style={gridPlacementStyle(item.x, item.y, span)}
        />
      </div>
      <div ref={flyerRef} className="pointer-events-none absolute overflow-hidden rounded-sm">
        <Image
          src={animatableImageSrc(item)}
          alt=""
          fill
          className="object-cover"
          sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * span)}px`}
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
