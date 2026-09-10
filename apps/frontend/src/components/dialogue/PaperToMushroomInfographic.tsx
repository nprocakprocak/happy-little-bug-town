import Image from "next/image";

export function PaperToMushroomInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/paper-to-mushroom.webp"
        alt="Fertilize the mushroom field with scraps of paper"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
