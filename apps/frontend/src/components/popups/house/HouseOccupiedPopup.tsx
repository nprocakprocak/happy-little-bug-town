"use client";

import Image from "next/image";
import { StructureType } from "@happy-little-bug-town/utils";

import { structureTypeToImage } from "../../helpers/structureImages";
import { GridPopup } from "../shared/GridPopup";

interface HouseOccupiedPopupProps {
  structureType: StructureType;
  onClose: () => void;
}

export function HouseOccupiedPopup({ structureType, onClose }: HouseOccupiedPopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <div className="flex justify-center pt-[4cqi]">
        <div className="relative h-[28cqi] w-[28cqi]">
          <Image
            src={structureTypeToImage(structureType)}
            alt=""
            fill
            className="object-contain"
            sizes="28cqi"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pb-[2cqi]">
        <p className="text-center text-[clamp(1rem,5cqi,2rem)] text-stone-800">
          First, you must empty this house of its inhabitants
        </p>
      </div>
      <div className="flex justify-center p-[3cqi]">
        <button
          type="button"
          onClick={onClose}
          className="min-w-[20%] rounded-md bg-sky-500 px-[6cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
        >
          Ok
        </button>
      </div>
    </GridPopup>
  );
}
