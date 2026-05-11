import { Item, Position } from "@happy-little-park/types";

export function generateRandomItem(position: Position): Item {
  return {
    id: crypto.randomUUID(),
    itemType: "leaf-part",
    x: position.x,  
    y: position.y,
  };
}
