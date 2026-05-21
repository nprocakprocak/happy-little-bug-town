import { Item } from "./item";

export interface ExtractFromStackResult {
  extractedItem: Item;
  remainingItem?: Item;
  stackDissolved: boolean;
}
