export interface MainState {
  requiresLogin: boolean;
  setRequiresLogin: (value: boolean) => void;
  isTransformingToAnthill: boolean;
  setIsTransformingToAnthill: (value: boolean) => void;
}
