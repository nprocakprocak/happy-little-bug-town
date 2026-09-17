import Image from "next/image";

export function UpgradeHoleInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/upgrade-hole.webp"
        alt="Drop ants into the hole to turn it into an anthill"
        width={1021}
        height={370}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
