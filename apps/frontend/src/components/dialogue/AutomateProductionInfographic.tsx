import Image from "next/image";

export function AutomateProductionInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/automate-production.webp"
        alt="Drop a termite on a building to gather resources automatically"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
