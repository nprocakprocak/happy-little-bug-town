"use client";

import Image from "next/image";
import { ItemType } from "@happy-little-bug-town/utils";

import { itemTypeToImageForItem } from "../../helpers/itemImages";

interface PopupResourceCostsProps {
  itemCosts: { itemType: ItemType; count: number }[];
}

export function PopupResourceCosts({ itemCosts }: PopupResourceCostsProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-[3cqi]">
      {itemCosts.map(({ itemType, count }) => (
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
