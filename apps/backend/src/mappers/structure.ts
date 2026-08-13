import { StructureDto, StructureOnGridDto, StructureWithContents } from "../types/structureDto.js";

export function toStructureDto(structure: StructureWithContents): StructureDto {
  return {
    id: structure.id,
    structureType: structure.structureType,
    x: structure.x,
    y: structure.y,
    authorId: structure.authorId,
    items: structure.items.map((item) => ({ id: item.id, itemType: item.itemType })),
    bugs: structure.bugs.map((bug) => ({ id: bug.id, bugType: bug.bugType })),
  };
}

export function toStructureOnGridDto(structure: StructureDto): StructureOnGridDto {
  return {
    id: structure.id,
    structureType: structure.structureType,
    x: structure.x,
    y: structure.y,
    items: structure.items,
    bugs: structure.bugs,
  };
}
