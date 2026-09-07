import Image from "next/image";

export function LeafToBeetleInfographic() {
  return (
    <figure className="m-0">
      <Image
        src="/dialogues/leaf-to-beetle.webp"
        alt="Drag a leaf onto the beetle to feed it"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
