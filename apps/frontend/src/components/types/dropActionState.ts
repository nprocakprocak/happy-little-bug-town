import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";

export interface DropActionState {
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  structures: Structure[];
}
