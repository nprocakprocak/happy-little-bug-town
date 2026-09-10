import Image from "next/image";

export function TavernListInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/tavern-list.webp"
        alt="Foods that attract bugs in the tavern"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
