import { Bug } from "./bug";
import { Item } from "./item";

export interface ExtractFromStackResult {
  extractedItem: Item;
  stackDissolved: boolean;
  releasedBugs: Bug[];
}
