"use client";

import Image from "next/image";
import { StructureType } from "@happy-little-bug-town/utils";

import { STRUCTURE_EVOLUTION_FADE_MS } from "../../constants";
import { structureTypeToImage } from "../helpers/itemTypeToImage";

interface StructureEvolutionSpriteProps {
  fromType: StructureType;
  toType: StructureType;
  fadeStarted: boolean;
  sizes: string;
  onFadeComplete: () => void;
}

export function StructureEvolutionSprite({
  fromType,
  toType,
  fadeStarted,
  sizes,
  onFadeComplete,
}: StructureEvolutionSpriteProps) {
  const fadeStyle = { transitionDuration: `${STRUCTURE_EVOLUTION_FADE_MS}ms` };

  return (
    <>
      <Image
        src={structureTypeToImage(fromType)}
        alt=""
        fill
        className="object-cover transition-opacity"
        style={{ ...fadeStyle, opacity: fadeStarted ? 0 : 1 }}
        sizes={sizes}
      />
      <Image
        src={structureTypeToImage(toType)}
        alt=""
        fill
        className="object-cover transition-opacity"
        style={{ ...fadeStyle, opacity: fadeStarted ? 1 : 0 }}
        sizes={sizes}
        onTransitionEnd={(event) => {
          if (event.propertyName !== "opacity" || !fadeStarted) {
            return;
          }
          onFadeComplete();
        }}
      />
    </>
  );
}
