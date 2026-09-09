import Image from "next/image";

export function CookingListInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/cooking-list.webp"
        alt="Meals that can be cooked in the kitchen"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
