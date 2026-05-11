import type { Mine } from "@happy-little-park/types";
import { positionOverlapsAnyMine } from "./overlaps";

export function gridCellFromClientPoint(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  cols: number,
  rows: number,
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  const style = getComputedStyle(container);
  const gapX = parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
  const gapY = parseFloat(style.rowGap) || parseFloat(style.gap) || 0;

  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  const cellW = (rect.width - gapX * (cols - 1)) / cols;
  const cellH = (rect.height - gapY * (rows - 1)) / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const left = c * (cellW + gapX);
      const top = r * (cellH + gapY);
      if (relX >= left && relX < left + cellW && relY >= top && relY < top + cellH) {
        return { x: c + 1, y: r + 1 };
      }
    }
  }

  let bestCol = 0;
  let bestRow = 0;
  let bestDist = Infinity;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const centerX = c * (cellW + gapX) + cellW / 2;
      const centerY = r * (cellH + gapY) + cellH / 2;
      const d = (relX - centerX) ** 2 + (relY - centerY) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestCol = c;
        bestRow = r;
      }
    }
  }

  return { x: bestCol + 1, y: bestRow + 1 };
}
