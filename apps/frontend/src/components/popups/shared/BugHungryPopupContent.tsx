"use client";

import Image from "next/image";
import { ItemType } from "@happy-little-bug-town/utils";

import { Bug } from "../../../types/bug";
import { bugToImage } from "../../helpers/bugImages";
import { itemTypeToImageForItem } from "../../helpers/itemImages";

interface BugHungryPopupContentProps {
  bug: Bug;
  foodItemType: ItemType;
  maxCount: number;
  onClose: () => void;
  message?: string;
}

export function BugHungryPopupContent({
  bug,
  foodItemType,
  maxCount,
  onClose,
  message = "I'm too hungry to work",
}: BugHungryPopupContentProps) {
  const foodCount = bug.items.filter((item) => item.itemType === foodItemType).length;

  return (
    <>
      <div className="flex justify-center pt-[4cqi]">
        <div className="relative h-[28cqi] w-[28cqi]">
          <Image src={bugToImage(bug)} alt="" fill className="object-contain" sizes="28cqi" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pb-[2cqi]">
        <div className="flex items-center gap-[2cqi]">
          <div className="relative h-[8cqi] w-[8cqi]">
            <Image
              src={itemTypeToImageForItem(foodItemType)}
              alt=""
              fill
              className="object-contain"
              sizes="8cqi"
            />
          </div>
          <span className="text-[clamp(1rem,4.5cqi,1.75rem)] font-semibold text-stone-700">
            {foodCount}/{maxCount}
          </span>
        </div>
        <p className="text-center text-[clamp(1rem,5cqi,2rem)] text-stone-800">{message}</p>
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
    </>
  );
}
