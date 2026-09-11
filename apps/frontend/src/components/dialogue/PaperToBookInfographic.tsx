import Image from "next/image";

export function PaperToBookInfographic() {
  return (
    <figure className="m-0 w-[48cqi]">
      <Image
        src="/dialogues/paper-to-book.webp"
        alt="The library produces books from paper"
        width={1536}
        height={1024}
        sizes="48cqi"
        className="h-auto w-full"
      />
    </figure>
  );
}
