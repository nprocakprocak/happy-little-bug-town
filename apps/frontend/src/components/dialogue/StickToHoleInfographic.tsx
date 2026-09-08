import Image from "next/image";

export function StickToHoleInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/stick-to-hole.webp"
        alt="Drop an item or a bug into the hole to remove it"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
