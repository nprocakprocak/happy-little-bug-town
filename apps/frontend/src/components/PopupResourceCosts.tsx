"use client";

import Image from "next/image";
import { ItemType } from "@happy-little-park/utils";

import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

interface PopupResourceCostsProps {
  costs: { itemType: ItemType; count: number }[];
}

export function PopupResourceCosts({ costs }: PopupResourceCostsProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-[3cqi]">
      {costs.map(({ itemType, count }) => (
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
  );
}
