"use client";

import Image from "next/image";

interface CarouselOption {
  id: string;
  imageSrc: string;
  label: string;
}

interface CarouselSliderProps {
  options: CarouselOption[];
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  previousAriaLabel: string;
  nextAriaLabel: string;
  selectAriaLabelPrefix: string;
}

export function CarouselSlider({
  options,
  selectedIndex,
  onSelectedIndexChange,
  previousAriaLabel,
  nextAriaLabel,
  selectAriaLabelPrefix,
}: CarouselSliderProps) {
  const selectedOption = options[selectedIndex];
  const lastIndex = options.length - 1;

  function goToPrevious() {
    onSelectedIndexChange(selectedIndex === 0 ? lastIndex : selectedIndex - 1);
  }

  function goToNext() {
    onSelectedIndexChange(selectedIndex === lastIndex ? 0 : selectedIndex + 1);
  }

  return (
    <div className="flex w-full flex-col items-center gap-[2cqi]">
      <div className="flex w-full items-center gap-[2cqi]">
        <button
          type="button"
          onClick={goToPrevious}
          aria-label={previousAriaLabel}
          className="flex h-[8cqi] w-[8cqi] shrink-0 items-center justify-center rounded-full bg-stone-200 text-[clamp(1rem,4cqi,1.5rem)] font-bold text-stone-700 transition-colors hover:bg-stone-300"
        >
          ‹
        </button>
        <div className="relative h-[24cqi] min-w-0 flex-1">
          <Image
            src={selectedOption.imageSrc}
            alt=""
            fill
            className="object-contain"
            sizes="24cqi"
          />
        </div>
        <button
          type="button"
          onClick={goToNext}
          aria-label={nextAriaLabel}
          className="flex h-[8cqi] w-[8cqi] shrink-0 items-center justify-center rounded-full bg-stone-200 text-[clamp(1rem,4cqi,1.5rem)] font-bold text-stone-700 transition-colors hover:bg-stone-300"
        >
          ›
        </button>
      </div>
      <p className="text-center text-[clamp(0.875rem,4cqi,1.5rem)] font-semibold text-stone-800">
        {selectedOption.label}
      </p>
      <div className="flex items-center gap-[1.5cqi]">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectedIndexChange(index)}
            aria-label={`${selectAriaLabelPrefix} ${index + 1}`}
            className={`h-[1.5cqi] w-[1.5cqi] rounded-full transition-colors ${
              index === selectedIndex ? "bg-sky-500" : "bg-stone-300 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
