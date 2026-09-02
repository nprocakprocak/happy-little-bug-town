const HEIGHT_TOLERANCE_PX = 1;

export function splitTextToPages(
  text: string,
  measureEl: HTMLElement,
  lineCount: number,
): string[] {
  if (text.length === 0) {
    return [""];
  }

  const previousHeight = measureEl.style.height;
  const previousOverflow = measureEl.style.overflow;
  measureEl.style.height = `${lineCount}lh`;
  measureEl.style.overflow = "hidden";

  if (measureEl.clientWidth === 0 || measureEl.clientHeight === 0) {
    measureEl.style.height = previousHeight;
    measureEl.style.overflow = previousOverflow;
    return [text];
  }

  const pages: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const fitLength = findFitLength(remaining, measureEl);
    pages.push(remaining.slice(0, fitLength).trimEnd());
    remaining = remaining.slice(fitLength).trimStart();
  }

  measureEl.style.height = previousHeight;
  measureEl.style.overflow = previousOverflow;
  measureEl.textContent = "";

  return pages.length > 0 ? pages : [""];
}

function findFitLength(text: string, measureEl: HTMLElement): number {
  if (textFits(measureEl, text)) {
    return text.length;
  }

  let low = 0;
  let high = text.length;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (textFits(measureEl, text.slice(0, mid))) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  const fitLength = Math.max(breakAtWord(text, low), 1);
  return Math.min(fitLength, text.length);
}

function textFits(measureEl: HTMLElement, candidate: string): boolean {
  measureEl.textContent = candidate;
  return measureEl.scrollHeight <= measureEl.clientHeight + HEIGHT_TOLERANCE_PX;
}

function breakAtWord(text: string, length: number): number {
  if (length >= text.length) {
    return text.length;
  }
  const lastSpace = text.lastIndexOf(" ", length);
  if (lastSpace <= 0) {
    return length;
  }
  return lastSpace;
}
