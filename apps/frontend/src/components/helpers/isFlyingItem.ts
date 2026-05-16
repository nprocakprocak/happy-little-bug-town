import { GridAnimatable } from "@happy-little-park/types";

export function isFlyingItem(animatable: GridAnimatable): animatable is Required<GridAnimatable> {
  return animatable.fromX !== undefined && animatable.fromY !== undefined;
}
