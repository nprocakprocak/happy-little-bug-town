import Image from "next/image";

export function WoodProductionInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/wood-production.webp"
        alt="Drop sticks on the woodcutter to produce wood"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
