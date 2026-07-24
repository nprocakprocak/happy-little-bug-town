import Image from "next/image";

interface MissingResourceCounterProps {
  imageSrc: string;
  missing: number;
}

export function MissingResourceCounter({ imageSrc, missing }: MissingResourceCounterProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-[0.35cqi]">
      <div className="relative h-[5cqi] w-[5cqi] shrink-0">
        <Image src={imageSrc} alt="" fill className="object-contain drop-shadow-sm" sizes="5cqi" />
      </div>
      <span className="rounded-sm bg-stone-900/80 px-[0.75cqi] py-[0.15cqi] text-[clamp(0.625rem,2.5cqi,0.875rem)] font-bold tabular-nums text-white shadow-sm">
        {missing}
      </span>
    </div>
  );
}
