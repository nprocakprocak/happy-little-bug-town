import Image from "next/image";
import { ItemType } from "@happy-little-bug-town/utils";

import { itemTypeToImageForItem } from "../helpers/itemImages";

interface HungryBugInfographicProps {
  foodItemType: ItemType;
  foodCount: number;
  maxCount: number;
}

export function HungryBugInfographic({
  foodItemType,
  foodCount,
  maxCount,
}: HungryBugInfographicProps) {
  return (
    <div className="flex items-center justify-center gap-[2cqi] px-[4cqi] py-[3cqi]">
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
  );
}
