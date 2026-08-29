import { GridAnimatable } from "../../types/gridEntity";

export function isFlying(animatable: GridAnimatable): animatable is Required<GridAnimatable> {
  return animatable.fromX !== undefined && animatable.fromY !== undefined;
}
