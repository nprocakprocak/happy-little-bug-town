"use client";

import Image from "next/image";

import { BUILDING_OPTIONS } from "../constants/beetleBuild";
import { getStructureName } from "./helpers/getStructureName";
import { structureTypeToImage } from "./helpers/itemTypeToImage";

interface BeetleBuildingSliderProps {
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
}

export function BeetleBuildingSlider({
  selectedIndex,
  onSelectedIndexChange,
}: BeetleBuildingSliderProps) {
  const selectedBuilding = BUILDING_OPTIONS[selectedIndex];
  const lastIndex = BUILDING_OPTIONS.length - 1;

  function goToPrevious() {
    onSelectedIndexChange(selectedIndex === 0 ? lastIndex : selectedIndex - 1);
  }

  function goToNext() {
    onSelectedIndexChange(selectedIndex === lastIndex ? 0 : selectedIndex + 1);
  }

  return (
    <div className="flex w-full flex-col items-center gap-[2cqi]">
      <div className="flex w-full items-center gap-[2cqi]">
        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous building"
          className="flex h-[8cqi] w-[8cqi] shrink-0 items-center justify-center rounded-full bg-stone-200 text-[clamp(1rem,4cqi,1.5rem)] font-bold text-stone-700 transition-colors hover:bg-stone-300"
        >
          ‹
        </button>
        <div className="relative h-[24cqi] min-w-0 flex-1">
          <Image
            src={structureTypeToImage(selectedBuilding.structureType)}
            alt=""
            fill
            className="object-contain"
            sizes="24cqi"
          />
        </div>
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next building"
          className="flex h-[8cqi] w-[8cqi] shrink-0 items-center justify-center rounded-full bg-stone-200 text-[clamp(1rem,4cqi,1.5rem)] font-bold text-stone-700 transition-colors hover:bg-stone-300"
        >
          ›
        </button>
      </div>
      <p className="text-center text-[clamp(0.875rem,4cqi,1.5rem)] font-semibold text-stone-800">
        {getStructureName(selectedBuilding)}
      </p>
      <div className="flex items-center gap-[1.5cqi]">
        {BUILDING_OPTIONS.map((structure, index) => (
          <button
            key={structure.id}
            type="button"
            onClick={() => onSelectedIndexChange(index)}
            aria-label={`Select building ${index + 1}`}
            className={`h-[1.5cqi] w-[1.5cqi] rounded-full transition-colors ${
              index === selectedIndex ? "bg-sky-500" : "bg-stone-300 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
