"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface GridVisibilityContextValue {
  gridCellsVisible: boolean;
  toggleGridCellsVisible: () => void;
  setGridCellsVisible: (visible: boolean) => void;
}

const GridVisibilityContext = createContext<GridVisibilityContextValue | null>(null);

interface GridVisibilityProviderProps {
  children: React.ReactNode;
}

function isEditableKeyboardTarget(element: HTMLElement): boolean {
  const tag = element.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  return false;
}

export function GridVisibilityProvider({ children }: GridVisibilityProviderProps) {
  const [gridCellsVisible, setGridCellsVisible] = useState(false);

  const toggleGridCellsVisible = useCallback(() => {
    setGridCellsVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "g" && event.key !== "G") {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && isEditableKeyboardTarget(target)) {
        return;
      }
      event.preventDefault();
      toggleGridCellsVisible();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleGridCellsVisible]);

  const value = useMemo(
    () => ({
      gridCellsVisible,
      toggleGridCellsVisible,
      setGridCellsVisible,
    }),
    [gridCellsVisible, toggleGridCellsVisible],
  );

  return <GridVisibilityContext.Provider value={value}>{children}</GridVisibilityContext.Provider>;
}

export function useGridVisibility(): GridVisibilityContextValue {
  const context = useContext(GridVisibilityContext);
  if (!context) {
    throw new Error("useGridVisibility must be used within GridVisibilityProvider");
  }
  return context;
}
