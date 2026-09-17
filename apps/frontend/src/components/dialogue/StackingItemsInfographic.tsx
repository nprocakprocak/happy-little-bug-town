import Image from "next/image";

export function StackingItemsInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/stacking-items.webp"
        alt="Stack sticks, leaves and roots with the rake"
        width={1331}
        height={490}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
