import { SelectedSquarePosition } from "./position";

export interface GridItem extends SelectedSquarePosition {
  id: string;
  image: string;
}
