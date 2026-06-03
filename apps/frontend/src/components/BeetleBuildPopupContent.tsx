"use client";

import { useState } from "react";
import Image from "next/image";

import { BEETLE_BUILD_RESOURCE_COSTS, BEETLE_BUILDING_OPTIONS } from "../constants/beetleBuild";
import { Structure } from "../types/structure";
import { BeetleBuildingSlider } from "./BeetleBuildingSlider";
import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

interface BeetleBuildPopupContentProps {
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetleBuildPopupContent({ onClose, onBuild }: BeetleBuildPopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const selectedStructure = BEETLE_BUILDING_OPTIONS[selectedBuildingIndex];

  function handleBuildClick() {
    onBuild(selectedStructure);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pt-[4cqi] pb-[2cqi]">
        <BeetleBuildingSlider
          selectedIndex={selectedBuildingIndex}
          onSelectedIndexChange={setSelectedBuildingIndex}
        />
        <div className="flex w-full flex-wrap items-center justify-center gap-[3cqi]">
          {BEETLE_BUILD_RESOURCE_COSTS.map(({ itemType, count }) => (
            <div key={itemType} className="flex items-center gap-[1.5cqi]">
              <div className="relative h-[7cqi] w-[7cqi]">
                <Image
                  src={itemTypeToImageForItem(itemType)}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="7cqi"
                />
              </div>
              <span className="text-[clamp(0.875rem,4cqi,1.5rem)] font-semibold text-stone-700">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-[3cqi] p-[3cqi]">
        <button
          type="button"
          onClick={handleBuildClick}
          className="min-w-[28%] rounded-md bg-sky-500 px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
        >
          Build
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-w-[28%] rounded-md bg-stone-200 px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300"
        >
          Close
        </button>
      </div>
    </>
  );
}
