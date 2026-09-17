import Image from "next/image";

export function FlowersToBeeInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/flowers-to-bee.webp"
        alt="Welcome a bee delegation with flowers"
        width={1049}
        height={376}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
