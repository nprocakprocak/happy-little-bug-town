"use client";

import { useLayoutEffect, useRef } from "react";
import { getStackSpan, Position } from "@happy-little-bug-town/utils";

import { gridPlacementStyle, groundGridTemplateStyle } from "../helpers/groundGridStyles";
import { STACK_CREATE_BLOCKED_FLASH_MS } from "./constants";

interface StackCreateBlockedHintLayerProps {
  cols: number;
  rows: number;
  origin: Position;
  onComplete: () => void;
}

export function StackCreateBlockedHintLayer({
  cols,
  rows,
  origin,
  onComplete,
}: StackCreateBlockedHintLayerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const span = getStackSpan();

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      onCompleteRef.current();
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animation = overlay.animate(
      reduced
        ? [{ opacity: 0.55 }, { opacity: 0 }]
        : [
            { opacity: 0 },
            { opacity: 0.7, offset: 0.14 },
            { opacity: 0.08, offset: 0.32 },
            { opacity: 0.7, offset: 0.46 },
            { opacity: 0.4, offset: 0.64 },
            { opacity: 0 },
          ],
      {
        duration: reduced ? STACK_CREATE_BLOCKED_FLASH_MS / 2 : STACK_CREATE_BLOCKED_FLASH_MS,
        easing: "ease-in-out",
        fill: "forwards",
      },
    );
    animation.onfinish = () => {
      onCompleteRef.current();
    };

    return () => {
      animation.cancel();
    };
  }, [origin.x, origin.y]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid h-full w-full gap-1" style={groundGridTemplateStyle(cols, rows)}>
        <div
          ref={overlayRef}
          aria-hidden
          className="rounded-sm bg-red-500"
          style={{ ...gridPlacementStyle(origin.x, origin.y, span), opacity: 0 }}
        />
      </div>
    </div>
  );
}
