import Image from "next/image";

export function AppleToFlyInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/apple-to-fly.webp"
        alt="Drop rotten apples on the composter to attract flies"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
