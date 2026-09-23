"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";
import { BUG_SPAN, getItemSpan, ITEM_TYPES } from "@happy-little-bug-town/utils";

import { allBugSpriteSrcs } from "../components/helpers/bugImages";
import { gridImageSizes } from "../components/helpers/groundGridStyles";
import { itemTypeToImageForItem } from "../components/helpers/itemImages";

interface SpritePreload {
  src: string;
  sizes: string;
}

interface SrcCandidate {
  url: string;
  width: number;
}

function boardSpritePreloads(cols: number): SpritePreload[] {
  const itemPreloads = ITEM_TYPES.map((itemType) => ({
    src: itemTypeToImageForItem(itemType),
    sizes: gridImageSizes(cols, getItemSpan(itemType)),
  }));
  const bugPreloads = allBugSpriteSrcs().map((src) => ({
    src,
    sizes: gridImageSizes(cols, BUG_SPAN),
  }));
  return [...itemPreloads, ...bugPreloads];
}

function parseSrcSet(srcSet: string): SrcCandidate[] {
  return srcSet.split(", ").flatMap((entry) => {
    const separator = entry.lastIndexOf(" ");
    if (separator <= 0) {
      return [];
    }
    const url = entry.slice(0, separator);
    const width = Number(entry.slice(separator + 1).replace("w", ""));
    if (!url || !Number.isFinite(width)) {
      return [];
    }
    return [{ url, width }];
  });
}

function optimizedBoardSrc(src: string, sizes: string): string {
  const { props } = getImageProps({
    alt: "",
    src,
    fill: true,
    sizes,
  });
  const sizesPx = Number(sizes.replace("px", ""));
  const candidates = parseSrcSet(props.srcSet ?? "").sort(
    (left, right) => left.width - right.width,
  );
  const target = sizesPx * window.devicePixelRatio;
  const match = candidates.find((candidate) => candidate.width >= target);
  if (match) {
    return match.url;
  }
  const largest = candidates[candidates.length - 1];
  if (largest) {
    return largest.url;
  }
  return props.src;
}

export function usePreloadBoardSprites(cols: number) {
  useEffect(() => {
    if (cols <= 0) {
      return;
    }

    const images = boardSpritePreloads(cols).map((sprite) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = optimizedBoardSrc(sprite.src, sprite.sizes);
      return image;
    });

    return () => {
      for (const image of images) {
        image.src = "";
      }
    };
  }, [cols]);
}
