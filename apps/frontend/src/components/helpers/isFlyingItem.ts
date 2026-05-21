import { GridAnimatable } from "../../types/gridAnimatable";

export function isFlyingItem(animatable: GridAnimatable): animatable is Required<GridAnimatable> {
  return animatable.fromX !== undefined && animatable.fromY !== undefined;
}
