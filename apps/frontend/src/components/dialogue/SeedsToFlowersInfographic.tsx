import Image from "next/image";

export function SeedsToFlowersInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/seeds-to-flowers.webp"
        alt="Use seeds to plant flowers on this field"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
