import Image from "next/image";

export function WoodcutterListInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/woodcutter-list.webp"
        alt="Items that can be produced in the woodcutter"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
