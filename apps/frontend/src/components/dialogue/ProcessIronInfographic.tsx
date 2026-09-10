import Image from "next/image";

export function ProcessIronInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/smelter-list.webp"
        alt="Items that can be processed in the smelter"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
