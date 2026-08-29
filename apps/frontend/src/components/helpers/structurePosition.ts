import { getStructureSpan, Position } from "@happy-little-bug-town/utils";

import { Structure } from "../../types/structure";

const EVEN_CENTER_OFFSETS: [number, number][] = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

export function pickRandomNearestStructureCenterCell(structure: Structure): Position {
  const span = getStructureSpan(structure.structureType);
  const { x: originX, y: originY } = structure;

  if (span < 1) {
    return { x: originX, y: originY };
  }

  if (span % 2 === 1) {
    const half = Math.floor(span / 2);
    return { x: originX + half, y: originY + half };
  }

  const shift = span / 2 - 1;
  const baseX = originX + shift;
  const baseY = originY + shift;
  const pick = EVEN_CENTER_OFFSETS[Math.floor(Math.random() * EVEN_CENTER_OFFSETS.length)];
  return { x: baseX + pick[0], y: baseY + pick[1] };
}

export function getBeetleHouseExtractOrigin(structure: Structure): Position {
  const span = getStructureSpan(structure.structureType);
  return {
    x: structure.x + span - 1,
    y: structure.y + span - 1,
  };
}
