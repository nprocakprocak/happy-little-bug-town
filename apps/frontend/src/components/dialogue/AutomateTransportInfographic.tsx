import Image from "next/image";

export function AutomateTransportInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/automate-transport.webp"
        alt="Drop an ant on a building or a stack to deliver items automatically"
        width={1136}
        height={924}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
