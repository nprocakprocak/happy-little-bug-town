import Image from "next/image";

export function StonemasonListInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/stonemason-list.webp"
        alt="Items that can be produced in the stonemason"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
