import { StackDto, StackOnGridDto, StackWithItems } from "../types/stackDto.js";

export function toStackDto(stack: StackWithItems): StackDto {
  return {
    id: stack.id,
    itemType: stack.itemType,
    x: stack.x,
    y: stack.y,
    authorId: stack.authorId,
    itemsCount: stack.items.length,
    bugs: stack.bugs.map((bug) => ({ id: bug.id, bugType: bug.bugType })),
  };
}

export function toStackOnGridDto(stack: StackDto): StackOnGridDto {
  return {
    id: stack.id,
    itemType: stack.itemType,
    x: stack.x,
    y: stack.y,
    itemsCount: stack.itemsCount,
    bugs: stack.bugs,
  };
}
