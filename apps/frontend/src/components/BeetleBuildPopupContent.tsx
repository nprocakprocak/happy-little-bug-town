"use client";

import { useState } from "react";
import Image from "next/image";
import { BuildableStructureType } from "@happy-little-park/utils";

import {
  BUILDING_OPTIONS,
  getBuildResourceCostsForType,
  hasStructureType,
} from "../constants/beetleBuild";
import { Structure } from "../types/structure";
import { BeetleBuildingSlider } from "./BeetleBuildingSlider";
import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

interface BeetleBuildPopupContentProps {
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetleBuildPopupContent({
  structures,
  onClose,
  onBuild,
}: BeetleBuildPopupContentProps) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const selectedStructure = BUILDING_OPTIONS[selectedBuildingIndex];
  const selectedResourceCosts = getBuildResourceCostsForType(
    selectedStructure.structureType as BuildableStructureType,
  );
  const canBuild = !hasStructureType(structures, selectedStructure.structureType);

  function handleBuildClick() {
    if (!canBuild) {
      return;
    }
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
          {selectedResourceCosts.map(({ itemType, count }) => (
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
          disabled={!canBuild}
          className={`min-w-[28%] rounded-md px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium shadow-sm transition-colors ${
            canBuild
              ? "bg-sky-500 text-white hover:bg-sky-600"
              : "cursor-not-allowed bg-stone-300 text-stone-500"
          }`}
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
