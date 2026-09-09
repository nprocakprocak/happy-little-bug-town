import Image from "next/image";

export function BricksProductionInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/bricks-production.webp"
        alt="Build a stonemason to produce bricks"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
